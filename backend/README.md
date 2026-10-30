# 🌿 ArogyaMitra Backend (Node.js + Express + Prisma)

The migrated backend for **ArogyaMitra (HealthyFriend)**, an AI-powered fitness, wellness, and dietary coaching platform.

Originally built on FastAPI and SQLAlchemy, this backend is migrated to **Node.js (>= 18), Express.js, and Prisma ORM**, preserving existing database tables, API contracts, AI prompts, and frontend compatibility.

---

## 🛠 Tech Stack

- **Runtime:** Node.js (>= 18) with ES Modules
- **Server Framework:** Express.js 4.x
- **ORM & Data Layer:** Prisma Client & Prisma CLI
- **Database:** PostgreSQL (Hosted on Supabase)
- **Authentication:** JWT (`jsonwebtoken`) & Native Bcrypt password hashing (`bcrypt`)
- **Validation:** Zod Schema Validation
- **AI Engine:** Official Groq SDK (`groq-sdk`) with LLaMA 3.3-70B
- **Google OAuth2 & Calendar:** `googleapis` v3
- **External Integrations:** YouTube Data API v3 & Spoonacular Nutrition API

---

## 📂 Project Architecture

```
backend/
├── prisma/
│   └── schema.prisma         # Introspected schema representing existing Supabase DB
├── src/
│   ├── config/
│   │   ├── database.js       # Prisma client instance with logging
│   │   └── env.js            # Environment validation & loading
│   ├── controllers/          # HTTP request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── workoutController.js
│   │   ├── mealController.js
│   │   ├── planController.js
│   │   ├── chatController.js
│   │   ├── healthController.js
│   │   ├── progressController.js
│   │   ├── youtubeController.js
│   │   ├── recipeController.js
│   │   └── calendarController.js
│   ├── middleware/
│   │   ├── authMiddleware.js # JWT Bearer validation & user injection
│   │   ├── errorHandler.js   # Centralized error handler
│   │   └── validate.js       # Zod schema validation middleware
│   ├── routes/               # Express routers mounted under /api
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── workoutRoutes.js
│   │   ├── mealRoutes.js
│   │   ├── planRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── healthRoutes.js
│   │   ├── progressRoutes.js
│   │   ├── youtubeRoutes.js
│   │   ├── recipeRoutes.js
│   │   └── calendarRoutes.js
│   ├── services/             # Core business logic & 3rd party APIs
│   │   ├── ai/
│   │   │   ├── groqService.js
│   │   │   ├── promptBuilder.js
│   │   │   ├── contextResolver.js
│   │   │   └── router.js
│   │   ├── calendar/
│   │   │   └── calendarService.js
│   │   ├── youtube/
│   │   │   └── youtubeService.js
│   │   ├── nutrition/
│   │   │   └── spoonacularService.js
│   │   ├── workoutService.js
│   │   ├── mealService.js
│   │   └── healthService.js
│   ├── utils/
│   │   ├── auth.js           # Password hash/verify and JWT sign/decode
│   │   └── logger.js         # Structured logger
│   ├── validators/           # Zod payload schemas
│   │   └── schemas.js
│   ├── app.js                # Express app configuration & middleware
│   └── server.js             # Server listener & graceful shutdown handlers
├── tests/
│   └── migration.test.js     # Comprehensive test suite (Node test runner + Supertest)
├── .env.example
├── render.yaml               # Deployment config for Render
└── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### 2. Installation
Navigate to the `backend/` directory:
```bash
cd backend
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your credentials:
```env
PORT=8000
ENVIRONMENT=development
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
JWT_SECRET_KEY="arogyamitra-jwt-secret-2024"
GROQ_API_KEY="gsk_..."
GOOGLE_CALENDAR_CLIENT_ID="..."
GOOGLE_CALENDAR_CLIENT_SECRET="..."
GOOGLE_CALENDAR_REDIRECT_URI="http://localhost:8000/api/calendar/callback"
YOUTUBE_API_KEY="..."
SPOONACULAR_API_KEY="..."
```

### 4. Prisma Client Generation
```bash
npm run prisma:generate
```

### 5. Start Development Server
```bash
npm run dev
```
The server will start on `http://localhost:8000`.

### 6. Run Test Suite
```bash
npm test
```

---

## 🔒 Authentication Flow

- Passwords are verified against existing database records using standard `bcrypt.compare`.
- Inputs are safely truncated to 72 bytes to adhere to bcrypt standards and prevent buffer overflow issues.
- Access tokens are signed using `HS256` with `sub` pointing to the user ID.
- Protected endpoints accept tokens via the standard header:
  `Authorization: Bearer <access_token>`

---

## 🌐 API Endpoints Reference

All routes are mounted under `/api` unless otherwise noted.

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | Root API status banner | No |
| `GET` | `/health` | Healthcheck status | No |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login with username/email & password | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `PUT` | `/api/auth/me` | Update profile fields | Yes |
| `POST` | `/api/user/` | Create guest user | No |
| `GET` | `/api/user/:userId` | Get user by ID | No |
| `POST` | `/api/workout/generate` | Generate 7-day personalized workout plan | Yes |
| `GET` | `/api/workout/active` | Get active workout plan | Yes |
| `POST` | `/api/workout/log-exercise`| Log exercise completion & calories | Yes |
| `POST` | `/api/generate-workout/` | Generate workout plan (legacy endpoint) | Optional |
| `POST` | `/api/nutrition/generate` | Generate personalized meal plan | Yes |
| `POST` | `/api/nutrition/generate-by-id` | Generate meal plan by user ID | No |
| `GET` | `/api/nutrition/active` | Get active meal plan | Yes |
| `POST` | `/api/nutrition/log-meal` | Log meal entry | Yes |
| `GET` | `/api/plans/:userId` | List all historical plans | No |
| `GET` | `/api/plans/:userId/latest` | Get latest workout & meal plans | No |
| `POST` | `/api/aromi-chat/` | Chat with AROMI AI Coach (Adaptive routing) | Optional |
| `POST` | `/api/chat/` | Standard chat endpoint for ChatPage | Optional |
| `POST` | `/api/health-assessment/assessment/submit` | Submit health assessment | Yes |
| `POST` | `/api/health-assessment/analyze` | AI clinical analysis of assessment | Yes |
| `GET` | `/api/health-assessment/latest` | Get latest health assessment | Yes |
| `POST` | `/api/progress/log` | Record daily progress log | Yes |
| `GET` | `/api/progress/history` | Retrieve progress history | Yes |
| `GET` | `/api/progress/stats` | Retrieve 30-day dashboard statistics | Yes |
| `POST` | `/api/youtube/search` | Search exercise tutorial videos | Yes |
| `POST` | `/api/recipes/search` | Search Spoonacular recipes | Yes |
| `GET` | `/api/recipes/:recipe_id` | Fetch detailed recipe information | Yes |
| `GET` | `/api/calendar/auth-url` | Generate Google OAuth2 authorization URL | Yes |
| `GET` | `/api/calendar/callback` | Google OAuth2 callback redirect handler | No |
| `POST` | `/api/calendar/save-tokens` | Save Google OAuth tokens | Yes |
| `POST` | `/api/calendar/sync` | Sync workout schedule to Google Calendar | Yes |

---

## 🚢 Render Deployment

The backend is configured for deployment on Render via `backend/render.yaml`:
- **Environment:** `node`
- **Build Command:** `npm install && npx prisma generate`
- **Start Command:** `npm start`
