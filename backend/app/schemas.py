from pydantic import BaseModel
from typing import List, Optional
from pydantic import BaseModel
from typing import List
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    xp: int
    streak: int
    badges: List[str] = []

    class Config:
        orm_mode = True

class QuestionBase(BaseModel):
    subject: str
    difficulty: str
    question_text: str
    options: List[str]
    correct_answer: str

class QuizSubmit(BaseModel):
    user_id: int
    answers: List[dict]  # [{question_id: int, chosen_answer: str, response_time: float}]

class Answer(BaseModel):
    question_id: int
    chosen_answer: str

class SubmitQuizRequest(BaseModel):
    user_id: int
    subject: str
    current_difficulty: str
    answers: List[Answer]

class SubmitQuizResponse(BaseModel):
    score: int
    xp_gained: int
    new_streak: int
    badges_unlocked: List[str]
    next_difficulty: str
class OfflineAnswer(BaseModel):
    question_id: int
    chosen_answer: str

class OfflineQuiz(BaseModel):
    subject: str
    current_difficulty: str
    answers: List[OfflineAnswer]

class SubmitOfflineRequest(BaseModel):
    user_id: int
    quizzes: List[OfflineQuiz]

class SubmitOfflineResponse(BaseModel):
    total_xp_gained: int
    new_streak: int
    badges_unlocked: List[str]
    next_difficulties: List[str]
class QuestionAttemptSchema(BaseModel):
    question_id: int
    selected_option: str
    time_taken: float
    correct: bool

class QuizAttemptSchema(BaseModel):
    user_id: int
    quiz_id: int
    start_time: datetime
    end_time: datetime
    score: float
    questions: List[QuestionAttemptSchema]

class BatchQuizSubmissionSchema(BaseModel):
    attempts: List[QuizAttemptSchema]
class Answer(BaseModel):
    question_id: int
    chosen_answer: str
    response_time: Optional[float] = None   # seconds — frontend should send if available
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import date

class BadgeSchema(BaseModel):
    badge_id: int
    name: str
    description: Optional[str]

class UserProgressSchema(BaseModel):
    user_id: int
    total_xp: int
    current_streak: int
    badges: List[BadgeSchema]
    last_quiz_date: Optional[date]
