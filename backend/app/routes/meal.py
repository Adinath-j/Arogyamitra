from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import GenerateMealRequest
from app.services.meal_service import generate_meal_plan

router = APIRouter(prefix="/generate-meal", tags=["Meal"])


@router.post("/")
def create_meal_plan(request: GenerateMealRequest, db: Session = Depends(get_db)):
    try:
        result = generate_meal_plan(request.user_id, db)
        return {"success": True, "data": result}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")