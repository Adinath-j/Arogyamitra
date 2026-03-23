from sqlalchemy.orm import Session
from app.models.models import User
from app.services.groq_service import call_groq
from app.utils.prompts import chat_system_prompt
from app.schemas.schemas import ChatMessage


def chat_with_aromi(user_id: int, messages: list[ChatMessage], db: Session) -> str:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError(f"User {user_id} not found")

    system = chat_system_prompt(user)

    # Build messages array for Groq
    groq_messages = [{"role": "system", "content": system}]
    for msg in messages:
        groq_messages.append({"role": msg.role, "content": msg.content})

    reply = call_groq(groq_messages, temperature=0.8, max_tokens=1024)
    return reply