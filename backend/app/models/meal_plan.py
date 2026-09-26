from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class MealPlan(BaseModel):
    id: Optional[str] = None
    user_id: str
    days: int = 7
    meals_per_day: int = 3
    preferences: List[str] = Field(default_factory=list)
    plan_data: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[datetime] = None
