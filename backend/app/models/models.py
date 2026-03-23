from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    goal = Column(String, nullable=False)          # weight_loss | muscle_gain | maintenance
    diet_type = Column(String, nullable=False)     # veg | non-veg | vegan
    allergies = Column(String, default="")         # comma-separated
    time_availability = Column(Integer, default=45) # minutes per day
    created_at = Column(DateTime, default=datetime.utcnow)

    plans = relationship("Plan", back_populates="user")


class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_type = Column(String, nullable=False)     # workout | meal
    content = Column(Text, nullable=False)         # JSON string of the plan
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="plans")