from typing import Optional, Dict, Any
from app.models.models import User
from app.ai.context_resolver import EffectiveUserContext

class PromptBuilder:
    """
    Centralized prompt builder that injects deterministic user context into AI prompts.
    Provides standard templates for chat, workout generation, and meal plan generation.
    """

    @staticmethod
    def _calculate_bmi(weight_kg: Optional[float], height_cm: Optional[float]) -> Optional[float]:
        if not weight_kg or not height_cm or height_cm <= 0:
            return None
        height_m = height_cm / 100
        return round(weight_kg / (height_m * height_m), 1)

    @staticmethod
    def _calculate_bmr(weight_kg: Optional[float], height_cm: Optional[float], age: Optional[int], gender: Optional[str]) -> Optional[float]:
        """Calculates BMR using Mifflin-St Jeor Equation"""
        if not all([weight_kg, height_cm, age, gender]):
            return None
        
        # Base BMR (Mifflin-St Jeor)
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age)
        
        if gender.lower().startswith('m'):
            bmr += 5
        elif gender.lower().startswith('f'):
            bmr -= 161
        else:
            return None # Requires known biological sex for this formula
        
        return round(bmr)

    @classmethod
    def get_user_context(cls, user: EffectiveUserContext) -> str:
        """
        Builds a comprehensive, deterministic context string about the user.
        """
        if not user:
            return "No specific user profile provided. Give general, safe advice."

        context_lines = [
            f"User Profile for {user.name or 'User'}:",
            f"- Age: {user.age or 'Unknown'}",
            f"- Gender: {user.gender or 'Unknown'}",
            f"- Primary Goal: {user.goal or 'General Health'}",
            f"- Diet Preference: {user.diet_preference or 'Any'}",
            f"- Daily Time Availability: {user.time_availability or 'Unknown'} minutes",
        ]

        if user.allergies:
            context_lines.append(f"- Allergies/Restrictions: {user.allergies}")
        
        fitness_level = user.fitness_level or 'Unknown'
        if fitness_level and fitness_level != 'Unknown':
            context_lines.append(f"- Fitness Level: {fitness_level}")
        
        # Calculate biometric data if available
        if user.weight and user.height:
            context_lines.append(f"- Weight: {user.weight} kg")
            context_lines.append(f"- Height: {user.height} cm")
            
            bmi = cls._calculate_bmi(user.weight, user.height)
            if bmi:
                category = "Underweight" if bmi < 18.5 else "Normal" if bmi < 25 else "Overweight" if bmi < 30 else "Obese"
                context_lines.append(f"- BMI: {bmi} ({category})")
            
            bmr = cls._calculate_bmr(user.weight, user.height, user.age, user.gender)
            if bmr:
                context_lines.append(f"- Basal Metabolic Rate (BMR): ~{bmr} kcal/day")
                
                # Adjust TDEE based on fitness level (basic estimation)
                multiplier = 1.2 # sedentary
                if fitness_level.lower() == 'intermediate':
                    multiplier = 1.375
                elif fitness_level.lower() == 'advanced':
                    multiplier = 1.55
                
                tdee = round(bmr * multiplier)
                context_lines.append(f"- Est. Daily Calorie Needs (TDEE): ~{tdee} kcal/day")
                
            # Deterministic Water Intake Calculation (~35ml per kg base)
            water_liters = round(user.weight * 0.035, 1)
            context_lines.append(f"- Est. Daily Baseline Water Need: ~{water_liters} Liters (Increase if sweating/active)")

            # Deterministic Protein Target Calculation
            protein_multiplier = 0.8
            goal = (user.goal or '').lower()
            if 'muscle' in goal or 'strength' in goal or fitness_level.lower() == 'advanced':
                protein_multiplier = 1.8
            elif 'weight_loss' in goal or fitness_level.lower() == 'intermediate':
                protein_multiplier = 1.2
            
            protein_g = round(user.weight * protein_multiplier)
            context_lines.append(f"- Est. Daily Protein Target: ~{protein_g}g")

        return "\n".join(context_lines)

    @classmethod
    def build_chat_system_prompt(
        cls, 
        user: Optional[EffectiveUserContext] = None, 
        user_status: Optional[str] = None,
        current_workout: Optional[dict] = None,
        current_meal: Optional[dict] = None
    ) -> str:
        """
        Builds the system prompt for the general AROMI chat assistant.
        """
        base_prompt = (
            "You are AROMI (ArogyaMitra), an intelligent, empathetic, and highly personalized AI health and wellness coach. "
            "Your goal is to provide medical-grade quality advice that feels like a 1-on-1 coaching session.\n\n"
            "### CORE PRINCIPLES:\n"
            "1. **PERSONALIZE EVERY RESPONSE**: NEVER give generic advice. Always anchor your answers directly to the user's specific context (Weight, Height, Age, Goals, calculated BMR, BMI, Water needs, etc. provided below). Explicitly mention their stats in your reasoning (e.g., 'Given your weight of X kg and goal of Y...').\n"
            "2. **EXPLAIN THE 'WHY'**: Do not just output a number or a simple instruction. Explain how it was calculated (using the provided context values), why it matters for their specific body, and what factors can change it.\n"
            "3. **IMPROVE FORMATTING**: Use headings (###), bold text for key metrics, and bullet points to break down your response into logical sections (e.g., Personalized Recommendation, The Science/Calculation, Factors to Consider, Actionable Tips). Avoid dense paragraphs.\n"
            "4. **NATURAL & CONVERSATIONAL TONE**: Speak like a supportive human expert. Be warm, professional, and encouraging. AVOID repetitive filler like 'A common recommendation is...' or 'Generally speaking...'. Provide the personalized advice first.\n"
            "5. **NEVER EXPOSE INTERNAL MEMORY**: You must NEVER mention previous profile values, cached values, retrieved memory context, or internal calculations. The context provided below is the ONLY absolute source of truth. NEVER compare current values to past ones. Answer natively without revealing that context was injected.\n"
            "6. **ACTIONABLE ADVICE**: Always conclude with 1-2 practical, easy-to-implement tips related to their question.\n"
            "7. **SAFETY**: Do not provide medical diagnoses. Recommend consulting a doctor for severe symptoms.\n\n"
            "CRITICAL: You MUST respond in pure JSON format ONLY. Do not include any text outside the JSON object.\n"
            "Format your JSON exactly like this:\n"
            "{\n"
            "  \"reply\": \"Your beautifully formatted, personalized markdown response goes here.\",\n"
            "  \"modified_workout_plan\": null, // or a JSON object if you modified their workout plan\n"
            "  \"modified_meal_plan\": null // or a JSON object if you modified their meal plan\n"
            "}"
        )

        context_blocks = []
        
        if user:
            context_blocks.append(f"--- USER CONTEXT ---\n{cls.get_user_context(user)}")
            
        if user_status:
            context_blocks.append(f"--- USER STATUS ---\nThe user reported feeling: {user_status}")
            
        if current_workout:
            context_blocks.append(f"--- CURRENT WORKOUT PLAN ---\n{current_workout}")
            
        if current_meal:
            context_blocks.append(f"--- CURRENT MEAL PLAN ---\n{current_meal}")
            
        if context_blocks:
            context_blocks.append("------------------")
            full_context = "\n\n".join(context_blocks)
            return f"{base_prompt}\n\n{full_context}\n\nYou can use the context provided to answer the user's questions or modify their plans if asked."
        
        return base_prompt

    @classmethod
    def build_workout_prompt(cls, user: EffectiveUserContext) -> str:
        """
        Builds the prompt specifically for generating a 7-day workout plan.
        """
        user_context = cls.get_user_context(user)
        return f"""
You are an expert fitness coach. Your task is to generate a personalized, safe, and highly effective 7-day workout plan based EXACTLY on the user's profile below.

--- USER CONTEXT ---
{user_context}
------------------

Requirements for the Workout Plan:
1. It must be exactly 7 days.
2. The daily duration must NOT exceed the user's "Daily Time Availability".
3. The difficulty must match their Fitness Level and BMI (e.g., lower impact for obese, higher intensity for athletic).
4. Include specific exercises, sets, and reps (e.g., 3 sets of 10-12 reps).
5. Specify rest days where appropriate (usually 1-2 days).
6. Provide output in pure JSON format ONLY (no markdown blocks, no introduction, no summary).

Format the JSON exactly like this:
{{
  "plan_type": "workout",
  "days": [
    {{
      "day": 1,
      "focus": "Upper Body Strength",
      "duration": "45 mins",
      "exercises": [
        {{ "name": "Push-ups", "sets": 3, "reps": "10-12" }},
        {{ "name": "Dumbbell Rows", "sets": 3, "reps": "12" }}
      ]
    }}
  ]
}}
"""

    @classmethod
    def build_meal_prompt(cls, user: EffectiveUserContext) -> str:
        """
        Builds the prompt specifically for generating a 1-day Indian meal plan.
        """
        user_context = cls.get_user_context(user)
        return f"""
You are an expert nutritionist specializing in Indian cuisine. Your task is to generate a realistic, healthy 1-day Indian meal plan based EXACTLY on the user's profile below.

--- USER CONTEXT ---
{user_context}
------------------

Requirements for the Meal Plan:
1. It must respect their diet preference (e.g., Vegetarian, Vegan, Non-Veg) and strictly avoid any allergies listed.
2. It should align with their Primary Goal (e.g., calorie deficit for weight loss, surplus for muscle gain) and estimated BMR/TDEE.
3. Provide meals for: Breakfast, Lunch, Snack, and Dinner.
4. Provide estimated nutritional values (calories, protein) for each meal.
5. Keep the recipes focused on accessible Indian ingredients.
6. Provide output in pure JSON format ONLY (no markdown blocks, no introduction, no summary).

Format the JSON exactly like this:
{{
  "plan_type": "meal",
  "meals": [
    {{
      "meal_time": "Breakfast",
      "name": "Poha with Peanuts",
      "description": "Flattened rice cooked with turmeric, mustard seeds, and roasted peanuts.",
      "calories": 350,
      "protein_g": 8
    }}
  ]
}}
"""
