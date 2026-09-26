-- NutriShield Seed Data Migration
-- Migration 002: Seed Data for Normalized Database Schema

-- Seed Health Conditions
INSERT INTO health_conditions (id, name, description) VALUES
(1, 'Diabetes', 'Metabolic condition affecting blood sugar regulation'),
(2, 'Hypertension', 'High blood pressure requiring sodium management'),
(3, 'CKD', 'Chronic Kidney Disease requiring protein/electrolyte monitoring'),
(4, 'PCOS', 'Polycystic Ovary Syndrome affecting metabolic & insulin sensitivity'),
(5, 'Celiac disease', 'Autoimmune condition requiring strict gluten elimination')
ON CONFLICT (id) DO NOTHING;

-- Seed Allergens
INSERT INTO allergens (id, name) VALUES
(1, 'Peanut'),
(2, 'Soy'),
(3, 'Milk'),
(4, 'Egg'),
(5, 'Tree nuts'),
(6, 'Shellfish')
ON CONFLICT (id) DO NOTHING;

-- Seed Dietary Restrictions
INSERT INTO dietary_restrictions (id, name) VALUES
(1, 'Vegetarian'),
(2, 'Vegan'),
(3, 'Jain'),
(4, 'Halal'),
(5, 'Low sodium'),
(6, 'Low sugar'),
(7, 'Gluten free'),
(8, 'Lactose free')
ON CONFLICT (id) DO NOTHING;

-- Seed Demo User '00000000-0000-0000-0000-000000000123'
INSERT INTO users (id, name, email)
VALUES ('00000000-0000-0000-0000-000000000123', 'Karthik', 'karthik@nutrishield.demo')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email;

-- Seed User Conditions (Diabetes & Hypertension for Demo User)
INSERT INTO user_conditions (user_id, condition_id, notes) VALUES
('00000000-0000-0000-0000-000000000123', 1, 'Type 2 Diabetes management'),
('00000000-0000-0000-0000-000000000123', 2, 'Stage 1 Hypertension')
ON CONFLICT DO NOTHING;

-- Seed User Allergies (Peanut Allergy for Demo User)
INSERT INTO user_allergies (user_id, allergen_id, severity) VALUES
('00000000-0000-0000-0000-000000000123', 1, 'high')
ON CONFLICT DO NOTHING;

-- Seed User Dietary Restrictions (Vegetarian for Demo User)
INSERT INTO user_dietary_restrictions (user_id, restriction_id) VALUES
('00000000-0000-0000-0000-000000000123', 1)
ON CONFLICT DO NOTHING;

-- Seed User Preferences
INSERT INTO user_preferences (user_id, preference_type, value) VALUES
('00000000-0000-0000-0000-000000000123', 'lifestyle', 'low_oil'),
('00000000-0000-0000-0000-000000000123', 'cuisine', 'prefers Indian food')
ON CONFLICT DO NOTHING;

-- Seed Doctor / Dietary Instructions
INSERT INTO dietary_instructions (user_id, instruction, source) VALUES
('00000000-0000-0000-0000-000000000123', 'Limit sodium intake according to clinician-provided plan.', 'Dr. Sharma (Cardiologist)')
ON CONFLICT DO NOTHING;

-- Seed Ingredient Relationships (Hidden Intelligence)
INSERT INTO ingredient_relationships (base_ingredient, related_ingredient, relationship_type, normalized_name) VALUES
('peanut', 'groundnut', 'synonym', 'peanut'),
('peanut', 'peanut flour', 'derived', 'peanut'),
('peanut', 'peanut protein', 'derived', 'peanut'),
('peanut', 'peanut oil', 'derived', 'peanut'),
('peanut', 'groundnut oil', 'derived', 'peanut'),
('milk', 'whey', 'derived', 'milk'),
('milk', 'casein', 'derived', 'milk'),
('milk', 'milk solids', 'derived', 'milk'),
('soy', 'soy lecithin', 'derived', 'soy'),
('wheat', 'maida', 'synonym', 'refined wheat flour')
ON CONFLICT DO NOTHING;

-- Seed Sample Demo Restaurant
INSERT INTO restaurants (id, name, cuisine, vegetarian_only, vegan_only, verified) VALUES
('11111111-1111-1111-1111-111111111111', 'Green Leaf Pure Veg', 'South Indian', true, false, true),
('22222222-2222-2222-2222-222222222222', 'Spice Route Diner', 'Multi-Cuisine', false, false, true)
ON CONFLICT (id) DO NOTHING;

-- Seed Restaurant Source
INSERT INTO restaurant_sources (restaurant_id, source_name, source_url, claim) VALUES
('11111111-1111-1111-1111-111111111111', 'Official Menu Partner', 'https://greenleaf.example.com', '100% Pure Vegetarian Kitchen');

-- Seed Ingredients
INSERT INTO ingredients (id, name, category) VALUES
(1, 'rice', 'grain'),
(2, 'urad dal', 'legume'),
(3, 'paneer', 'dairy'),
(4, 'butter', 'dairy'),
(5, 'groundnut', 'legume'),
(6, 'salt', 'seasoning')
ON CONFLICT (id) DO NOTHING;

-- Seed Menu Items
INSERT INTO menu_items (id, restaurant_id, name, description, price, category) VALUES
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Plain Dosa', 'Crispy rice lentil crepe', 120.00, 'Main Course'),
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Paneer Butter Masala', 'Rich paneer gravy', 240.00, 'Main Course'),
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Peanut Chutney Special Dosa', 'Dosa with groundnut chutney', 160.00, 'Special')
ON CONFLICT (id) DO NOTHING;

-- Seed Menu Item Ingredients
INSERT INTO menu_item_ingredients (menu_item_id, ingredient_id, confidence, is_confirmed) VALUES
('33333333-3333-3333-3333-333333333333', 1, 0.95, true),
('33333333-3333-3333-3333-333333333333', 2, 0.90, true),
('44444444-4444-4444-4444-444444444444', 3, 0.95, true),
('44444444-4444-4444-4444-444444444444', 4, 0.90, false),
('55555555-5555-5555-5555-555555555555', 5, 0.98, true)
ON CONFLICT DO NOTHING;
