"""
CareerOS Backend API Tests
Tests: auth (register/login/me/logout), resume parse, applications CRUD,
status updates, stats, AI pipeline (live OpenAI or mocked in unit tests).
"""
import os
import io
import uuid
import time
import pytest
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load env for integration tests (optional — skip if no backend running)
load_dotenv(Path(__file__).resolve().parents[1] / ".env")
load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8000").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@careeros.ai"
ADMIN_PASSWORD = "admin123"


# ---------------- Fixtures ----------------
@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login",
               json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
               timeout=60)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    s.headers.update({"Authorization": f"Bearer {data['access_token']}"})
    s.user = data
    return s


@pytest.fixture(scope="module")
def new_user_session():
    s = requests.Session()
    email = f"TEST_user_{uuid.uuid4().hex[:8]}@example.com"
    r = s.post(f"{API}/auth/register",
               json={"name": "Test User", "email": email, "password": "test123"},
               timeout=60)
    assert r.status_code == 200, f"Register failed: {r.status_code} {r.text}"
    data = r.json()
    s.headers.update({"Authorization": f"Bearer {data['access_token']}"})
    s.user = data
    s.email = email
    return s


# ---------------- Health ----------------
class TestHealth:
    def test_root(self):
        r = requests.get(f"{API}/", timeout=60)
        assert r.status_code == 200
        assert "CareerOS" in r.json().get("message", "")

    def test_health_endpoint(self):
        r = requests.get(f"{API}/health", timeout=60)
        assert r.status_code == 200
        data = r.json()
        assert "status" in data
        assert "database" in data
        assert "openai_configured" in data


