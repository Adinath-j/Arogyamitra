import json
import os
import httpx
from sqlalchemy.orm import Session
from app.models.models import User, Plan
from app.services.groq_service import call_groq_json
from app.ai.prompt_builder import PromptBuilder
from app.ai.tools import get_youtube_link

from app.utils.config import settings




from app.ai.context_resolver import ContextResolver

def generate_workout_plan(user_id: int, db: Session, user_message: str = "") -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError(f"User {user_id} not found")

    effective_context, _ = ContextResolver.resolve(user, user_message)
    prompt = PromptBuilder.build_workout_prompt(effective_context)
    system = "You are a professional fitness coach. Always respond with valid JSON only."

    plan_data = call_groq_json(system_prompt=system, user_prompt=prompt)

    # Attach YouTube links dynamically
    if "plan" in plan_data and isinstance(plan_data["plan"], list):
        for day in plan_data["plan"]:
            if "exercises" in day and isinstance(day["exercises"], list):
                for ex in day["exercises"]:
                    if "youtube_search" in ex:
                        search_term = ex.pop("youtube_search")
                        ex["youtube_video_link"] = get_youtube_link(search_term)

    # Save to DB
    plan = Plan(
        user_id=user_id,
        plan_type="workout",
        content=json.dumps(plan_data),
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)

    return {"plan_id": plan.id, **plan_data}