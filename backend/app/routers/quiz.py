from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
from app import crud, schemas, models
from app.database import get_db
from app.utils.gamification import calculate_quiz_xp, update_gamification_for_user

router = APIRouter(prefix="/quiz", tags=["Quiz"])

# XP calculation
def calculate_xp(score: int, total_questions: int, fast_answers: int = 0):
    base_xp = score * 10
    bonus_xp = fast_answers * 5
    return base_xp + bonus_xp

# Determine next difficulty
def get_next_difficulty(current_difficulty: str, accuracy: float):
    if accuracy >= 0.8:
        return "hard" if current_difficulty == "medium" else "medium"
    elif accuracy <= 0.4:
        return "easy" if current_difficulty == "medium" else "medium"
    else:
        return current_difficulty

# -------------------------
# Online quiz submission
# -------------------------
@router.post("/submit", response_model=schemas.SubmitQuizResponse)
def submit_quiz(payload: schemas.SubmitQuizRequest, db: Session = Depends(get_db)):
    # Fetch correct answers
    questions = crud.get_questions(db, payload.subject, payload.current_difficulty, limit=len(payload.answers))
    correct_answers = {q.id: q.correct_answer for q in questions}

    # Calculate score and fast answers
    score = 0
    fast_answers_count = 0
    for ans in payload.answers:
        if ans.question_id in correct_answers and ans.chosen_answer == correct_answers[ans.question_id]:
            score += 1
            fast_answers_count += 1  # optional

    total_questions = len(payload.answers)
    accuracy = score / total_questions if total_questions > 0 else 0
    xp_gained = calculate_xp(score, total_questions, fast_answers_count)

    # Fetch user
    user = db.query(models.User).filter(models.User.id == payload.user_id).first()
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

# -------------------------
# Offline batch submission
# -------------------------
@router.post("/submit-offline", response_model=schemas.SubmitOfflineResponse)
def submit_offline_quizzes(payload: schemas.SubmitOfflineRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    total_xp = 0
    next_difficulties = []
    badges = user.badges or []

    for quiz in payload.quizzes:
        # Fetch correct answers
        questions = crud.get_questions(db, quiz.subject, quiz.current_difficulty, limit=len(quiz.answers))
        correct_answers = {q.id: q.correct_answer for q in questions}

        # Calculate score
        score = sum(1 for ans in quiz.answers if ans.question_id in correct_answers and ans.chosen_answer == correct_answers[ans.question_id])
        total_questions = len(quiz.answers)
        accuracy = score / total_questions if total_questions > 0 else 0

        # XP calculation
        xp_gained = score * 10
        total_xp += xp_gained

        # Determine next difficulty
        next_diff = get_next_difficulty(quiz.current_difficulty, accuracy)
        next_difficulties.append(next_diff)

        # Log each answer
        for ans in quiz.answers:
            db.add(models.QuizLog(
                user_id=user.id,
                question_id=ans.question_id,
                chosen_answer=ans.chosen_answer,
                correct=int(ans.chosen_answer == correct_answers.get(ans.question_id)),
                response_time=5,  # offline assumed
                subject=quiz.subject,
                difficulty=quiz.current_difficulty
            ))

    # Update user stats
    user.xp += total_xp
    user.streak = user.streak + 1 if user.streak else 1  # simple streak update

    # Update badges
    if user.xp >= 50 and "Beginner" not in badges:
        badges.append("Beginner")
    if user.xp >= 200 and "Scholar" not in badges:
        badges.append("Scholar")
    user.badges = badges

    db.commit()
    db.refresh(user)

    return schemas.SubmitOfflineResponse(
        total_xp_gained=total_xp,
        new_streak=user.streak,
        badges_unlocked=badges,
        next_difficulties=next_difficulties
    )

# -------------------------
# Batch quiz submission (alternative endpoint)
# -------------------------
@router.post("/offline/submit")
def submit_offline_batch(batch: schemas.BatchQuizSubmissionSchema, db: Session = Depends(get_db)):
    response_data = []

    for attempt in batch.attempts:
        # Check if attempt already exists
        existing = crud.get_quiz_attempt(db, user_id=attempt.user_id, quiz_id=attempt.quiz_id)
        if existing:
            response_data.append({"quiz_id": attempt.quiz_id, "status": "already_submitted"})
            continue

        # Save quiz attempt
        quiz_db = crud.create_quiz_attempt(db, attempt)

        # Save question attempts
        for question in attempt.questions:
            crud.create_question_attempt(db, quiz_id=quiz_db.id, question=question)

        response_data.append({"quiz_id": attempt.quiz_id, "status": "submitted"})

    return {"message": "Batch submission complete", "results": response_data}
