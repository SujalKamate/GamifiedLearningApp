# backend/main.py
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import random
from database import get_db_connection
from schemas import Question


app = FastAPI()

# DB connection helper
def get_db_connection():
    conn = sqlite3.connect("quiz.db")
    conn.row_factory = sqlite3.Row
    return conn

# Pydantic model for Question
class Question(BaseModel):
    id: int
    subject: str
    topic: str
    question_text: str
    options: List[str]
    difficulty: str

# Adaptive difficulty logic
def adjust_difficulty(current_difficulty: str, accuracy: float):
    if accuracy >= 0.8:
        if current_difficulty == "easy":
            return "medium"
        elif current_difficulty == "medium":
            return "hard"
        else:
            return "hard"
    elif accuracy <= 0.4:
        if current_difficulty == "hard":
            return "medium"
        elif current_difficulty == "medium":
            return "easy"
        else:
            return "easy"
    else:
        return current_difficulty

# Endpoint to fetch quiz questions
@app.get("/get-quiz", response_model=List[Question])
def get_quiz(user_id: int = Query(...), subject: str = Query(...), current_difficulty: str = Query("medium"), num_questions: int = Query(5)):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Fetch questions of given subject & difficulty
    cursor.execute(
        "SELECT * FROM questions WHERE subject = ? AND difficulty = ?",
        (subject.lower(), current_difficulty.lower())
    )
    rows = cursor.fetchall()
    
    if not rows:
        conn.close()
        raise HTTPException(status_code=404, detail="No questions found for this subject/difficulty")
    
    # Randomly select questions
    selected_questions = random.sample(rows, min(num_questions, len(rows)))
    
    # Convert to list of Question models
    questions_list = []
    for q in selected_questions:
        questions_list.append(Question(
            id=q["id"],
            subject=q["subject"],
            topic=q["topic"],
            question_text=q["question_text"],
            options=q["options"].split("|"),  # Assuming options stored as pipe-separated
            difficulty=q["difficulty"]
        ))
    
    conn.close()
    return questions_list
