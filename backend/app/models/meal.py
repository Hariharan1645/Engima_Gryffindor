from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class Meal(BaseModel):
    id: Optional[str] = None
    user_id: str
    meal_type: str  # breakfast, lunch, dinner, snack
    name: str
    recipe: Optional[str] = None
    nutrition: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[datetime] = None
