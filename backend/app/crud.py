from sqlalchemy.orm import Session
from app import models
from sqlalchemy.orm import Session
from . import models, schemas
from sqlalchemy.orm import Session
from datetime import datetime
from app import models

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, name: str, email: str, password: str):
    user = models.User(name=name, email=email, password=password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_questions(db: Session, subject: str, difficulty: str, limit: int = 5):
    return db.query(models.Question).filter(
        models.Question.subject == subject,
        models.Question.difficulty == difficulty
    ).limit(limit).all()
def get_quiz_attempt(db: Session, user_id: int, quiz_id: int):
    return db.query(models.QuizAttempt).filter_by(user_id=user_id, quiz_id=quiz_id).first()

def create_quiz_attempt(db: Session, attempt: schemas.QuizAttemptSchema):
    db_attempt = models.QuizAttempt(
        user_id=attempt.user_id,
        quiz_id=attempt.quiz_id,
        start_time=attempt.start_time,
        end_time=attempt.end_time,
        score=attempt.score,
        synced=True
    )
    db.add(db_attempt)
    db.commit()
    db.refresh(db_attempt)
    return db_attempt

def create_question_attempt(db: Session, quiz_id: int, question: schemas.QuestionAttemptSchema):
    db_question = models.QuestionAttempt(
        quiz_id=quiz_id,
        question_id=question.question_id,
        selected_option=question.selected_option,
        time_taken=question.time_taken,
        correct=question.correct
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question
def create_quiz_session(db: Session, user_id: int, subject: str = None, difficulty: str = None):
    # deactivate existing sessions for safety
    db.query(models.QuizSession).filter(models.QuizSession.user_id == user_id, models.QuizSession.is_active == True).update({"is_active": False})
    session = models.QuizSession(user_id=user_id, subject=subject, difficulty=difficulty, is_active=True)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

def get_active_session(db: Session, user_id: int):
    return db.query(models.QuizSession).filter(models.QuizSession.user_id == user_id, models.QuizSession.is_active == True).first()

def close_session(db: Session, session_id: int):
    s = db.query(models.QuizSession).filter(models.QuizSession.id == session_id).first()
    if s:
        s.is_active = False
        db.commit()
    return s

def log_quiz_answers(db: Session, user_id: int, subject: str, difficulty: str, answers: list, synced: bool = True):
    # answers is list of dicts: {question_id, chosen_answer, correct, response_time}
    logs = []
    for a in answers:
        log = models.QuizLog(
            user_id=user_id,
            question_id=a.get("question_id"),
            chosen_answer=a.get("chosen_answer"),
            correct=1 if a.get("correct") else 0,
            response_time=a.get("response_time", 0),
            subject=subject,
            difficulty=difficulty,
            synced=synced
        )
        db.add(log)
        logs.append(log)
    db.commit()
    # refresh logs if needed
    return logs