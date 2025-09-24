from sqlalchemy import Column, Integer, String, Float, JSON
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    xp = Column(Integer, default=0)
    streak = Column(Integer, default=0)
    badges = Column(JSON, default=[])

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String)
    difficulty = Column(String)  # easy / medium / hard
    question_text = Column(String)
    options = Column(JSON)
    correct_answer = Column(String)

class QuizLog(Base):
    __tablename__ = "quiz_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    question_id = Column(Integer)
    chosen_answer = Column(String)
    correct = Column(Integer)
    response_time = Column(Float)
