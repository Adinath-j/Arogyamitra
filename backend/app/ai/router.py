import json
from typing import Dict, Any
from app.services.groq_service import call_groq_json

class RequestRouter:
    """
    Agentic Request Router that classifies incoming user requests into distinct intents.
    This allows the system to route requests to specialized handlers instead of relying on a single monolithic LLM call.
    """

    INTENT_SCHEMA = {
        "intent": "string (one of the predefined categories)",
        "confidence": "float (0.0 to 1.0)",
        "extracted_entities": "object (any specific data extracted from the prompt, like food names, dates, etc.)"
    }

    CATEGORIES = [
        "general_conversation", # Casual chat, greetings, asking how the AI is
        "health_qa",            # Asking for general health/wellness advice
        "workout_generation",   # Requesting a new workout plan
        "meal_plan_generation", # Requesting a new meal plan
        "plan_retrieval",       # Asking to see their existing workout/meal plan
        "calendar_scheduling",  # Asking to add a workout or meal to their calendar
        "nutrition_lookup",     # Asking for calories/macros of a specific food
        "exercise_lookup",      # Asking how to perform a specific exercise
        "profile_update",       # Asking to update their weight, goal, etc.
    ]

    @classmethod
    def classify_intent(cls, user_prompt: str) -> Dict[str, Any]:
        """
        Classifies the user prompt into one of the predefined intents.
        """
        system_prompt = f"""
You are an intelligent intent classification router for a health and wellness application.
Your ONLY job is to analyze the user's message and classify it into exactly ONE of the following categories:
{json.dumps(cls.CATEGORIES, indent=2)}

You must return a raw JSON object matching this schema exactly:
{json.dumps(cls.INTENT_SCHEMA, indent=2)}

Examples:
User: "Generate a new workout for me" -> intent: "workout_generation"
User: "How many calories in an apple?" -> intent: "nutrition_lookup", extracted_entities: {{"food": "apple"}}
User: "Schedule my workout for tomorrow at 5pm" -> intent: "calendar_scheduling", extracted_entities: {{"time": "tomorrow 5pm", "event": "workout"}}
User: "I weigh 80kg now" -> intent: "profile_update", extracted_entities: {{"weight": "80kg"}}
User: "What's my plan for today?" -> intent: "plan_retrieval"
User: "How do I do a deadlift?" -> intent: "exercise_lookup", extracted_entities: {{"exercise": "deadlift"}}
User: "I have a headache" -> intent: "health_qa"
User: "Hi AROMI" -> intent: "general_conversation"

IMPORTANT: You must ONLY output valid JSON. No markdown, no explanations, no preamble.
"""
        
        try:
            # We use the standard Groq JSON call. Since it's just routing, it's very fast.
            result = call_groq_json(system_prompt=system_prompt, user_prompt=user_prompt)
            
            # Basic validation
            if "intent" not in result or result["intent"] not in cls.CATEGORIES:
                print(f"Router returned invalid intent, defaulting to general_conversation: {result}")
                return {"intent": "general_conversation", "confidence": 0.0, "extracted_entities": {}}
                
            return result
        except Exception as e:
            print(f"Routing failed: {e}")
            return {"intent": "general_conversation", "confidence": 0.0, "extracted_entities": {}}
