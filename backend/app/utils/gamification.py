# app/utils/gamification.py
from datetime import datetime, date, timedelta
from typing import List, Dict
from sqlalchemy.orm import Session
from app.models import UserProgress, Badge
# Define badge thresholds
BADGE_RULES = [
    (50, "Beginner"),
    (200, "Scholar"),
    (500, "Master"),
]

# XP rules
XP_PER_CORRECT = 10
FAST_ANSWER_PENALTY = 0  # keep 0 or reduce if flagged

def calculate_quiz_xp(correct_count: int, total_questions: int, fast_flag_count: int = 0) -> int:
    """Calculate XP for a single quiz attempt."""
    base = correct_count * XP_PER_CORRECT
    bonus = 0  # you can add time-based bonus
    penalty = FAST_ANSWER_PENALTY * fast_flag_count
    return max(0, base + bonus - penalty)

def update_gamification_for_user(user, xp_gained: int, db_session) -> Dict:
    """
    Update user's xp, streaks and badges in DB (user is SQLAlchemy model instance).
    Returns structure with info for API response.
    """
    # XP
    previous_xp = user.xp or 0
    new_total_xp = previous_xp + xp_gained
    user.xp = new_total_xp

    # Streak: check last_quiz_date
    today = date.today()
    last = None
    if user.last_quiz_date:
        # if stored as string convert to date/time if necessary; assume datetime or date
        if isinstance(user.last_quiz_date, str):
            try:
                last = datetime.fromisoformat(user.last_quiz_date).date()
            except Exception:
                last = None
        elif isinstance(user.last_quiz_date, datetime):
            last = user.last_quiz_date.date()
        else:
            last = user.last_quiz_date

    if last == today - timedelta(days=1):
        user.streak = (user.streak or 0) + 1
        streak_warning = None
    elif last == today:
        # already counted today
        user.streak = user.streak or 1
        streak_warning = None
    else:
        user.streak = 1
        streak_warning = None

    # Badges: add new badges if thresholds crossed
    badges: List[str] = user.badges or []
    newly_earned = []
    for threshold, name in BADGE_RULES:
        if new_total_xp >= threshold and name not in badges:
            badges.append(name)
            newly_earned.append(name)

    user.badges = badges
    # update last_quiz_date
    user.last_quiz_date = datetime.utcnow()

    # commit is done by caller
    return {
        "xp_earned": xp_gained,
        "total_xp": new_total_xp,
        "new_badges": newly_earned,
        "current_streak": user.streak,
        "streak_warning": streak_warning
    }
from sqlalchemy.orm import Session
from app.models import UserProgress, Badge

def update_progress(db: Session, user_id: int, xp_earned: int):
    user = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()
    if not user:
        user = UserProgress(user_id=user_id, total_xp=0, current_streak=0, badges=[])
        db.add(user)
        db.commit()
        db.refresh(user)

    # Update XP
    user.total_xp += xp_earned

    # Update streak
    today = date.today()
    if user.last_quiz_date == today - timedelta(days=1):
        user.current_streak += 1
    elif user.last_quiz_date == today:
        pass  # Same day, streak unchanged
    else:
        user.current_streak = 1

    user.last_quiz_date = today

    # Check badges
    badges = db.query(Badge).all()
    unlocked = []
    for badge in badges:
        criteria = badge.criteria
        if "xp" in criteria and user.total_xp >= criteria["xp"] and badge.name not in [b["name"] for b in user.badges]:
            user.badges.append({"badge_id": badge.badge_id, "name": badge.name, "description": badge.description})
            unlocked.append(badge.name)
        if "streak" in criteria and user.current_streak >= criteria["streak"] and badge.name not in [b["name"] for b in user.badges]:
            user.badges.append({"badge_id": badge.badge_id, "name": badge.name, "description": badge.description})
            unlocked.append(badge.name)

    db.commit()
    db.refresh(user)

    return {
        "total_xp": user.total_xp,
        "current_streak": user.current_streak,
        "badges": user.badges,
        "unlocked_badges": unlocked
    }
def calculate_xp(quiz_score: int) -> int:
    # Simple XP logic: each correct answer = 10 XP
    return quiz_score * 10

def update_streak(user_progress: UserProgress, db: Session):
    today = datetime.utcnow().date()
    last_date = user_progress.last_quiz_date
    if isinstance(last_date, datetime):
        last_date = last_date.date()
    
    if today == last_date + timedelta(days=1):
        user_progress.streak += 1
    elif today != last_date:
        user_progress.streak = 1  # streak broken, reset
    
    user_progress.last_quiz_date = datetime.utcnow()
    db.commit()
    db.refresh(user_progress)
    return user_progress.streak

def unlock_badges(user_progress: UserProgress, db: Session):
    unlocked = []
    all_badges = db.query(Badge).all()
    for badge in all_badges:
        if badge.id in user_progress.badges.split(","):
            continue  # already unlocked

        # Example criteria parsing
        if badge.criteria.startswith("xp_"):
            required_xp = int(badge.criteria.split("_")[1])
            if user_progress.xp >= required_xp:
                unlocked.append(badge.name)
        elif badge.criteria.startswith("streak_"):
            required_streak = int(badge.criteria.split("_")[1])
            if user_progress.streak >= required_streak:
                unlocked.append(badge.name)
    
    # Update user badges
    if unlocked:
        current = user_progress.badges.split(",") if user_progress.badges else []
        user_progress.badges = ",".join(current + [str(badge.id) for badge in all_badges if badge.name in unlocked])
        db.commit()
        db.refresh(user_progress)
    
    return unlocked