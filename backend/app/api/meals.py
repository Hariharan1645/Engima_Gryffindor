from typing import Any, Dict, List
from fastapi import APIRouter, Depends
from app.core.security import get_current_user_id

router = APIRouter(prefix="/meals", tags=["Meals"])

@router.get("", response_model=List[Dict[str, Any]])
def get_user_meals(user_id: str = Depends(get_current_user_id)):
    """Fetch meal log history for current user."""
    return [
        {
            "id": "meal-1",
            "name": "Vegetable Poha",
            "meal_type": "breakfast",
            "created_at": "2026-09-26T08:00:00Z"
        }
    ]
