# app/utils/gamification.py
from datetime import datetime, date, timedelta
from typing import List, Dict

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
