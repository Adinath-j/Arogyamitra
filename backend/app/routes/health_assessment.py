from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.auth import get_current_user
from app.models.models import User, HealthAssessment
from app.schemas.schemas import HealthAssessmentSubmit, HealthAnalysisRequest
from app.services.health_service import analyze_health
import json

router = APIRouter(prefix="/health-assessment", tags=["Health Assessment"])


@router.post("/assessment/submit")
def submit_assessment(
    data: HealthAssessmentSubmit,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Save raw assessment questionnaire answers."""
    assessment = HealthAssessment(
        user_id=user.id,
        bmi=data.bmi,
        injuries=data.injuries,
        medications=data.medications,
        health_conditions=data.health_conditions,
        assessment_data=json.dumps(data.assessment_data or {}),
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return {"success": True, "assessment_id": assessment.id}


@router.post("/analyze")
def analyze(
    data: HealthAnalysisRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Run AI-powered health analysis and return structured report."""
    try:
        result = analyze_health(user, data.model_dump(), db)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(500, f"Health analysis failed: {str(e)}")


@router.get("/latest")
def get_latest(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    assessment = (
        db.query(HealthAssessment)
        .filter(HealthAssessment.user_id == user.id)
        .order_by(HealthAssessment.created_at.desc())
        .first()
    )
    if not assessment:
        return {"assessment": None}

    recs = []
    if assessment.recommendations:
        try:
            recs = json.loads(assessment.recommendations)
        except Exception:
            recs = []

    return {
        "assessment": {
            "id": assessment.id,
            "bmi": assessment.bmi,
            "bmi_category": assessment.bmi_category,
            "health_score": assessment.health_score,
            "ai_analysis": assessment.ai_analysis,
            "recommendations": recs,
            "created_at": assessment.created_at.isoformat(),
        }
    }