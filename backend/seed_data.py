# seed_data.py
from app.database import SessionLocal
from app import models

db = SessionLocal()

# Add sample questions
sample_questions = [
    models.Question(subject="Math", difficulty="easy", question_text="2+2=?", options=["2","3","4","5"], correct_answer="4"),
    models.Question(subject="Math", difficulty="medium", question_text="5*6=?", options=["11","30","20","35"], correct_answer="30"),
    models.Question(subject="Science", difficulty="easy", question_text="Water formula?", options=["H2O","CO2","NaCl","O2"], correct_answer="H2O")
]

db.add_all(sample_questions)
db.commit()
print("Sample questions added!")

# Optional: Add a test user
from app.crud import create_user
create_user(db, "Test User", "test@example.com", "password123")

db.close()