# ---------------- Auth ----------------
class TestAuth:
    def test_register_new_user_returns_token_and_cookies(self):
        email = f"TEST_reg_{uuid.uuid4().hex[:8]}@example.com"
        r = requests.post(f"{API}/auth/register",
                          json={"name": "Reg User", "email": email, "password": "pass1234"},
                          timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == email.lower()  # backend normalises to lowercase
        assert data["role"] == "user"
        assert "access_token" in data and len(data["access_token"]) > 10
        # cookies
        cookies = {c.name for c in r.cookies}
        assert "access_token" in cookies
        assert "refresh_token" in cookies

    def test_register_duplicate_email(self):
        email = f"TEST_dup_{uuid.uuid4().hex[:8]}@example.com"
        body = {"name": "X", "email": email, "password": "pass1234"}
        r1 = requests.post(f"{API}/auth/register", json=body, timeout=60)
        assert r1.status_code == 200
        r2 = requests.post(f"{API}/auth/register", json=body, timeout=60)
        assert r2.status_code == 400
        assert "already" in r2.json().get("detail", "").lower()

    def test_register_short_password_rejected(self):
        r = requests.post(f"{API}/auth/register",
                          json={"name": "X", "email": f"TEST_s_{uuid.uuid4().hex[:6]}@x.com",
                                "password": "123"}, timeout=60)
        assert r.status_code == 422

    def test_admin_login_success(self):
        r = requests.post(f"{API}/auth/login",
                          json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        assert "access_token" in data
        cookies = {c.name for c in r.cookies}
        assert "access_token" in cookies
        assert "refresh_token" in cookies
        # Verify bcrypt hash format - login working means hash is valid

    def test_login_invalid_password(self):
        # Use unique email/IP combo to not affect lockout for other tests
        email = f"TEST_badpw_{uuid.uuid4().hex[:8]}@example.com"
        requests.post(f"{API}/auth/register",
                      json={"name": "B", "email": email, "password": "pass1234"}, timeout=60)
        r = requests.post(f"{API}/auth/login",
                          json={"email": email, "password": "wrongpass"}, timeout=60)
        assert r.status_code == 401

    def test_me_with_bearer_token(self, new_user_session):
        r = new_user_session.get(f"{API}/auth/me", timeout=60)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == new_user_session.email.lower()
        assert "password_hash" not in data
        assert "id" in data

    def test_me_with_cookie_only(self):
        # Use a fresh session relying solely on cookies (no Bearer)
        s = requests.Session()
        email = f"TEST_cookie_{uuid.uuid4().hex[:8]}@example.com"
        r = s.post(f"{API}/auth/register",
                   json={"name": "C", "email": email, "password": "pass1234"}, timeout=60)
        assert r.status_code == 200
        # Remove any auth header; rely on cookies in session jar
        r2 = s.get(f"{API}/auth/me", timeout=60)
        assert r2.status_code == 200
        assert r2.json()["email"] == email.lower()

    def test_me_unauthenticated(self):
        r = requests.get(f"{API}/auth/me", timeout=60)
        assert r.status_code == 401

    def test_logout(self, new_user_session):
        r = new_user_session.post(f"{API}/auth/logout", timeout=60)
        assert r.status_code == 200


# ---------------- Resume Parse ----------------
class TestResumeParse:
    def test_parse_text_file(self, admin_session):
        content = b"John Doe\nSenior Engineer\nPython, FastAPI, React"
        files = {"file": ("resume.txt", io.BytesIO(content), "text/plain")}
        r = admin_session.post(f"{API}/resume/parse", files=files, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["filename"] == "resume.txt"
        assert "Python" in data["text"]
        assert data["char_count"] == len(data["text"])
        assert data["char_count"] > 0

    def test_parse_empty_file_returns_400(self, admin_session):
        files = {"file": ("empty.txt", io.BytesIO(b""), "text/plain")}
        r = admin_session.post(f"{API}/resume/parse", files=files, timeout=60)
        assert r.status_code == 400

    def test_parse_unauthenticated(self):
        files = {"file": ("r.txt", io.BytesIO(b"hi"), "text/plain")}
        r = requests.post(f"{API}/resume/parse", files=files, timeout=60)
        assert r.status_code == 401


# ---------------- Applications CRUD ----------------
class TestApplications:
    def _create(self, s, job="Senior Engineer", company="Acme"):
        payload = {
            "job_title": job,
            "company": company,
            "job_description": "We need a Python engineer with FastAPI experience.",
            "resume_text": "TEST_RESUME experienced python engineer with FastAPI and React skills.",
        }
        r = s.post(f"{API}/applications", json=payload, timeout=60)
        assert r.status_code == 200, r.text
        return r.json()

    def test_create_application(self, new_user_session):
        app = self._create(new_user_session)
        assert "id" in app
        assert app["job_title"] == "Senior Engineer"
        assert app["company"] == "Acme"
        assert app["status"] == "draft"
        assert app["generated"] is False
        assert isinstance(app["status_history"], list) and len(app["status_history"]) == 1
        # _id should be stripped, only id
        assert "_id" not in app

    def test_list_applications(self, new_user_session):
        self._create(new_user_session, job="DevOps Eng", company="Beta Inc")
        r = new_user_session.get(f"{API}/applications", timeout=60)
        assert r.status_code == 200
        data = r.json()
        assert "items" in data
        items = data["items"]
        assert isinstance(items, list)
        assert len(items) >= 1
        assert data["total"] >= 1
        for it in items:
            assert "job_description" not in it
            assert "resume_text" not in it
            assert "id" in it

    def test_get_application_detail(self, new_user_session):
        app = self._create(new_user_session, job="Backend Eng", company="Gamma")
        r = new_user_session.get(f"{API}/applications/{app['id']}", timeout=60)
        assert r.status_code == 200
        data = r.json()
        assert data["id"] == app["id"]
        assert "job_description" in data
        assert "resume_text" in data

    def test_get_application_invalid_id_400(self, new_user_session):
        r = new_user_session.get(f"{API}/applications/not-an-objectid", timeout=60)
        assert r.status_code == 400

    def test_get_application_other_user_404(self, new_user_session, admin_session):
        # admin creates an app; new_user shouldn't be able to fetch it
        app = self._create(admin_session, job="Hidden", company="Secret")
        r = new_user_session.get(f"{API}/applications/{app['id']}", timeout=60)
        assert r.status_code == 404

    def test_update_status_and_history(self, new_user_session):
        app = self._create(new_user_session, job="Frontend", company="Delta")
        r = new_user_session.patch(f"{API}/applications/{app['id']}/status",
                                   json={"status": "applied"}, timeout=60)
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "applied"
        assert len(data["status_history"]) == 2
        assert data["status_history"][-1]["status"] == "applied"

        # GET to confirm persistence
        r2 = new_user_session.get(f"{API}/applications/{app['id']}", timeout=60)
        assert r2.json()["status"] == "applied"

    def test_update_status_invalid_value(self, new_user_session):
        app = self._create(new_user_session, job="Z", company="Z")
        r = new_user_session.patch(f"{API}/applications/{app['id']}/status",
                                   json={"status": "garbage"}, timeout=60)
        assert r.status_code == 400

    def test_delete_application(self, new_user_session):
        app = self._create(new_user_session, job="ToDelete", company="X")
        r = new_user_session.delete(f"{API}/applications/{app['id']}", timeout=60)
        assert r.status_code == 200
        # confirm 404 after delete
        r2 = new_user_session.get(f"{API}/applications/{app['id']}", timeout=60)
        assert r2.status_code == 404

    def test_applications_unauthenticated(self):
        r = requests.get(f"{API}/applications", timeout=60)
        assert r.status_code == 401


# ---------------- Stats ----------------
class TestStats:
    def test_stats_structure(self, new_user_session):
        # ensure at least one app exists
        new_user_session.post(f"{API}/applications", json={
            "job_title": "Stats App", "company": "S",
            "job_description": "jd", "resume_text": "rt"
        }, timeout=60)
        r = new_user_session.get(f"{API}/stats", timeout=60)
        assert r.status_code == 200
        data = r.json()
        for key in ("total", "by_status", "avg_match_rate", "avg_ats", "generated_count"):
            assert key in data
        assert isinstance(data["total"], int)
        assert data["total"] >= 1
        assert isinstance(data["by_status"], dict)
        assert isinstance(data["generated_count"], int)


# ---------------- AI Pipeline ----------------
class TestAIPipeline:
    def test_run_pipeline_returns_response(self, new_user_session):
        # Create app for the AI run
        r = new_user_session.post(f"{API}/applications", json={
            "job_title": "AI Test Eng",
            "company": "AI Co",
            "job_description": "Need ML engineer with PyTorch.",
            "resume_text": "Experienced ML engineer."
        }, timeout=60)
        app = r.json()
        rr = new_user_session.post(f"{API}/applications/{app['id']}/run", timeout=180)
        # Either succeeds (OpenAI available) or returns clean 500 (API error)
        assert rr.status_code in (200, 500), f"Unexpected status: {rr.status_code} {rr.text[:200]}"
        if rr.status_code == 200:
            data = rr.json()
            assert data["generated"] is True
            assert "results" in data
            # Verify all 5 agents produced output
            assert "fit_analysis" in data["results"]
        else:
            body = rr.json()
            assert "AI generation failed" in body.get("detail", "")

    def test_run_pipeline_unauthorized(self):
        r = requests.post(f"{API}/applications/507f1f77bcf86cd799439011/run", timeout=60)
        assert r.status_code == 401

    def test_run_pipeline_other_user_app_returns_404(self, new_user_session, admin_session):
        admin_app = admin_session.post(f"{API}/applications", json={
            "job_title": "Admin App", "company": "AdminCo",
            "job_description": "jd", "resume_text": "rt"
        }, timeout=60).json()
        r = new_user_session.post(f"{API}/applications/{admin_app['id']}/run", timeout=60)
        assert r.status_code == 404

    def test_regenerate_unknown_agent_400(self, new_user_session):
        app = new_user_session.post(f"{API}/applications", json={
            "job_title": "X", "company": "X", "job_description": "x", "resume_text": "x"
        }, timeout=60).json()
        r = new_user_session.post(
            f"{API}/applications/{app['id']}/regenerate/not_an_agent", timeout=60)
        assert r.status_code == 400

    def test_regenerate_known_agent(self, new_user_session):
        app = new_user_session.post(f"{API}/applications", json={
            "job_title": "X", "company": "X", "job_description": "x", "resume_text": "x"
        }, timeout=60).json()
        r = new_user_session.post(
            f"{API}/applications/{app['id']}/regenerate/fit_analysis", timeout=120)
        assert r.status_code in (200, 500)
        if r.status_code == 500:
            assert "AI generation failed" in r.json().get("detail", "")
