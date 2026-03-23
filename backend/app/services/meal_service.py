import json
from sqlalchemy.orm import Session
from app.models.models import User, Plan
from app.services.groq_service import call_groq_json
from app.utils.prompts import meal_prompt


def generate_meal_plan(user_id: int, db: Session) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError(f"User {user_id} not found")

    prompt = meal_prompt(user)
    system = "You are an Indian nutritionist. Always respond with valid JSON only."

    plan_data = call_groq_json(system, prompt)

    # Save to DB
    plan = Plan(
        user_id=user_id,
        plan_type="meal",
        content=json.dumps(plan_data),
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)

    return {"plan_id": plan.id, **plan_data}