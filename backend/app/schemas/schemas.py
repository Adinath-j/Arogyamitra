from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ---------- User ----------

class UserCreate(BaseModel):
    name: str
    age: int = Field(ge=10, le=100)
    gender: str                         # male | female | other
    goal: str                           # weight_loss | muscle_gain | maintenance
    diet_type: str                      # veg | non-veg | vegan
    allergies: Optional[str] = ""
    time_availability: Optional[int] = 45


class UserResponse(BaseModel):
    id: int
    name: str
    age: int
    gender: str
    goal: str
    diet_type: str
    allergies: str
    time_availability: int
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


# ---------- Generate Requests ----------

class GenerateWorkoutRequest(BaseModel):
    user_id: int


class GenerateMealRequest(BaseModel):
    user_id: int


# ---------- Chat ----------

class ChatMessage(BaseModel):
    role: str       # user | assistant
    content: str


class ChatRequest(BaseModel):
    user_id: int
    messages: List[ChatMessage]


class ChatResponse(BaseModel):
    reply: str