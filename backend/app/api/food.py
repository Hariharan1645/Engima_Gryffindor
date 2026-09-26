import json
from typing import Optional, Union
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from app.core.security import get_current_user_id
from app.schemas.analysis import AnalysisCreateRequest, AnalysisResponse
from app.services.analysis_service import analysis_service
from app.services.llm_service import ImageAnalysisUnavailable

router = APIRouter(tags=["Food Analysis"])

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_food(
    request: Request,
    user_id: str = Depends(get_current_user_id)
):
    """
    Main Food Analysis API.
    Supports both application/json body and multipart/form-data (image/text uploads).
    """
    content_type = request.headers.get("content-type", "")
    
    input_type = "text"
    text_content = None
    context = None
    image_bytes = None
    image_mime_type = "image/jpeg"

    if "multipart/form-data" in content_type:
        form = await request.form()
        input_type = form.get("input_type", "text")
        text_content = form.get("text")
        raw_context = form.get("context")
        if raw_context:
            try:
                context = json.loads(raw_context) if isinstance(raw_context, str) and raw_context.startswith("{") else {"raw": raw_context}
            except Exception:
                context = {"raw": raw_context}

        file_obj = form.get("image")
        if file_obj and hasattr(file_obj, "read"):
            if not getattr(file_obj, "content_type", "").startswith("image/"):
                raise HTTPException(status_code=415, detail="Uploaded file must be an image.")
            image_bytes = await file_obj.read()
            image_mime_type = file_obj.content_type
            input_type = "image"

    elif "application/json" in content_type:
        try:
            body = await request.json()
            input_type = body.get("input_type", "text")
            text_content = body.get("text")
            context = body.get("context")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON payload")

    else:
        # Generic fallback
        try:
            body = await request.json()
            input_type = body.get("input_type", "text")
            text_content = body.get("text")
            context = body.get("context")
        except Exception:
            raise HTTPException(status_code=400, detail="Unsupported content-type or empty request body")

    if not text_content and not image_bytes:
        raise HTTPException(
            status_code=400, 
            detail="Must provide either text description or an image for analysis."
        )

    try:
        result = analysis_service.create_analysis(
            user_id=user_id,
            input_type=input_type,
            text=text_content,
            image_bytes=image_bytes,
            image_mime_type=image_mime_type,
            context=context
        )
    except ImageAnalysisUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return result
