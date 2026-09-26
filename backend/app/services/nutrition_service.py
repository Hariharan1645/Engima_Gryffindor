from typing import Any, Dict, List

class NutritionService:
    """Helper service for nutritional estimates and health risk thresholds."""

    @staticmethod
    def evaluate_sodium_risk(ingredients: List[Dict[str, Any]], nutrition: Dict[str, Any]) -> Tuple[str, str]:
        """Returns (status, severity) for sodium given ingredients and nutrition."""
        sodium_mg = nutrition.get("sodium_mg") or nutrition.get("sodium", 0)
        if sodium_mg > 600:
            return "confirmed", "high"
        elif sodium_mg > 350:
            return "confirmed", "moderate"
        
        # Check ingredient keywords
        for ing in ingredients:
            name = (ing.get("normalized_name") or ing.get("name", "")).lower()
            if any(k in name for k in ["salt", "pickled", "soy sauce", "sambar", "chaat masala"]):
                return "potential", "moderate"
        
        return "unknown", "low"

    @staticmethod
    def evaluate_glycemic_risk(ingredients: List[Dict[str, Any]], nutrition: Dict[str, Any]) -> Tuple[str, str]:
        """Returns (status, severity) for diabetes/glycemic risk."""
        sugar_g = nutrition.get("sugar_g") or nutrition.get("sugar", 0)
        if sugar_g > 15:
            return "confirmed", "high"
        elif sugar_g > 5:
            return "confirmed", "moderate"
            
        for ing in ingredients:
            name = (ing.get("normalized_name") or ing.get("name", "")).lower()
            if any(k in name for k in ["sugar", "jaggery", "honey", "syrup", "maida", "refined wheat flour", "sweet"]):
                return "potential", "moderate"
        return "unknown", "low"

nutrition_service = NutritionService()
