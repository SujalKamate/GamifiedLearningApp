from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, models

router = APIRouter()

BADGE_RULES = [
    {"name": "Beginner", "xp": 50},
    {"name": "Scholar", "xp": 200},
    {"name": "Master", "xp": 500},
    {"name": "Streaker", "streak": 7}
]

@router.get("/user-badges/{user_id}")
def get_user_badges(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return {"error": "User not found"}
    
    badges = user.badges or []
    earned_badges = []

    # Check XP-based badges
    for rule in BADGE_RULES:
        if "xp" in rule and user.xp >= rule["xp"] and rule["name"] not in badges:
            badges.append(rule["name"])
            earned_badges.append(rule["name"])
        elif "streak" in rule and user.streak >= rule["streak"] and rule["name"] not in badges:
            badges.append(rule["name"])
            earned_badges.append(rule["name"])

    user.badges = badges
    db.commit()
    
    return {"user_id": user_id, "badges": badges, "newly_earned": earned_badges}
