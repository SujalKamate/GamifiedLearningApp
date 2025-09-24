from fastapi import FastAPI
from app.routers import auth, quiz
from app.database import Base, engine

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Gamified Adaptive Learning App")

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(quiz.router, prefix="/quiz", tags=["quiz"])

@app.get("/")
def root():
    return {"message": "Welcome to Gamified Adaptive Learning App Backend!"}
