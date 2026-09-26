-- ==========================================
-- SWAAHARA DATABASE SCHEMA FOR SUPABASE
-- Run this script in the Supabase SQL Editor:
-- (https://supabase.com/dashboard/project/egbhpgzpnhcdddgthgmy/sql)
-- ==========================================

-- 1. Main User Profiles Table (Stores 10 Profile Sections)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    user_id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT,
    height TEXT,
    weight TEXT,

    conditions TEXT[] DEFAULT '{}',
    allergies TEXT[] DEFAULT '{}',
    intolerances TEXT[] DEFAULT '{}',
    dietary_patterns TEXT[] DEFAULT '{}',
    goals TEXT[] DEFAULT '{}',

    activity_level TEXT,
    activities TEXT[] DEFAULT '{}',

    meals_per_day TEXT,
    snacking_frequency TEXT,
    late_night_eating TEXT,

    eating_locations TEXT[] DEFAULT '{}',
    cuisine_preferences TEXT[] DEFAULT '{}',

    has_doctor_instructions BOOLEAN DEFAULT FALSE,
    doctor_instructions TEXT DEFAULT '',

    is_completed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own profile records
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.user_profiles;
CREATE POLICY "Users can manage their own profile"
ON public.user_profiles FOR ALL
USING (auth.uid()::text = user_id OR user_id = '123')
WITH CHECK (auth.uid()::text = user_id OR user_id = '123');

-- 2. Legacy Normalized Health & Dietary Tables
CREATE TABLE IF NOT EXISTS public.health_conditions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.user_conditions (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    condition_id INT REFERENCES public.health_conditions(id),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.allergens (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.user_allergies (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    allergen_id INT REFERENCES public.allergens(id),
    severity TEXT DEFAULT 'high'
);

CREATE TABLE IF NOT EXISTS public.dietary_restrictions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.user_dietary_restrictions (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    restriction_id INT REFERENCES public.dietary_restrictions(id)
);

CREATE TABLE IF NOT EXISTS public.user_preferences (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    preference_type TEXT,
    value TEXT
);

CREATE TABLE IF NOT EXISTS public.dietary_instructions (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    instruction TEXT NOT NULL,
    source TEXT DEFAULT 'Clinician'
);

-- 3. Analysis Sessions & Risk Results Tables
CREATE TABLE IF NOT EXISTS public.analysis_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    input_type TEXT NOT NULL,
    original_text TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.analysis_sessions(id) ON DELETE CASCADE,
    overall_status TEXT NOT NULL,
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES public.analysis_results(id) ON DELETE CASCADE,
    risk_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT NOT NULL,
    explanation TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES public.analysis_results(id) ON DELETE CASCADE,
    evidence_type TEXT,
    source_name TEXT,
    evidence_text TEXT,
    confidence FLOAT DEFAULT 0.95
);

CREATE TABLE IF NOT EXISTS public.analysis_unknowns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES public.analysis_results(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    importance TEXT DEFAULT 'medium',
    resolved BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES public.analysis_results(id) ON DELETE CASCADE,
    type TEXT,
    title TEXT,
    description TEXT NOT NULL,
    reasoning TEXT
);

CREATE TABLE IF NOT EXISTS public.analysis_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES public.analysis_results(id) ON DELETE CASCADE,
    question_id UUID,
    answer TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable public access for demo testing
ALTER TABLE public.analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public analysis access" ON public.analysis_sessions;
DROP POLICY IF EXISTS "Public analysis results access" ON public.analysis_results;
DROP POLICY IF EXISTS "Public risks access" ON public.risks;

CREATE POLICY "Public analysis access" ON public.analysis_sessions FOR ALL USING (true);
CREATE POLICY "Public analysis results access" ON public.analysis_results FOR ALL USING (true);
CREATE POLICY "Public risks access" ON public.risks FOR ALL USING (true);

-- Seed Default Health Conditions & Allergens
INSERT INTO public.health_conditions (name) VALUES ('Diabetes'), ('Hypertension'), ('CKD'), ('PCOS'), ('Celiac disease') ON CONFLICT DO NOTHING;
INSERT INTO public.allergens (name) VALUES ('Peanut'), ('Soy'), ('Milk'), ('Egg'), ('Tree nuts'), ('Shellfish') ON CONFLICT DO NOTHING;
INSERT INTO public.dietary_restrictions (name) VALUES ('Vegetarian'), ('Vegan'), ('Jain'), ('Halal'), ('Low sodium'), ('Gluten free'), ('Lactose free') ON CONFLICT DO NOTHING;
