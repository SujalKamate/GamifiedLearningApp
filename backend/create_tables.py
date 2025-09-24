# create_tables.py
from app.database import Base, engine
from app import models

# Create all tables from SQLAlchemy models
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")
