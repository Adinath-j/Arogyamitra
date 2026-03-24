from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import json
from app.database import get_db
from app.utils.auth import get_current_user
from app.models.models import User, Plan
from app.schemas.schemas import CalendarSyncRequest
from app.services.calendar_service import sync_workout_to_calendar, get_google_auth_url
from app.utils.config import settings

router = APIRouter(prefix="/calendar", tags=["Google Calendar"])


@router.get("/auth-url")
def get_auth_url(user: User = Depends(get_current_user)):
    """Returns the Google OAuth2 URL the frontend should redirect to."""
    try:
        url = get_google_auth_url(user.id)
        return {"auth_url": url}
    except Exception as e:
        raise HTTPException(500, f"Could not generate auth URL: {str(e)}")


@router.get("/callback")
def oauth_callback(state: str, code: str, request: Request, db: Session = Depends(get_db)):
    """Handle Google OAuth2 callback — exchange code for tokens and save to active user."""
    from google_auth_oauthlib.flow import Flow
    try:
        user_id = int(state)
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.GOOGLE_CALENDAR_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CALENDAR_CLIENT_SECRET,
                    "redirect_uris": [settings.GOOGLE_CALENDAR_REDIRECT_URI],
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=["https://www.googleapis.com/auth/calendar.events"],
        )
        flow.redirect_uri = settings.GOOGLE_CALENDAR_REDIRECT_URI
        flow.fetch_token(code=code)
        creds = flow.credentials

        # Look up the user matching the state parameter and save tokens
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.google_access_token = creds.token
            user.google_refresh_token = creds.refresh_token
            db.commit()

        # Seamlessly return user to the App
        return RedirectResponse(url="http://localhost:5173/dashboard?calendar=connected")
    except Exception as e:
        raise HTTPException(500, f"OAuth callback failed: {str(e)}")


@router.post("/sync")
def sync_to_calendar(
    req: CalendarSyncRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Sync a workout plan to Google Calendar."""
    if not user.google_access_token:
        raise HTTPException(400, "Google Calendar not connected. Visit /api/calendar/auth-url first.")

    plan = db.query(Plan).filter(
        Plan.id == req.workout_plan_id,
        Plan.user_id == user.id,
        Plan.plan_type == "workout"
    ).first()
    if not plan:
        raise HTTPException(404, "Workout plan not found")

    try:
        plan_data = json.loads(plan.content)
        events = sync_workout_to_calendar(
            user.google_access_token,
            user.google_refresh_token,
            plan_data,
            req.start_date,
        )
        return {"success": True, "events_created": len(events), "events": events}
    except Exception as e:
        raise HTTPException(500, f"Calendar sync failed: {str(e)}")


@router.post("/save-tokens")
def save_tokens(
    tokens: dict,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Save Google tokens to user record after OAuth flow."""
    user.google_access_token = tokens.get("access_token")
    user.google_refresh_token = tokens.get("refresh_token")
    db.commit()
    return {"success": True, "message": "Google Calendar tokens saved"}