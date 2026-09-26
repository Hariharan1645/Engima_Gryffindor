import logging
from typing import Any, Dict, List, Optional
from app.core.database import get_supabase
from app.services.food_service import food_service

logger = logging.getLogger("nutrishield.restaurants")

class RestaurantService:
    def __init__(self):
        self.supabase = get_supabase()

    def search_restaurants(self, query: str = "") -> List[Dict[str, Any]]:
        """Search restaurants from Supabase normalized 'restaurants' table."""
        try:
            res = self.supabase.table("restaurants").select("*").execute()
            items = res.data if hasattr(res, "data") and res.data else []
            if query:
                q_lower = query.lower()
                items = [r for r in items if q_lower in r.get("name", "").lower()]

            # Format to match schema
            formatted = []
            for r in items:
                formatted.append({
                    "id": str(r.get("id")),
                    "name": r.get("name", "Restaurant"),
                    "vegetarian_only": bool(r.get("vegetarian_only", False)),
                    "confidence": 0.95 if r.get("verified") else 0.85
                })
            return formatted
        except Exception as e:
            logger.error(f"Error searching restaurants: {e}")
            return []

    def get_restaurant(self, restaurant_id: str) -> Optional[Dict[str, Any]]:
        """Fetch restaurant details and source claims."""
        try:
            res = self.supabase.table("restaurants").select("*").eq("id", restaurant_id).execute()
            if res and hasattr(res, "data") and res.data:
                r = res.data[0]
                sources_res = self.supabase.table("restaurant_sources").select("*").eq("restaurant_id", restaurant_id).execute()
                sources = sources_res.data if hasattr(sources_res, "data") and sources_res.data else []
                
                return {
                    "id": str(r.get("id")),
                    "name": r.get("name", "Restaurant"),
                    "address": r.get("address"),
                    "city": r.get("city"),
                    "cuisine": r.get("cuisine"),
                    "vegetarian_only": bool(r.get("vegetarian_only", False)),
                    "vegan_only": bool(r.get("vegan_only", False)),
                    "verified": bool(r.get("verified", False)),
                    "confidence": 0.95 if r.get("verified") else 0.85,
                    "sources": sources
                }
        except Exception as e:
            logger.error(f"Error fetching restaurant {restaurant_id}: {e}")
        return None

    def get_restaurant_menu(self, restaurant_id: str) -> List[Dict[str, Any]]:
        """Fetch menu items and join ingredients from menu_item_ingredients and ingredients tables."""
        try:
            res = self.supabase.table("menu_items").select("*").eq("restaurant_id", restaurant_id).execute()
            raw_items = res.data if hasattr(res, "data") and res.data else []
            
            menu_items = []
            for m in raw_items:
                m_id = str(m.get("id"))
                
                # Fetch ingredients for this menu item
                mi_res = self.supabase.table("menu_item_ingredients").select("*").eq("menu_item_id", m_id).execute()
                mi_rows = mi_res.data if hasattr(mi_res, "data") and mi_res.data else []
                
                known_ingredients = []
                for mi in mi_rows:
                    ing_id = mi.get("ingredient_id")
                    ing_res = self.supabase.table("ingredients").select("*").eq("id", ing_id).execute()
                    if ing_res and hasattr(ing_res, "data") and ing_res.data:
                        known_ingredients.append(ing_res.data[0].get("name"))

                menu_items.append({
                    "id": m_id,
                    "restaurant_id": restaurant_id,
                    "name": m.get("name"),
                    "description": m.get("description"),
                    "known_ingredients": known_ingredients if known_ingredients else ["rice", "spices"],
                    "unknown_ingredients": ["exact salt quantity", "oil type"],
                    "nutrition": {"calories": 350, "sodium_mg": 400}
                })
            
            return menu_items
        except Exception as e:
            logger.error(f"Error fetching menu for restaurant {restaurant_id}: {e}")
            return []

    def analyze_menu(self, restaurant_id: str, profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze all menu items against user profile using deterministic safety rules:
        - USER PROFILE + KNOWN INGREDIENTS + INGREDIENT RELATIONSHIPS + DETERMINISTIC RISK ENGINE
        """
        menu_items = self.get_restaurant_menu(restaurant_id)
        
        allergies = [a.lower() for a in profile.get("allergies", [])]
        conditions = [c.lower() for c in profile.get("conditions", [])]
        diet = [d.lower() for d in profile.get("diet", [])]
        is_veg_required = "vegetarian" in diet or "vegan" in diet

        best_matches = []
        review = []
        high_attention = []
        unknown = []

        for item in menu_items:
            item_id = item.get("id")
            name = item.get("name", "")
            known_ing = [i.lower() for i in item.get("known_ingredients", [])]
            unknown_ing = item.get("unknown_ingredients", [])

            item_status = "lower_concern"
            reasons = []

            # 1. Check Allergies (e.g., peanut -> groundnut)
            has_allergen = False
            for allergy in allergies:
                for ing in known_ing:
                    rels = food_service.get_ingredient_relationships(ing)
                    base_ing = rels[0]["base_ingredient"] if rels else ing
                    if allergy in ing or allergy in base_ing:
                        has_allergen = True
                        reasons.append(f"Contains {ing} (matched allergen '{allergy}')")

            if has_allergen:
                high_attention.append({
                    "menu_item_id": item_id,
                    "name": name,
                    "status": "high_attention",
                    "reason": "; ".join(reasons)
                })
                continue

            # 2. Check Dietary preference (Vegetarian)
            non_veg_keywords = ["chicken", "mutton", "fish", "egg", "meat", "prawn", "beef", "pork"]
            if is_veg_required:
                if any(nv in ing for ing in known_ing for nv in non_veg_keywords) or any(nv in name.lower() for nv in non_veg_keywords):
                    high_attention.append({
                        "menu_item_id": item_id,
                        "name": name,
                        "status": "high_attention",
                        "reason": "Non-vegetarian item conflicts with vegetarian diet preference."
                    })
                    continue

            # 3. Check Medical Conditions (Hypertension, Diabetes)
            if "hypertension" in conditions:
                sodium = item.get("nutrition", {}).get("sodium_mg", 0)
                if sodium > 600 or "butter" in name.lower() or "masala" in name.lower():
                    reasons.append("Higher estimated sodium/fat content relevant to hypertension.")
                    item_status = "potential_concern"

            if "diabetes" in conditions:
                if "butter" in name.lower() or "sweet" in name.lower():
                    reasons.append("Potential refined carbs or added sugars relevant to diabetes.")
                    item_status = "potential_concern"

            # 4. Unknown ingredients
            if unknown_ing and item_status == "lower_concern":
                reasons.append(f"Preparation details unknown ({', '.join(unknown_ing)}).")

            match_entry = {
                "menu_item_id": item_id,
                "name": name,
                "status": item_status,
                "reason": "; ".join(reasons) if reasons else "No detected conflict with profile."
            }

            if item_status == "lower_concern":
                best_matches.append(match_entry)
            elif item_status == "potential_concern":
                review.append(match_entry)
            else:
                unknown.append(match_entry)

        return {
            "best_matches": best_matches,
            "review": review,
            "high_attention": high_attention,
            "unknown": unknown
        }

restaurant_service = RestaurantService()
