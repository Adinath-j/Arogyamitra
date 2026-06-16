import json
from sqlalchemy.orm import Session
from app.models.models import User, ChatHistory, Plan
from app.services.groq_service import call_groq_json
from app.ai.prompt_builder import PromptBuilder
from app.ai.context_resolver import ContextResolver
from app.schemas.schemas import ArogyaCoachMessage


def chat_with_aromi(request: ArogyaCoachMessage, db: Session) -> dict:
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise ValueError(f"User {request.user_id} not found")

    # --- Context Resolution Architecture ---
    effective_user_context, profile_updates = ContextResolver.resolve(user, request.message)

    system = PromptBuilder.build_chat_system_prompt(
        user=effective_user_context,
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
    
    # --- Agentic Request Routing ---
    from app.ai.router import RequestRouter
    route_info = RequestRouter.classify_intent(request.message)
    intent = route_info.get("intent", "general_conversation")
    print(f"AROMI Router classified intent: {intent} with {route_info.get('confidence', 0)} confidence.")
    
    ai_response = {}
    reply_text = ""
    
    if intent == "workout_generation":
        from app.services.workout_service import generate_workout_plan
        print("AROMI Router triggering: generate_workout_plan")
        try:
            generate_workout_plan(user.id, db, request.message)
            reply_text = "I've just generated a brand new workout plan tailored to your profile! 💪 You can check it out in your Dashboard."
        except Exception as e:
            reply_text = f"I tried to generate a workout plan for you, but something went wrong: {e}"
            
    elif intent == "meal_plan_generation":
        from app.services.meal_service import generate_meal_plan
        print("AROMI Router triggering: generate_meal_plan")
        try:
            generate_meal_plan(user, db, request.message)
            reply_text = "I've crafted a personalized Indian meal plan for you! 🍱 It's ready to view in your Dashboard."
        except Exception as e:
            reply_text = f"I tried to create your meal plan, but hit a snag: {e}"
            
    else:
        # Fallback to general conversational AI
        ai_response = call_groq_json(messages=groq_messages)

    # Extract reply, fallback if failed (only if not already set by router)
    if not reply_text:
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

    if isinstance(ai_response, dict):
        ai_response["reply"] = reply_text
        if profile_updates:
            ai_response["profile_updates"] = profile_updates
        return ai_response
    else:
        return {"reply": reply_text, "profile_updates": profile_updates}