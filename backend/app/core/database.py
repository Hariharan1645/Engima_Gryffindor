import logging
from typing import Any, Dict, List, Optional
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger("nutrishield.database")

class InMemorySupabaseTable:
    """Fallback in-memory table adapter for demo/testing when live Supabase is offline or tables missing."""
    def __init__(self, table_name: str, data_store: Dict[str, List[Dict[str, Any]]]):
        self.table_name = table_name
        self.data_store = data_store
        if table_name not in self.data_store:
            self.data_store[table_name] = []
        self._query_filters = []
        self._single = False

    def select(self, columns: str = "*"):
        self._query_filters = []
        return self

    def insert(self, data: Any):
        self._insert_data = data
        return self

    def update(self, data: Dict[str, Any]):
        self._update_data = data
        return self

    def eq(self, column: str, value: Any):
        self._query_filters.append((column, value))
        return self

    def execute(self):
        # Handle insert
        if hasattr(self, "_insert_data"):
            rows = self._insert_data if isinstance(self._insert_data, list) else [self._insert_data]
            inserted = []
            for r in rows:
                record = dict(r)
                if "id" not in record and "user_id" not in record and "food_id" not in record:
                    import uuid
                    record["id"] = str(uuid.uuid4())
                
                # Check for existing record by user_id if present
                if "user_id" in record and record["user_id"]:
                    uid = record["user_id"]
                    existing_idx = next((i for i, existing in enumerate(self.data_store[self.table_name]) if str(existing.get("user_id")) == str(uid)), None)
                    if existing_idx is not None:
                        self.data_store[self.table_name][existing_idx].update(record)
                        inserted.append(self.data_store[self.table_name][existing_idx])
                        continue

                self.data_store[self.table_name].append(record)
                inserted.append(record)
            delattr(self, "_insert_data")
            return MockResponse(inserted)

        rows = self.data_store.get(self.table_name, [])
        # Filter
        filtered = []
        for r in rows:
            match = True
            for col, val in self._query_filters:
                if str(r.get(col)) != str(val):
                    match = False
                    break
            if match:
                filtered.append(r)
        
        # Handle update if _update_data is present
        if hasattr(self, "_update_data"):
            for r in filtered:
                r.update(self._update_data)
            delattr(self, "_update_data")
            return MockResponse(filtered)

        return MockResponse(filtered)

    def single(self):
        self._single = True
        return self

class MockResponse:
    def __init__(self, data: Any):
        self.data = data

