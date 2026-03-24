from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.utils.auth import get_current_user
from app.models.models import User, ProgressLog
from app.schemas.schemas import ProgressLogCreate, ProgressLogResponse
from datetime import datetime, timedelta

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.post("/log", response_model=ProgressLogResponse)
def log_progress(
    data: ProgressLogCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    log = ProgressLog(user_id=user.id, **data.model_dump())

    # Update user weight if provided
    if data.weight:
        user.weight = data.weight

    # Update streak logic
    yesterday = datetime.utcnow() - timedelta(days=1)
    last_log = (
        db.query(ProgressLog)
        .filter(ProgressLog.user_id == user.id, ProgressLog.log_date >= yesterday)
        .order_by(ProgressLog.log_date.desc())
        .first()
    )
    if last_log:
        user.current_streak += 1
        user.longest_streak = max(user.longest_streak, user.current_streak)
    else:
        user.current_streak = 1

    # Charity points: 1 point per workout minute
    if data.workout_duration > 0:
        user.charity_points += data.workout_duration // 5

    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/history")
def get_history(
    days: int = 30,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    since = datetime.utcnow() - timedelta(days=days)
    logs = (
        db.query(ProgressLog)
        .filter(ProgressLog.user_id == user.id, ProgressLog.log_date >= since)
        .order_by(ProgressLog.log_date.asc())
        .all()
    )
    return {
        "logs": [
            {
                "id": l.id,
                "date": l.log_date.isoformat(),
                "weight": l.weight,
                "calories_burned": l.calories_burned,
                "workout_duration": l.workout_duration,
                "steps": l.steps,
                "water_intake": l.water_intake,
                "sleep_hours": l.sleep_hours,
                "mood": l.mood,
            }
            for l in logs
        ]
    }


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Aggregated stats for dashboard widgets."""
    last_30 = datetime.utcnow() - timedelta(days=30)
    logs = (
        db.query(ProgressLog)
        .filter(ProgressLog.user_id == user.id, ProgressLog.log_date >= last_30)
        .all()
    )
    total_cal = sum(l.calories_burned for l in logs)
    total_min = sum(l.workout_duration for l in logs)
    avg_sleep = sum(l.sleep_hours for l in logs) / len(logs) if logs else 0

    return {
        "current_streak": user.current_streak,
        "longest_streak": user.longest_streak,
        "total_workouts": user.total_workouts_completed,
        "total_calories_burned": round(user.total_calories_burned, 1),
        "charity_points": user.charity_points,
        "last_30_days": {
            "calories_burned": round(total_cal, 1),
            "workout_minutes": total_min,
            "avg_sleep_hours": round(avg_sleep, 1),
            "sessions": len(logs),
        },
    }