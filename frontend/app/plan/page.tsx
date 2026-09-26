'use client';

import React, { useState } from 'react';
import { MOCK_WEEKLY_PLAN, CURRENT_USER_PROFILE } from '@/lib/mock-data';
import { DayPlan, MealPlanCard } from '@/lib/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CalendarDays, Clock, Utensils, CheckCircle2, X, ChevronRight, Sparkles, BookOpen } from 'lucide-react';

export default function WeeklyPlanPage() {
  const plan = MOCK_WEEKLY_PLAN;
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [selectedMeal, setSelectedMeal] = useState<MealPlanCard | null>(null);

  const activeDay: DayPlan = plan.days[selectedDayIndex] || plan.days[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8D5CE]/60 text-[#3A2E2C] text-xs font-bold uppercase tracking-wider">
          <CalendarDays size={14} className="text-[#C27B66]" />
          <span>Protocol Schedule &bull; Vol. IV</span>
        </div>

        <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#3A2E2C] tracking-tight">
          Your Weekly <span className="italic font-normal text-[#C27B66]">Table</span>
        </h1>

        <p className="text-sm sm:text-base text-[#3A2E2C]/80 max-w-2xl">
          A balanced cadence of nourishing meals engineered for blood sugar stability (GL &le; 10), zero allergens, and low sodium for{' '}
          <strong className="font-semibold text-[#3A2E2C]">{CURRENT_USER_PROFILE.name}</strong>.
        </p>
      </div>

      {/* Day Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {plan.days.map((dayPlan: DayPlan, idx: number) => {
          const isActive = selectedDayIndex === idx;
          return (
            <button
              key={dayPlan.day}
              onClick={() => setSelectedDayIndex(idx)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[#3A2E2C] text-white shadow-md scale-[1.02]'
                  : 'bg-white text-[#3A2E2C]/80 border border-[#EDE0DA] hover:bg-[#F5E6E1]'
              }`}
            >
              <span>{dayPlan.day}</span>
              <span className={`ml-1 text-[10px] font-normal ${isActive ? 'text-[#D9A8A0]' : 'text-[#3A2E2C]/60'}`}>
                ({dayPlan.dateLabel})
              </span>
            </button>
          );
        })}
      </div>

      {/* Botanical Sync Banner */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-[#EDE0DA] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#8FA382]/20 flex items-center justify-center text-[#3A4432] shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h2 className="font-display font-bold text-base text-[#3A2E2C]">
              Histamine &amp; Glycemic Synchrony Verified
            </h2>
            <p className="text-xs text-[#3A2E2C]/70">
              {activeDay.meals.length} repasts assembled for zero postprandial glucose spike.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#8FA382] text-[#3A4432]">
          100% Safe Sequence
        </span>
      </div>

      {/* Meals Grid */}
      <div className="space-y-4">
        {activeDay.meals.map((meal) => (
          <Card
            key={meal.id}
            variant="surface"
            className="p-6 transition-all duration-300 hover:shadow-md border-[#EDE0DA] group cursor-pointer"
            onClick={() => setSelectedMeal(meal)}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#C27B66]">
                    {meal.mealType} &bull; {meal.prepTime}
                  </span>
                  <StatusBadge verdict={meal.verdict} size="sm" />
                </div>

                <h3 className="font-display font-bold text-lg sm:text-xl text-[#3A2E2C] group-hover:text-[#C27B66] transition-colors">
                  {meal.recipeTitle}
                </h3>

                {/* Highlights */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {meal.highlights.map((h, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-[#3A2E2C]/80 border border-[#EDE0DA]"
                    >
                      {h}
                    </span>
                  ))}
                </div>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#C27B66] group-hover:underline">
                    <span>View Recipe &amp; Prep Notes</span>
                    <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recipe Modal */}
      {selectedMeal && (
        <div className="fixed inset-0 z-50 bg-[#3A2E2C]/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FBF6F3] border border-[#EDE0DA] rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setSelectedMeal(null)}
              className="absolute top-6 right-6 text-[#3A2E2C]/60 hover:text-[#3A2E2C] cursor-pointer"
            >
              <X size={22} />
            </button>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#C27B66]">
                <BookOpen size={16} />
                <span>{selectedMeal.mealType} Recipe</span>
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#3A2E2C]">
                {selectedMeal.recipe.title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-[#3A2E2C]/70">
                <span className="flex items-center gap-1 font-semibold">
                  <Clock size={14} /> {selectedMeal.recipe.prepTime}
                </span>
                <span>&bull;</span>
                <span className="font-semibold">{selectedMeal.recipe.servings} Servings</span>
              </div>
            </div>

            {/* Compatibility Note */}
            <div className="p-4 bg-[#8FA382]/20 border border-[#8FA382]/40 rounded-2xl text-xs text-[#3A4432] space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                Almanac Clinical Alignment:
              </span>
              <p className="leading-relaxed">{selectedMeal.recipe.compatibilityNotes}</p>
            </div>

            {/* Ingredients */}
            <div className="space-y-2">
              <h3 className="font-display font-bold text-base text-[#3A2E2C]">
                Ingredients
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#3A2E2C]/90">
                {selectedMeal.recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-[#EDE0DA]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C27B66]" />
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <h3 className="font-display font-bold text-base text-[#3A2E2C]">
                Preparation Instructions
              </h3>
              <ol className="space-y-2 text-xs text-[#3A2E2C]/90 list-decimal list-inside">
                {selectedMeal.recipe.instructions.map((inst, i) => (
                  <li key={i} className="bg-white p-3 rounded-xl border border-[#EDE0DA] leading-relaxed">
                    {inst}
                  </li>
                ))}
              </ol>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setSelectedMeal(null)}>
                Close Recipe
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
