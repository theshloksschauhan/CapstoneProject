import os
import json
import re
import asyncio
from typing import Optional
from openai import AsyncOpenAI

def _get_default_model():
    if "OPENROUTER_API_KEY" in os.environ:
        return "qwen/qwen-2.5-coder-32b-instruct:free"
    if "GEMINI_API_KEY" in os.environ:
        return "gemini-2.0-flash"
    if "GROQ_API_KEY" in os.environ:
        return "llama-3.3-70b-versatile"
    return "gpt-4o"

MODEL_NAME = os.environ.get("OPENROUTER_MODEL") or os.environ.get("GEMINI_MODEL") or os.environ.get("OPENAI_MODEL") or _get_default_model()

_client: Optional[AsyncOpenAI] = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        if "OPENROUTER_API_KEY" in os.environ:
            _client = AsyncOpenAI(
                api_key=os.environ["OPENROUTER_API_KEY"], 
                base_url="https://openrouter.ai/api/v1"
            )
        elif "GEMINI_API_KEY" in os.environ:
            _client = AsyncOpenAI(
                api_key=os.environ["GEMINI_API_KEY"], 
                base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
            )
        else:
            api_key = os.environ.get("GROQ_API_KEY") or os.environ.get("OPENAI_API_KEY")
            base_url = "https://api.groq.com/openai/v1" if "GROQ_API_KEY" in os.environ else None
            _client = AsyncOpenAI(api_key=api_key, base_url=base_url)
    return _client


def _extract_json(text: str):
    """Pull a JSON object out of an LLM response, tolerating code fences/prose."""
    if not text:
        return None
    text = text.strip()
    fence = re.search(r"```(?:json)?\s*(.*?)```", text, re.DOTALL)
    if fence:
        text = fence.group(1).strip()
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidate = text[start:end + 1]
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            pass
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None


async def _run(system_message: str, user_text: str, session_id: str) -> str:
    client = _get_client()
    resp = await client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_text},
        ],
        temperature=0.4,
    )
    return resp.choices[0].message.content or ""


def _truncate(text: str, limit: int = 9000) -> str:
    return text[:limit] if text else ""


def _fit_context_text(fit_context: Optional[dict]) -> str:
    if not fit_context:
        return ""
    gaps = fit_context.get("gaps") or []
    missing_keywords = fit_context.get("missing_keywords") or []
    parts = []
    gap_lines = []
    for gap in gaps[:5]:
        if isinstance(gap, dict):
            title = gap.get("title", "Gap")
            detail = gap.get("detail", "")
            gap_lines.append(f"- {title}: {detail}".strip())
    if gap_lines:
        parts.append("Known gaps to address:\n" + "\n".join(gap_lines))
    if missing_keywords:
        parts.append("Prioritize these missing keywords where truthful: " + ", ".join(str(item) for item in missing_keywords[:15]))
    return "\n\n".join(parts)


# ----------------- AGENTS -----------------

async def fit_analysis_agent(resume: str, jd: str, app_id: str) -> dict:
    system = (
        "You are an elite career strategist and recruiter. Compare a candidate's resume "
        "against a job description and produce a precise, honest fit analysis. "
        "Respond ONLY with valid JSON matching this schema: "
        '{"match_rate": <int 0-100>, "verdict": "<one short sentence>", '
        '"summary": "<2-3 sentence overview>", '
        '"strengths": [{"title": "<str>", "detail": "<str>"}], '
        '"gaps": [{"title": "<str>", "detail": "<str>", "severity": "low|medium|high"}], '
        '"matched_keywords": ["<str>"], "missing_keywords": ["<str>"]}'
    )
    user = f"JOB DESCRIPTION:\n{_truncate(jd)}\n\nRESUME:\n{_truncate(resume)}"
    raw = await _run(system, user, f"{app_id}-fit")
    data = _extract_json(raw) or {}
    data.setdefault("match_rate", 0)
    data.setdefault("verdict", "")
    data.setdefault("summary", "")
    data.setdefault("strengths", [])
    data.setdefault("gaps", [])
    data.setdefault("matched_keywords", [])
    data.setdefault("missing_keywords", [])
    return data


