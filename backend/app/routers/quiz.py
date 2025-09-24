from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import BatchQuizSubmissionSchema
from .. import crud
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app import crud, models, schemas
from app.utils.gamification import calculate_quiz_xp, update_gamification_for_user
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from gamification import update_progress
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import UserProgress
from gamification import calculate_xp, update_streak, unlock_badges

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
        score = 0
        for ans in quiz.answers:
            if ans.question_id in correct_answers and ans.chosen_answer == correct_answers[ans.question_id]:
                score += 1

        total_questions = len(quiz.answers)
        accuracy = score / total_questions if total_questions > 0 else 0

        # XP calculation
        xp_gained = score * 10
        total_xp += xp_gained

        # Determine next difficulty
        if accuracy >= 0.8:
            next_diff = "hard" if quiz.current_difficulty == "medium" else "medium"
        elif accuracy <= 0.4:
            next_diff = "easy" if quiz.current_difficulty == "medium" else "medium"
        else:
            next_diff = quiz.current_difficulty

        next_difficulties.append(next_diff)

        # Log each answer
        for ans in quiz.answers:
            db.add(models.QuizLog(
                user_id=user.id,
                question_id=ans.question_id,
                chosen_answer=ans.chosen_answer,
                correct=int(ans.chosen_answer == correct_answers.get(ans.question_id)),
                response_time=5,  # offline assumed default
                subject=quiz.subject,
                difficulty=quiz.current_difficulty
            ))

    # Update user stats
    user.xp += total_xp
    user.streak = user.streak + 1 if user.streak else 1  # simple streak update

    # Badges example
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
@router.post("/offline/submit")
def submit_offline_quizzes(batch: BatchQuizSubmissionSchema, db: Session = Depends(get_db)):
    response_data = []

    for attempt in batch.attempts:
        # Check if attempt already exists
        existing = crud.get_quiz_attempt(db, user_id=attempt.user_id, quiz_id=attempt.quiz_id)
        
        if existing:
            # Conflict resolution: skip or update partially
            response_data.append({"quiz_id": attempt.quiz_id, "status": "already_submitted"})
            continue
        
        # Save quiz attempt
        quiz_db = crud.create_quiz_attempt(db, attempt)

        # Save question attempts
        for question in attempt.questions:
            crud.create_question_attempt(db, quiz_id=quiz_db.id, question=question)

        response_data.append({"quiz_id": attempt.quiz_id, "status": "submitted"})

    return {"message": "Batch submission complete", "results": response_data}
@router.post("/submit", response_model=schemas.SubmitQuizResponse)
def submit_quiz(payload: schemas.SubmitQuizRequest, db: Session = Depends(get_db)):
    # Verify user
    user = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check active session (optional enforcement)
    active_session = crud.get_active_session(db, payload.user_id)
    # optional: if you want to enforce active session -> uncomment next block
    # if not active_session:
    #     raise HTTPException(status_code=403, detail="No active quiz session. Start a session before submitting.")

    # Fetch correct answers from DB (Questions)
    question_ids = [a.question_id for a in payload.answers]
    questions = db.query(models.Question).filter(models.Question.id.in_(question_ids)).all()
    correct_map = {q.id: q.correct_answer for q in questions}

    # Tally score and detect fast answers
    score = 0
    fast_flag_count = 0
    for ans in payload.answers:
        qid = ans.question_id
        chosen = ans.chosen_answer
        correct = correct_map.get(qid)
        is_correct = (chosen == correct)
        if is_correct:
            score += 1
        # If frontend sends response_time include it; else assume safe default
        response_time = getattr(ans, "response_time", None) if hasattr(ans, "response_time") else None
        if response_time is not None and response_time < 2.0:
            fast_flag_count += 1

    total_questions = len(payload.answers)
    accuracy = (score / total_questions) if total_questions > 0 else 0

    # Log answers (synced=true)
    answers_for_logging = []
    for ans in payload.answers:
        answers_for_logging.append({
            "question_id": ans.question_id,
            "chosen_answer": ans.chosen_answer,
            "correct": (correct_map.get(ans.question_id) == ans.chosen_answer),
            "response_time": getattr(ans, "response_time", 0)
        })
    crud.log_quiz_answers(db, user.id, payload.subject, payload.current_difficulty, answers_for_logging, synced=True)

    # Calculate XP
    xp_gained = calculate_quiz_xp(score, total_questions, fast_flag_count)

    # Update gamification on user record
    gamification_result = update_gamification_for_user(user, xp_gained, db)
    db.commit()
    db.refresh(user)

    # Close session if exists
    if active_session:
        crud.close_session(db, active_session.id)

    # Determine next difficulty
    if accuracy >= 0.8:
        next_difficulty = "hard" if payload.current_difficulty == "medium" else "medium"
    elif accuracy <= 0.4:
        next_difficulty = "easy" if payload.current_difficulty == "medium" else "medium"
    else:
        next_difficulty = payload.current_difficulty

    # Build response
    return schemas.SubmitQuizResponse(
        score=score,
        xp_gained=gamification_result["xp_earned"],
        new_streak=gamification_result["current_streak"],
        badges_unlocked=gamification_result["new_badges"],
        next_difficulty=next_difficulty
    )
@router.post("/quiz/submit")
def submit_quiz(user_id: int, score: int, db: Session = Depends(get_db)):
    # Save quiz results in your quiz table first (already done in offline support)
    
    # Update gamification
    progress = update_progress(db, user_id=user_id, xp_earned=score)
    
    return {
        "message": "Quiz submitted successfully",
        "progress": progress
    }
@router.post("/submit_quiz/")
def submit_quiz(user_id: int, quiz_score: int, db: Session = Depends(get_db)):
    # Get or create user progress
    user_progress = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
    if not user_progress:
        user_progress = UserProgress(user_id=user_id, xp=0, streak=0, badges="")
        db.add(user_progress)
        db.commit()
        db.refresh(user_progress)
    
    # 1️⃣ Calculate XP
    gained_xp = calculate_xp(quiz_score)
    user_progress.xp += gained_xp
    
    # 2️⃣ Update streak
    streak = update_streak(user_progress, db)
    
    # 3️⃣ Unlock badges
    unlocked_badges = unlock_badges(user_progress, db)
    
    # 4️⃣ Return all gamification info
    return {
        "xp_earned": gained_xp,
        "total_xp": user_progress.xp,
        "current_streak": streak,
        "badges_unlocked": unlocked_badges
    }