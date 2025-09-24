from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db
from datetime import datetime, timedelta

router = APIRouter()

def calculate_xp(score: int, total_questions: int, fast_answers: int = 0):
    base_xp = score * 10
    bonus_xp = fast_answers * 5
    return base_xp + bonus_xp

def get_next_difficulty(current_difficulty: str, accuracy: float):
    if accuracy >= 0.8:
        return "hard" if current_difficulty == "medium" else "medium"
    elif accuracy <= 0.4:
        return "easy" if current_difficulty == "medium" else "medium"
    else:
        return current_difficulty

@router.post("/submit", response_model=schemas.SubmitQuizResponse)
def submit_quiz(payload: schemas.SubmitQuizRequest, db: Session = Depends(get_db)):
    # Fetch correct answers
    questions = crud.get_questions(db, payload.subject, payload.current_difficulty, limit=len(payload.answers))
    correct_answers = {q.id: q.correct_answer for q in questions}

    # Calculate score
    score = 0
    fast_answers_count = 0
    for ans in payload.answers:
        if ans.question_id in correct_answers and ans.chosen_answer == correct_answers[ans.question_id]:
            score += 1
            fast_answers_count += 1  # optional: assume answered fast

    total_questions = len(payload.answers)
    accuracy = score / total_questions if total_questions > 0 else 0
    xp_gained = calculate_xp(score, total_questions, fast_answers_count)

    # Fetch user
    user = db.query(crud.models.User).filter(crud.models.User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update streak
    today = datetime.now().date()
    last_quiz_date = user.last_quiz_date
    if last_quiz_date and last_quiz_date == today - timedelta(days=1):
        user.streak += 1
    elif last_quiz_date != today:
        user.streak = 1  # reset streak

    # Update XP and badges
    user.xp += xp_gained
    badges = user.badges or []
    if user.xp >= 50 and "Beginner" not in badges:
        badges.append("Beginner")
    if user.xp >= 200 and "Scholar" not in badges:
        badges.append("Scholar")
    user.badges = badges
    user.last_quiz_date = today

    # Commit updates
    db.commit()
    db.refresh(user)

    # Determine next difficulty
    next_difficulty = get_next_difficulty(payload.current_difficulty, accuracy)

    return schemas.SubmitQuizResponse(
        score=score,
        xp_gained=xp_gained,
        new_streak=user.streak,
        badges_unlocked=user.badges,
        next_difficulty=next_difficulty
    )
