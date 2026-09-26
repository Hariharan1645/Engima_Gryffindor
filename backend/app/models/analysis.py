from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class Risk(BaseModel):
    type: str = Field(..., description="Risk category: e.g. allergy, sodium, glycemic, diet")
    status: str = Field(..., description="confirmed, potential, unknown")
    severity: str = Field(..., description="high, moderate, low")
    explanation: str = Field(..., description="Fact-based explanation")

class UnknownInfo(BaseModel):
    question: str
    importance: str = "medium"  # high, medium, low

class AnalysisQuestion(BaseModel):
    id: str
    analysis_id: str
    question: str
    reason: str
    importance: str = "medium"
    created_at: Optional[datetime] = None

class AnalysisAnswer(BaseModel):
    id: Optional[str] = None
    analysis_id: str
    question_id: str
    answer: str
    created_at: Optional[datetime] = None

class Analysis(BaseModel):
    id: Optional[str] = None
    user_id: str
    input_type: str  # text or image
    input_text: Optional[str] = None
    image_url: Optional[str] = None
    context: Dict[str, Any] = Field(default_factory=dict)
    food_name: Optional[str] = None
    ingredients: List[Dict[str, Any]] = Field(default_factory=list)
    overall_status: str  # no_detected_concern, potential_concern, high_attention, insufficient_information
    risks: List[Dict[str, Any]] = Field(default_factory=list)
    unknowns: List[Dict[str, Any]] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    evidence: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
