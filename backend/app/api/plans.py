from fastapi import APIRouter, Depends, status
from app.core.security import get_current_user_id
from app.schemas.meal_plan import MealPlanRequest, MealPlanResponse
from app.services.meal_plan_service import meal_plan_service

router = APIRouter(prefix="/meal-plans", tags=["Meal Plans"])

@router.post("/generate", response_model=MealPlanResponse)
def generate_meal_plan(
    payload: MealPlanRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Generate custom multi-day meal plan.
    Automatically loads user profile from Supabase and applies Gemini AI candidate generation
    filtered deterministically by profile safety constraints.
    """
    plan_result = meal_plan_service.generate_meal_plan(
        user_id=user_id,
        days=payload.days,
        meals_per_day=payload.meals_per_day,
        preferences=payload.preferences
    )
    return plan_result
