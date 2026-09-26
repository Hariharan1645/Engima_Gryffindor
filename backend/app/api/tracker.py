from fastapi import APIRouter, Depends
from app.core.security import get_current_user_id
from app.schemas.tracker import TrackerAnalyzeRequest, TrackerAnalyzeResponse
from app.services.analysis_service import analysis_service
from app.services.llm_service import llm_service

router = APIRouter(prefix="/tracker", tags=["Calorie & Nutrient Tracker"])

@router.post("/analyze", response_model=TrackerAnalyzeResponse)
def analyze_daily_tracker(
    payload: TrackerAnalyzeRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Calculate total calories, macro breakdown, and micronutrients using Groq AI.
    Cross-examines daily meal consumption against authenticated user's clinical profile.
    """
    profile = analysis_service.get_user_profile(user_id)
    profile_context = analysis_service.build_personalized_ai_context(profile)

    analysis_res = llm_service.analyze_tracker_nutrition(
        breakfast=payload.breakfast,
        lunch=payload.lunch,
        snacks=payload.snacks,
        dinner=payload.dinner,
        profile_context=profile_context
    )

    return analysis_res
