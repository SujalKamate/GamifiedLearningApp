import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Routers
from app.routers import (
    quiz,
    badges,
    analytics,
    streak,
    leveling,
    adaptive,
    dashboard,
    quiz_history,
    offline,
    auth as auth_router,
    anti_cheating,
    session,
)

app = FastAPI()

# CORS from env
origins_env = os.getenv("CORS_ORIGINS", "http://localhost:3000")
origins = [o.strip() for o in origins_env.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers (once each, with clear prefixes)
app.include_router(quiz.router, prefix="/quiz", tags=["quiz"])
app.include_router(offline.router, prefix="/offline", tags=["offline"])
app.include_router(quiz_history.router, prefix="/history", tags=["quiz-history"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
app.include_router(adaptive.router, prefix="/adaptive", tags=["adaptive"])
app.include_router(leveling.router, prefix="/leveling", tags=["leveling"])
app.include_router(streak.router, prefix="/streak", tags=["streak"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
app.include_router(badges.router, prefix="/badges", tags=["badges"])
app.include_router(anti_cheating.router, prefix="/anti-cheating", tags=["anti-cheating"])
app.include_router(session.router, prefix="/session", tags=["session"])
app.include_router(auth_router.router, prefix="/auth", tags=["auth"])


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("app.main:app", host=host, port=port, reload=os.getenv("APP_ENV") == "development")
