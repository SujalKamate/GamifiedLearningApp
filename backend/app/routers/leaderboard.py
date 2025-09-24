from fastapi import APIRouter
from app.database import get_db_connection
from app.schemas import LeaderboardResponse, LeaderboardUser

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("/", response_model=LeaderboardResponse)
def get_leaderboard(top_n: int = 5):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, name, xp, streak, badges
        FROM users
        ORDER BY xp DESC, streak DESC
        LIMIT ?
    """, (top_n,))
    users = []
    for row in cur.fetchall():
        badges = row["badges"].split(",") if row["badges"] else []
        users.append(LeaderboardUser(
            user_id=row["id"],
            name=row["name"],
            xp=row["xp"],
            streak=row["streak"],
            badges=badges
        ))
    conn.close()
    return LeaderboardResponse(top_users=users)
