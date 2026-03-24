from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ---------- Auth ----------

class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str
    full_name: str
    age: Optional[int] = None
    gender: Optional[str] = "male"
    height: Optional[float] = None
    weight: Optional[float] = None
    fitness_level: Optional[str] = "beginner"
    fitness_goal: Optional[str] = "weight_loss"
    workout_preference: Optional[str] = "home"
    diet_preference: Optional[str] = "vegetarian"
    allergies: Optional[str] = ""
    time_availability: Optional[int] = 45


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str
    full_name: str
    role: str


# ---------- User ----------

class UserCreate(BaseModel):
    name: str
    age: int = Field(ge=10, le=100)
    gender: str
    goal: str
    diet_type: str
    allergies: Optional[str] = ""
    time_availability: Optional[int] = 45


class UserResponse(BaseModel):
    id: int
    email: Optional[str] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = "user"
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    goal: Optional[str] = None
    diet_type: Optional[str] = None
    fitness_goal: Optional[str] = None
    diet_preference: Optional[str] = None
    allergies: Optional[str] = ""
    time_availability: Optional[int] = 45
    height: Optional[float] = None
    weight: Optional[float] = None
    fitness_level: Optional[str] = None
    workout_preference: Optional[str] = None
    current_streak: Optional[int] = 0
    longest_streak: Optional[int] = 0
    charity_points: Optional[int] = 0
    total_workouts_completed: Optional[int] = 0
    total_calories_burned: Optional[float] = 0.0
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Plans ----------

class PlanCreate(BaseModel):
    user_id: int
    plan_type: str
    content: str


class PlanResponse(BaseModel):
    id: int
    user_id: int
    plan_type: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Progress ----------

class ProgressLogCreate(BaseModel):
    weight: Optional[float] = None
    calories_burned: Optional[float] = 0.0
    workout_duration: Optional[int] = 0
    steps: Optional[int] = 0
    water_intake: Optional[float] = 0.0
    sleep_hours: Optional[float] = 0.0
    mood: Optional[str] = "Good"

class ProgressLogResponse(BaseModel):
    id: int
    user_id: int
    log_date: datetime
    weight: Optional[float] = None
    calories_burned: float
    workout_duration: int
    steps: int
    water_intake: float
    sleep_hours: float
    mood: str

    class Config:
        from_attributes = True


# ---------- Health Assessment ----------

class HealthAssessmentSubmit(BaseModel):
    bmi: Optional[float] = None
    injuries: Optional[str] = None
    medications: Optional[str] = None
    health_conditions: Optional[str] = None
    assessment_data: Optional[dict] = None

class HealthAnalysisRequest(BaseModel):
    assessment_id: Optional[int] = None
    answers: Optional[dict] = None


# ---------- Generate Requests ----------

class GenerateWorkoutRequest(BaseModel):
    user_id: Optional[int] = None


class GenerateMealRequest(BaseModel):
    user_id: Optional[int] = None


# ---------- Chat / AROMI ----------

class ChatMessage(BaseModel):
    role: str       # user | assistant
    content: str

class ArogyaCoachMessage(BaseModel):
    user_id: int
    message: str
    user_status: Optional[str] = "normal"  # normal, traveling, recovering from injury, busy
    current_workout_plan: Optional[dict] = None
    current_meal_plan: Optional[dict] = None

class ChatResponse(BaseModel):
    reply: str
    modified_workout_plan: Optional[dict] = None
    modified_meal_plan: Optional[dict] = None

# ---------- YouTube ----------

class YouTubeSearchRequest(BaseModel):
    query: str
    max_results: int = 5


# ---------- Recipes / Spoonacular ----------

class RecipeSearchRequest(BaseModel):
    query: str
    diet: Optional[str] = None
    max_results: int = 5


# ---------- Meal Log ----------

class MealLogCreate(BaseModel):
    meal_type: str                        # breakfast | lunch | dinner | snack
    description: Optional[str] = None
    calories: Optional[float] = None


# ---------- Calendar ----------

class CalendarSyncRequest(BaseModel):
    workout_plan_id: int
    start_date: str                       # ISO date string e.g. "2024-01-15"
