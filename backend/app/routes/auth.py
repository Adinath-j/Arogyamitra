from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User
from app.schemas.schemas import RegisterRequest, TokenResponse, UserResponse
from app.utils.auth import hash_password, verify_password, create_access_token, get_current_user
from app.utils.logger import logger

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user and return a JWT token."""
    if not payload.email or not payload.email.strip():
        logger.warning("User creation rejected: missing required field 'email'")
        raise HTTPException(status_code=400, detail="Email is required")
    if not payload.username or not payload.username.strip():
        logger.warning("User creation rejected: missing required field 'username'")
        raise HTTPException(status_code=400, detail="Username is required")
    if not payload.password or not payload.password.strip():
        logger.warning("User creation rejected: missing required field 'password'")
        raise HTTPException(status_code=400, detail="Password is required")

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        email=payload.email,
        username=payload.username,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        name=payload.full_name,                        # backward compat
        role="user",
        age=payload.age,
        gender=payload.gender,
        height=payload.height,
        weight=payload.weight,
        fitness_level=payload.fitness_level,
        fitness_goal=payload.fitness_goal,
        goal=payload.fitness_goal,                     # backward compat
        workout_preference=payload.workout_preference,
        diet_preference=payload.diet_preference,
        diet_type=payload.diet_preference,             # backward compat
        allergies=payload.allergies or "",
        time_availability=payload.time_availability or 45,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        username=user.username,
        full_name=user.full_name or "",
        role=user.role,
    )


@router.post("/login", response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login with username/email + password and return a JWT token."""
    # Accept either username or email
    user = (
        db.query(User).filter(User.username == form.username).first()
        or db.query(User).filter(User.email == form.username).first()
    )
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        username=user.username,
        full_name=user.full_name or "",
        role=user.role,
    )


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_me(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update profile fields for the currently authenticated user."""
    allowed = {"full_name", "age", "gender", "height", "weight", "fitness_goal",
               "diet_preference", "allergies", "time_availability", "fitness_level",
               "workout_preference"}
    for k, v in payload.items():
        if k in allowed:
            setattr(current_user, k, v)
            # Keep backward-compat aliases in sync
            if k == "full_name":
                current_user.name = v
            elif k == "fitness_goal":
                current_user.goal = v
            elif k == "diet_preference":
                current_user.diet_type = v
    db.commit()
    db.refresh(current_user)
    return current_user
