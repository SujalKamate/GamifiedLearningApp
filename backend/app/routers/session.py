# app/routers/session.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas

router = APIRouter()

@router.post("/start")
def start_session(user_id: int, subject: str = None, difficulty: str = None, db: Session = Depends(get_db)):
    session = crud.create_quiz_session(db, user_id=user_id, subject=subject, difficulty=difficulty)
    return {"session_id": session.id, "message": "Session started"}

@router.post("/end")
def end_session(session_id: int, db: Session = Depends(get_db)):
    s = crud.close_session(db, session_id)
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session ended"}
