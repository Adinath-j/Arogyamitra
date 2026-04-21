# ⚕️ ArogyaMitra (HealthyFriend)

ArogyaMitra is a comprehensive, AI-powered Health and Wellness ecosystem built from the ground up for personalized fitness, dietary planning, and conversational coaching.

It features an intelligent assistant (AROMI) powered by LLama3 that natively analyzes health profiles to dynamically generate and modify fitness and meal plans. 

## 🚀 Live Demo
- **Frontend**: arogyamitra-chi.vercel.app
- **Backend**: [Your Render Link]

---

## 🛠 Tech Stack

### Frontend (React + Vite)
- **Framework:** React 18, React Router v6
- **Styling:** Tailwind CSS v3 with glassmorphism UI principles
- **State Management:** Zustand (for lightweight, persistent User auth flow)
- **API Communication:** Axios with centralized interceptors
- **Icons & UI:** Lucide React, React Hot Toast

### Backend (Python + FastAPI)
- **Framework:** FastAPI (Uvicorn ASGI server)
- **Database:** PostgreSQL (Hosted on Supabase) via SQLAlchemy ORM
- **Authentication:** JWT (JSON Web Tokens), Native Bcrypt hashing
- **AI Integration:** Groq API (LLama3-8b-8192) for JSON-structured generative responses
- **Third-Party Integrations:**
  - Google Calendar API v3 (OAuth2 scheduling for workouts)
  - YouTube Data API v3 (Dynamic exercise video scraping)
  - Spoonacular API (Macronutrient & recipe analysis)

---

## 🔥 Key Technical Triumphs & Challenges Overcome

Building ArogyaMitra for production introduced a myriad of complex backend architectural hurdles, which we systematically dismantled:

### 1. The Google Calendar API Sync (OAuth 404 & 422 Errors)
**The Problem:** Pushing our AI-generated JSON workout routines directly to a user's Google Calendar threw recurring `422 Unprocessable Entity` and `404 Not Found` API validation errors.
**The Fix:** 
- The 422 error was triggered because our local frontend was stripping the internal Postgres `id` parameter from the dataset, causing the payload strict-validation to crash. We intercepted this and forcefully embedded the `plan_id` onto the sync requests.
- The 404 error was triggered because the `/calendar/sync` route queried an archaic `WorkoutPlan` database table instead of the unified `Plan` JSON cache generator. We rewired the SQLAlchemy tables so Google OAuth correctly targets our active generations.

**The Polish:** Instead of the OAuth flow ending in a blank JSON screen from Google, we rebuilt the callback. It now takes the access tokens, quietly saves them to the active Postgres user session, and seamlessly triggers a secure browser redirect straight back into the React dashboard (`/dashboard?calendar=connected`), flashing a beautiful success toast!

### 2. The Great Render Boot Crash (Passlib vs Bcrypt 4.x)
**The Problem:** When deploying the backend to Render, the server completely crashed with a `500 Internal Server Error` on the very first login attempt.
**The Fix:** We discovered a legendary Python 3.11 compatibility bug deep within the codebase. We used `passlib` for password verification, which executes an internal "security wrap test" upon boot by attempting to encrypt a massive `90-byte` string. 
However, modern `bcrypt` completely banned inputs over `72-bytes`, so `passlib` instantly triggered a strict `ValueError` which brought down out entire server. Rather than relying on fragile monkeypatches, we completely ripped `passlib` out of the source code and flawlessly rewrote `auth.py` to use pure, native `bcrypt.hashpw` functions!

### 3. Vercel Single Page App (SPA) Routing (404 Error)
**The Problem:** Visiting `https://arogyamitra.vercel.app/login` exactly directly resulted in a 404 error.
**The Fix:** React manages routing on the client side using `index.html`. Vercel natively tries to search for a literal file called `login.html`. We resolved this by injecting a custom `vercel.json` routing layer that commands Vercel to route any unknown paths instantly to `index.html`.

### 4. Supabase Postgres Dialects
**The Problem:** SQLAlchemy `create_engine` initially crashed during production deployment because Supabase connection protocols use deprecated SQL dialects (`postgres://`).
**The Fix:** We built an intercept proxy in `database.py` that auto-swaps the string to `postgresql://` and safely drops synchronous SQLite threading locks!

---

## 💻 Local Setup Guide

If you'd like to spin up ArogyaMitra on your local machine, follow these exact steps.

### Prerequisites
- Node.js >= 18.x
- Python 3.11.x
- PostgreSQL database (or Supabase)
- API Keys: Groq, Spoonacular, YouTube Data API, Google Cloud Console 

### 1. Run the Backend (FastAPI)

Navigate to the `backend` directory:
```bash
cd backend
```

Create and activate a virtual environment:
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Mac/Linux
python3 -m venv .venv
source .venv/bin/activate
```

Install the dependencies:
```bash
pip install -r requirements.txt
```

Create a `.env` file in the `backend` folder containing your keys:
```env
ENVIRONMENT=development
DATABASE_URL=postgresql://[user]:[password]@[host]:6543/postgres

SECRET_KEY=generate_a_strong_string
JWT_SECRET_KEY=generate_another_strong_string

GROQ_API_KEY=your_key
YOUTUBE_API_KEY=your_key
SPOONACULAR_API_KEY=your_key

GOOGLE_CALENDAR_CLIENT_ID=your_key
GOOGLE_CALENDAR_CLIENT_SECRET=your_key
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:8000/api/calendar/callback
```

Boot the server:
```bash
uvicorn app.main:app --reload
```
*Your backend is now live at http://127.0.0.1:8000*


### 2. Run the Frontend (React + Vite)

Open a new terminal and navigate to the `frontend` directory:
```bash
cd frontend
```

Install the packages:
```bash
npm install
```

Ensure your Vite application knows where the API is by either using the local Vite proxy (`vite.config.js`) or an `.env` file:
```env
VITE_API_URL=http://localhost:8000/api
```

Start the React development server:
```bash
npm run dev
```
*Your frontend is now live at http://localhost:5173* 🚀

---
*ArogyaMitra was carefully crafted using cutting-edge LLMs, Python ASGI patterns, and modern Javascript frontend architecture!*
