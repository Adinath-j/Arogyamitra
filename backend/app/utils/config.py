from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./arogyamitra.db"
    SECRET_KEY: str = "arogyamitra-super-secret-key-2024"

    # App
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # AI
    GROQ_API_KEY: str = ""

    # Google
    GOOGLE_CALENDAR_CLIENT_ID: str = ""
    GOOGLE_CALENDAR_CLIENT_SECRET: str = ""
    GOOGLE_CALENDAR_REDIRECT_URI: str = "http://localhost:8000/api/calendar/callback"
    YOUTUBE_API_KEY: str = ""

    # Spoonacular
    SPOONACULAR_API_KEY: str = ""

    # JWT
    JWT_SECRET_KEY: str = "arogyamitra-jwt-secret-2024"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()