import httpx
from app.utils.config import settings


def generate_spoonacular_meal_plan(target_calories: int, diet: str, exclude_ingredients: str = "") -> dict:
    """Fetch structured meal plan using Spoonacular's Generate Meal Plan API."""
    if not settings.SPOONACULAR_API_KEY:
        raise ValueError("Missing settings.SPOONACULAR_API_KEY in environment variables.")

    # We use timeFrame=week to get a 7-day response
    url = "https://api.spoonacular.com/mealplanner/generate"
    params = {
        "apiKey": settings.SPOONACULAR_API_KEY,
        "timeFrame": "week",
        "targetCalories": target_calories,
        "diet": diet.lower() if diet else "",
        "exclude": exclude_ingredients
    }
    
    try:
        response = httpx.get(url, params=params, timeout=10.0)
        response.raise_for_status()
        raw_plan = response.json()
        
        # Transform Spoonacular response into our app's defined output format
        formatted_plan = {"plan": []}
        
        # The typical Spoonacular week response has week keys: "monday", "tuesday", etc.
        days_of_week = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        
        for i, day_key in enumerate(days_of_week):
            if "week" in raw_plan and day_key in raw_plan["week"]:
                day_data = raw_plan["week"][day_key]
                nutrients = day_data.get("nutrients", {})
                meals = day_data.get("meals", [])
                
                day_obj = {
                    "day": f"Day {i+1} ({day_key.capitalize()})",
                    "total_calories": nutrients.get("calories", target_calories),
                    "macros": {
                        "protein": f"{nutrients.get('protein', 0)}g",
                        "fat": f"{nutrients.get('fat', 0)}g",
                        "carbohydrates": f"{nutrients.get('carbohydrates', 0)}g"
                    },
                    "meals": {}
                }
                
                # Assign meals (Spoonacular usually returns 3 meals per day: Breakfast, Lunch, Dinner)
                meal_types = ["breakfast", "lunch", "dinner"]
                for j, meal in enumerate(meals):
                    meal_name = meal_types[j] if j < len(meal_types) else f"snack_{j}"
                    
                    # Fetch detailed ingredients/instructions would require a separate call to /recipes/{id}/information
                    # To keep it performant and simple for the MVP, we use the basic info + a link
                    source_url = meal.get("sourceUrl", f"https://spoonacular.com/recipes/{meal.get('title', '').replace(' ', '-')}-{meal.get('id')}")
                    
                    day_obj["meals"][meal_name] = {
                        "dish": meal.get("title", "Unknown Dish"),
                        "ready_in_minutes": meal.get("readyInMinutes", 0),
                        "servings": meal.get("servings", 1),
                        "recipe_link": source_url
                    }
                
                formatted_plan["plan"].append(day_obj)

        if not formatted_plan["plan"]:
             return {"error": "Failed to parse Spoonacular response", "raw": raw_plan}

        return formatted_plan

    except Exception as e:
        print(f"Spoonacular lookup failed: {e}")
        return {"error": str(e)}


async def search_recipes(query: str, diet: str = None, max_results: int = 5) -> list:
    """Search for recipes by keyword."""
    if not settings.SPOONACULAR_API_KEY:
        return [{"error": "Missing settings.SPOONACULAR_API_KEY"}]

    params = {
        "apiKey": settings.SPOONACULAR_API_KEY,
        "query": query,
        "number": max_results,
        "addRecipeInformation": True,
    }
    if diet:
        params["diet"] = diet

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get("https://api.spoonacular.com/recipes/complexSearch", params=params)
            r.raise_for_status()
            data = r.json()
        return [
            {
                "id": item["id"],
                "title": item["title"],
                "image": item.get("image"),
                "ready_in_minutes": item.get("readyInMinutes"),
                "servings": item.get("servings"),
            }
            for item in data.get("results", [])
        ]
    except Exception as e:
        return [{"error": str(e)}]


async def get_recipe_details(recipe_id: int) -> dict:
    """Get full nutritional & ingredient info for a recipe."""
    if not settings.SPOONACULAR_API_KEY:
        return {"error": "Missing settings.SPOONACULAR_API_KEY"}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(
                f"https://api.spoonacular.com/recipes/{recipe_id}/information",
                params={"apiKey": settings.SPOONACULAR_API_KEY, "includeNutrition": True},
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        return {"error": str(e)}
