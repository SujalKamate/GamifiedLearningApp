from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas, models
from app.database import get_db
from pydantic import BaseModel
from typing import Optional
import os
from jose import jwt
from datetime import datetime, timedelta
from google.oauth2 import id_token as google_id_token

router = APIRouter()

class GoogleAuthRequest(BaseModel):
    id_token: str

class AuthResponse(BaseModel):
    token: str
    user: schemas.UserResponse

@router.post("/signup", response_model=AuthResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    created = crud.create_user(db, user.name, user.email, user.password)
    token = create_jwt(created)
    return AuthResponse(
        token=token,
        user=schemas.UserResponse(
            id=created.id,
            name=created.name,
            email=created.email,
            xp=created.xp or 0,
            streak=created.streak or 0,
            badges=created.badges or [],
        ),
    )

@router.get("/login", response_model=AuthResponse)
def login(email: str, password: str, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=email)
    if not db_user or db_user.password != password:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    token = create_jwt(db_user)
    return AuthResponse(
        token=token,
        user=schemas.UserResponse(
            id=db_user.id,
            name=db_user.name,
            email=db_user.email,
            xp=db_user.xp or 0,
            streak=db_user.streak or 0,
            badges=db_user.badges or [],
        ),
    )

def create_jwt(user: models.User) -> str:
    secret = os.getenv("JWT_SECRET", "dev-secret")
    algo = os.getenv("JWT_ALGORITHM", "HS256")
    expires_minutes = int(os.getenv("JWT_EXPIRES_MIN", "120"))
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "exp": datetime.utcnow() + timedelta(minutes=expires_minutes),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, secret, algorithm=algo)


@router.post("/google", response_model=AuthResponse)
def google_auth(body: GoogleAuthRequest, db: Session = Depends(get_db)):
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    if not client_id:
        raise HTTPException(status_code=500, detail="GOOGLE_CLIENT_ID not configured")
    try:
        # Lazy import to avoid hard dependency on 'requests' at startup
        try:
            from google.auth.transport import requests as google_requests  # type: ignore
            request_adapter = google_requests.Request()
        except Exception:
            # Fallback: if transport isn't available, surface a clear error when endpoint is used
            raise HTTPException(status_code=503, detail="Google auth transport not available. Install 'requests' or disable Google login.")

        idinfo = google_id_token.verify_oauth2_token(body.id_token, request_adapter, client_id)
        email = idinfo.get("email")
        name = idinfo.get("name") or email.split("@")[0]
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {e}")

    user = crud.get_user_by_email(db, email=email)
    if not user:
        # Create user with no password (Google account)
        user = crud.create_user(db, name=name, email=email, password="")

    token = create_jwt(user)

    return AuthResponse(
        token=token,
        user=schemas.UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            xp=user.xp or 0,
            streak=user.streak or 0,
            badges=user.badges or [],
        ),
    )
