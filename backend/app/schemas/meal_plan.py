from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class MealPlanRequest(BaseModel):
    days: int = Field(7, ge=1, le=14, description="Number of plan days")
    meals_per_day: int = Field(3, ge=1, le=6, description="Meals per day")
    preferences: List[str] = Field(default_factory=list, description="Preferences e.g. vegetarian, indian, low_oil")

class MealNutrition(BaseModel):
    calories: Optional[int] = None
    protein_g: Optional[int] = None
    carbs_g: Optional[int] = None
    fat_g: Optional[int] = None
    sodium_mg: Optional[int] = None

class MealItem(BaseModel):
    meal_type: str  # breakfast, lunch, dinner, snack
    name: str
    recipe: str
    nutrition: Dict[str, Any] = Field(default_factory=dict)

class DayPlan(BaseModel):
    day: int
    meals: List[MealItem]

class MealPlanResponse(BaseModel):
    plan_id: str
    days: List[DayPlan]
