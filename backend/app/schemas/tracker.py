from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class TrackerAnalyzeRequest(BaseModel):
    breakfast: List[str] = Field(default_factory=list)
    lunch: List[str] = Field(default_factory=list)
    snacks: List[str] = Field(default_factory=list)
    dinner: List[str] = Field(default_factory=list)

class MealBreakdownItem(BaseModel):
    calories: int
    summary: str

class MealBreakdown(BaseModel):
    breakfast: MealBreakdownItem
    lunch: MealBreakdownItem
    snacks: MealBreakdownItem
    dinner: MealBreakdownItem

class MacroBreakdown(BaseModel):
    protein_g: float
    protein_target_g: float = 75.0
    carbs_g: float
    carbs_target_g: float = 225.0
    fat_g: float
    fat_target_g: float = 55.0
    fiber_g: float
    fiber_target_g: float = 30.0

class MicronutrientBreakdown(BaseModel):
    vitamin_a_pct: float = 75.0
    vitamin_c_pct: float = 80.0
    vitamin_d_pct: float = 50.0
    vitamin_b12_pct: float = 60.0
    calcium_mg: float = 750.0
    iron_mg: float = 14.0
    sodium_mg: float = 1800.0
    potassium_mg: float = 2300.0

class TrackerAnalyzeResponse(BaseModel):
    total_calories: int
    target_calories: int = 2000
    health_score: int = 85
    meal_breakdown: Dict[str, Any]
    macros: MacroBreakdown
    micronutrients: MicronutrientBreakdown
    clinical_insights: List[str]
