from typing import List, Dict
from app.utils.config import settings


def get_google_auth_url(user_id: int) -> str:
    """Returns the Google OAuth2 authorization URL."""
    try:
        from google_auth_oauthlib.flow import Flow
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
        auth_url, _ = flow.authorization_url(prompt="consent", state=str(user_id), access_type="offline")
        return auth_url
    except Exception:
        return f"https://accounts.google.com/o/oauth2/v2/auth?client_id={settings.GOOGLE_CALENDAR_CLIENT_ID}&redirect_uri={settings.GOOGLE_CALENDAR_REDIRECT_URI}&response_type=code&scope=https://www.googleapis.com/auth/calendar.events"


def sync_workout_to_calendar(
    access_token: str,
    refresh_token: str,
    plan_data: dict,
    start_date: str,
) -> List[Dict]:
    """Push workout plan days as Google Calendar events. Returns list of created event summaries."""
    try:
        from google.oauth2.credentials import Credentials
        from googleapiclient.discovery import build
        from datetime import datetime, timedelta

        creds = Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.GOOGLE_CALENDAR_CLIENT_ID,
            client_secret=settings.GOOGLE_CALENDAR_CLIENT_SECRET,
        )
        service = build("calendar", "v3", credentials=creds)

        start = datetime.fromisoformat(start_date)
        events_created = []

        for i, day in enumerate(plan_data.get("plan", [])):
            day_date = start + timedelta(days=i)
            exercises = ", ".join(e["name"] for e in day.get("exercises", []))
            event = {
                "summary": f"🏋️ {day.get('day', f'Day {i + 1}')} — {day.get('focus', 'Workout')}",
                "description": f"Focus: {day.get('focus', '')}\nExercises: {exercises}",
                "start": {"date": day_date.strftime("%Y-%m-%d")},
                "end": {"date": (day_date + timedelta(days=1)).strftime("%Y-%m-%d")},
            }
            created = service.events().insert(calendarId="primary", body=event).execute()
            events_created.append({"id": created.get("id"), "summary": created.get("summary")})

        return events_created

    except ImportError:
        # google-api-python-client not installed → return stub
        return [{"message": "Google Calendar integration not available (missing google-api-python-client)"}]
    except Exception as e:
        raise RuntimeError(f"Calendar sync error: {e}")
