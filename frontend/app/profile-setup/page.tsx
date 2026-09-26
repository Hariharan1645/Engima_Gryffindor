'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CURRENT_USER_PROFILE } from '@/lib/mock-data';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  ShieldCheck,
  Check,
  Plus,
  Upload,
  FileText,
  User,
  Activity,
  Heart,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function ProfileSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form states initialized with Clara M.'s active profile
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    CURRENT_USER_PROFILE.conditions
  );
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(
    CURRENT_USER_PROFILE.allergies
  );
  const [dietType, setDietType] = useState<string>(CURRENT_USER_PROFILE.dietType);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    CURRENT_USER_PROFILE.goals
  );
  const [doctorNoteFile, setDoctorNoteFile] = useState<string | null>(
    CURRENT_USER_PROFILE.doctorNoteFileName || null
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const availableConditions = [
    'Type 2 Diabetes',
    'Hypertension',
    'Histamine Intolerance',
    'GERD / Acid Reflux',
    'Celiac Disease',
    'IBS (Irritable Bowel Syndrome)',
    'CKD Stage 2 (Kidney Guard)',
  ];

  const availableAllergies = [
    'Tree Nut Allergy',
    'Shellfish',
    'Peanuts',
    'Dairy (Casein / Whey)',
    'Soy Proteins',
    'Sesame & Tahini',
    'Gluten',
  ];

  const availableDietTypes = [
    'Botanical Clinical Low-Histamine & Glycemic Guard',
    'Mediterranean & Low Histamine',
    'Strict Keto & Gluten-Free',
    'Low FODMAP & Renal Guard',
    'Whole Food Plant-Based',
  ];

  const availableGoals = [
    'Blood Sugar Stability (GL ≤ 10)',
    'Low Sodium (<400mg/meal)',
    'Zero Allergen Cross-Traces',
    'Anti-Inflammatory Gut Healing',
    'Ketosis Maintenance',
  ];

  const toggleCondition = (item: string) => {
    if (selectedConditions.includes(item)) {
      setSelectedConditions(selectedConditions.filter((c) => c !== item));
    } else {
      setSelectedConditions([...selectedConditions, item]);
    }
  };

  const toggleAllergy = (item: string) => {
    if (selectedAllergies.includes(item)) {
      setSelectedAllergies(selectedAllergies.filter((a) => a !== item));
    } else {
      setSelectedAllergies([...selectedAllergies, item]);
    }
  };

  const toggleGoal = (item: string) => {
    if (selectedGoals.includes(item)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== item));
    } else {
      setSelectedGoals([...selectedGoals, item]);
    }
  };

  const handleSimulateUpload = () => {
    setDoctorNoteFile('dr_endocrinology_eval_2026.pdf');
  };

  const handleSaveProfile = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      router.push('/scan');
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Multi-step Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                step === i
                  ? 'w-10 bg-[#3A2E2C]'
                  : step > i
                  ? 'w-6 bg-[#8FA382]'
                  : 'w-6 bg-[#EDE0DA]'
              }`}
            />
          ))}
        </div>

        <div className="text-xs uppercase tracking-widest font-semibold text-[#3A2E2C]/70">
          Step 0{step} / <span className="text-[#C27B66] italic font-display">Clinical Profile</span>
        </div>
      </div>

      {/* Editorial Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8D5CE]/60 text-[#3A2E2C] text-xs font-bold uppercase tracking-wider">
          <User size={14} className="text-[#C27B66]" />
          <span>Tactile Clinical Intake &bull; {CURRENT_USER_PROFILE.name}</span>
        </div>

        <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#3A2E2C] tracking-tight">
          Tell us what your body needs to <span className="italic font-normal text-[#C27B66]">flourish</span>.
        </h1>

        <p className="text-sm sm:text-base text-[#3A2E2C]/80">
          Swaahara screens ingredients, culinary additives, and cooking methods against your clinical sensitivities and physician directives.
        </p>
      </div>

      {/* Step Content Card */}
      <Card variant="surface" className="p-6 sm:p-10 space-y-8 border-[#EDE0DA] relative">
        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-[#EDE0DA] pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#C27B66] uppercase tracking-wider">
                  Section 01
                </span>
                <h2 className="font-display font-bold text-xl text-[#3A2E2C]">
                  Medical Conditions &amp; Metabolic Flags
                </h2>
              </div>
              <span className="text-xs font-semibold text-[#3A2E2C]/60">
                {selectedConditions.length} selected
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {availableConditions.map((item) => {
                const isSelected = selectedConditions.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleCondition(item)}
                    className={`px-4 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-[#3A2E2C] text-[#FBF6F3] shadow-sm'
                        : 'bg-white text-[#3A2E2C] border border-[#EDE0DA] hover:border-[#C27B66]'
                    }`}
                  >
                    {isSelected ? <Check size={14} className="text-[#D9A8A0]" /> : <Plus size={14} />}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="border-b border-[#EDE0DA] pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#C27B66] uppercase tracking-wider">
                  Section 02
                </span>
                <h2 className="font-display font-bold text-xl text-[#3A2E2C]">
                  Immunological &amp; Severe Allergies
                </h2>
              </div>
              <span className="text-xs font-semibold text-[#3A2E2C]/60">
                {selectedAllergies.length} selected
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {availableAllergies.map((item) => {
                const isSelected = selectedAllergies.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAllergy(item)}
                    className={`px-4 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-[#9B4A38] text-[#FBF6F3] shadow-sm'
                        : 'bg-white text-[#3A2E2C] border border-[#EDE0DA] hover:border-[#C27B66]'
                    }`}
                  >
                    {isSelected ? <Check size={14} className="text-[#FBF6F3]" /> : <Plus size={14} />}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="border-b border-[#EDE0DA] pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#C27B66] uppercase tracking-wider">
                  Section 03
                </span>
                <h2 className="font-display font-bold text-xl text-[#3A2E2C]">
                  Diet Type &amp; Botanical Framework
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              {availableDietTypes.map((type) => {
                const isSelected = dietType === type;
                return (
                  <div
                    key={type}
                    onClick={() => setDietType(type)}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#3A2E2C] text-[#FBF6F3] border-[#3A2E2C] shadow-sm'
                        : 'bg-white text-[#3A2E2C] border-[#EDE0DA] hover:border-[#C27B66]'
                    }`}
                  >
                    <span className="font-bold text-sm">{type}</span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                        isSelected
                          ? 'bg-[#C27B66] border-[#C27B66] text-white'
                          : 'border-[#EDE0DA] bg-[#F6ECE7]'
                      }`}
                    >
                      {isSelected && <Check size={14} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8">
            <div className="border-b border-[#EDE0DA] pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#C27B66] uppercase tracking-wider">
                  Section 04
                </span>
                <h2 className="font-display font-bold text-xl text-[#3A2E2C]">
                  Goals &amp; Doctor&apos;s Directives Upload
                </h2>
              </div>
            </div>

            {/* Goals selection */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3A2E2C]/70">
                Target Biomarkers &amp; Nutritional Goals
              </span>
              <div className="flex flex-wrap gap-2">
                {availableGoals.map((goal) => {
                  const isSelected = selectedGoals.includes(goal);
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleGoal(goal)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#8FA382] text-[#3A4432] font-bold'
                          : 'bg-white text-[#3A2E2C] border border-[#EDE0DA]'
                      }`}
                    >
                      {isSelected && <Check size={12} />}
                      <span>{goal}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Doctor's note upload section */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3A2E2C]/70">
                Physician Evaluation Upload (Optional)
              </span>

              {doctorNoteFile ? (
                <div className="p-4 bg-[#8FA382]/20 border border-[#8FA382]/40 rounded-2xl flex items-center justify-between text-xs text-[#3A4432]">
                  <div className="flex items-center gap-2.5 font-bold">
                    <FileText size={18} className="text-[#3A4432]" />
                    <span>Uploaded: {doctorNoteFile}</span>
                  </div>
                  <span className="bg-[#8FA382] text-white px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold">
                    Verified Active
                  </span>
                </div>
              ) : (
                <div
                  onClick={handleSimulateUpload}
                  className="border-2 border-dashed border-[#D9A8A0] rounded-2xl p-6 text-center space-y-2 bg-[#F5E6E1]/40 hover:bg-[#F5E6E1] transition-colors cursor-pointer"
                >
                  <Upload size={24} className="text-[#C27B66] mx-auto" />
                  <p className="text-xs font-bold text-[#3A2E2C]">
                    Click to attach Doctor&apos;s Note or Clinical Assessment (PDF/Scan)
                  </p>
                  <p className="text-[11px] text-[#3A2E2C]/60">
                    Mock upload mode &bull; No real file storage required
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-[#EDE0DA]">
          {step > 1 ? (
            <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
              &larr; Previous Step
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button variant="primary" size="md" onClick={() => setStep(step + 1)}>
              Next Step &rarr;
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handleSaveProfile}
              icon={savedSuccess ? <CheckCircle2 size={18} /> : <Sparkles size={18} />}
            >
              {savedSuccess ? 'Profile Saved!' : 'Save Clinical Profile'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
