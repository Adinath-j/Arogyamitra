import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Plan

router = APIRouter(prefix="/plans", tags=["Plans"])


@router.get("/{user_id}")
def get_plans(user_id: int, db: Session = Depends(get_db)):
    plans = db.query(Plan).filter(Plan.user_id == user_id).order_by(Plan.created_at.desc()).all()
    if not plans:
        return {"plans": []}

    result = []
    for plan in plans:
        result.append({
            "id": plan.id,
            "plan_type": plan.plan_type,
            "created_at": plan.created_at.isoformat(),
            "content": json.loads(plan.content),
        })

    return {"plans": result}


@router.get("/{user_id}/latest")
def get_latest_plans(user_id: int, db: Session = Depends(get_db)):
    """Return the latest workout and meal plan for a user."""
    workout = (
        db.query(Plan)
        .filter(Plan.user_id == user_id, Plan.plan_type == "workout")
        .order_by(Plan.created_at.desc())
        .first()
    )
    meal = (
        db.query(Plan)
        .filter(Plan.user_id == user_id, Plan.plan_type == "meal")
        .order_by(Plan.created_at.desc())
        .first()
    )

    workout_data = None
    if workout:
        workout_data = {"plan_id": workout.id, **json.loads(workout.content)}

    meal_data = None
    if meal:
        meal_data = {"plan_id": meal.id, **json.loads(meal.content)}

    return {
        "workout": workout_data,
        "meal": meal_data,
    }