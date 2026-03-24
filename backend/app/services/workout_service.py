import json
import os
import httpx
from sqlalchemy.orm import Session
from app.models.models import User, Plan
from app.services.groq_service import call_groq_json
from app.utils.prompts import workout_prompt


from app.utils.config import settings

def _get_youtube_link(query: str) -> str:
    """Sync helper: return a YouTube link for an exercise search term."""
    api_key = settings.YOUTUBE_API_KEY
    fallback = f"https://youtube.com/results?search_query={query.replace(' ', '+')}"
    if not api_key or api_key == "your_youtube_api_key_here":
        return fallback
    try:
        r = httpx.get(
            "https://www.googleapis.com/youtube/v3/search",
            params={"part": "snippet", "q": f"{query} proper form", "key": api_key, "maxResults": 1, "type": "video"},
            timeout=5.0,
        )
        r.raise_for_status()
        items = r.json().get("items", [])
        if items:
            return f"https://www.youtube.com/watch?v={items[0]['id']['videoId']}"
    except Exception:
        pass
    return fallback


def generate_workout_plan(user_id: int, db: Session) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError(f"User {user_id} not found")

    prompt = workout_prompt(user)
    system = "You are a professional fitness coach. Always respond with valid JSON only."

    plan_data = call_groq_json(system_prompt=system, user_prompt=prompt)

    # Attach YouTube links dynamically
    if "plan" in plan_data and isinstance(plan_data["plan"], list):
        for day in plan_data["plan"]:
            if "exercises" in day and isinstance(day["exercises"], list):
                for ex in day["exercises"]:
                    if "youtube_search" in ex:
                        search_term = ex.pop("youtube_search")
                        ex["youtube_video_link"] = _get_youtube_link(search_term)

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