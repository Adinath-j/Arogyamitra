from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database import engine, Base
from app.utils.config import settings
from app.utils.logger import logger

# Import all route modules
from app.routes import user, workout, chat, progress, auth
from app.routes import health_assessment, youtube, spoonacular, calendar
from app.routes.meal import router as meal_router
from app.routes.plans import router as plans_router

print("CORS_ORIGINS:", settings.CORS_ORIGINS)
print("TYPE:", type(settings.CORS_ORIGINS))
# Auto-create all DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ArogyaMitra API",
    description="AI-powered fitness & wellness platform — powered by LLaMA 3.3-70B",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting ArogyaMitra API v2.0.0 in {settings.ENVIRONMENT} mode.")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
    )

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all routers under /api prefix
PREFIX = "/api"
app.include_router(auth.router,              prefix=PREFIX)
app.include_router(user.router,              prefix=PREFIX)
app.include_router(workout.router,           prefix=PREFIX)
app.include_router(meal_router,              prefix=PREFIX)
app.include_router(chat.router,              prefix=PREFIX)
app.include_router(health_assessment.router, prefix=PREFIX)
app.include_router(progress.router,          prefix=PREFIX)
app.include_router(youtube.router,           prefix=PREFIX)
app.include_router(spoonacular.router,       prefix=PREFIX)
app.include_router(calendar.router,          prefix=PREFIX)
app.include_router(plans_router,             prefix=PREFIX)



@app.get("/")
def root():
    logger.info("Root endpoint accessed")
    return {
        "app": "ArogyaMitra API v2.0",
        "status": "running 🌿",
        "docs": "/docs",
        "version": "2.0.0",
    }


@app.get("/health")
def health():
    return {"status": "ok", "environment": settings.ENVIRONMENT}