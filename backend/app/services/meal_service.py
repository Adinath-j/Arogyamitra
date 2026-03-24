import json
from sqlalchemy.orm import Session
from app.models.models import User, Plan
from app.services.groq_service import call_groq_json
from app.utils.prompts import meal_prompt
from app.services.spoonacular_service import generate_spoonacular_meal_plan


def generate_meal_plan(user: User, db: Session) -> dict:
    if not user:
        raise ValueError("User not found")

    # Simple logic to convert user goal to Spoonacular target calories
    base_calories = 2000
    goal = user.goal.lower()
    if "loss" in goal:
        base_calories = 1600
    elif "gain" in goal:
        base_calories = 2600

    plan_data = generate_spoonacular_meal_plan(
        target_calories=base_calories,
        diet=user.diet_type, 
        exclude_ingredients=user.allergies
    )

    # Fallback to AI if Spoonacular integration fails/returns error
    if "error" in plan_data:
        print(f"Spoonacular Error ({plan_data['error']}), falling back to Groq AI plan...")
        prompt = meal_prompt(user)
        system = "You are an Indian nutritionist. Always respond with valid JSON only."
        plan_data = call_groq_json(system_prompt=system, user_prompt=prompt)

    # Save to DB
    plan = Plan(
        user_id=user.id,
        plan_type="meal",
        content=json.dumps(plan_data),
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)

    return {"plan_id": plan.id, **plan_data}


def get_active_meal_plan(user_id: int, db: Session):
    """Return the most recent meal plan for a user."""
    plan = (
        db.query(Plan)
        .filter(Plan.user_id == user_id, Plan.plan_type == "meal")
        .order_by(Plan.created_at.desc())
        .first()
    )
    if not plan:
        return None
    return {"plan_id": plan.id, **json.loads(plan.content)}