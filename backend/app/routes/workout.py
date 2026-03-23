from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import GenerateWorkoutRequest
from app.services.workout_service import generate_workout_plan

router = APIRouter(prefix="/generate-workout", tags=["Workout"])


@router.post("/")
def create_workout_plan(request: GenerateWorkoutRequest, db: Session = Depends(get_db)):
    try:
        result = generate_workout_plan(request.user_id, db)
        return {"success": True, "data": result}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")