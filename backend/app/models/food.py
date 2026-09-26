from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class Ingredient(BaseModel):
    name: str = Field(..., description="Ingredient name")
    normalized_name: Optional[str] = None
    category: Optional[str] = None
    is_explicit: bool = True
    confidence: float = 1.0

class IngredientRelationship(BaseModel):
    id: Optional[str] = None
    base_ingredient: str
    related_ingredient: str
    relationship_type: str  # synonym, derived, category, hidden
    normalized_name: str
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    created_at: Optional[datetime] = None

class FoodItem(BaseModel):
    id: Optional[str] = None
    name: str
    category: Optional[str] = None
    known_ingredients: List[str] = Field(default_factory=list)
    created_at: Optional[datetime] = None