async def ats_score_agent(resume: str, jd: str, app_id: str) -> dict:
    system = (
        "You are an ATS (Applicant Tracking System) simulator and resume optimization expert. "
        "Score how well the resume would pass an ATS for the given job. "
        "Respond ONLY with valid JSON matching this schema: "
        '{"overall_score": <int 0-100>, '
        '"breakdown": [{"category": "Keyword Match|Formatting|Relevance|Completeness|Impact", '
        '"score": <int 0-100>, "note": "<short str>"}], '
        '"missing_keywords": ["<str>"], '
        '"suggestions": ["<actionable str>"]}'
    )
    user = f"JOB DESCRIPTION:\n{_truncate(jd)}\n\nRESUME:\n{_truncate(resume)}"
    raw = await _run(system, user, f"{app_id}-ats")
    data = _extract_json(raw) or {}
    data.setdefault("overall_score", 0)
    data.setdefault("breakdown", [])
    data.setdefault("missing_keywords", [])
    data.setdefault("suggestions", [])
    return data


async def resume_rewrite_agent(resume: str, jd: str, app_id: str, fit_context: Optional[dict] = None) -> dict:
    system = (
        "You are a world-class resume writer. Rewrite and optimize the candidate's resume to "
        "target the given job description: stronger action verbs, quantified impact, ATS keywords, "
        "and clear structure. Keep it truthful to the original experience. "
        "Respond ONLY with valid JSON matching this schema: "
        '{"rewritten_resume": "<full rewritten resume as clean plain text with line breaks>", '
        '"changes": [{"section": "<str>", "original": "<short excerpt>", '
        '"improved": "<short excerpt>", "reason": "<why>"}], '
        '"summary_of_changes": "<2-3 sentences>"}'
    )
    context_text = _fit_context_text(fit_context)
    user = f"TARGET JOB DESCRIPTION:\n{_truncate(jd)}\n\nORIGINAL RESUME:\n{_truncate(resume)}"
    if context_text:
        user = f"{context_text}\n\n{user}"
    raw = await _run(system, user, f"{app_id}-rewrite")
    data = _extract_json(raw) or {}
    data.setdefault("rewritten_resume", "")
    data.setdefault("changes", [])
    data.setdefault("summary_of_changes", "")
    return data


async def cover_letter_agent(resume: str, jd: str, company: str, role: str, app_id: str, fit_context: Optional[dict] = None) -> dict:
    system = (
        "You are a professional cover letter writer. Write a compelling, tailored, modern "
        "cover letter (250-350 words) connecting the candidate's experience to the role. "
        "Confident, specific, no clichés or fluff. "
        "Respond ONLY with valid JSON matching this schema: "
        '{"cover_letter": "<full cover letter text with paragraph breaks>", '
        '"hook": "<the strong opening line>"}'
    )
    context_text = _fit_context_text(fit_context)
    user = (f"ROLE: {role}\nCOMPANY: {company}\n\nJOB DESCRIPTION:\n{_truncate(jd)}\n\n"
            f"CANDIDATE RESUME:\n{_truncate(resume)}")
    if context_text:
        user = f"{context_text}\n\n{user}"
    raw = await _run(system, user, f"{app_id}-cover")
    data = _extract_json(raw) or {}
    data.setdefault("cover_letter", "")
    data.setdefault("hook", "")
    return data