class MockSupabaseClient:
    """Mock Client conforming to supabase-py interface for normalized database schema."""
    def __init__(self):
        self.data_store: Dict[str, List[Dict[str, Any]]] = {}
        self._seed_default_data()

    def _seed_default_data(self):
        demo_id = settings.DEMO_USER_ID
        self.data_store["users"] = [{"id": demo_id, "name": settings.DEMO_USER_NAME, "email": "karthik@nutrishield.demo"}]
        
        self.data_store["user_profiles"] = [{
            "user_id": demo_id,
            "full_name": settings.DEMO_USER_NAME,
            "date_of_birth": "1995-06-15",
            "gender": "Male",
            "height": "175 cm",
            "weight": "72 kg",
            "conditions": ["Diabetes", "Hypertension"],
            "allergies": ["Peanuts"],
            "intolerances": ["Lactose"],
            "dietary_patterns": ["Vegetarian"],
            "goals": ["Manage blood sugar", "Reduce sodium"],
            "activity_level": "Moderately active",
            "activities": ["Walking"],
            "meals_per_day": "3",
            "snacking_frequency": "Once a day",
            "late_night_eating": "Never",
            "eating_locations": ["Home-cooked"],
            "cuisine_preferences": ["Indian", "South Indian"],
            "has_doctor_instructions": True,
            "doctor_instructions": "Reduce sodium and avoid highly processed foods.",
            "is_completed": True
        }]
        
        self.data_store["health_conditions"] = [
            {"id": 1, "name": "Diabetes", "description": "Metabolic condition"},
            {"id": 2, "name": "Hypertension", "description": "High blood pressure"},
            {"id": 3, "name": "CKD", "description": "Chronic Kidney Disease"},
            {"id": 4, "name": "PCOS", "description": "Polycystic Ovary Syndrome"},
            {"id": 5, "name": "Celiac disease", "description": "Autoimmune condition"}
        ]
        self.data_store["user_conditions"] = [
            {"user_id": demo_id, "condition_id": 1, "notes": "Type 2 Diabetes"},
            {"user_id": demo_id, "condition_id": 2, "notes": "Hypertension"}
        ]

        self.data_store["allergens"] = [
            {"id": 1, "name": "Peanut"},
            {"id": 2, "name": "Soy"},
            {"id": 3, "name": "Milk"},
            {"id": 4, "name": "Egg"},
            {"id": 5, "name": "Tree nuts"},
            {"id": 6, "name": "Shellfish"}
        ]
        self.data_store["user_allergies"] = [
            {"user_id": demo_id, "allergen_id": 1, "severity": "high"}
        ]

        self.data_store["dietary_restrictions"] = [
            {"id": 1, "name": "Vegetarian"},
            {"id": 2, "name": "Vegan"},
            {"id": 3, "name": "Jain"},
            {"id": 4, "name": "Halal"},
            {"id": 5, "name": "Low sodium"},
            {"id": 6, "name": "Low sugar"},
            {"id": 7, "name": "Gluten free"},
            {"id": 8, "name": "Lactose free"}
        ]
        self.data_store["user_dietary_restrictions"] = [
            {"user_id": demo_id, "restriction_id": 1}
        ]

        self.data_store["user_preferences"] = [
            {"id": 1, "user_id": demo_id, "preference_type": "lifestyle", "value": "low_oil"}
        ]

        self.data_store["dietary_instructions"] = [
            {"id": 1, "user_id": demo_id, "instruction": "Limit sodium intake according to clinician-provided plan.", "source": "Dr. Sharma"}
        ]

        self.data_store["ingredient_relationships"] = [
            {"id": "ir1", "base_ingredient": "peanut", "related_ingredient": "groundnut", "relationship_type": "synonym", "normalized_name": "peanut"},
            {"id": "ir2", "base_ingredient": "peanut", "related_ingredient": "peanut flour", "relationship_type": "derived", "normalized_name": "peanut"},
            {"id": "ir3", "base_ingredient": "milk", "related_ingredient": "whey", "relationship_type": "derived", "normalized_name": "milk"},
            {"id": "ir4", "base_ingredient": "milk", "related_ingredient": "casein", "relationship_type": "derived", "normalized_name": "milk"},
            {"id": "ir5", "base_ingredient": "soy", "related_ingredient": "soy lecithin", "relationship_type": "derived", "normalized_name": "soy"},
            {"id": "ir6", "base_ingredient": "wheat", "related_ingredient": "maida", "relationship_type": "synonym", "normalized_name": "refined wheat flour"}
        ]

        self.data_store["restaurants"] = [
            {"id": "r1", "name": "Green Leaf Pure Veg", "address": "12 Main St", "city": "Bangalore", "vegetarian_only": True, "vegan_only": False, "verified": True},
            {"id": "r2", "name": "Spice Route Diner", "address": "45 Park Rd", "city": "Bangalore", "vegetarian_only": False, "vegan_only": False, "verified": True}
        ]

        self.data_store["restaurant_sources"] = [
            {"id": 1, "restaurant_id": "r1", "source_name": "Official Menu Partner", "source_url": "https://greenleaf.example.com", "claim": "100% Pure Vegetarian Kitchen"}
        ]

        self.data_store["ingredients"] = [
            {"id": 1, "name": "rice", "category": "grain"},
            {"id": 2, "name": "urad dal", "category": "legume"},
            {"id": 3, "name": "paneer", "category": "dairy"},
            {"id": 4, "name": "butter", "category": "dairy"},
            {"id": 5, "name": "groundnut", "category": "legume"},
            {"id": 6, "name": "salt", "category": "seasoning"}
        ]

        self.data_store["menu_items"] = [
            {"id": "m1", "restaurant_id": "r1", "name": "Plain Dosa", "description": "Crispy crepe", "price": 120.0, "category": "Main"},
            {"id": "m2", "restaurant_id": "r1", "name": "Paneer Butter Masala", "description": "Rich paneer curry", "price": 240.0, "category": "Main"},
            {"id": "m3", "restaurant_id": "r1", "name": "Peanut Chutney Special Dosa", "description": "Dosa with groundnut chutney", "price": 160.0, "category": "Special"}
        ]

        self.data_store["menu_item_ingredients"] = [
            {"menu_item_id": "m1", "ingredient_id": 1, "confidence": 0.95, "is_confirmed": True},
            {"menu_item_id": "m1", "ingredient_id": 2, "confidence": 0.90, "is_confirmed": True},
            {"menu_item_id": "m2", "ingredient_id": 3, "confidence": 0.95, "is_confirmed": True},
            {"menu_item_id": "m2", "ingredient_id": 4, "confidence": 0.90, "is_confirmed": False},
            {"menu_item_id": "m3", "ingredient_id": 5, "confidence": 0.98, "is_confirmed": True}
        ]

        self.data_store["analysis_sessions"] = []
        self.data_store["analysis_results"] = []
        self.data_store["risks"] = []
        self.data_store["evidence"] = []
        self.data_store["analysis_unknowns"] = []
        self.data_store["recommendations"] = []
        self.data_store["analysis_answers"] = []

        self.data_store["foods"] = []
        self.data_store["food_ingredients"] = []
        self.data_store["nutrition_facts"] = []
        self.data_store["meals"] = []
        self.data_store["meal_items"] = []
        self.data_store["meal_plans"] = []
        self.data_store["meal_plan_items"] = []

    def table(self, name: str):
        return InMemorySupabaseTable(name, self.data_store)


