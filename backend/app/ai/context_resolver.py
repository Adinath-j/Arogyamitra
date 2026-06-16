import re
from typing import Optional, Tuple, Dict, Any
from pydantic import BaseModel

# Removed User dependency from here, but ContextResolver needs to accept something.
# We will still accept the SQLAlchemy User model as input, but PromptBuilder won't see it.
from app.models.models import User

class EffectiveUserContext(BaseModel):
    """
    The resolved, conflict-free user profile used for prompt generation.
    """
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    fitness_level: Optional[str] = None
    goal: Optional[str] = None
    diet_preference: Optional[str] = None
    allergies: Optional[str] = None
    time_availability: Optional[int] = None


class ContextExtractor:
    """
    Modular component to extract structured context from natural language.
    Currently uses Regex, but designed to be replaced by an LLM structured extractor in the future.
    """
    
    @staticmethod
    def extract(message: str) -> Dict[str, Any]:
        extracted = {}
        
        # Weight
        w_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:kg|kilos|kilograms)\b", message, re.IGNORECASE)
        if w_match:
            extracted["weight"] = float(w_match.group(1))
            
        # Height
        h_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:cm|centimeters)\b", message, re.IGNORECASE)
        if h_match:
            extracted["height"] = float(h_match.group(1))
            
        # Age
        a_match = re.search(r"\b(\d+)\s*(?:years old|yo|years of age)\b", message, re.IGNORECASE)
        if a_match:
            extracted["age"] = int(a_match.group(1))
        else:
            a_match_im = re.search(r"(?:i am|i'm|age is)\s*(\d{2})\b", message, re.IGNORECASE)
            if a_match_im:
                extracted["age"] = int(a_match_im.group(1))

        # Dietary Preference
        d_match = re.search(r"\b(?:i am|i'm|my diet is|now a|changed to)\s*(vegetarian|vegan|pescatarian|keto|paleo)\b", message, re.IGNORECASE)
        if d_match:
            extracted["diet_preference"] = d_match.group(1).lower()

        # Fitness Goal
        g_match = re.search(r"\b(?:goal is|want to)\s*(weight loss|muscle gain|maintain weight|lose weight|build muscle)\b", message, re.IGNORECASE)
        if g_match:
            goal_map = {"lose weight": "weight_loss", "build muscle": "muscle_gain", "maintain weight": "maintain"}
            extracted["goal"] = goal_map.get(g_match.group(1).lower(), g_match.group(1).lower())

        # Fitness Level
        f_match = re.search(r"\b(?:i am a|my fitness level is)\s*(beginner|intermediate|advanced)\b", message, re.IGNORECASE)
        if f_match:
            extracted["fitness_level"] = f_match.group(1).lower()

        # Gender
        gen_match = re.search(r"\b(?:i am a)\s*(man|woman|male|female)\b", message, re.IGNORECASE)
        if gen_match:
            extracted["gender"] = gen_match.group(1).lower()

        return extracted


class ContextResolver:
    """
    Merges extracted explicit values over the stored user profile 
    to create a clean, effective context.
    """

    @classmethod
    def resolve(cls, user: User, message: str = "") -> Tuple[EffectiveUserContext, dict]:
        """
        Builds the EffectiveUserContext and returns it along with a dictionary of profile_updates.
        """
        # Start with database values
        context = EffectiveUserContext(
            name=user.name,
            age=user.age,
            gender=user.gender,
            weight=user.weight,
            height=user.height,
            fitness_level=getattr(user, 'fitness_level', None),
            goal=user.goal or user.fitness_goal,
            diet_preference=user.diet_type or getattr(user, 'diet_preference', None),
            allergies=user.allergies,
            time_availability=user.time_availability
        )

        profile_updates = {}

        if not message:
            return context, profile_updates

        # Extract overrides
        extracted_data = ContextExtractor.extract(message)
        
        # Merge overrides and record updates
        for key, value in extracted_data.items():
            if hasattr(context, key):
                current_val = getattr(context, key)
                if current_val != value:
                    setattr(context, key, value)
                    profile_updates[key] = value

        return context, profile_updates
