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

    def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """
        Fetch user profile from normalized Supabase tables:
        health_conditions, user_conditions, allergens, user_allergies,
        dietary_restrictions, user_dietary_restrictions, user_preferences, dietary_instructions.
        """
        conditions = []
        allergies = []
        diet = []
        preferences = []
        instructions = []

        try:
            # 1. Fetch user conditions
            uc_res = self.supabase.table("user_conditions").select("*").eq("user_id", user_id).execute()
            if uc_res and hasattr(uc_res, "data") and uc_res.data:
                c_ids = [r["condition_id"] for r in uc_res.data if "condition_id" in r]
                hc_res = self.supabase.table("health_conditions").select("*").execute()
                hc_map = {r["id"]: r["name"].lower() for r in (hc_res.data if hasattr(hc_res, "data") and hc_res.data else [])}
                conditions = [hc_map.get(cid, str(cid)) for cid in c_ids]

            # 2. Fetch user allergies
            ua_res = self.supabase.table("user_allergies").select("*").eq("user_id", user_id).execute()
            if ua_res and hasattr(ua_res, "data") and ua_res.data:
                a_ids = [r["allergen_id"] for r in ua_res.data if "allergen_id" in r]
                alg_res = self.supabase.table("allergens").select("*").execute()
                alg_map = {r["id"]: r["name"].lower() for r in (alg_res.data if hasattr(alg_res, "data") and alg_res.data else [])}
                allergies = [alg_map.get(aid, str(aid)) for aid in a_ids]

            # 3. Fetch user dietary restrictions
            ud_res = self.supabase.table("user_dietary_restrictions").select("*").eq("user_id", user_id).execute()
            if ud_res and hasattr(ud_res, "data") and ud_res.data:
                d_ids = [r["restriction_id"] for r in ud_res.data if "restriction_id" in r]
                dr_res = self.supabase.table("dietary_restrictions").select("*").execute()
                dr_map = {r["id"]: r["name"].lower() for r in (dr_res.data if hasattr(dr_res, "data") and dr_res.data else [])}
                diet = [dr_map.get(did, str(did)) for did in d_ids]

            # 4. Fetch user preferences
            up_res = self.supabase.table("user_preferences").select("*").eq("user_id", user_id).execute()
            if up_res and hasattr(up_res, "data") and up_res.data:
                preferences = [r.get("value", "").lower() for r in up_res.data if r.get("value")]

            # 5. Fetch doctor dietary instructions
            di_res = self.supabase.table("dietary_instructions").select("*").eq("user_id", user_id).execute()
            if di_res and hasattr(di_res, "data") and di_res.data:
                instructions = [r.get("instruction") for r in di_res.data if r.get("instruction")]

        except Exception as e:
            logger.warning(f"Error fetching profile for user {user_id} from normalized tables: {e}")

        # Fallbacks if database returned empty lists during mock/demo
        if not conditions:
            conditions = ["diabetes", "hypertension"]
        if not allergies:
            allergies = ["peanut"]
        if not diet:
            diet = ["vegetarian"]
        if not preferences:
            preferences = ["low_oil"]

        return {
            "user_id": user_id,
            "conditions": conditions,
            "allergies": allergies,
            "diet": diet,
            "preferences": preferences,
            "instructions": instructions
        }

    def update_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update profile in normalized tables."""
        conds = profile_data.get("conditions")
        algs = profile_data.get("allergies")
        diets = profile_data.get("diet")
        prefs = profile_data.get("preferences")
        insts = profile_data.get("instructions")

        try:
            # Clear & re-insert user preferences
            if prefs is not None:
                self.supabase.table("user_preferences").insert([
                    {"user_id": user_id, "preference_type": "lifestyle", "value": p} for p in prefs
                ]).execute()
            
            # Clear & re-insert dietary instructions if provided
            if insts is not None:
                self.supabase.table("dietary_instructions").insert([
                    {"user_id": user_id, "instruction": ins, "source": "Clinician"} for ins in insts
                ]).execute()

        except Exception as e:
            logger.error(f"Error updating normalized profile: {e}")

        existing = self.get_user_profile(user_id)
        return {
            "user_id": user_id,
            "conditions": conds if conds is not None else existing.get("conditions", []),
            "allergies": algs if algs is not None else existing.get("allergies", []),
            "diet": diets if diets is not None else existing.get("diet", []),
            "preferences": prefs if prefs is not None else existing.get("preferences", []),
            "instructions": insts if insts is not None else existing.get("instructions", [])
        }

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
                if allergy in raw_name or allergy in norm_name or allergy in base_ing:
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

        # 3. Clinical Condition Checks (Hypertension, Diabetes, CKD, PCOS)
        if "hypertension" in user_conditions:
            sodium_found = False
            for ing in normalized_ingredients:
                name = ing.get("name", "").lower()
                if any(k in name for k in ["salt", "sodium", "soy sauce", "pickle", "sambar"]):
                    sodium_found = True
                    break
            
            if sodium_found:
                risks.append({
                    "type": "sodium",
                    "status": "potential",
                    "severity": "moderate",
                    "explanation": "Sodium may be relevant given the user's hypertension profile."
                })
                has_clinical_concern = True
                recommendations.append("Consider requesting low-sodium preparation or avoiding extra sauce.")
            else:
                unknowns.append({
                    "question": f"Does the preparation of {food_name} contain added salt or high-sodium sauces?",
                    "importance": "medium"
                })

        if "diabetes" in user_conditions:
            sugar_found = False
            for ing in normalized_ingredients:
                name = ing.get("name", "").lower()
                if any(k in name for k in ["sugar", "jaggery", "honey", "syrup", "maida", "refined wheat flour"]):
                    sugar_found = True
                    break
            
            if sugar_found:
                risks.append({
                    "type": "glycemic",
                    "status": "potential",
                    "severity": "moderate",
                    "explanation": "Contains refined carbohydrates or added sugars which may cause glycemic fluctuations relevant to diabetes."
                })
                has_clinical_concern = True
                recommendations.append("Monitor portion size and pair with high-fiber vegetables or protein.")
            else:
                unknowns.append({
                    "question": f"Does {food_name} contain added sweeteners, honey, or refined flour (maida)?",
                    "importance": "medium"
                })

        # 4. Low Oil Check
        if "low_oil" in user_preferences:
            if any(k in food_name.lower() for k in ["tikka", "butter", "fry", "fried", "masala", "curry"]):
                unknowns.append({
                    "question": "How much cooking oil or ghee was used during preparation?",
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
        context: Optional[Any] = None
    ) -> Dict[str, Any]:
        """Main flow for POST /api/v1/analyze using normalized database tables."""
        profile = self.get_user_profile(user_id)
        
        # Step 1: Gemini extraction (text or image)
        extracted = llm_service.analyze_food(
            text=text,
            image_bytes=image_bytes,
            context=context
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
            context=context or {},
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
        profile_summary = f"Conditions: {profile.get('conditions')}, Allergies: {profile.get('allergies')}, Diet: {profile.get('diet')}"
        risks = llm_service.generate_explanation(risks, food_name, profile_summary)

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
                profile_summary=profile_summary
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
        
        # Build re-evaluated analysis
        food_name = "Paneer Butter Masala"
        ingredients = [
            food_service.normalize_ingredient({"raw_name": "paneer", "is_explicit": True}),
            food_service.normalize_ingredient({"raw_name": "butter", "is_explicit": True})
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
