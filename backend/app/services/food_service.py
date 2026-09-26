import logging
from typing import Any, Dict, List, Optional
from app.core.database import get_supabase

logger = logging.getLogger("nutrishield.food")

# Built-in Seed dictionary for instant deterministic matching
STATIC_NORMALIZATIONS = {
    "groundnut": {"base": "peanut", "normalized": "peanut", "type": "synonym"},
    "peanut flour": {"base": "peanut", "normalized": "peanut", "type": "derived"},
    "peanut protein": {"base": "peanut", "normalized": "peanut", "type": "derived"},
    "peanut oil": {"base": "peanut", "normalized": "peanut", "type": "derived"},
    "groundnut oil": {"base": "peanut", "normalized": "peanut", "type": "derived"},
    "arachis oil": {"base": "peanut", "normalized": "peanut", "type": "synonym"},
    
    "whey": {"base": "milk", "normalized": "milk", "type": "derived"},
    "whey protein concentrate": {"base": "milk", "normalized": "milk", "type": "derived"},
    "casein": {"base": "milk", "normalized": "milk", "type": "derived"},
    "milk solids": {"base": "milk", "normalized": "milk", "type": "derived"},
    "lactose": {"base": "milk", "normalized": "milk", "type": "derived"},
    "paneer": {"base": "milk", "normalized": "milk", "type": "derived"},
    "curd": {"base": "milk", "normalized": "milk", "type": "derived"},
    "butter": {"base": "milk", "normalized": "milk", "type": "derived"},
    "ghee": {"base": "milk", "normalized": "milk", "type": "derived"},
    "cream": {"base": "milk", "normalized": "milk", "type": "derived"},

    "soy lecithin": {"base": "soy", "normalized": "soy", "type": "derived"},
    "soy protein": {"base": "soy", "normalized": "soy", "type": "derived"},
    "soy flour": {"base": "soy", "normalized": "soy", "type": "derived"},
    "soya": {"base": "soy", "normalized": "soy", "type": "synonym"},
    "tofu": {"base": "soy", "normalized": "soy", "type": "derived"},

    "maida": {"base": "wheat", "normalized": "refined wheat flour", "type": "synonym"},
    "refined wheat flour": {"base": "wheat", "normalized": "refined wheat flour", "type": "synonym"},
    "atta": {"base": "wheat", "normalized": "whole wheat flour", "type": "synonym"},
    "semolina": {"base": "wheat", "normalized": "wheat", "type": "derived"},
    "sooji": {"base": "wheat", "normalized": "wheat", "type": "synonym"},
    "gluten": {"base": "wheat", "normalized": "wheat", "type": "derived"}
}

class FoodService:
    def __init__(self):
        self.supabase = get_supabase()

    def get_ingredient_relationships(self, raw_name: str) -> List[Dict[str, Any]]:
        """Fetch relationship mapping from Supabase database or static dictionary."""
        name_lower = raw_name.strip().lower()
        relationships = []

        # 1. Check static fallback dictionary
        if name_lower in STATIC_NORMALIZATIONS:
            static_item = STATIC_NORMALIZATIONS[name_lower]
            relationships.append({
                "base_ingredient": static_item["base"],
                "related_ingredient": name_lower,
                "relationship_type": static_item["type"],
                "normalized_name": static_item["normalized"]
            })

        # 2. Query Supabase database table 'ingredient_relationships'
        try:
            res = self.supabase.table("ingredient_relationships").select("*").eq("related_ingredient", name_lower).execute()
            if res and hasattr(res, "data") and res.data:
                for row in res.data:
                    relationships.append(row)
        except Exception as e:
            logger.warning(f"Error querying ingredient_relationships from Supabase: {e}")

        return relationships

    def normalize_ingredient(self, raw_ingredient: Dict[str, Any]) -> Dict[str, Any]:
        """
        Takes raw ingredient dict (e.g. {'raw_name': 'groundnut'}) and returns normalized
        ingredient dict with mapped base_ingredient and relationship metadata.
        """
        raw_name = raw_ingredient.get("raw_name") or raw_ingredient.get("name", "")
        name_lower = raw_name.strip().lower()

        # Perform relationship lookup
        rel_list = self.get_ingredient_relationships(name_lower)
        
        normalized_name = raw_name
        base_ingredient = name_lower
        rel_type = "direct"

        if rel_list:
            first_rel = rel_list[0]
            normalized_name = first_rel.get("normalized_name", raw_name)
            base_ingredient = first_rel.get("base_ingredient", name_lower)
            rel_type = first_rel.get("relationship_type", "synonym")

        return {
            "name": raw_name,
            "normalized_name": normalized_name,
            "base_ingredient": base_ingredient,
            "relationship_type": rel_type,
            "category": raw_ingredient.get("category", "general"),
            "is_explicit": raw_ingredient.get("is_explicit", True),
            "confidence": raw_ingredient.get("confidence", 1.0)
        }

food_service = FoodService()
