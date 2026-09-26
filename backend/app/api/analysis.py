from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user_id
from app.schemas.analysis import (
    AnalysisResponse,
    AnswersRequest,
    ModifyRequest,
    ModifyResponse,
    QuestionsResponse,
)
from app.services.analysis_service import analysis_service

router = APIRouter(prefix="/analysis", tags=["Analysis & Questions"])

@router.get("/{id}/questions", response_model=QuestionsResponse)
def get_analysis_questions(
    id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Fetch follow-up clarification questions for a food analysis session."""
    questions = analysis_service.get_analysis_questions(id)
    return QuestionsResponse(questions=questions)

@router.post("/{id}/answers", response_model=AnalysisResponse)
def answer_analysis_questions(
    id: str,
    payload: AnswersRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Submit answers to follow-up questions and re-run risk engine."""
    answers_dicts = [a.model_dump() for a in payload.answers]
    updated_analysis = analysis_service.answer_analysis_questions(
        analysis_id=id,
        answers=answers_dicts,
        user_id=user_id
    )
    return updated_analysis

@router.post("/{id}/modify", response_model=ModifyResponse)
def modify_analysis(
    id: str,
    payload: ModifyRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Counterfactual modification API:
    Evaluate impact of changes (portion, ingredients, drinks) without overwriting original analysis.
    """
    changes_dicts = [c.model_dump() for c in payload.changes]
    result = analysis_service.modify_analysis(
        analysis_id=id,
        changes=changes_dicts,
        user_id=user_id
    )
    return result
