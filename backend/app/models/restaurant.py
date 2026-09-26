from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class Restaurant(BaseModel):
    id: Optional[str] = None
    name: str
    vegetarian_only: bool = False
    confidence: float = 1.0
    created_at: Optional[datetime] = None

class MenuItem(BaseModel):
    id: Optional[str] = None
    restaurant_id: str
    name: str
    description: Optional[str] = None
    known_ingredients: List[str] = Field(default_factory=list)
    unknown_ingredients: List[str] = Field(default_factory=list)
    nutrition: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[datetime] = None
