import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.analysis import router as analysis_router
from app.api.food import router as food_router
from app.api.meals import router as meals_router
from app.api.plans import router as plans_router
from app.api.profiles import router as profiles_router
from app.api.restaurants import router as restaurants_router
from app.api.users import router as users_router
from app.core.config import settings
from app.core.database import get_supabase

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nutrishield.main")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "NutriShield Backend API - Intelligent HealthTech Decision-Support Prototype. "
        "Integrates Supabase PostgreSQL database and Gemini AI multimodal food understanding."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Routers
api_v1_prefix = settings.API_V1_STR
app.include_router(profiles_router, prefix=api_v1_prefix)
app.include_router(food_router, prefix=api_v1_prefix)
app.include_router(analysis_router, prefix=api_v1_prefix)
app.include_router(restaurants_router, prefix=api_v1_prefix)
app.include_router(meals_router, prefix=api_v1_prefix)
app.include_router(plans_router, prefix=api_v1_prefix)
app.include_router(users_router, prefix=api_v1_prefix)

# Health Check Endpoint
@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint confirming FastAPI service and Supabase connectivity status."""
    db_status = "connected"
    try:
        sp = get_supabase()
        db_status = "connected" if sp else "disconnected"
    except Exception:
        db_status = "offline"

    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_status
    }

# Exception Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An unexpected server error occurred.",
            "type": exc.__class__.__name__
        }
    )
