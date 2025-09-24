from sqlalchemy import Column, Integer, String, Float, JSON
from app.database import Base
from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from .database import Base
from sqlalchemy import Column, Integer, String, Float, JSON, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from sqlalchemy import Column, Integer, String, JSON, Date
from database import Base
from sqlalchemy import Column, Integer, String, JSON, Date
from database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

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

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    quiz_id = Column(Integer, index=True)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    score = Column(Float)
    synced = Column(Boolean, default=False)  # To mark if offline attempt is synced
    questions = relationship("QuestionAttempt", back_populates="quiz", cascade="all, delete-orphan")

class QuestionAttempt(Base):
    __tablename__ = "question_attempts"
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quiz_attempts.id"))
    question_id = Column(Integer)
    selected_option = Column(String)
    time_taken = Column(Float)
    correct = Column(Boolean)
    quiz = relationship("QuizAttempt", back_populates="questions")
    
class QuizSession(Base):
    __tablename__ = "quiz_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    subject = Column(String, nullable=True)
    difficulty = Column(String, nullable=True)
    start_time = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

class QuizLog(Base):
    __tablename__ = "quiz_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    question_id = Column(Integer)
    chosen_answer = Column(String)
    correct = Column(Integer)
    response_time = Column(Float)   # seconds spent on the question
    subject = Column(String)
    difficulty = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    synced = Column(Boolean, default=True)  # false if offline and not yet synced
class UserProgress(Base):
    __tablename__ = "user_progress"
    user_id = Column(Integer, primary_key=True, index=True)
    total_xp = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    last_quiz_date = Column(Date)
    badges = Column(JSON, default=[])

class Badge(Base):
    __tablename__ = "badges"
    badge_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    criteria = Column(JSON, nullable=False)
    
class UserProgress(Base):
    __tablename__ = "user_progress"
    user_id = Column(Integer, primary_key=True, index=True)
    total_xp = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    last_quiz_date = Column(Date)
    badges = Column(JSON, default=[])

class Badge(Base):
    __tablename__ = "badges"
    badge_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    criteria = Column(JSON, nullable=False)
class UserProgress(Base):
    __tablename__ = "user_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    xp = Column(Integer, default=0)
    streak = Column(Integer, default=0)
    last_quiz_date = Column(DateTime, default=datetime.datetime.utcnow)
    badges = Column(String, default="")  # comma separated badge ids

class Badge(Base):
    __tablename__ = "badges"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    criteria = Column(String)  # e.g., "xp_100", "streak_7"
    description = Column(String)