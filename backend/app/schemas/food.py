from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class IngredientSchema(BaseModel):
    name: str
    normalized_name: Optional[str] = None
    category: Optional[str] = None
    is_explicit: bool = True
    confidence: float = 1.0

class FoodSchema(BaseModel):
    name: str
    ingredients: List[IngredientSchema] = Field(default_factory=list)