async def interview_pack_agent(resume: str, jd: str, role: str, app_id: str, fit_context: Optional[dict] = None) -> dict:
    system = (
        "You are an expert interview coach. Generate a tailored interview preparation pack for "
        "this candidate and role. Mix behavioral, technical, and role-specific questions. "
        "Respond ONLY with valid JSON matching this schema: "
        '{"questions": [{"question": "<str>", "category": "Behavioral|Technical|Role-specific|Culture", '
        '"difficulty": "easy|medium|hard", "suggested_answer": "<concise model answer using STAR>", '
        '"tip": "<short tip>"}], '
        '"focus_areas": ["<str>"]}'
    )
    context_text = _fit_context_text(fit_context)
    user = f"ROLE: {role}\n\nJOB DESCRIPTION:\n{_truncate(jd)}\n\nCANDIDATE RESUME:\n{_truncate(resume)}"
    if context_text:
        user = f"{context_text}\n\n{user}"
    raw = await _run(system, user, f"{app_id}-interview")
    data = _extract_json(raw) or {}
    data.setdefault("questions", [])
    data.setdefault("focus_areas", [])
    return data


async def salary_negotiation_agent(resume: str, jd: str, role: str, app_id: str, fit_context: Optional[dict] = None) -> dict:
    system = (
        "You are an expert salary negotiation coach. Based on the candidate's resume and the job description, "
        "estimate the market value and provide negotiation scripts for different scenarios (e.g., lowball offer, "
        "asking for more equity/benefits). "
        "Respond ONLY with valid JSON matching this schema: "
        '{"market_value_estimate": "<str>", '
        '"negotiation_scripts": [{"scenario": "<str>", "script": "<str>"}], '
        '"tips": ["<str>"]}'
    )
    context_text = _fit_context_text(fit_context)
    user = f"ROLE: {role}\n\nJOB DESCRIPTION:\n{_truncate(jd)}\n\nCANDIDATE RESUME:\n{_truncate(resume)}"
    if context_text:
        user = f"{context_text}\n\n{user}"
    raw = await _run(system, user, f"{app_id}-salary")
    data = _extract_json(raw) or {}
    data.setdefault("market_value_estimate", "Unknown")
    data.setdefault("negotiation_scripts", [])
    data.setdefault("tips", [])
    return data


async def run_full_pipeline(resume: str, jd: str, company: str, role: str, app_id: str) -> dict:
    fit = await fit_analysis_agent(resume, jd, app_id)
    context = {"gaps": fit.get("gaps", []), "missing_keywords": fit.get("missing_keywords", [])}
    ats, rewrite, cover, interview, salary = await asyncio.gather(
        ats_score_agent(resume, jd, app_id),
        resume_rewrite_agent(resume, jd, app_id, fit_context=context),
        cover_letter_agent(resume, jd, company, role, app_id, fit_context=context),
        interview_pack_agent(resume, jd, role, app_id, fit_context=context),
        salary_negotiation_agent(resume, jd, role, app_id, fit_context=context),
    )
    return {
        "fit_analysis": fit,
        "ats_score": ats,
        "resume_rewrite": rewrite,
        "cover_letter": cover,
        "interview_pack": interview,
        "salary_negotiation": salary,
    }


AGENT_MAP = {
    "fit_analysis": lambda resume, jd, company, role, app_id, fit_context=None: fit_analysis_agent(resume, jd, app_id),
    "ats_score": lambda resume, jd, company, role, app_id, fit_context=None: ats_score_agent(resume, jd, app_id),
    "resume_rewrite": lambda resume, jd, company, role, app_id, fit_context=None: resume_rewrite_agent(resume, jd, app_id, fit_context=fit_context),
    "cover_letter": lambda resume, jd, company, role, app_id, fit_context=None: cover_letter_agent(resume, jd, company, role, app_id, fit_context=fit_context),
    "interview_pack": lambda resume, jd, company, role, app_id, fit_context=None: interview_pack_agent(resume, jd, role, app_id, fit_context=fit_context),
    "salary_negotiation": lambda resume, jd, company, role, app_id, fit_context=None: salary_negotiation_agent(resume, jd, role, app_id, fit_context=fit_context),
}
