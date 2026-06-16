from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User
from app.schemas.schemas import UserCreate, UserResponse
import uuid
import secrets
from app.utils.auth import hash_password

router = APIRouter(prefix="/user", tags=["User"])


@router.post("/", response_model=UserResponse)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    guest_uuid = str(uuid.uuid4())[:8]
    guest_email = f"guest_{guest_uuid}@local.arogyamitra"
    guest_username = f"guest_{guest_uuid}"
    guest_password = hash_password(secrets.token_urlsafe(16))

    user = User(
        **user_data.model_dump(),
        email=guest_email,
        username=guest_username,
        hashed_password=guest_password,
        role="guest"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user