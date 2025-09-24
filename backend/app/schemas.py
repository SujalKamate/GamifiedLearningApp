from pydantic import BaseModel
from typing import List, Optional

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
