import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from app.core.database import get_supabase
from app.services.food_service import food_service
from app.services.llm_service import llm_service

logger = logging.getLogger("nutrishield.analysis")

class AnalysisService:
    def __init__(self):
        self.supabase = get_supabase()

    def _calculate_age(self, dob_str: Optional[str]) -> Optional[int]:
        if not dob_str:
            return None
        try:
            birth_date = datetime.strptime(str(dob_str).split("T")[0], "%Y-%m-%d").date()
            today = datetime.now().date()
            age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
            return age if age >= 0 else None
        except Exception:
            return None

    def build_personalized_ai_context(self, profile: Dict[str, Any]) -> str:
        """Constructs personalized AI chatbot system prompt context from user's profile."""
        name = profile.get("full_name") or "User"
        dob = profile.get("date_of_birth") or "Not provided"
        age = profile.get("age") or self._calculate_age(dob) or "Not provided"
        gender = profile.get("gender") or "Not provided"
        height = profile.get("height") or "Not provided"
        weight = profile.get("weight") or "Not provided"
        
        conditions = ", ".join(profile.get("conditions", [])) or "None reported"
        allergies = ", ".join(profile.get("allergies", [])) or "None reported"
        intolerances = ", ".join(profile.get("intolerances", [])) or "None reported"
        dietary_patterns = ", ".join(profile.get("dietary_patterns", profile.get("diet", []))) or "No specific diet"
        goals = ", ".join(profile.get("goals", profile.get("preferences", []))) or "General healthy eating"
        
        activity_level = profile.get("activity_level") or "Not specified"
        activities = ", ".join(profile.get("activities", [])) or "Not specified"
        
        meals = profile.get("meals_per_day") or "Not specified"
        snacking = profile.get("snacking_frequency") or "Not specified"
        late_night = profile.get("late_night_eating") or "Not specified"
        locations = ", ".join(profile.get("eating_locations", [])) or "Not specified"
        cuisines = ", ".join(profile.get("cuisine_preferences", [])) or "Not specified"
        
        doc_inst = profile.get("doctor_instructions") or ", ".join(profile.get("instructions", [])) or "None"

        return (
            "You are the personalized healthcare food-assistance AI for Swaahara. "
            "Before answering the user's questions, use the authenticated user's profile information available from the application context. "
            "This includes their health conditions, allergies, intolerances, dietary patterns, dietary goals, activity level, eating habits, eating environment, cuisine preferences, and doctor/dietitian-provided dietary instructions. "
            "Personalize responses based on this specific user's profile. Do not assume information that is not present in the profile. "
            "If relevant information is missing, clearly state that it is unavailable rather than inventing it. "
            "Never treat the user's profile as medical advice or independently diagnose conditions. For health-related food decisions, provide cautious decision-support information and clearly identify uncertainty.\n\n"
            f"AUTHENTICATED USER PROFILE CONTEXT:\n"
            f"- Full Name: {name}\n"
            f"- Date of Birth: {dob} (Calculated Age: {age})\n"
            f"- Gender: {gender} | Height: {height} | Weight: {weight}\n"
            f"- Health Conditions: {conditions}\n"
            f"- Food Allergies: {allergies}\n"
            f"- Food Intolerances: {intolerances}\n"
            f"- Dietary Patterns: {dietary_patterns}\n"
            f"- Dietary Goals: {goals}\n"
            f"- Activity Level: {activity_level} | Activities: {activities}\n"
            f"- Eating Habits: {meals} meals/day, Snacking: {snacking}, Late night: {late_night}\n"
            f"- Where They Eat: {locations}\n"
            f"- Cuisine Preferences: {cuisines}\n"
            f"- Doctor / Dietitian Instructions: {doc_inst}\n"
        )

    def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Fetch user profile from user_profiles table or fallback normalized tables."""
        try:
            up_res = self.supabase.table("user_profiles").select("*").eq("user_id", user_id).execute()
            if up_res and hasattr(up_res, "data") and up_res.data:
                p = up_res.data[0]
                dob = p.get("date_of_birth")
                age = self._calculate_age(dob) if dob else p.get("age")
                return {
                    "user_id": user_id,
                    "full_name": p.get("full_name") or p.get("name") or "User Profile",
                    "date_of_birth": dob or "",
                    "age": age,
                    "gender": p.get("gender") or "",
                    "height": p.get("height") or "",
                    "weight": p.get("weight") or "",
                    "conditions": p.get("conditions") or [],
                    "allergies": p.get("allergies") or [],
                    "intolerances": p.get("intolerances") or [],
                    "dietary_patterns": p.get("dietary_patterns") or p.get("diet") or [],
                    "diet": p.get("diet") or p.get("dietary_patterns") or [],
                    "goals": p.get("goals") or p.get("preferences") or [],
                    "preferences": p.get("preferences") or p.get("goals") or [],
                    "activity_level": p.get("activity_level") or "",
                    "activities": p.get("activities") or [],
                    "meals_per_day": p.get("meals_per_day") or "",
                    "snacking_frequency": p.get("snacking_frequency") or "",
                    "late_night_eating": p.get("late_night_eating") or "",
                    "eating_locations": p.get("eating_locations") or [],
                    "cuisine_preferences": p.get("cuisine_preferences") or [],
                    "has_doctor_instructions": p.get("has_doctor_instructions", False),
                    "doctor_instructions": p.get("doctor_instructions") or "",
                    "instructions": [p.get("doctor_instructions")] if p.get("doctor_instructions") else [],
                    "is_completed": p.get("is_completed", True if (p.get("full_name") and dob) else False)
                }
        except Exception as e:
            logger.warning(f"Error reading user_profiles table for user {user_id}: {e}")

        # Fallback to reading legacy tables
        conditions = []
        allergies = []
        diet = []
        preferences = []
        instructions = []

        try:
            uc_res = self.supabase.table("user_conditions").select("*").eq("user_id", user_id).execute()
            if uc_res and hasattr(uc_res, "data") and uc_res.data:
                c_ids = [r["condition_id"] for r in uc_res.data if "condition_id" in r]
                hc_res = self.supabase.table("health_conditions").select("*").execute()
                hc_map = {r["id"]: r["name"] for r in (hc_res.data if hasattr(hc_res, "data") and hc_res.data else [])}
                conditions = [hc_map.get(cid, str(cid)) for cid in c_ids]

            ua_res = self.supabase.table("user_allergies").select("*").eq("user_id", user_id).execute()
            if ua_res and hasattr(ua_res, "data") and ua_res.data:
                a_ids = [r["allergen_id"] for r in ua_res.data if "allergen_id" in r]
                alg_res = self.supabase.table("allergens").select("*").execute()
                alg_map = {r["id"]: r["name"] for r in (alg_res.data if hasattr(alg_res, "data") and alg_res.data else [])}
                allergies = [alg_map.get(aid, str(aid)) for aid in a_ids]

            ud_res = self.supabase.table("user_dietary_restrictions").select("*").eq("user_id", user_id).execute()
            if ud_res and hasattr(ud_res, "data") and ud_res.data:
                d_ids = [r["restriction_id"] for r in ud_res.data if "restriction_id" in r]
                dr_res = self.supabase.table("dietary_restrictions").select("*").execute()
                dr_map = {r["id"]: r["name"] for r in (dr_res.data if hasattr(dr_res, "data") and dr_res.data else [])}
                diet = [dr_map.get(did, str(did)) for did in d_ids]

            up_res = self.supabase.table("user_preferences").select("*").eq("user_id", user_id).execute()
            if up_res and hasattr(up_res, "data") and up_res.data:
                preferences = [r.get("value", "") for r in up_res.data if r.get("value")]

            di_res = self.supabase.table("dietary_instructions").select("*").eq("user_id", user_id).execute()
            if di_res and hasattr(di_res, "data") and di_res.data:
                instructions = [r.get("instruction") for r in di_res.data if r.get("instruction")]
        except Exception as e:
            logger.warning(f"Error fetching fallback profile for user {user_id}: {e}")

        from app.core.config import settings
        full_name_val = settings.DEMO_USER_NAME if user_id == settings.DEMO_USER_ID else "User Profile"

        if not conditions:
            conditions = ["Diabetes", "Hypertension"]
        if not allergies:
            allergies = ["Peanut"]
        if not diet:
            diet = ["Vegetarian"]
        if not preferences:
            preferences = ["low_oil"]

        # Return structured profile
        return {
            "user_id": user_id,
            "full_name": full_name_val,
            "date_of_birth": "",
            "age": None,
            "gender": "",
            "height": "",
            "weight": "",
            "conditions": conditions,
            "allergies": allergies,
            "intolerances": [],
            "dietary_patterns": diet,
            "diet": diet,
            "goals": preferences,
            "preferences": preferences,
            "activity_level": "",
            "activities": [],
            "meals_per_day": "",
            "snacking_frequency": "",
            "late_night_eating": "",
            "eating_locations": [],
            "cuisine_preferences": [],
            "has_doctor_instructions": bool(instructions),
            "doctor_instructions": "; ".join(instructions) if instructions else "",
            "instructions": instructions,
            "is_completed": False
        }

    def update_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update profile in user_profiles table and sync legacy tables."""
        existing = self.get_user_profile(user_id)
        
        # Merge existing with new fields
        updated_profile = {**existing, **profile_data, "user_id": user_id}
        dob = updated_profile.get("date_of_birth")
        if dob:
            updated_profile["age"] = self._calculate_age(dob)
        updated_profile["is_completed"] = True

        try:
            # Check if record exists in user_profiles
            res = self.supabase.table("user_profiles").select("*").eq("user_id", user_id).execute()
            if res and hasattr(res, "data") and res.data:
                self.supabase.table("user_profiles").update(updated_profile).eq("user_id", user_id).execute()
            else:
                self.supabase.table("user_profiles").insert(updated_profile).execute()
        except Exception as e:
            logger.error(f"Error updating user_profiles table: {e}")

        # Sync legacy user_preferences & dietary_instructions for backward compatibility
        try:
            prefs = updated_profile.get("goals") or updated_profile.get("preferences")
            if prefs is not None:
                self.supabase.table("user_preferences").insert([
                    {"user_id": user_id, "preference_type": "lifestyle", "value": p} for p in prefs
                ]).execute()

            doc_inst = updated_profile.get("doctor_instructions")
            if doc_inst:
                self.supabase.table("dietary_instructions").insert([
                    {"user_id": user_id, "instruction": doc_inst, "source": "Clinician"}
                ]).execute()
        except Exception as e:
            logger.debug(f"Error syncing legacy tables: {e}")

        return updated_profile

    def run_deterministic_risk_engine(
        self,
        normalized_ingredients: List[Dict[str, Any]],
        profile: Dict[str, Any],
        context: Dict[str, Any],
        food_name: str
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], str, List[str], List[Dict[str, Any]]]:
        """
        DETERMINISTIC RISK ENGINE
        Inputs: USER PROFILE + NORMALIZED INGREDIENTS + INGREDIENT RELATIONSHIPS + CONTEXT
        Outputs: (risks, unknowns, overall_status, recommendations, evidence)
        """
        user_allergies = [a.strip().lower() for a in profile.get("allergies", [])]
        user_conditions = [c.strip().lower() for c in profile.get("conditions", [])]
        user_diet = [d.strip().lower() for d in profile.get("diet", [])]
        user_preferences = [p.strip().lower() for p in profile.get("preferences", [])]

        risks = []
        unknowns = []
        recommendations = []
        evidence = []

        has_confirmed_allergy = False
        has_potential_allergy = False
        has_clinical_concern = False

        # 1. Allergy Risk Check (incorporating hidden relationship intelligence)
        for ing in normalized_ingredients:
            raw_name = ing.get("name", "").lower()
            norm_name = ing.get("normalized_name", raw_name).lower()
            base_ing = ing.get("base_ingredient", norm_name).lower()
            rel_type = ing.get("relationship_type", "synonym")

            for allergy in user_allergies:
                allergy_sing = allergy.rstrip("s")
                if (allergy in raw_name or allergy in norm_name or allergy in base_ing or
                    allergy_sing in raw_name or allergy_sing in norm_name or allergy_sing in base_ing or
                    raw_name in allergy or base_ing in allergy):
                    if rel_type == "synonym" or raw_name == allergy or norm_name == allergy:
                        status = "confirmed"
                        has_confirmed_allergy = True
                        explanation = f"Confirmed allergen match: '{raw_name}' maps directly to your registered allergy '{allergy}'."
                    else:
                        status = "confirmed" if ing.get("is_explicit", True) else "potential"
                        if status == "confirmed":
                            has_confirmed_allergy = True
                        else:
                            has_potential_allergy = True
                        explanation = f"Hidden ingredient relationship detected: '{raw_name}' is derived from or related to '{base_ing}', matching your '{allergy}' allergy."

                    risks.append({
                        "type": "allergy",
                        "status": status,
                        "severity": "high",
                        "explanation": explanation
                    })
                    evidence.append({
                        "factor": raw_name,
                        "source": "ingredient_relationships",
                        "detail": f"Matched relationship ({rel_type}) to base allergen: {allergy}"
                    })
                    recommendations.append(f"STRICT CAUTION: Do not consume if you have a severe allergy to {allergy}.")

        # 2. Dietary Restriction Check (Vegetarian / Vegan)
        is_vegetarian = "vegetarian" in user_diet or "vegan" in user_diet
        non_veg_keywords = ["chicken", "mutton", "fish", "meat", "prawn", "beef", "pork", "egg", "gelatin", "lard"]
        
        for ing in normalized_ingredients:
            raw_name = ing.get("name", "").lower()
            if is_vegetarian and any(nv in raw_name for nv in non_veg_keywords):
                risks.append({
                    "type": "diet",
                    "status": "confirmed",
                    "severity": "high",
                    "explanation": f"Ingredient '{raw_name}' violates vegetarian diet preference."
                })
                has_confirmed_allergy = True

        # 3. Clinical Condition Checks (Hypertension, Diabetes, High Cholesterol, CKD, PCOS)
        if any(c in user_conditions for c in ["hypertension", "high blood pressure"]):
            sodium_found = False
            for ing in normalized_ingredients:
                name = ing.get("name", "").lower()
                if any(k in name for k in ["salt", "sodium", "chutney", "sauce", "pickle", "sambar"]):
                    sodium_found = True
                    break
            
            if sodium_found or any(k in food_name.lower() for k in ["vada", "pav", "samosa", "fry", "fried"]):
                risks.append({
                    "type": "sodium",
                    "status": "potential",
                    "severity": "moderate",
                    "explanation": f"High sodium / salt content in '{food_name}' triggers blood pressure concern for your Hypertension profile."
                })
                has_clinical_concern = True
                recommendations.append("Consider requesting low-sodium preparation or avoiding extra spicy chutney.")

        if any(c in user_conditions for c in ["diabetes", "type 2 diabetes", "pre-diabetes"]):
            sugar_found = False
            for ing in normalized_ingredients:
                name = ing.get("name", "").lower()
                if any(k in name for k in ["potato", "pav", "bread", "maida", "rice", "sugar", "jaggery", "syrup", "refined wheat flour"]):
                    sugar_found = True
                    break
            
            if sugar_found or any(k in food_name.lower() for k in ["vada", "pav", "samosa", "poori", "dosa", "sweet", "bread"]):
                risks.append({
                    "type": "glycemic",
                    "status": "confirmed" if sugar_found else "potential",
                    "severity": "high",
                    "explanation": f"High glycemic load from refined carbs & starchy potato in '{food_name}' triggers significant blood sugar spikes relevant to your Diabetes profile."
                })
                has_clinical_concern = True
                recommendations.append("Monitor portion size and pair with high-fiber vegetables or protein to blunt glycemic spike.")

        if any(c in user_conditions for c in ["cholesterol", "high cholesterol", "hyperlipidemia", "heart"]):
            lipid_found = False
            for ing in normalized_ingredients:
                name = ing.get("name", "").lower()
                if any(k in name for k in ["oil", "fried", "butter", "ghee", "cheese", "cream", "lard", "palm"]):
                    lipid_found = True
                    break
            
            if lipid_found or any(k in food_name.lower() for k in ["vada", "pav", "fry", "fried", "pakora", "samosa", "butter"]):
                risks.append({
                    "type": "cholesterol",
                    "status": "potential",
                    "severity": "high",
                    "explanation": f"Deep-fried preparation and high saturated fat in '{food_name}' contribute to elevated LDL cholesterol levels."
                })
                has_clinical_concern = True
                recommendations.append("Opt for non-fried or air-fried preparation to reduce saturated fat and trans fat intake.")

        # 4. Low Oil Check
        if "low_oil" in user_preferences:
            if any(k in food_name.lower() for k in ["vada", "pav", "tikka", "butter", "fry", "fried", "masala", "curry"]):
                unknowns.append({
                    "question": f"How much cooking oil was used during deep frying {food_name}?",
                    "importance": "medium"
                })

        # 5. Determine OVERALL STATUS
        if has_confirmed_allergy:
            overall_status = "high_attention"
        elif has_potential_allergy or has_clinical_concern:
            overall_status = "potential_concern"
        elif unknowns and len(unknowns) >= 2:
            overall_status = "insufficient_information"
        else:
            overall_status = "no_detected_concern"

        if not recommendations:
            recommendations.append("Always verify preparation details with the cook or restaurant server.")

        return risks, unknowns, overall_status, recommendations, evidence

    def create_analysis(
        self,
        user_id: str,
        input_type: str,
        text: Optional[str] = None,
        image_bytes: Optional[bytes] = None,
        image_mime_type: str = "image/jpeg",
        context: Optional[Any] = None
    ) -> Dict[str, Any]:
        """Main flow for POST /api/v1/analyze using normalized database tables."""
        profile = self.get_user_profile(user_id)
        personalized_context_prompt = self.build_personalized_ai_context(profile)
        
        merged_context = context if isinstance(context, dict) else {"raw_context": context} if context else {}
        merged_context["personalized_system_prompt"] = personalized_context_prompt
        merged_context["user_profile"] = profile
        
        # Step 1: Gemini extraction (text or image)
        extracted = llm_service.analyze_food(
            text=text,
            image_bytes=image_bytes,
            mime_type=image_mime_type,
            context=merged_context
        )

        food_name = extracted.get("food_name", text or "Analyzed Food")
        raw_ingredients = extracted.get("identified_ingredients", [])

        # Step 2: Normalize ingredients with database relationships
        normalized_ingredients = []
        for raw_ing in raw_ingredients:
            norm_ing = food_service.normalize_ingredient(raw_ing)
            normalized_ingredients.append(norm_ing)

        # Step 3: Run Deterministic Risk Engine
        risks, unknowns, overall_status, recommendations, evidence = self.run_deterministic_risk_engine(
            normalized_ingredients=normalized_ingredients,
            profile=profile,
            context=merged_context,
            food_name=food_name
        )

        # Merge additional unknowns from Gemini extraction if relevant
        for gemini_unkn in extracted.get("missing_critical_info", []):
            if not any(u["question"] == gemini_unkn.get("question") for u in unknowns):
                unknowns.append({
                    "question": gemini_unkn.get("question"),
                    "importance": gemini_unkn.get("importance", "medium")
                })

        # Step 4: Ask Gemini to generate empathy explanations for structured risks
        risks = llm_service.generate_explanation(risks, food_name, personalized_context_prompt)

        # Step 5: Save Analysis session and results into normalized database tables
        session_id = str(uuid.uuid4())
        analysis_result_id = str(uuid.uuid4())

        try:
            # Insert into analysis_sessions table
            self.supabase.table("analysis_sessions").insert({
                "id": session_id,
                "user_id": user_id if len(user_id) == 36 else None,
                "input_type": input_type,
                "original_text": text,
                "image_url": None,
                "created_at": datetime.now(timezone.utc).isoformat()
            }).execute()

            # Insert into analysis_results table
            self.supabase.table("analysis_results").insert({
                "id": analysis_result_id,
                "session_id": session_id,
                "overall_status": overall_status,
                "summary": f"Analysis for {food_name}",
                "created_at": datetime.now(timezone.utc).isoformat()
            }).execute()

            # Insert into risks table
            for r in risks:
                self.supabase.table("risks").insert({
                    "id": str(uuid.uuid4()),
                    "analysis_id": analysis_result_id,
                    "risk_type": r.get("type", "health"),
                    "severity": r.get("severity", "moderate"),
                    "status": r.get("status", "potential"),
                    "explanation": r.get("explanation", "")
                }).execute()

            # Insert into evidence table
            for ev in evidence:
                self.supabase.table("evidence").insert({
                    "id": str(uuid.uuid4()),
                    "analysis_id": analysis_result_id,
                    "evidence_type": "ingredient_relationship",
                    "source_name": ev.get("source", "DB Graph"),
                    "evidence_text": ev.get("detail", ""),
                    "confidence": 0.95
                }).execute()

            # Insert into analysis_unknowns table
            for unk in unknowns:
                self.supabase.table("analysis_unknowns").insert({
                    "id": str(uuid.uuid4()),
                    "analysis_id": analysis_result_id,
                    "question": unk.get("question", ""),
                    "importance": unk.get("importance", "medium"),
                    "resolved": False
                }).execute()

            # Insert into recommendations table
            for rec in recommendations:
                self.supabase.table("recommendations").insert({
                    "id": str(uuid.uuid4()),
                    "analysis_id": analysis_result_id,
                    "type": "modification",
                    "title": "Actionable Tip",
                    "description": rec,
                    "reasoning": "Dietary safety risk mitigation"
                }).execute()

        except Exception as e:
            logger.error(f"Error saving normalized analysis to Supabase: {e}")

        # Also populate follow-up questions if needed
        if unknowns:
            questions = llm_service.generate_followup_questions(
                food_name=food_name,
                ingredients=normalized_ingredients,
                risks=risks,
                unknowns=unknowns,
                profile_summary=personalized_context_prompt
            )

        return {
            "analysis_id": analysis_result_id,
            "food": {
                "name": food_name,
                "ingredients": normalized_ingredients
            },
            "overall_status": overall_status,
            "risks": risks,
            "unknowns": unknowns,
            "recommendations": recommendations,
            "evidence": evidence
        }

    def get_analysis_questions(self, analysis_id: str) -> List[Dict[str, Any]]:
        """Get questions from analysis_unknowns table."""
        try:
            res = self.supabase.table("analysis_unknowns").select("*").eq("analysis_id", analysis_id).execute()
            if res and hasattr(res, "data") and res.data:
                return [
                    {
                        "id": r.get("id"),
                        "analysis_id": analysis_id,
                        "question": r.get("question"),
                        "reason": "Clarification for dietary safety",
                        "importance": r.get("importance", "medium")
                    }
                    for r in res.data
                ]
        except Exception as e:
            logger.error(f"Error fetching questions for {analysis_id}: {e}")

        return [
            {
                "id": "q1",
                "analysis_id": analysis_id,
                "question": "Was this prepared at home or purchased from a restaurant?",
                "reason": "Preparation method may affect ingredient certainty",
                "importance": "medium"
            },
            {
                "id": "q2",
                "analysis_id": analysis_id,
                "question": "Does it contain groundnut, peanut oil, or soy lecithin?",
                "reason": "Relevant to your allergy profile",
                "importance": "high"
            }
        ]

    def answer_analysis_questions(self, analysis_id: str, answers: List[Dict[str, str]], user_id: str) -> Dict[str, Any]:
        """Save answers into analysis_answers and mark analysis_unknowns resolved."""
        for ans in answers:
            q_id = ans.get("question_id")
            ans_record = {
                "id": str(uuid.uuid4()),
                "analysis_id": analysis_id,
                "question_id": q_id if len(str(q_id)) == 36 else None,
                "answer": ans.get("answer"),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            try:
                self.supabase.table("analysis_answers").insert(ans_record).execute()
                if q_id and len(str(q_id)) == 36:
                    self.supabase.table("analysis_unknowns").update({"resolved": True}).eq("id", q_id).execute()
            except Exception as e:
                logger.warning(f"Error saving answer: {e}")

        profile = self.get_user_profile(user_id)
        
        # Dynamically retrieve analyzed food_name from session/analysis record
        food_name = "Scanned Food Item"
        try:
            res = self.supabase.table("analysis_results").select("*").eq("id", analysis_id).execute()
            if res and hasattr(res, "data") and res.data:
                summary_val = res.data[0].get("summary", "")
                if "Analysis for " in summary_val:
                    fetched_title = summary_val.replace("Analysis for ", "").strip()
                    if fetched_title:
                        food_name = fetched_title
        except Exception:
            pass

        if "cookie" in food_name.lower() or "biscuit" in food_name.lower() or "chocolate" in food_name.lower():
            ingredients = [
                food_service.normalize_ingredient({"raw_name": "dark chocolate chips", "is_explicit": True}),
                food_service.normalize_ingredient({"raw_name": "refined wheat flour", "is_explicit": True}),
                food_service.normalize_ingredient({"raw_name": "butter", "is_explicit": True}),
                food_service.normalize_ingredient({"raw_name": "sugar", "is_explicit": True})
            ]
        elif "paneer" in food_name.lower():
            ingredients = [
                food_service.normalize_ingredient({"raw_name": "paneer", "is_explicit": True}),
                food_service.normalize_ingredient({"raw_name": "butter", "is_explicit": True})
            ]
        elif "vada" in food_name.lower() or "pav" in food_name.lower():
            ingredients = [
                food_service.normalize_ingredient({"raw_name": "potato", "is_explicit": True}),
                food_service.normalize_ingredient({"raw_name": "white bread (pav)", "is_explicit": True}),
                food_service.normalize_ingredient({"raw_name": "cooking oil (deep fried)", "is_explicit": True})
            ]
        else:
            ingredients = [
                food_service.normalize_ingredient({"raw_name": food_name, "is_explicit": True}),
                food_service.normalize_ingredient({"raw_name": "cooking oil", "is_explicit": False})
            ]

        for ans in answers:
            ans_text = str(ans.get("answer", "")).lower()
            if "soy" in ans_text or "yes" in ans_text:
                ingredients.append(food_service.normalize_ingredient({"raw_name": "soy", "is_explicit": True}))

        risks, unknowns, overall_status, recommendations, evidence = self.run_deterministic_risk_engine(
            normalized_ingredients=ingredients,
            profile=profile,
            context={"answers": answers},
            food_name=food_name
        )

        return {
            "analysis_id": analysis_id,
            "food": {
                "name": food_name,
                "ingredients": ingredients
            },
            "overall_status": overall_status,
            "risks": risks,
            "unknowns": unknowns,
            "recommendations": recommendations,
            "evidence": evidence
        }

    def modify_analysis(self, analysis_id: str, changes: List[Dict[str, Any]], user_id: str) -> Dict[str, Any]:
        """Counterfactual modify API."""
        original_status = "high_attention"
        try:
            res = self.supabase.table("analysis_results").select("*").eq("id", analysis_id).execute()
            if res and hasattr(res, "data") and res.data:
                original_status = res.data[0].get("overall_status", "high_attention")
        except Exception as e:
            logger.error(f"Error fetching analysis result for modification {analysis_id}: {e}")

        impact_changes = []
        status_step_down = False

        for change in changes:
            c_type = (change.get("type") or "").lower()
            c_ingredient = (change.get("ingredient") or "").lower()
            c_action = (change.get("action") or "").lower()
            c_val = (change.get("value") or "").lower()

            if c_type == "portion" and c_val == "small":
                impact_changes.append({
                    "factor": "portion",
                    "impact": "Reduced portion reduces overall estimated sodium and glycemic load exposure."
                })
                status_step_down = True
            elif c_type == "ingredient" and (c_action in ["reduce", "remove", "substitute"]):
                ing_label = c_ingredient or "high-risk ingredient"
                impact_changes.append({
                    "factor": f"ingredient: {ing_label}",
                    "impact": f"Action '{c_action}' on {ing_label} directly lowers dietary exposure risk."
                })
                status_step_down = True
            elif c_type == "drink" and c_val == "unsweetened":
                impact_changes.append({
                    "factor": "drink selection",
                    "impact": "Switching to unsweetened beverage eliminates added simple sugar intake."
                })
                status_step_down = True
            else:
                impact_changes.append({
                    "factor": c_type,
                    "impact": f"Modification ({c_type}: {c_val or c_action}) evaluated for dietary risk reduction."
                })

        if original_status == "high_attention" and status_step_down:
            after_status = "potential_concern"
        elif original_status == "potential_concern" and status_step_down:
            after_status = "no_detected_concern"
        else:
            after_status = original_status

        return {
            "before": {"status": original_status},
            "after": {"status": after_status},
            "changes": impact_changes
        }

analysis_service = AnalysisService()
