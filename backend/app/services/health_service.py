import json
from sqlalchemy.orm import Session
from app.models.models import User, HealthAssessment
from app.services.groq_service import call_groq_json
from datetime import datetime

def analyze_health(user: User, data: dict, db: Session) -> dict:
    answers = data.get("answers", {})
    assessment_id = data.get("assessment_id")
    
    prompt = f"""You are ArogyaMitra, an expert AI Health & Wellness Clinician.
Analyze the following health assessment for the user:
Name: {user.name}, Age: {user.age}, Gender: {user.gender}, Goal: {user.goal}
User Responses:
{json.dumps(answers, indent=2)}

Provide a structured JSON output with the exact following keys:
- "bmi_category": string (e.g. "Normal", "Overweight")
- "health_score": float (0 to 100)
- "ai_analysis": string (short paragraph summarizing health risks and positives)
- "recommendations": array of strings (top 3 actionable tips)

JSON only! Do not include markdown blocks.
"""
    
    result = call_groq_json(system_prompt="You produce only valid JSON.", user_prompt=prompt)
    
    if "error" in result:
        return result
        
    # Update DB if assessment_id provided
    if assessment_id:
        assessment = db.query(HealthAssessment).filter(HealthAssessment.id == assessment_id).first()
        if assessment:
            assessment.bmi_category = result.get("bmi_category")
            assessment.health_score = result.get("health_score")
            assessment.ai_analysis = result.get("ai_analysis")
            assessment.recommendations = json.dumps(result.get("recommendations", []))
            assessment.created_at = datetime.utcnow()
            db.commit()
    
    return result
