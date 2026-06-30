import os
import secrets
import string
import jwt
import bcrypt
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, Request
from bson import ObjectId

JWT_ALGORITHM = "HS256"
ACCESS_MIN = 60 * 24
REFRESH_DAYS = 7
MAX_FAILED = 5
LOCK_MINUTES = 15


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def cookie_secure() -> bool:
    return os.environ.get("COOKIE_SECURE", "false").lower() == "true"


def cookie_samesite() -> str:
    # Cross-site auth cookies require SameSite=None together with Secure=true on HTTPS.
    return "none" if cookie_secure() else "lax"


def _cookie_kwargs():
    return {"secure": cookie_secure(), "samesite": cookie_samesite(), "path": "/"}


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_MIN),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_DAYS),
        "type": "refresh",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookies(response, access_token: str, refresh_token: str):
    kw = _cookie_kwargs()
    response.set_cookie(
        key="access_token", value=access_token, httponly=True,
        max_age=ACCESS_MIN * 60, **kw,
    )
    response.set_cookie(
        key="refresh_token", value=refresh_token, httponly=True,
        max_age=REFRESH_DAYS * 86400, **kw,
    )


def set_access_cookie(response, access_token: str):
    kw = _cookie_kwargs()
    response.set_cookie(
        key="access_token", value=access_token, httponly=True,
        max_age=ACCESS_MIN * 60, **kw,
    )


def clear_auth_cookies(response):
    kw = _cookie_kwargs()
    response.delete_cookie("access_token", **kw)
    response.delete_cookie("refresh_token", **kw)


def _token_from_request(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    return token


async def get_current_user_from_db(request: Request, db) -> dict:
    token = _token_from_request(request)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["id"] = str(user["_id"])
        user.pop("_id", None)
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def require_admin(request: Request, db) -> dict:
    user = await get_current_user_from_db(request, db)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


async def check_lockout(db, identifier: str):
    rec = await db.login_attempts.find_one({"identifier": identifier})
    if rec and rec.get("count", 0) >= MAX_FAILED:
        locked_until = rec.get("locked_until")
        if locked_until and datetime.fromisoformat(locked_until) > datetime.now(timezone.utc):
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again later.")


async def register_failed_attempt(db, identifier: str):
    rec = await db.login_attempts.find_one({"identifier": identifier})
    count = (rec.get("count", 0) if rec else 0) + 1
    update = {"count": count}
    if count >= MAX_FAILED:
        update["locked_until"] = (datetime.now(timezone.utc) + timedelta(minutes=LOCK_MINUTES)).isoformat()
    await db.login_attempts.update_one({"identifier": identifier}, {"$set": update}, upsert=True)


async def clear_attempts(db, identifier: str):
    await db.login_attempts.delete_one({"identifier": identifier})


async def seed_admin(db):
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@careeros.ai").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD")
    if not admin_password:
        alphabet = string.ascii_letters + string.digits
        admin_password = "".join(secrets.choice(alphabet) for _ in range(16))
        print(f"[STARTUP] Generated admin password: {admin_password}")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email},
                                  {"$set": {"password_hash": hash_password(admin_password)}})
