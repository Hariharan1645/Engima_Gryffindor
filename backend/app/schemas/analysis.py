from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.schemas.food import FoodSchema

class AnalysisCreateRequest(BaseModel):
    input_type: str = Field("text", description="Input type: 'text' or 'image'")
    text: Optional[str] = Field(None, description="Text description of food")
    context: Optional[Any] = Field(None, description="Optional context e.g. restaurant food, home cooked")

class RiskItem(BaseModel):
    type: str = Field(..., description="sodium, glycemic, allergy, diet, etc.")
    status: str = Field(..., description="confirmed, potential, unknown")
    severity: str = Field(..., description="high, moderate, low")
    explanation: str = Field(..., description="Detailed explanation")

class UnknownItem(BaseModel):
    question: str
    importance: str = "medium"  # low, medium, high

class EvidenceItem(BaseModel):
    factor: str
    source: str
    detail: str

class AnalysisResponse(BaseModel):
    analysis_id: str
    food: FoodSchema
    overall_status: str
    risks: List[RiskItem] = Field(default_factory=list)
    unknowns: List[UnknownItem] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    evidence: List[Dict[str, Any]] = Field(default_factory=list)

class QuestionItem(BaseModel):
    id: str
    question: str
    reason: str
    importance: str = "medium"

class QuestionsResponse(BaseModel):
    questions: List[QuestionItem]

class AnswerItem(BaseModel):
    question_id: str
    answer: str

class AnswersRequest(BaseModel):
    answers: List[AnswerItem]

class ModifyChangeItem(BaseModel):
    type: str  # portion, ingredient, drink, prep
    ingredient: Optional[str] = None
    action: Optional[str] = None  # reduce, remove, substitute, add
    value: Optional[str] = None

class ModifyRequest(BaseModel):
    changes: List[ModifyChangeItem]

class ImpactChange(BaseModel):
    factor: str
    impact: str

class ModifyStatus(BaseModel):
    status: str

class ModifyResponse(BaseModel):
    before: ModifyStatus
    after: ModifyStatus
    changes: List[ImpactChange]
