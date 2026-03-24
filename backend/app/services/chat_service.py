import json
from sqlalchemy.orm import Session
from app.models.models import User, ChatHistory, Plan
from app.services.groq_service import call_groq_json
from app.utils.prompts import chat_system_prompt
from app.schemas.schemas import ArogyaCoachMessage


def chat_with_aromi(request: ArogyaCoachMessage, db: Session) -> dict:
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise ValueError(f"User {request.user_id} not found")

    system = chat_system_prompt(
        user,
        user_status=request.user_status,
        current_workout=request.current_workout_plan,
        current_meal=request.current_meal_plan
    )

    # Fetch recent chat history
    recent_history = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == user.id)
        .order_by(ChatHistory.created_at.asc())
        .limit(10)
        .all()
    )

    # Build messages array for Groq
    groq_messages = [{"role": "system", "content": system}]
    for msg in recent_history:
        groq_messages.append({"role": msg.role, "content": msg.content})
    
    groq_messages.append({"role": "user", "content": request.message})

    # Save user message
    user_msg = ChatHistory(user_id=user.id, role="user", content=request.message)
    db.add(user_msg)

    # Call AI
    ai_response = call_groq_json(messages=groq_messages)

    # Extract reply, fallback if failed
    reply_text = ai_response.get("reply", "I'm here for you! How can I help today?") if isinstance(ai_response, dict) else str(ai_response)
    
    if "error" in ai_response:
        reply_text = "I'm having trouble understanding right now, but I'm here to help you stay fit!"

    # --- Realtime Adaptive Support: Parse plan modifications ---
    if isinstance(ai_response, dict):
        mod_workout = ai_response.get("modified_workout_plan")
        mod_meal = ai_response.get("modified_meal_plan")
        
        if mod_workout:
            try:
                new_wp = Plan(user_id=user.id, plan_type="workout", content=json.dumps(mod_workout))
                db.add(new_wp)
                print(f"AROMI successfully modified workout plan for user {user.id}")
            except Exception as e:
                print(f"Failed to save modified workout plan: {e}")

        if mod_meal:
            try:
                new_mp = Plan(user_id=user.id, plan_type="meal", content=json.dumps(mod_meal))
                db.add(new_mp)
                print(f"AROMI successfully modified meal plan for user {user.id}")
            except Exception as e:
                print(f"Failed to save modified meal plan: {e}")

    # Save assistant message
    assistant_msg = ChatHistory(user_id=user.id, role="assistant", content=reply_text)
    db.add(assistant_msg)
    db.commit()

    return ai_response if isinstance(ai_response, dict) else {"reply": str(ai_response)}