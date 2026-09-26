'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, calculateAgeFromDOB, FullUserProfileData } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  ShieldCheck,
  Check,
  Plus,
  User,
  Activity,
  Heart,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
  AlertCircle,
  Utensils,
  MapPin,
  Clock,
  Globe,
  Stethoscope,
} from 'lucide-react';

export default function ProfileSetupPage() {
  const router = useRouter();
  const { profile, updateProfile, isLoading } = useAuth();

  const [activeStep, setActiveStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State initialized from Auth Context Profile
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [dateOfBirth, setDateOfBirth] = useState(profile.date_of_birth || '');
  const [gender, setGender] = useState(profile.gender || '');
  const [height, setHeight] = useState(profile.height || '');
  const [weight, setWeight] = useState(profile.weight || '');

  const [conditions, setConditions] = useState<string[]>(profile.conditions || []);
  const [customCondition, setCustomCondition] = useState('');

  const [allergies, setAllergies] = useState<string[]>(profile.allergies || []);
  const [customAllergy, setCustomAllergy] = useState('');
  const [intolerances, setIntolerances] = useState<string[]>(profile.intolerances || []);
  const [customIntolerance, setCustomIntolerance] = useState('');

  const [dietaryPatterns, setDietaryPatterns] = useState<string[]>(profile.dietary_patterns || []);
  const [customDietPattern, setCustomDietPattern] = useState('');

  const [goals, setGoals] = useState<string[]>(profile.goals || []);
  const [customGoal, setCustomGoal] = useState('');

  const [activityLevel, setActivityLevel] = useState(profile.activity_level || '');
  const [activities, setActivities] = useState<string[]>(profile.activities || []);

  const [mealsPerDay, setMealsPerDay] = useState(profile.meals_per_day || '');
  const [snackingFrequency, setSnackingFrequency] = useState(profile.snacking_frequency || '');
  const [lateNightEating, setLateNightEating] = useState(profile.late_night_eating || '');

  const [eatingLocations, setEatingLocations] = useState<string[]>(profile.eating_locations || []);
  const [cuisinePreferences, setCuisinePreferences] = useState<string[]>(profile.cuisine_preferences || []);

  const [hasDoctorInstructions, setHasDoctorInstructions] = useState(profile.has_doctor_instructions || false);
  const [doctorInstructions, setDoctorInstructions] = useState(profile.doctor_instructions || '');

  useEffect(() => {
    if (profile) {
      if (profile.full_name) setFullName(profile.full_name);
      if (profile.date_of_birth) setDateOfBirth(profile.date_of_birth);
      if (profile.gender) setGender(profile.gender);
      if (profile.height) setHeight(profile.height);
      if (profile.weight) setWeight(profile.weight);
      if (profile.conditions) setConditions(profile.conditions);
      if (profile.allergies) setAllergies(profile.allergies);
      if (profile.intolerances) setIntolerances(profile.intolerances);
      if (profile.dietary_patterns) setDietaryPatterns(profile.dietary_patterns);
      if (profile.goals) setGoals(profile.goals);
      if (profile.activity_level) setActivityLevel(profile.activity_level);
      if (profile.activities) setActivities(profile.activities);
      if (profile.meals_per_day) setMealsPerDay(profile.meals_per_day);
      if (profile.snacking_frequency) setSnackingFrequency(profile.snacking_frequency);
      if (profile.late_night_eating) setLateNightEating(profile.late_night_eating);
      if (profile.eating_locations) setEatingLocations(profile.eating_locations);
      if (profile.cuisine_preferences) setCuisinePreferences(profile.cuisine_preferences);
      if (profile.has_doctor_instructions !== undefined) setHasDoctorInstructions(profile.has_doctor_instructions);
      if (profile.doctor_instructions) setDoctorInstructions(profile.doctor_instructions);
    }
  }, [profile]);

  const calculatedAge = calculateAgeFromDOB(dateOfBirth);

  const toggleItem = (list: string[], setList: (val: string[]) => void, item: string) => {
    if (item === 'None') {
      setList(['None']);
      return;
    }
    const filtered = list.filter((i) => i !== 'None');
    if (filtered.includes(item)) {
      setList(filtered.filter((i) => i !== item));
    } else {
      setList([...filtered, item]);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const updated: Partial<FullUserProfileData> = {
      full_name: fullName || 'User Profile',
      date_of_birth: dateOfBirth,
      gender,
      height,
      weight,
      conditions,
      allergies,
      intolerances,
      dietary_patterns: dietaryPatterns,
      goals,
      activity_level: activityLevel,
      activities,
      meals_per_day: mealsPerDay,
      snacking_frequency: snackingFrequency,
      late_night_eating: lateNightEating,
      eating_locations: eatingLocations,
      cuisine_preferences: cuisinePreferences,
      has_doctor_instructions: hasDoctorInstructions,
      doctor_instructions: hasDoctorInstructions ? doctorInstructions : '',
      is_completed: true,
    };

    await updateProfile(updated);
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => {
      router.push('/scan');
    }, 1200);
  };

  const stepsList = [
    { num: 1, title: 'Basic & Health', icon: User },
    { num: 2, title: 'Allergies & Diets', icon: Heart },
    { num: 3, title: 'Goals & Activity', icon: Activity },
    { num: 4, title: 'Habits & Cuisines', icon: Utensils },
    { num: 5, title: 'Doctor Instructions', icon: Stethoscope },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8D5CE]/60 text-[#3A2E2C] text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck size={14} className="text-[#C27B66]" />
          <span>Personalized Health Context</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#3A2E2C]">
          Set Up Your Profile
        </h1>
        <p className="text-sm sm:text-base text-[#3A2E2C]/80 max-w-xl mx-auto">
          Tell us a little about yourself so we can personalize your food safety, allergen checks, and health insights.
        </p>
      </div>

      {/* Progress Bar / Step Tabs */}
      <div className="flex items-center justify-between bg-[#FBF6F3] border border-[#EDE0DA] rounded-2xl p-2 shadow-xs overflow-x-auto">
        {stepsList.map((s) => {
          const Icon = s.icon;
          const isActive = activeStep === s.num;
          const isDone = activeStep > s.num;
          return (
            <button
              key={s.num}
              type="button"
              onClick={() => setActiveStep(s.num)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#3A2E2C] text-[#FBF6F3] shadow-xs'
                  : isDone
                  ? 'bg-[#8FA382]/20 text-[#3A4432]'
                  : 'text-[#3A2E2C]/60 hover:text-[#3A2E2C]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive
                    ? 'bg-[#D9A8A0] text-[#3A2E2C]'
                    : isDone
                    ? 'bg-[#8FA382] text-[#FBF6F3]'
                    : 'bg-[#E8D5CE] text-[#3A2E2C]'
                }`}
              >
                {isDone ? <Check size={12} /> : s.num}
              </div>
              <span className="hidden sm:inline-block">{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* Step Content Container */}
      <Card variant="default" className="p-6 sm:p-8 space-y-8 border-[#EDE0DA] shadow-sm">
        {/* STEP 1: BASIC INFORMATION & HEALTH CONDITIONS */}
        {activeStep === 1 && (
          <div className="space-y-8 animate-fade-in">
            {/* SECTION 1: BASIC INFORMATION */}
            <div className="space-y-4">
              <div className="border-b border-[#EDE0DA] pb-2 flex items-center justify-between">
                <h2 className="font-display font-bold text-xl text-[#3A2E2C] flex items-center gap-2">
                  <User size={20} className="text-[#C27B66]" />
                  Section 1 &mdash; Basic Information
                </h2>
                <span className="text-xs text-[#9B4A38] font-semibold uppercase tracking-wider">* Required Fields</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3A2E2C] mb-1">
                    Full Name <span className="text-[#9B4A38]">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 bg-[#F6ECE7] border border-[#EDE0DA] rounded-xl text-sm text-[#3A2E2C] focus:outline-none focus:ring-2 focus:ring-[#C27B66]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3A2E2C] mb-1">
                    Date of Birth <span className="text-[#9B4A38]">*</span>
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F6ECE7] border border-[#EDE0DA] rounded-xl text-sm text-[#3A2E2C] focus:outline-none focus:ring-2 focus:ring-[#C27B66]/40"
                  />
                  {calculatedAge !== undefined && (
                    <p className="mt-1 text-xs text-[#3A4432] font-semibold flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-[#8FA382]" />
                      Calculated Age: <span className="font-bold">{calculatedAge} years old</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3A2E2C] mb-1">
                    Gender (Optional)
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F6ECE7] border border-[#EDE0DA] rounded-xl text-sm text-[#3A2E2C] focus:outline-none focus:ring-2 focus:ring-[#C27B66]/40"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3A2E2C] mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 175"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#F6ECE7] border border-[#EDE0DA] rounded-xl text-sm text-[#3A2E2C] focus:outline-none focus:ring-2 focus:ring-[#C27B66]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3A2E2C] mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 70"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#F6ECE7] border border-[#EDE0DA] rounded-xl text-sm text-[#3A2E2C] focus:outline-none focus:ring-2 focus:ring-[#C27B66]/40"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: HEALTH CONDITIONS */}
            <div className="space-y-4 pt-4">
              <div className="border-b border-[#EDE0DA] pb-2">
                <h2 className="font-display font-bold text-xl text-[#3A2E2C] flex items-center gap-2">
                  <Heart size={20} className="text-[#C27B66]" />
                  Section 2 &mdash; Health Conditions
                </h2>
                <p className="text-xs text-[#3A2E2C]/70">
                  Do you currently have any health conditions that affect your diet? (Select all that apply)
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  'Diabetes',
                  'Prediabetes',
                  'Hypertension / High Blood Pressure',
                  'High Cholesterol',
                  'Heart Disease',
                  'PCOS / PCOD',
                  'Thyroid Disorder',
                  'Chronic Kidney Disease',
                  'Kidney Stones',
                  'IBS',
                  'GERD / Acid Reflux',
                  'Celiac Disease',
                  'Inflammatory Bowel Disease',
                  'Gout',
                  'Fatty Liver Disease',
                  'None',
                ].map((item) => {
                  const isSelected = conditions.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleItem(conditions, setConditions, item)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#3A2E2C] text-[#FBF6F3] border-[#3A2E2C] shadow-2xs'
                          : 'bg-[#F6ECE7] text-[#3A2E2C]/80 border-[#EDE0DA] hover:bg-[#E8D5CE]'
                      }`}
                    >
                      {isSelected ? <Check size={14} className="text-[#D9A8A0]" /> : <Plus size={14} />}
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Condition */}
              <div className="flex gap-2 max-w-md pt-1">
                <input
                  type="text"
                  placeholder="Add another health condition..."
                  value={customCondition}
                  onChange={(e) => setCustomCondition(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#F6ECE7] border border-[#EDE0DA] rounded-xl text-xs text-[#3A2E2C] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customCondition.trim() && !conditions.includes(customCondition.trim())) {
                      setConditions([...conditions.filter((c) => c !== 'None'), customCondition.trim()]);
                      setCustomCondition('');
                    }
                  }}
                  className="px-4 py-2 bg-[#E8D5CE] hover:bg-[#D9A8A0] text-[#3A2E2C] text-xs font-bold rounded-xl transition-all"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ALLERGIES & INTOLERANCES & DIETARY PATTERNS */}
        {activeStep === 2 && (
          <div className="space-y-8 animate-fade-in">
            {/* SECTION 3: ALLERGIES & INTOLERANCES */}
            <div className="space-y-4">
              <div className="border-b border-[#EDE0DA] pb-2">
                <h2 className="font-display font-bold text-xl text-[#3A2E2C] flex items-center gap-2">
                  <AlertCircle size={20} className="text-[#9B4A38]" />
                  Section 3 &mdash; Allergies &amp; Intolerances
                </h2>
                <p className="text-xs text-[#3A2E2C]/70">
                  Allergies and intolerances remain strictly separated for clinical safety screening.
                </p>
              </div>

              {/* Food Allergies */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3A2E2C]">
                  Food Allergies
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Peanuts', 'Tree Nuts', 'Milk / Dairy', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish', 'Sesame', 'None'].map((item) => {
                    const isSelected = allergies.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleItem(allergies, setAllergies, item)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#9B4A38] text-[#FBF6F3] border-[#9B4A38] shadow-2xs'
                            : 'bg-[#F6ECE7] text-[#3A2E2C]/80 border-[#EDE0DA] hover:bg-[#E8D5CE]'
                        }`}
                      >
                        {isSelected ? <Check size={14} className="text-[#FBF6F3]" /> : <Plus size={14} />}
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 max-w-md pt-1">
                  <input
                    type="text"
                    placeholder="Add custom food allergy..."
                    value={customAllergy}
                    onChange={(e) => setCustomAllergy(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#F6ECE7] border border-[#EDE0DA] rounded-xl text-xs text-[#3A2E2C] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customAllergy.trim() && !allergies.includes(customAllergy.trim())) {
                        setAllergies([...allergies.filter((a) => a !== 'None'), customAllergy.trim()]);
                        setCustomAllergy('');
                      }
                    }}
                    className="px-4 py-2 bg-[#E8D5CE] hover:bg-[#D9A8A0] text-[#3A2E2C] text-xs font-bold rounded-xl transition-all"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Food Intolerances */}
              <div className="space-y-2 pt-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3A2E2C]">
                  Food Intolerances
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Lactose', 'Gluten', 'Fructose', 'Histamine', 'FODMAPs', 'None'].map((item) => {
                    const isSelected = intolerances.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleItem(intolerances, setIntolerances, item)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#C9973E] text-[#3A2E2C] border-[#C9973E] shadow-2xs'
                            : 'bg-[#F6ECE7] text-[#3A2E2C]/80 border-[#EDE0DA] hover:bg-[#E8D5CE]'
                        }`}
                      >
                        {isSelected ? <Check size={14} /> : <Plus size={14} />}
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 max-w-md pt-1">
                  <input
                    type="text"
                    placeholder="Add custom intolerance..."
                    value={customIntolerance}
                    onChange={(e) => setCustomIntolerance(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#F6ECE7] border border-[#EDE0DA] rounded-xl text-xs text-[#3A2E2C] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customIntolerance.trim() && !intolerances.includes(customIntolerance.trim())) {
                        setIntolerances([...intolerances.filter((i) => i !== 'None'), customIntolerance.trim()]);
                        setCustomIntolerance('');
                      }
                    }}
                    className="px-4 py-2 bg-[#E8D5CE] hover:bg-[#D9A8A0] text-[#3A2E2C] text-xs font-bold rounded-xl transition-all"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 4: DIETARY PATTERNS */}
            <div className="space-y-4 pt-4">
              <div className="border-b border-[#EDE0DA] pb-2">
                <h2 className="font-display font-bold text-xl text-[#3A2E2C] flex items-center gap-2">
                  <Utensils size={20} className="text-[#C27B66]" />
                  Section 4 &mdash; Dietary Patterns
                </h2>
                <p className="text-xs text-[#3A2E2C]/70">
                  What dietary patterns do you follow? (Multiple preferences e.g. Vegetarian + Jain supported)
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  'Vegetarian',
                  'Vegan',
                  'Eggetarian',
                  'Non-Vegetarian',
                  'Jain',
                  'Pescatarian',
                  'Halal',
                  'Kosher',
                  'No specific diet',
                ].map((item) => {
                  const isSelected = dietaryPatterns.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleItem(dietaryPatterns, setDietaryPatterns, item)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#3A2E2C] text-[#FBF6F3] border-[#3A2E2C] shadow-2xs'
                          : 'bg-[#F6ECE7] text-[#3A2E2C]/80 border-[#EDE0DA] hover:bg-[#E8D5CE]'
                      }`}
                    >
                      {isSelected ? <Check size={14} className="text-[#D9A8A0]" /> : <Plus size={14} />}
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: DIETARY GOALS & ACTIVITY */}
        {activeStep === 3 && (
          <div className="space-y-8 animate-fade-in">
            {/* SECTION 5: DIETARY GOALS */}
            <div className="space-y-4">
              <div className="border-b border-[#EDE0DA] pb-2">
                <h2 className="font-display font-bold text-xl text-[#3A2E2C] flex items-center gap-2">
                  <Sparkles size={20} className="text-[#C27B66]" />
                  Section 5 &mdash; Dietary &amp; Health Goals
                </h2>
                <p className="text-xs text-[#3A2E2C]/70">
                  What are your current dietary or health goals?
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  'Lose weight',
                  'Gain weight',
                  'Maintain weight',
                  'Manage blood sugar',
                  'Manage blood pressure',
                  'Reduce sodium',
                  'Reduce added sugar',
                  'Manage cholesterol',
                  'Improve gut health',
                  'Increase protein',
                  'Increase fiber',
                  'Eat more whole foods',
                  'General healthy eating',
                  "Follow doctor's dietary plan",
                ].map((item) => {
                  const isSelected = goals.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleItem(goals, setGoals, item)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#8FA382] text-[#FBF6F3] border-[#8FA382] shadow-2xs'
                          : 'bg-[#F6ECE7] text-[#3A2E2C]/80 border-[#EDE0DA] hover:bg-[#E8D5CE]'
                      }`}
                    >
                      {isSelected ? <Check size={14} /> : <Plus size={14} />}
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 6: ACTIVITY & LIFESTYLE */}
            <div className="space-y-4 pt-4">
              <div className="border-b border-[#EDE0DA] pb-2">
                <h2 className="font-display font-bold text-xl text-[#3A2E2C] flex items-center gap-2">
                  <Activity size={20} className="text-[#C27B66]" />
                  Section 6 &mdash; Activity &amp; Lifestyle
                </h2>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3A2E2C]">
                  How active are you on a typical week?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    'Little to no activity',
                    'Lightly active',
                    'Moderately active',
                    'Very active',
                    'Extremely active',
                  ].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setActivityLevel(level)}
                      className={`p-3 rounded-xl text-xs font-semibold border text-left transition-all ${
                        activityLevel === level
                          ? 'bg-[#3A2E2C] text-[#FBF6F3] border-[#3A2E2C]'
                          : 'bg-[#F6ECE7] text-[#3A2E2C]/80 border-[#EDE0DA] hover:bg-[#E8D5CE]'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3A2E2C]">
                  What activities do you usually do?
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Walking', 'Running', 'Gym', 'Swimming', 'Cycling', 'Yoga', 'Sports'].map((act) => {
                    const isSelected = activities.includes(act);
                    return (
                      <button
                        key={act}
                        type="button"
                        onClick={() => toggleItem(activities, setActivities, act)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#3A2E2C] text-[#FBF6F3] border-[#3A2E2C]'
                            : 'bg-[#F6ECE7] text-[#3A2E2C]/80 border-[#EDE0DA] hover:bg-[#E8D5CE]'
                        }`}
                      >
                        {isSelected ? <Check size={12} /> : <Plus size={12} />}
                        <span>{act}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: EATING HABITS & CUISINES */}
        {activeStep === 4 && (
          <div className="space-y-8 animate-fade-in">
            {/* SECTION 7: EATING HABITS */}
            <div className="space-y-4">
              <div className="border-b border-[#EDE0DA] pb-2">
                <h2 className="font-display font-bold text-xl text-[#3A2E2C] flex items-center gap-2">
                  <Clock size={20} className="text-[#C27B66]" />
                  Section 7 &mdash; Eating Habits
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3A2E2C] mb-1.5">
                    Meals per day
                  </label>
                  <select
                    value={mealsPerDay}
                    onChange={(e) => setMealsPerDay(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6ECE7] border border-[#EDE0DA] rounded-xl text-xs text-[#3A2E2C] focus:outline-none"
                  >
                    <option value="">Select option</option>
                    <option value="1–2">1–2 meals</option>
                    <option value="3">3 meals</option>
                    <option value="4">4 meals</option>
                    <option value="5+">5+ meals</option>
                    <option value="It varies">It varies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3A2E2C] mb-1.5">
                    Snacking Frequency
                  </label>
                  <select
                    value={snackingFrequency}
                    onChange={(e) => setSnackingFrequency(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6ECE7] border border-[#EDE0DA] rounded-xl text-xs text-[#3A2E2C] focus:outline-none"
                  >
                    <option value="">Select option</option>
                    <option value="Rarely">Rarely</option>
                    <option value="Once a day">Once a day</option>
                    <option value="2–3 times a day">2–3 times a day</option>
                    <option value="Frequently">Frequently</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3A2E2C] mb-1.5">
                    Late Night Eating
                  </label>
                  <select
                    value={lateNightEating}
                    onChange={(e) => setLateNightEating(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6ECE7] border border-[#EDE0DA] rounded-xl text-xs text-[#3A2E2C] focus:outline-none"
                  >
                    <option value="">Select option</option>
                    <option value="Never">Never</option>
                    <option value="Occasionally">Occasionally</option>
                    <option value="Often">Often</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 8: WHERE DO YOU EAT MOST OFTEN */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-[#EDE0DA] pb-2">
                <h2 className="font-display font-bold text-xl text-[#3A2E2C] flex items-center gap-2">
                  <MapPin size={20} className="text-[#C27B66]" />
                  Section 8 &mdash; Where Do You Eat Most Often?
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  'Home-cooked',
                  'College / Office cafeteria',
                  'Restaurant',
                  'Takeout / Food delivery',
                  'A mix of these',
                ].map((loc) => {
                  const isSelected = eatingLocations.includes(loc);
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => toggleItem(eatingLocations, setEatingLocations, loc)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#3A2E2C] text-[#FBF6F3] border-[#3A2E2C]'
                          : 'bg-[#F6ECE7] text-[#3A2E2C]/80 border-[#EDE0DA] hover:bg-[#E8D5CE]'
                      }`}
                    >
                      {isSelected ? <Check size={14} className="text-[#D9A8A0]" /> : <Plus size={14} />}
                      <span>{loc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 9: CUISINE PREFERENCES */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-[#EDE0DA] pb-2">
                <h2 className="font-display font-bold text-xl text-[#3A2E2C] flex items-center gap-2">
                  <Globe size={20} className="text-[#C27B66]" />
                  Section 9 &mdash; Cuisine Preferences
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  'Indian',
                  'South Indian',
                  'North Indian',
                  'Chinese',
                  'Italian',
                  'Mexican',
                  'Middle Eastern',
                  'Japanese',
                  'Korean',
                  'Continental',
                ].map((cuis) => {
                  const isSelected = cuisinePreferences.includes(cuis);
                  return (
                    <button
                      key={cuis}
                      type="button"
                      onClick={() => toggleItem(cuisinePreferences, setCuisinePreferences, cuis)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#C27B66] text-[#FBF6F3] border-[#C27B66]'
                          : 'bg-[#F6ECE7] text-[#3A2E2C]/80 border-[#EDE0DA] hover:bg-[#E8D5CE]'
                      }`}
                    >
                      {isSelected ? <Check size={14} /> : <Plus size={14} />}
                      <span>{cuis}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: DOCTOR INSTRUCTIONS & SAVE */}
        {activeStep === 5 && (
          <div className="space-y-8 animate-fade-in">
            {/* SECTION 10: DOCTOR / DIETITIAN INSTRUCTIONS */}
            <div className="space-y-4">
              <div className="border-b border-[#EDE0DA] pb-2">
                <h2 className="font-display font-bold text-xl text-[#3A2E2C] flex items-center gap-2">
                  <Stethoscope size={20} className="text-[#C27B66]" />
                  Section 10 &mdash; Doctor / Dietitian Instructions
                </h2>
                <p className="text-xs text-[#3A2E2C]/70">
                  Has a doctor or dietitian given you any specific dietary instructions?
                </p>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => setHasDoctorInstructions(true)}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                    hasDoctorInstructions
                      ? 'bg-[#3A2E2C] text-[#FBF6F3] border-[#3A2E2C]'
                      : 'bg-[#F6ECE7] text-[#3A2E2C]/70 border-[#EDE0DA]'
                  }`}
                >
                  Yes &bull; Has Specific Instructions
                </button>
                <button
                  type="button"
                  onClick={() => setHasDoctorInstructions(false)}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                    !hasDoctorInstructions
                      ? 'bg-[#3A2E2C] text-[#FBF6F3] border-[#3A2E2C]'
                      : 'bg-[#F6ECE7] text-[#3A2E2C]/70 border-[#EDE0DA]'
                  }`}
                >
                  No Specific Instructions
                </button>
              </div>

              {hasDoctorInstructions && (
                <div className="space-y-2 pt-2 animate-fade-in">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3A2E2C]">
                    Enter Your Dietary Instructions
                  </label>
                  <textarea
                    rows={4}
                    value={doctorInstructions}
                    onChange={(e) => setDoctorInstructions(e.target.value)}
                    placeholder='Example: "Reduce sodium, avoid highly processed sugars, and keep meal glycemic load under 10."'
                    className="w-full p-4 bg-[#F6ECE7] border border-[#EDE0DA] rounded-xl text-sm text-[#3A2E2C] focus:outline-none focus:ring-2 focus:ring-[#C27B66]/40 placeholder:text-[#3A2E2C]/40"
                  />
                </div>
              )}
            </div>

            {/* Profile Summary Preview Box */}
            <div className="bg-[#F5E6E1]/60 border border-[#EDE0DA] rounded-2xl p-4 text-xs space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-[#3A2E2C] flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#8FA382]" />
                Profile Summary &amp; AI Integration Ready
              </h4>
              <p className="text-[#3A2E2C]/80 leading-relaxed">
                Saving this profile will immediately sync your parameters to Supabase. Every AI food scan, menu evaluation, and chatbot answer will automatically use your personalized clinical context.
              </p>
            </div>
          </div>
        )}

        {/* Action Controls & Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-[#EDE0DA]">
          {activeStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveStep(activeStep - 1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Back
            </Button>
          ) : (
            <div />
          )}

          {activeStep < 5 ? (
            <Button
              type="button"
              variant="primary"
              onClick={() => setActiveStep(activeStep + 1)}
              className="flex items-center gap-2"
            >
              Next Step <ArrowRight size={16} />
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="lg"
              disabled={isSaving}
              onClick={handleSaveProfile}
              className="flex items-center gap-2 px-6"
            >
              {isSaving ? (
                <span>Saving to Supabase...</span>
              ) : savedSuccess ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#8FA382]" /> Profile Saved!
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Save &amp; Enter Dashboard <ArrowRight size={16} />
                </span>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
