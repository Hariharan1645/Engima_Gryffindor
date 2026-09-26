# 🛡️ NutriShield Backend - Comprehensive Project Guide

NutriShield is a HealthTech decision-support prototype backend designed to analyze food items, detect hidden ingredient relationships (e.g. groundnut → peanut allergy), evaluate medical condition risks (e.g. sodium for hypertension, glycemic impact for diabetes), handle preparation uncertainties, and generate personalized meal plans.

---

## 📋 Table of Contents
1. [Technology Stack](#-technology-stack)
2. [Project Architecture & Directory Structure](#-project-architecture--directory-structure)
3. [Database Architecture & Schema](#-database-architecture--schema)
4. [Installation & Local Setup](#-installation--local-setup)
5. [Environment Variables Configuration](#-environment-variables-configuration)
6. [Running Supabase SQL Migrations](#-running-supabase-sql-migrations)
7. [Running the Application](#-running-the-application)
8. [Testing APIs (Swagger, cURL, Python)](#-testing-apis-swagger-curl-python)
9. [Automated Unit Testing](#-automated-unit-testing)
10. [Core AI & Safety Principles](#-core-ai--safety-principles)

---

## 🛠️ Technology Stack

* **Language**: Python 3.11+
* **Web Framework**: FastAPI (Async high-performance REST API framework)
* **Server**: Uvicorn (ASGI web server)
* **Primary Database**: Supabase PostgreSQL (via `supabase-py` client)
* **AI & Multimodal Understanding**: Gemini 2.5 API (`google-genai` SDK)
* **Data Validation**: Pydantic v2
* **Testing Suite**: Pytest + HTTPX
* **Environment Management**: `python-dotenv`

---

## 📁 Project Architecture & Directory Structure

```
backend/
├── app/
│   ├── main.py                   # FastAPI app entry point & global config
│   ├── core/
│   │   ├── config.py             # Settings loader from .env
│   │   ├── database.py           # Supabase client initializer & resilient adapter
│   │   └── security.py           # Authentication & demo security helpers
│   ├── models/
│   │   ├── user.py               # User domain model
│   │   ├── profile.py            # Profile domain model
│   │   ├── food.py               # Food & Ingredient models
│   │   ├── meal.py               # Meal models
│   │   ├── restaurant.py         # Restaurant & Menu models
│   │   ├── analysis.py           # Analysis, Risk & Question models
│   │   └── meal_plan.py          # MealPlan model
│   ├── schemas/
│   │   ├── profile.py            # Profile Pydantic request/response schemas
│   │   ├── food.py               # Food schemas
│   │   ├── analysis.py           # Analysis, Risk, Question & Modify schemas
│   │   ├── restaurant.py         # Restaurant search & menu schemas
│   │   └── meal_plan.py          # Meal plan request/response schemas
│   ├── api/
│   │   ├── users.py              # User info endpoints
│   │   ├── profiles.py           # Profile GET/PUT endpoints
│   │   ├── food.py               # POST /api/v1/analyze endpoint
│   │   ├── analysis.py           # Questions, Answers & Modify endpoints
│   │   ├── restaurants.py        # Restaurant search & menu analysis endpoints
│   │   ├── meals.py              # Meal history endpoints
│   │   └── plans.py              # POST /api/v1/meal-plans/generate endpoint
│   ├── services/
│   │   ├── ocr_service.py        # Image processing helper
│   │   ├── food_service.py       # Ingredient normalization & relationship lookup
│   │   ├── llm_service.py        # Gemini API integration service
│   │   ├── nutrition_service.py  # Nutritional threshold evaluation
│   │   ├── restaurant_service.py # Restaurant menu safety screening
│   │   ├── analysis_service.py   # Deterministic Risk Engine & core workflow
│   │   └── meal_plan_service.py # Safety-validated meal plan generator
│   └── prompts/
│       ├── food_analysis.txt     # Multimodal food extraction prompt
│       ├── followup_questions.txt # Follow-up question synthesis prompt
│       └── meal_plan.txt         # Meal plan candidate generation prompt
├── migrations/
│   ├── 001_initial_schema.sql    # Complete PostgreSQL schema (29 tables)
│   └── 002_seed_data.sql         # Seed data script for demo & lookup tables
├── tests/
│   ├── conftest.py               # Pytest test client fixtures
│   ├── test_health.py            # Health check tests
│   ├── test_profile.py           # Profile API tests
│   ├── test_analysis.py          # Food analysis & allergy tests
│   ├── test_questions.py         # Questions & answers workflow tests
│   ├── test_restaurants.py       # Restaurant search & menu tests
│   ├── test_modify.py            # Counterfactual modification tests
│   └── test_meal_plans.py        # Meal plan generation tests
├── requirements.txt              # Required Python packages
├── .env                          # Local environment variables
└── .env.example                  # Environment template
```

---

## 🗄️ Database Architecture & Schema

NutriShield uses a normalized PostgreSQL relational database hosted on Supabase:

### Core Normalized Tables (29 Tables)
1. **`users`**: User identity records (`id`, `name`, `email`, `created_at`, `updated_at`).
2. **`health_conditions`**: Master table for medical conditions (`id`, `name`, `description`).
3. **`user_conditions`**: Junction table for user medical conditions (`user_id`, `condition_id`, `notes`).
4. **`allergens`**: Master table for allergens (`id`, `name`).
5. **`user_allergies`**: Junction table for user allergies (`user_id`, `allergen_id`, `severity`).
6. **`dietary_restrictions`**: Master table for diets (`id`, `name`).
7. **`user_dietary_restrictions`**: Junction table for dietary preferences (`user_id`, `restriction_id`).
8. **`user_preferences`**: Lifestyle preferences (`id`, `user_id`, `preference_type`, `value`).
9. **`dietary_instructions`**: Clinician/Doctor instructions (`id`, `user_id`, `instruction`, `source`, `created_at`).
10. **`foods`**: Food items repository (`id`, `name`, `source_type`, `brand`, `created_at`).
11. **`ingredients`**: Normalized ingredients (`id`, `name`, `category`).
12. **`food_ingredients`**: Food-to-ingredient mapping (`food_id`, `ingredient_id`, `quantity`, `unit`, `is_confirmed`).
13. **`nutrition_facts`**: Nutritional values (`food_id`, `calories`, `carbohydrates`, `protein`, `fat`, `sugar`, `sodium`, `fiber`).
14. **`restaurants`**: Restaurant directory (`id`, `name`, `address`, `city`, `vegetarian_only`, `vegan_only`, `verified`).
15. **`restaurant_sources`**: Sourced restaurant information (`restaurant_id`, `source_name`, `source_url`, `claim`).
16. **`menu_items`**: Menu catalog (`id`, `restaurant_id`, `name`, `description`, `price`, `category`).
17. **`menu_item_ingredients`**: Menu item ingredient mapping (`menu_item_id`, `ingredient_id`, `confidence`, `is_confirmed`).
18. **`analysis_sessions`**: Session log (`id`, `user_id`, `input_type`, `original_text`, `image_url`, `created_at`).
19. **`analysis_results`**: Session summary & overall status (`id`, `session_id`, `overall_status`, `summary`).
20. **`risks`**: Structured risk evaluation (`id`, `analysis_id`, `risk_type`, `severity`, `status`, `explanation`).
21. **`evidence`**: Supporting evidence (`id`, `analysis_id`, `evidence_type`, `source_name`, `evidence_text`, `confidence`).
22. **`analysis_unknowns`**: Missing information & questions (`id`, `analysis_id`, `question`, `importance`, `resolved`).
23. **`recommendations`**: Actionable guidance (`id`, `analysis_id`, `type`, `title`, `description`, `reasoning`).
24. **`meals`**: User meal log (`id`, `user_id`, `meal_type`, `eaten_at`, `location_type`, `notes`).
25. **`meal_items`**: Logged meal items (`meal_id`, `food_id`, `quantity`, `unit`).
26. **`meal_plans`**: Multi-day plan headers (`id`, `user_id`, `title`, `start_date`, `end_date`, `generated_by`).
27. **`meal_plan_items`**: Planned meals per day (`meal_plan_id`, `day_number`, `meal_type`, `food_name`, `recipe`, `calories`).
28. **`ingredient_relationships`**: Graph mapping aliases/derivatives (`base_ingredient`, `related_ingredient`, `relationship_type`, `normalized_name`).
29. **`analysis_answers`**: Follow-up answers submitted by user (`analysis_id`, `question_id`, `answer`).

---

## 📦 Installation & Local Setup

### Prerequisites
* Python 3.11 or higher installed on your system.
* Active Supabase project (or local execution using built-in resilient adapter).
* Gemini API Key (from Google AI Studio).

### Step 1: Clone / Navigate to Project Directory
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
python -m pip install -r requirements.txt
```

---

## 🔑 Environment Variables Configuration

Create a `.env` file inside the `backend/` directory:

```env
# Supabase Configuration
SUPABASE_URL=https://your-supabase-project-id.supabase.co
SUPABASE_KEY=your-supabase-service-role-or-anon-key

# Gemini AI API Key
GEMINI_API_KEY=your-gemini-api-key-here

# Application Configuration
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173
DEMO_USER_ID=123
DEMO_USER_NAME=Karthik
```

---

## 🛢️ Running Supabase SQL Migrations

To set up your database tables on Supabase:

1. Open your **Supabase Dashboard** at `https://app.supabase.com`.
2. Select your project and navigate to the **SQL Editor**.
3. Copy the contents of [`migrations/001_initial_schema.sql`](file:///c:/Users/KarthikDaGoat/Desktop/Enigma/backend/migrations/001_initial_schema.sql) and click **Run**.
4. Copy the contents of [`migrations/002_seed_data.sql`](file:///c:/Users/KarthikDaGoat/Desktop/Enigma/backend/migrations/002_seed_data.sql) and click **Run**.

---

## 🏃 Running the Application

Launch the FastAPI dev server using Uvicorn:

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Once running:
* **Interactive Swagger Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
* **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

## 🧪 Testing APIs (Swagger, cURL, Python)

### 1. Health Check (`GET /health`)
```bash
curl -X GET http://127.0.0.1:8000/health
```
**Expected Response**:
```json
{
  "status": "ok",
  "service": "NutriShield Backend",
  "version": "1.0.0",
  "database": "connected"
}
```

---

### 2. Get User Profile (`GET /api/v1/profile`)
```bash
curl -X GET http://127.0.0.1:8000/api/v1/profile
```
**Expected Response**:
```json
{
  "user": {
    "id": "123",
    "name": "Karthik"
  },
  "conditions": ["diabetes", "hypertension"],
  "allergies": ["peanut"],
  "diet": ["vegetarian"],
  "preferences": ["low_oil"],
  "instructions": [
    "Limit sodium intake according to clinician-provided plan."
  ]
}
```

---

### 3. Update User Profile (`PUT /api/v1/profile`)
```bash
curl -X PUT http://127.0.0.1:8000/api/v1/profile \
  -H "Content-Type: application/json" \
  -d '{
    "conditions": ["diabetes", "hypertension"],
    "allergies": ["peanut"],
    "diet": ["vegetarian"],
    "preferences": ["low_oil"]
  }'
```

---

### 4. Food Analysis API (`POST /api/v1/analyze`)

#### Option A: Text Input (JSON)
```bash
curl -X POST http://127.0.0.1:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "input_type": "text",
    "text": "Paneer tikka with green chutney",
    "context": "restaurant food"
  }'
```

#### Option B: Multimodal Image Upload (Form Data)
```bash
curl -X POST http://127.0.0.1:8000/api/v1/analyze \
  -F "input_type=image" \
  -F "image=@/path/to/food_photo.jpg" \
  -F "context=restaurant food"
```

**Expected Response**:
```json
{
  "analysis_id": "9a5a2cb4-d355-4756-a271-f6480431d541",
  "food": {
    "name": "Paneer tikka with green chutney",
    "ingredients": [
      {
        "name": "paneer",
        "normalized_name": "milk",
        "category": "dairy",
        "is_explicit": true,
        "confidence": 0.95
      }
    ]
  },
  "overall_status": "potential_concern",
  "risks": [
    {
      "type": "sodium",
      "status": "potential",
      "severity": "moderate",
      "explanation": "Sodium may be relevant given the user's hypertension profile."
    }
  ],
  "unknowns": [
    {
      "question": "Does the marinade contain added salt?",
      "importance": "medium"
    }
  ],
  "recommendations": [
    "Consider requesting low-sodium preparation or avoiding extra sauce."
  ],
  "evidence": []
}
```

---

### 5. Follow-Up Questions (`GET /api/v1/analysis/{id}/questions`)
```bash
curl -X GET http://127.0.0.1:8000/api/v1/analysis/9a5a2cb4-d355-4756-a271-f6480431d541/questions
```

---

### 6. Answer Questions (`POST /api/v1/analysis/{id}/answers`)
```bash
curl -X POST http://127.0.0.1:8000/api/v1/analysis/9a5a2cb4-d355-4756-a271-f6480431d541/answers \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {
        "question_id": "q1",
        "answer": "restaurant prep"
      },
      {
        "question_id": "q2",
        "answer": "yes, contains soy sauce"
      }
    ]
  }'
```

---

### 7. Counterfactual Modification (`POST /api/v1/analysis/{id}/modify`)
```bash
curl -X POST http://127.0.0.1:8000/api/v1/analysis/9a5a2cb4-d355-4756-a271-f6480431d541/modify \
  -H "Content-Type: application/json" \
  -d '{
    "changes": [
      { "type": "portion", "value": "small" },
      { "type": "ingredient", "ingredient": "butter", "action": "reduce" },
      { "type": "drink", "value": "unsweetened" }
    ]
  }'
```
**Expected Response**:
```json
{
  "before": { "status": "high_attention" },
  "after": { "status": "potential_concern" },
  "changes": [
    {
      "factor": "portion",
      "impact": "Reduced portion reduces overall estimated sodium and glycemic load exposure."
    },
    {
      "factor": "ingredient: butter",
      "impact": "Action 'reduce' on butter directly lowers dietary exposure risk."
    },
    {
      "factor": "drink selection",
      "impact": "Switching to unsweetened beverage eliminates added simple sugar intake."
    }
  ]
}
```

---

### 8. Restaurant Search & Menu Screening
```bash
# Search Restaurants
curl -X GET "http://127.0.0.1:8000/api/v1/restaurants/search?q=Green"

# Get Restaurant Menu
curl -X GET http://127.0.0.1:8000/api/v1/restaurants/r1/menu

# Analyze Menu items against user profile
curl -X POST http://127.0.0.1:8000/api/v1/restaurants/r1/analyze-menu
```

---

### 9. Generate Safety-Filtered Meal Plan (`POST /api/v1/meal-plans/generate`)
```bash
curl -X POST http://127.0.0.1:8000/api/v1/meal-plans/generate \
  -H "Content-Type: application/json" \
  -d '{
    "days": 7,
    "meals_per_day": 3,
    "preferences": ["vegetarian", "indian"]
  }'
```

---

## ⚡ Automated Unit Testing

Run all unit tests using pytest:

```bash
python -m pytest
```

---

## 🛡️ Core AI & Safety Principles

1. **Deterministic Safety Engine**: Medical risk decisions are made by deterministic code rules matching normalized ingredients against user profiles and clinician instructions—never left solely to LLM hallucinations.
2. **Hidden Ingredient Intelligence**: Relationship lookup maps aliases (e.g., `groundnut → peanut`, `whey → milk`) to detect hidden risks.
3. **No 100% Safe Guarantees**: Statuses are classified strictly as `confirmed`, `potential`, and `unknown`. Never claims food is "100% safe".
4. **Preserves Uncertainty**: Explicitly returns unknown preparation details instead of guessing.
