from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # ── Auth fields ────────────────────────────────────────────────────────────
    email           = Column(String, unique=True, index=True, nullable=False)
    username        = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role            = Column(String, default="user")      # "user" | "admin"
    full_name       = Column(String, nullable=True)

    # ── Profile fields (kept for backward-compat) ──────────────────────────────
    name             = Column(String, nullable=True)       # alias for full_name
    age              = Column(Integer, nullable=True)
    gender           = Column(String, nullable=True)
    goal             = Column(String, nullable=True)       # fitness_goal alias
    diet_type        = Column(String, nullable=True)       # diet_preference alias
    allergies        = Column(String, default="")
    time_availability = Column(Integer, default=45)
    height           = Column(Float, nullable=True)
    weight           = Column(Float, nullable=True)
    fitness_level    = Column(String, nullable=True)
    fitness_goal     = Column(String, nullable=True)
    workout_preference = Column(String, nullable=True)
    diet_preference  = Column(String, nullable=True)

    # ── Progress / gamification ────────────────────────────────────────────────
    current_streak          = Column(Integer, default=0)
    longest_streak          = Column(Integer, default=0)
    charity_points          = Column(Integer, default=0)
    total_workouts_completed = Column(Integer, default=0)
    total_calories_burned   = Column(Float, default=0.0)
    created_at              = Column(DateTime, default=datetime.utcnow)

    # ── Google Calendar tokens ─────────────────────────────────────────────────
    google_access_token  = Column(String, nullable=True)
    google_refresh_token = Column(String, nullable=True)

    # ── Relationships ──────────────────────────────────────────────────────────
    plans             = relationship("Plan", back_populates="user", cascade="all, delete-orphan")
    chat_messages     = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
    progress_logs     = relationship("ProgressLog", back_populates="user", cascade="all, delete-orphan")
    health_assessments = relationship("HealthAssessment", back_populates="user", cascade="all, delete-orphan")
    meal_logs         = relationship("MealLog", back_populates="user", cascade="all, delete-orphan")




class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_type = Column(String, nullable=False)     # workout | meal
    content = Column(Text, nullable=False)         # JSON string of the plan
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="plans")


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, nullable=False)          # user | assistant
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chat_messages")


class ProgressLog(Base):
    __tablename__ = "progress_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    log_date = Column(DateTime, default=datetime.utcnow)
    weight = Column(Float, nullable=True)
    calories_burned = Column(Float, default=0.0)
    workout_duration = Column(Integer, default=0)
    steps = Column(Integer, default=0)
    water_intake = Column(Float, default=0.0)
    sleep_hours = Column(Float, default=0.0)
    mood = Column(String, default="Good")

    user = relationship("User", back_populates="progress_logs")


class HealthAssessment(Base):
    __tablename__ = "health_assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    bmi = Column(Float, nullable=True)
    injuries = Column(String, nullable=True)
    medications = Column(String, nullable=True)
    health_conditions = Column(String, nullable=True)
    assessment_data = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    bmi_category = Column(String, nullable=True)
    health_score = Column(Float, nullable=True)
    ai_analysis = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="health_assessments")


class MealLog(Base):
    __tablename__ = "meal_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    meal_type = Column(String, nullable=False)   # breakfast | lunch | dinner | snack
    description = Column(Text, nullable=True)
    calories = Column(Float, nullable=True)
    logged_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="meal_logs")


class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plan_data = Column(Text, nullable=False)    # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)