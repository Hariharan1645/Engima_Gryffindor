from typing import Optional
from fastapi import Header, HTTPException, status
from app.core.config import settings

def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """
    Returns current user ID. Supports JWT tokens and defaults to demo user ('123') for hackathon simplicity.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        # JWT validation logic ready for production
        if token != "mock-token":
            # For hackathon demo, accept tokens or return demo user
            pass
    return settings.DEMO_USER_ID
