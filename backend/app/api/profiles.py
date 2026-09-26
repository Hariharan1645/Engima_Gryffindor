from fastapi import APIRouter, Depends, HTTPException, status
from app.core.config import settings
from app.core.security import get_current_user_id
from app.schemas.profile import ProfileResponse, ProfileUpdateRequest, UserProfileInfo
from app.services.analysis_service import analysis_service

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("", response_model=ProfileResponse)
def get_profile(user_id: str = Depends(get_current_user_id)):
    """Fetch user profile from Supabase."""
    profile_data = analysis_service.get_user_profile(user_id)
    return ProfileResponse(
        user=UserProfileInfo(id=user_id, name=settings.DEMO_USER_NAME),
        conditions=profile_data.get("conditions", []),
        allergies=profile_data.get("allergies", []),
        diet=profile_data.get("diet", []),
        preferences=profile_data.get("preferences", []),
        instructions=profile_data.get("instructions", [])
    )

@router.put("", response_model=ProfileResponse)
def update_profile(
    payload: ProfileUpdateRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Update user profile in Supabase."""
    updated = analysis_service.update_user_profile(user_id, payload.model_dump(exclude_unset=True))
    return ProfileResponse(
        user=UserProfileInfo(id=user_id, name=settings.DEMO_USER_NAME),
        conditions=updated.get("conditions", []),
        allergies=updated.get("allergies", []),
        diet=updated.get("diet", []),
        preferences=updated.get("preferences", []),
        instructions=updated.get("instructions", [])
    )
