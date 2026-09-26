from fastapi import APIRouter, Depends
from app.core.config import settings
from app.core.security import get_current_user_id
from app.schemas.profile import UserProfileInfo

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserProfileInfo)
def get_current_user_info(user_id: str = Depends(get_current_user_id)):
    """Return currently authenticated user info."""
    return UserProfileInfo(id=user_id, name=settings.DEMO_USER_NAME)