class ResilientTableWrapper:
    """Wrapper that tries live Supabase execution, falling back seamlessly to mock store on missing tables or errors."""
    def __init__(self, real_table: Any, mock_table: InMemorySupabaseTable):
        self.real_table = real_table
        self.mock_table = mock_table
        self._action = "select"

    def select(self, *args, **kwargs):
        self._action = "select"
        if self.real_table is not None:
            try:
                self.real_table = self.real_table.select(*args, **kwargs)
            except Exception as e:
                logger.debug(f"real_table.select error: {e}")
        self.mock_table.select(*args, **kwargs)
        return self

    def insert(self, *args, **kwargs):
        self._action = "insert"
        if self.real_table is not None:
            try:
                self.real_table = self.real_table.insert(*args, **kwargs)
            except Exception as e:
                logger.debug(f"real_table.insert error: {e}")
        self.mock_table.insert(*args, **kwargs)
        return self

    def update(self, *args, **kwargs):
        self._action = "update"
        if self.real_table is not None:
            try:
                self.real_table = self.real_table.update(*args, **kwargs)
            except Exception as e:
                logger.debug(f"real_table.update error: {e}")
        self.mock_table.update(*args, **kwargs)
        return self

    def eq(self, *args, **kwargs):
        if self.real_table is not None:
            try:
                self.real_table = self.real_table.eq(*args, **kwargs)
            except Exception as e:
                logger.debug(f"real_table.eq error: {e}")
        self.mock_table.eq(*args, **kwargs)
        return self

    def limit(self, *args, **kwargs):
        if self.real_table is not None:
            try:
                self.real_table = self.real_table.limit(*args, **kwargs)
            except Exception as e:
                logger.debug(f"real_table.limit error: {e}")
        return self

    def single(self, *args, **kwargs):
        if self.real_table is not None:
            try:
                self.real_table = self.real_table.single(*args, **kwargs)
            except Exception as e:
                logger.debug(f"real_table.single error: {e}")
        self.mock_table.single(*args, **kwargs)
        return self

    def execute(self):
        if self.real_table is not None:
            try:
                res = self.real_table.execute()
                # Keep mock table in sync if execute succeeds
                try:
                    self.mock_table.execute()
                except Exception:
                    pass
                if res and hasattr(res, "data"):
                    return res
            except Exception as e:
                logger.debug(f"Live Supabase table execute failed: {e}. Utilizing resilient mock table.")

        return self.mock_table.execute()


class ResilientSupabaseClient:
    def __init__(self, real_client: Any, mock_client: MockSupabaseClient):
        self.real_client = real_client
        self.mock_client = mock_client

    def table(self, name: str):
        real_tbl = None
        if self.real_client:
            try:
                real_tbl = self.real_client.table(name)
            except Exception:
                pass
        mock_tbl = self.mock_client.table(name)
        return ResilientTableWrapper(real_tbl, mock_tbl)


_supabase_client: Optional[Any] = None

def get_supabase() -> Any:
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client
    
    logger.info("Operating in 100% LOCAL DATABASE MODE. All data is managed locally.")
    _supabase_client = MockSupabaseClient()
    return _supabase_client
