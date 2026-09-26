from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class RestaurantSchema(BaseModel):
    id: str
    name: str
    vegetarian_only: bool = False
    confidence: float = 1.0

class MenuItemSchema(BaseModel):
    id: str
    restaurant_id: str
    name: str
    description: Optional[str] = None
    known_ingredients: List[str] = Field(default_factory=list)
    unknown_ingredients: List[str] = Field(default_factory=list)
    nutrition: Dict[str, Any] = Field(default_factory=dict)

class RestaurantMenuResponse(BaseModel):
    restaurant: RestaurantSchema
    items: List[MenuItemSchema]

class MenuMatchItem(BaseModel):
    menu_item_id: str
    name: str
    status: str  # lower_concern, potential_concern, high_attention, unknown
    reason: str

class MenuAnalysisResponse(BaseModel):
    best_matches: List[MenuMatchItem] = Field(default_factory=list)
    review: List[MenuMatchItem] = Field(default_factory=list)
    high_attention: List[MenuMatchItem] = Field(default_factory=list)
    unknown: List[MenuMatchItem] = Field(default_factory=list)
