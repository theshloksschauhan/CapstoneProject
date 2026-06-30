import json
import os
from pathlib import Path

import pytest
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

os.environ.setdefault("MONGO_URL", os.environ.get("MONGO_URL", "mongodb://localhost:27017"))
os.environ.setdefault("DB_NAME", os.environ.get("DB_NAME", "careeros_test"))
os.environ.setdefault("JWT_SECRET", "test-jwt-secret-for-pytest-only")
os.environ.setdefault("OPENAI_API_KEY", "sk-test-key")
os.environ.setdefault("COOKIE_SECURE", "false")
os.environ.setdefault("ADMIN_EMAIL", "admin@careeros.ai")
os.environ.setdefault("ADMIN_PASSWORD", "admin123")


@pytest.fixture
def mock_llm(monkeypatch):
    async def fake_run(system_message, user_text, session_id):
        if "fit" in session_id or "fit analysis" in system_message.lower():
            return json.dumps({
                "match_rate": 85,
                "verdict": "Strong fit",
                "summary": "Good match.",
                "strengths": [],
                "gaps": [],
                "matched_keywords": ["python"],
                "missing_keywords": [],
            })
        if "ats" in session_id or "ATS" in system_message:
            return json.dumps({
                "overall_score": 78,
                "breakdown": [],
                "missing_keywords": [],
                "suggestions": [],
            })
        if "rewrite" in session_id or "resume writer" in system_message.lower():
            return json.dumps({
                "rewritten_resume": "Rewritten resume text",
                "changes": [],
                "summary_of_changes": "Improved bullets.",
            })
        if "cover" in session_id or "cover letter" in system_message.lower():
            return json.dumps({"cover_letter": "Dear Hiring Manager...", "hook": "Hook line"})
        if "interview" in session_id or "interview coach" in system_message.lower():
            return json.dumps({"questions": [], "focus_areas": ["Leadership"]})
        return "{}"

    monkeypatch.setattr("llm_agents._run", fake_run)


@pytest.fixture
def client():
    from starlette.testclient import TestClient
    from server import app

    with TestClient(app) as c:
        yield c
