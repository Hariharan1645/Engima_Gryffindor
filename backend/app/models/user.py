from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class User(BaseModel):
    id: str = Field(..., description="Unique User ID")
    name: str = Field(..., description="User's full name")
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
