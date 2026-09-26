import base64
from typing import Tuple

class OCRService:
    """Helper service for image preparation and encoding for Gemini multimodal processing."""
    
    @staticmethod
    def process_image_bytes(image_bytes: bytes, content_type: str = "image/jpeg") -> Tuple[str, str]:
        """Convert image bytes to base64 string and return with content type."""
        b64_str = base64.b64encode(image_bytes).decode("utf-8")
        return b64_str, content_type

ocr_service = OCRService()
