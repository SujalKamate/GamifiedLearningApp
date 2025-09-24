from sqlalchemy.orm import Session
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
