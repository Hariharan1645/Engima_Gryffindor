-- NutriShield Supabase PostgreSQL Database Schema
-- Migration 001: Normalized Core Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. HEALTH CONDITIONS
CREATE TABLE IF NOT EXISTS health_conditions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    description TEXT
);

-- 3. USER CONDITIONS (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_conditions (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    condition_id INTEGER REFERENCES health_conditions(id) ON DELETE CASCADE,
    notes TEXT,
    PRIMARY KEY (user_id, condition_id)
);

-- 4. ALLERGENS
CREATE TABLE IF NOT EXISTS allergens (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL
);

-- 5. USER ALLERGIES (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_allergies (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    allergen_id INTEGER REFERENCES allergens(id) ON DELETE CASCADE,
    severity VARCHAR(30),
    PRIMARY KEY (user_id, allergen_id)
);

-- 6. DIETARY RESTRICTIONS
CREATE TABLE IF NOT EXISTS dietary_restrictions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- 7. USER DIETARY RESTRICTIONS (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_dietary_restrictions (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    restriction_id INTEGER REFERENCES dietary_restrictions(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, restriction_id)
);

-- 8. USER PREFERENCES
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    preference_type VARCHAR(50),
    value TEXT
);

-- 9. DIETARY INSTRUCTIONS (Doctor/Clinician Instructions)
CREATE TABLE IF NOT EXISTS dietary_instructions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    instruction TEXT NOT NULL,
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. FOODS
CREATE TABLE IF NOT EXISTS foods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    source_type VARCHAR(50), -- packaged / restaurant / homemade / database / user
    brand VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. INGREDIENTS
CREATE TABLE IF NOT EXISTS ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100)
);

-- 12. FOOD INGREDIENTS
CREATE TABLE IF NOT EXISTS food_ingredients (
    food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
    ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity DECIMAL,
    unit VARCHAR(50),
    is_confirmed BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (food_id, ingredient_id)
);

-- 13. NUTRITION FACTS
CREATE TABLE IF NOT EXISTS nutrition_facts (
    id SERIAL PRIMARY KEY,
    food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
    serving_size DECIMAL,
    serving_unit VARCHAR(50),
    calories DECIMAL,
    carbohydrates DECIMAL,
    protein DECIMAL,
    fat DECIMAL,
    sugar DECIMAL,
    sodium DECIMAL,
    fiber DECIMAL,
    saturated_fat DECIMAL
);

-- 14. RESTAURANTS
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    latitude DECIMAL,
    longitude DECIMAL,
    cuisine VARCHAR(100),
    vegetarian_only BOOLEAN,
    vegan_only BOOLEAN,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. RESTAURANT SOURCES
CREATE TABLE IF NOT EXISTS restaurant_sources (
    id SERIAL PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    source_name VARCHAR(100),
    source_url TEXT,
    retrieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    claim TEXT
);

-- 16. MENU ITEMS
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL,
    category VARCHAR(100)
);

-- 17. MENU ITEM INGREDIENTS
CREATE TABLE IF NOT EXISTS menu_item_ingredients (
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
    confidence DECIMAL,
    is_confirmed BOOLEAN DEFAULT FALSE,
    PRIMARY KEY(menu_item_id, ingredient_id)
);

-- 18. ANALYSIS SESSIONS
CREATE TABLE IF NOT EXISTS analysis_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    input_type VARCHAR(50), -- label / menu / food_photo / text
    original_text TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 19. ANALYSIS RESULTS
CREATE TABLE IF NOT EXISTS analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES analysis_sessions(id) ON DELETE CASCADE,
    overall_status VARCHAR(50), -- lower_concern / potential_concern / high_attention / unknown / insufficient_information
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 20. RISKS
CREATE TABLE IF NOT EXISTS risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES analysis_results(id) ON DELETE CASCADE,
    risk_type VARCHAR(100),
    severity VARCHAR(30),
    status VARCHAR(30), -- confirmed / potential / unknown
    explanation TEXT
);

-- 21. EVIDENCE
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES analysis_results(id) ON DELETE CASCADE,
    evidence_type VARCHAR(50),
    source_name VARCHAR(255),
    source_url TEXT,
    evidence_text TEXT,
    confidence DECIMAL
);

-- 22. ANALYSIS UNKNOWNS
CREATE TABLE IF NOT EXISTS analysis_unknowns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES analysis_results(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    importance VARCHAR(30),
    resolved BOOLEAN DEFAULT FALSE
);

-- 23. RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES analysis_results(id) ON DELETE CASCADE,
    type VARCHAR(50), -- alternative / modification / portion / pairing
    title VARCHAR(255),
    description TEXT,
    reasoning TEXT
);

-- 24. MEALS
CREATE TABLE IF NOT EXISTS meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    meal_type VARCHAR(50), -- breakfast / lunch / dinner / snack
    eaten_at TIMESTAMP,
    location_type VARCHAR(50), -- home / restaurant / packaged / unknown
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 25. MEAL ITEMS
CREATE TABLE IF NOT EXISTS meal_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
    food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
    quantity DECIMAL,
    unit VARCHAR(50)
);

-- 26. MEAL PLANS
CREATE TABLE IF NOT EXISTS meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    start_date DATE,
    end_date DATE,
    generated_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 27. MEAL PLAN ITEMS
CREATE TABLE IF NOT EXISTS meal_plan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
    day_number INTEGER,
    meal_type VARCHAR(50),
    food_name VARCHAR(255),
    recipe TEXT,
    calories DECIMAL,
    protein DECIMAL,
    carbohydrates DECIMAL,
    fat DECIMAL
);

-- 28. INGREDIENT RELATIONSHIPS (Hidden Intelligence Graph)
CREATE TABLE IF NOT EXISTS ingredient_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_ingredient VARCHAR(255) NOT NULL,
    related_ingredient VARCHAR(255) NOT NULL,
    relationship_type VARCHAR(50) NOT NULL,
    normalized_name VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 29. ANALYSIS ANSWERS (Follow-up clarification answers)
CREATE TABLE IF NOT EXISTS analysis_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES analysis_results(id) ON DELETE CASCADE,
    question_id UUID REFERENCES analysis_unknowns(id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
