from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.auth import get_current_user
from app.models.models import User, MealLog
from app.schemas.schemas import GenerateMealRequest, MealLogCreate
from app.services.meal_service import generate_meal_plan, get_active_meal_plan

router = APIRouter(prefix="/nutrition", tags=["Nutrition"])


# ── Legacy endpoint: accepts user_id directly (no auth required) ──────────────
@router.post("/generate-by-id")
def generate_by_id(user_id: int, db: Session = Depends(get_db)):
    """Called by old frontend (Home.jsx) without a JWT token."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    try:
        result = generate_meal_plan(user, db)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(500, f"Meal plan generation failed: {str(e)}")




@router.post("/generate")
def generate(
    req: GenerateMealRequest = GenerateMealRequest(),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        result = generate_meal_plan(user, db)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(500, f"Meal plan generation failed: {str(e)}")


@router.get("/active")
def get_active(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    plan = get_active_meal_plan(user.id, db)
    if not plan:
        return {"plan": None}
    return {"plan": plan}


@router.post("/log-meal")
def log_meal(
    data: MealLogCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    log = MealLog(user_id=user.id, **data.model_dump())
    db.add(log)
    db.commit()
    return {"success": True}