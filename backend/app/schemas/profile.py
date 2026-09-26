from typing import List, Optional
from pydantic import BaseModel, Field

class UserProfileInfo(BaseModel):
    id: str
    name: str
    email: Optional[str] = None

class ProfileResponse(BaseModel):
    user: UserProfileInfo
    
    # Section 1: Basic Information
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None

    # Section 2: Health Conditions
    conditions: List[str] = Field(default_factory=list)

    # Section 3: Allergies & Intolerances
    allergies: List[str] = Field(default_factory=list)
    intolerances: List[str] = Field(default_factory=list)

    # Section 4: Dietary Patterns
    dietary_patterns: List[str] = Field(default_factory=list)
    diet: List[str] = Field(default_factory=list)  # legacy alias

    # Section 5: Dietary Goals
    goals: List[str] = Field(default_factory=list)

    # Section 6: Activity & Lifestyle
    activity_level: Optional[str] = None
    activities: List[str] = Field(default_factory=list)

    # Section 7: Eating Habits
    meals_per_day: Optional[str] = None
    snacking_frequency: Optional[str] = None
    late_night_eating: Optional[str] = None

    # Section 8: Where Do You Eat Most Often
    eating_locations: List[str] = Field(default_factory=list)

    # Section 9: Cuisine Preferences
    cuisine_preferences: List[str] = Field(default_factory=list)

    # Section 10: Doctor / Dietitian Instructions
    has_doctor_instructions: bool = False
    doctor_instructions: Optional[str] = ""
    instructions: List[str] = Field(default_factory=list)  # legacy list

    # Status
    preferences: List[str] = Field(default_factory=list)  # legacy preferences
    is_completed: bool = False

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None

    conditions: Optional[List[str]] = Field(default=None)
    allergies: Optional[List[str]] = Field(default=None)
    intolerances: Optional[List[str]] = Field(default=None)
    dietary_patterns: Optional[List[str]] = Field(default=None)
    diet: Optional[List[str]] = Field(default=None)
    goals: Optional[List[str]] = Field(default=None)

    activity_level: Optional[str] = None
    activities: Optional[List[str]] = Field(default=None)

    meals_per_day: Optional[str] = None
    snacking_frequency: Optional[str] = None
    late_night_eating: Optional[str] = None

    eating_locations: Optional[List[str]] = Field(default=None)
    cuisine_preferences: Optional[List[str]] = Field(default=None)

    has_doctor_instructions: Optional[bool] = None
    doctor_instructions: Optional[str] = None
    instructions: Optional[List[str]] = Field(default=None)
    preferences: Optional[List[str]] = Field(default=None)
    is_completed: Optional[bool] = None
