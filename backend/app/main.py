from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from typing import List
import sqlite3
from datetime import datetime, timedelta
from app.routers import quiz
from app.routers import badges
from app.routers import analytics
from app.routers import streak
from app.routers import leveling
from app.routers import adaptive
from app.routers import dashboard
from app.routers import quiz_history
app.include_router(quiz_history.router, prefix="/history", tags=["quiz-history"])

app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])

app.include_router(adaptive.router, prefix="/adaptive", tags=["adaptive"])


app.include_router(leveling.router, prefix="/leveling", tags=["leveling"])

app.include_router(streak.router, prefix="/streak", tags=["streak"])

app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])


app.include_router(badges.router, prefix="/badges", tags=["badges"])


from app.routers import adaptive
app.include_router(adaptive.router, prefix="/adaptive", tags=["adaptive"])


app.include_router(quiz.router, prefix="/quiz", tags=["quiz"])


app = FastAPI()

# ---------------------------
# Pydantic Schemas
# ---------------------------
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

# ---------------------------
# Helper Functions
# ---------------------------
def get_db_connection():
    conn = sqlite3.connect("quiz.db")
    conn.row_factory = sqlite3.Row
    return conn

def calculate_xp(score, total_questions, fast_answers_count=0):
    base_xp = score * 10
    bonus_xp = fast_answers_count * 5
    return base_xp + bonus_xp

def get_next_difficulty(current_difficulty, accuracy):
    if accuracy >= 0.8:
        return "hard" if current_difficulty == "medium" else "medium"
    elif accuracy <= 0.4:
        return "easy" if current_difficulty == "medium" else "medium"
    else:
        return current_difficulty

# ---------------------------
# Submit Quiz Endpoint
# ---------------------------
@app.post("/submit-quiz", response_model=SubmitQuizResponse)
def submit_quiz(payload: SubmitQuizRequest):
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Fetch correct answers
    question_ids = [a.question_id for a in payload.answers]
    placeholders = ",".join("?" * len(question_ids))
    cur.execute(f"SELECT id, correct_answer FROM questions WHERE id IN ({placeholders})", question_ids)
    correct_answers = {row["id"]: row["correct_answer"] for row in cur.fetchall()}
    
    # Calculate score
    score = 0
    fast_answers_count = 0
    for ans in payload.answers:
        if ans.question_id in correct_answers:
            if ans.chosen_answer == correct_answers[ans.question_id]:
                score += 1
                # Hackathon: assume user answered fast (optional)
                fast_answers_count += 1
    
    total_questions = len(payload.answers)
    accuracy = score / total_questions if total_questions > 0 else 0
    xp_gained = calculate_xp(score, total_questions, fast_answers_count)
    
    # Update user XP, streak, badges
    cur.execute("SELECT xp, streak, last_quiz_date, badges FROM users WHERE id = ?", (payload.user_id,))
    user = cur.fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    # Streak update
    last_quiz_date = datetime.strptime(user["last_quiz_date"], "%Y-%m-%d") if user["last_quiz_date"] else None
    today = datetime.now().date()
    if last_quiz_date == today - timedelta(days=1):
        new_streak = user["streak"] + 1
    elif last_quiz_date == today:
        new_streak = user["streak"]  # Already played today
    else:
        new_streak = 1  # reset streak
    
    # Badge update (simple example)
    badges = user["badges"].split(",") if user["badges"] else []
    if xp_gained + user["xp"] >= 50 and "Beginner" not in badges:
        badges.append("Beginner")
    if xp_gained + user["xp"] >= 200 and "Scholar" not in badges:
        badges.append("Scholar")
    
    # Update DB
    cur.execute("""
        UPDATE users
        SET xp = xp + ?, streak = ?, last_quiz_date = ?, badges = ?
        WHERE id = ?
    """, (xp_gained, new_streak, today.strftime("%Y-%m-%d"), ",".join(badges), payload.user_id))
    
    # Log quiz attempts
    for ans in payload.answers:
        cur.execute("""
            INSERT INTO quiz_logs (user_id, question_id, chosen_answer, correct, response_time, subject, difficulty)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (payload.user_id, ans.question_id, ans.chosen_answer, 
              int(ans.chosen_answer == correct_answers[ans.question_id]), 5, payload.subject, payload.current_difficulty))
    
    conn.commit()
    conn.close()
    
    next_difficulty = get_next_difficulty(payload.current_difficulty, accuracy)
    
    return SubmitQuizResponse(
        score=score,
        xp_gained=xp_gained,
        new_streak=new_streak,
        badges_unlocked=badges,
        next_difficulty=next_difficulty
    )
