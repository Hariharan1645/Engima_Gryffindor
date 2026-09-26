from typing import List, Optional
from pydantic import BaseModel, Field

class UserProfileInfo(BaseModel):
    id: str
    name: str

class ProfileResponse(BaseModel):
    user: UserProfileInfo
    conditions: List[str] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)
    diet: List[str] = Field(default_factory=list)
    preferences: List[str] = Field(default_factory=list)
    instructions: List[str] = Field(default_factory=list)

class ProfileUpdateRequest(BaseModel):
    conditions: Optional[List[str]] = Field(default=None)
    allergies: Optional[List[str]] = Field(default=None)
    diet: Optional[List[str]] = Field(default=None)
    preferences: Optional[List[str]] = Field(default=None)
    instructions: Optional[List[str]] = Field(default=None)
