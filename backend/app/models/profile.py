from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class Profile(BaseModel):
    id: Optional[str] = None
    user_id: str = Field(..., description="Foreign key to users table")
    conditions: List[str] = Field(default_factory=list, description="Medical conditions e.g. diabetes, hypertension")
    allergies: List[str] = Field(default_factory=list, description="Allergies e.g. peanut, milk, egg")
    diet: List[str] = Field(default_factory=list, description="Dietary preference e.g. vegetarian, vegan")
    preferences: List[str] = Field(default_factory=list, description="Lifestyle preferences e.g. low_oil, low_sodium")
    instructions: List[str] = Field(default_factory=list, description="Custom medical or nutritional instructions")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
