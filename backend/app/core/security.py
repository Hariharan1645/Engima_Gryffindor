import base64
import json
import logging
from typing import Optional
from fastapi import Header
from app.core.config import settings

logger = logging.getLogger("nutrishield.security")

def get_current_user_id(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
) -> str:
    """
    Returns current user ID. Extract from explicit x-user-id header or Bearer JWT token (sub claim),
    falling back to demo user ID ('123') when unauthenticated.
    """
    if x_user_id and x_user_id.strip():
        return x_user_id.strip()

    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1].strip()
        if token and token != "mock-token" and "." in token:
            try:
                parts = token.split(".")
                if len(parts) >= 2:
                    payload_b64 = parts[1]
                    # Fix padding if necessary
                    padded = payload_b64 + "=" * (-len(payload_b64) % 4)
                    decoded_bytes = base64.b64decode(padded)
                    payload = json.loads(decoded_bytes.decode("utf-8"))
                    user_id = payload.get("sub") or payload.get("user_id") or payload.get("id")
                    if user_id:
                        return str(user_id)
            except Exception as e:
                logger.debug(f"Error parsing JWT token in security dependency: {e}")
        elif token and token != "mock-token":
            return token

    return settings.DEMO_USER_ID
