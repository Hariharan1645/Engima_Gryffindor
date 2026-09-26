from fastapi import APIRouter, Depends, HTTPException, status
from app.core.config import settings
from app.core.security import get_current_user_id
from app.schemas.profile import ProfileResponse, ProfileUpdateRequest, UserProfileInfo
from app.services.analysis_service import analysis_service

router = APIRouter(prefix="/profile", tags=["Profile"])

def _build_profile_response(user_id: str, p: dict) -> ProfileResponse:
    user_name = p.get("full_name") or p.get("name") or settings.DEMO_USER_NAME
    user_email = p.get("email")
    return ProfileResponse(
        user=UserProfileInfo(id=user_id, name=user_name, email=user_email),
        full_name=p.get("full_name", user_name),
        date_of_birth=p.get("date_of_birth"),
        age=p.get("age"),
        gender=p.get("gender"),
        height=p.get("height"),
        weight=p.get("weight"),
        conditions=p.get("conditions", []),
        allergies=p.get("allergies", []),
        intolerances=p.get("intolerances", []),
        dietary_patterns=p.get("dietary_patterns", p.get("diet", [])),
        diet=p.get("diet", p.get("dietary_patterns", [])),
        goals=p.get("goals", p.get("preferences", [])),
        activity_level=p.get("activity_level"),
        activities=p.get("activities", []),
        meals_per_day=p.get("meals_per_day"),
        snacking_frequency=p.get("snacking_frequency"),
        late_night_eating=p.get("late_night_eating"),
        eating_locations=p.get("eating_locations", []),
        cuisine_preferences=p.get("cuisine_preferences", []),
        has_doctor_instructions=p.get("has_doctor_instructions", False),
        doctor_instructions=p.get("doctor_instructions", ""),
        instructions=p.get("instructions", [p.get("doctor_instructions")] if p.get("doctor_instructions") else []),
        preferences=p.get("preferences", p.get("goals", [])),
        is_completed=p.get("is_completed", True if (p.get("full_name") and p.get("date_of_birth")) else False)
    )

@router.get("", response_model=ProfileResponse)
def get_profile(user_id: str = Depends(get_current_user_id)):
    """Fetch user profile from Supabase."""
    profile_data = analysis_service.get_user_profile(user_id)
    return _build_profile_response(user_id, profile_data)

@router.put("", response_model=ProfileResponse)
def update_profile(
    payload: ProfileUpdateRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Update user profile in Supabase."""
    updated = analysis_service.update_user_profile(user_id, payload.model_dump(exclude_unset=True))
    return _build_profile_response(user_id, updated)
