from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
import sqlite3

# Load environment variables
load_dotenv()

project_root = os.path.dirname(os.path.dirname(__file__))
default_db_path = os.path.join(project_root, "gamified_learning.db")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{default_db_path}")

# For SQLite, need check_same_thread
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Optional helper for routers that use raw SQLite access
def get_db_connection():
    """Return a sqlite3 connection matching DATABASE_URL; rows as dict-like objects."""
    if not DATABASE_URL.startswith("sqlite///") and not DATABASE_URL.startswith("sqlite:///"):
        raise RuntimeError("get_db_connection is only supported for SQLite URLs")
    # Normalize and extract file path from sqlite URL
    db_path = DATABASE_URL.replace("sqlite:///", "")
    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row
    return connection
