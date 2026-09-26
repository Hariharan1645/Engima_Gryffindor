import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List
from app.core.database import get_supabase
from app.services.analysis_service import analysis_service
from app.services.llm_service import llm_service

logger = logging.getLogger("nutrishield.meal_plan")

class MealPlanService:
    def __init__(self):
        self.supabase = get_supabase()

    def generate_meal_plan(
        self,
        user_id: str,
        days: int = 7,
        meals_per_day: int = 3,
        preferences: List[str] = None
    ) -> Dict[str, Any]:
        preferences = preferences or []

        # 1. Load user profile automatically from normalized Supabase tables
        profile = analysis_service.get_user_profile(user_id)
        conditions = profile.get("conditions", [])
        allergies = profile.get("allergies", [])
        diet = profile.get("diet", [])
        merged_preferences = list(set(preferences + profile.get("preferences", [])))

        # 2. Generate candidate meal plan using Gemini AI
        candidate_plan = llm_service.generate_meal_plan(
            conditions=conditions,
            allergies=allergies,
            diet=diet,
            preferences=merged_preferences,
            days=days,
            meals_per_day=meals_per_day
        )

        # 3. Deterministic Safety Validation & Filtering
        validated_days = []
        allergy_keywords = [a.lower() for a in allergies]

        for day_data in candidate_plan.get("days", []):
            d_num = day_data.get("day", 1)
            validated_meals = []
            
            for meal in day_data.get("meals", []):
                m_name = meal.get("name", "").lower()
                m_recipe = meal.get("recipe", "").lower()

                # Safety Check: Reject any meal containing allergen keywords
                violates_allergy = False
                for a_kw in allergy_keywords:
                    if a_kw in m_name or a_kw in m_recipe:
                        violates_allergy = True
                        logger.warning(f"Filtered out candidate meal '{meal.get('name')}' due to allergen '{a_kw}'")
                        break

                if not violates_allergy:
                    validated_meals.append({
                        "meal_type": meal.get("meal_type", "meal"),
                        "name": meal.get("name", "Nutritious Meal"),
                        "recipe": meal.get("recipe", "Healthy preparation."),
                        "nutrition": meal.get("nutrition", {})
                    })
                else:
                    validated_meals.append({
                        "meal_type": meal.get("meal_type", "meal"),
                        "name": "Steamed Rice with Moong Dal & Spinach",
                        "recipe": "Steamed rice cooked with yellow lentils and fresh spinach, lightly seasoned.",
                        "nutrition": {"calories": 350, "protein_g": 12, "carbs_g": 60, "fat_g": 5, "sodium_mg": 250}
                    })

            validated_days.append({
                "day": d_num,
                "meals": validated_meals
            })

        # 4. Save into normalized meal_plans and meal_plan_items tables
        plan_id = str(uuid.uuid4())
        
        try:
            # Insert meal_plans record
            self.supabase.table("meal_plans").insert({
                "id": plan_id,
                "user_id": user_id if len(user_id) == 36 else None,
                "title": f"Custom {days}-Day Nutritional Plan",
                "generated_by": "Gemini AI + Safety Engine",
                "created_at": datetime.now(timezone.utc).isoformat()
            }).execute()

            # Insert meal_plan_items records
            for day_entry in validated_days:
                d_no = day_entry.get("day")
                for m in day_entry.get("meals", []):
                    nutr = m.get("nutrition", {})
                    self.supabase.table("meal_plan_items").insert({
                        "id": str(uuid.uuid4()),
                        "meal_plan_id": plan_id,
                        "day_number": d_no,
                        "meal_type": m.get("meal_type"),
                        "food_name": m.get("name"),
                        "recipe": m.get("recipe"),
                        "calories": nutr.get("calories", 350),
                        "protein": nutr.get("protein_g", 12),
                        "carbohydrates": nutr.get("carbs_g", 50),
                        "fat": nutr.get("fat_g", 8)
                    }).execute()

        except Exception as e:
            logger.error(f"Error saving normalized meal plan to Supabase: {e}")

        return {
            "plan_id": plan_id,
            "days": validated_days
        }

meal_plan_service = MealPlanService()
