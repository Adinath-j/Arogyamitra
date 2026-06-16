from pydantic_settings import BaseSettings
from typing import List, Any
from pydantic import field_validator
import json


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres.krrejqmtyfwsquvtubee:ArogyaMitra%40123@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"
    SECRET_KEY: str = "arogyamitra-super-secret-key-2024"

    # App
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> Any:
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                try:
                    parsed = json.loads(v)
                    if isinstance(parsed, list):
                        return parsed
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

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