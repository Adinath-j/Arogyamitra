from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import user, workout, meal, chat, plans

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ArogyaMitra API",
    description="AI-powered fitness and wellness platform",
    version="1.0.0",
)

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(user.router)
app.include_router(workout.router)
app.include_router(meal.router)
app.include_router(chat.router)
app.include_router(plans.router)


@app.get("/")
def root():
    return {"message": "ArogyaMitra API is running 🌿", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}