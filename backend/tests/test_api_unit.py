"""In-process API unit tests with mocked OpenAI calls."""
import uuid

import pytest


@pytest.mark.usefixtures("mock_llm")
class TestApiUnit:
    def test_health(self, client):
        r = client.get("/api/health")
        assert r.status_code == 200
        assert "status" in r.json()

    def test_register_and_me(self, client):
        email = f"unit_{uuid.uuid4().hex[:8]}@example.com"
        r = client.post("/api/auth/register", json={
            "name": "Unit User",
            "email": email,
            "password": "pass1234",
        })
        assert r.status_code == 200, r.text
        token = r.json()["access_token"]
        me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me.status_code == 200
        assert me.json()["email"] == email

    def test_create_application_paginated_list(self, client):
        email = f"unit_{uuid.uuid4().hex[:8]}@example.com"
        reg = client.post("/api/auth/register", json={
            "name": "App User", "email": email, "password": "pass1234",
        })
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        create = client.post("/api/applications", json={
            "job_title": "Engineer",
            "company": "Acme",
            "job_description": "Python role",
            "resume_text": "Python developer with FastAPI experience.",
        }, headers=headers)
        assert create.status_code == 200
        listing = client.get("/api/applications", headers=headers)
        assert listing.status_code == 200
        data = listing.json()
        assert "items" in data
        assert data["total"] >= 1

    def test_run_pipeline_mocked(self, client, mock_llm):
        email = f"unit_{uuid.uuid4().hex[:8]}@example.com"
        reg = client.post("/api/auth/register", json={
            "name": "AI User", "email": email, "password": "pass1234",
        })
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        app = client.post("/api/applications", json={
            "job_title": "ML Eng",
            "company": "AI Co",
            "job_description": "Need PyTorch.",
            "resume_text": "ML engineer.",
        }, headers=headers).json()
        run = client.post(f"/api/applications/{app['id']}/run", headers=headers)
        assert run.status_code == 200, run.text
        assert run.json()["generated"] is True
        assert "fit_analysis" in run.json()["results"]

    def test_profile_update(self, client):
        email = f"unit_{uuid.uuid4().hex[:8]}@example.com"
        reg = client.post("/api/auth/register", json={
            "name": "Old Name", "email": email, "password": "pass1234",
        })
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        upd = client.patch("/api/auth/profile", json={"name": "New Name"}, headers=headers)
        assert upd.status_code == 200
        assert upd.json()["name"] == "New Name"

    def test_admin_stats_requires_admin(self, client):
        email = f"unit_{uuid.uuid4().hex[:8]}@example.com"
        reg = client.post("/api/auth/register", json={
            "name": "User", "email": email, "password": "pass1234",
        })
        token = reg.json()["access_token"]
        r = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 403

    def test_admin_stats_success(self, client):
        login = client.post("/api/auth/login", json={
            "email": "admin@careeros.ai", "password": "admin123",
        })
        assert login.status_code == 200, login.text
        token = login.json()["access_token"]
        r = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 200
        assert "users" in r.json()
