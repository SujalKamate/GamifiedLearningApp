from fastapi import APIRouter, HTTPException
from app.database import get_db_connection
from app.schemas import DashboardResponse, SubjectStats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/{user_id}", response_model=DashboardResponse)
def get_dashboard(user_id: int):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT xp, streak, badges FROM users WHERE id = ?", (user_id,))
    user = cur.fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    badges = user["badges"].split(",") if user["badges"] else []

    cur.execute("""
        SELECT subject, COUNT(*) as total_questions, SUM(correct) as correct_answers
        FROM quiz_logs
        WHERE user_id = ?
        GROUP BY subject
    """, (user_id,))
    subject_stats = []
    for row in cur.fetchall():
        accuracy = row["correct_answers"] / row["total_questions"] if row["total_questions"] else 0
        subject_stats.append(SubjectStats(
            subject=row["subject"],
            total_questions=row["total_questions"],
            correct_answers=row["correct_answers"],
            accuracy=round(accuracy * 100, 2)
        ))

    conn.close()
    return DashboardResponse(
        xp=user["xp"],
        streak=user["streak"],
        badges=badges,
        subject_stats=subject_stats
    )
