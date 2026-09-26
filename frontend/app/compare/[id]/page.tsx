'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MOCK_REFORMULATION_PAD_THAI, CURRENT_USER_PROFILE } from '@/lib/mock-data';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Sparkles, ArrowRight, CheckCircle, AlertTriangle, ArrowLeftRight, ChevronLeft, ShieldCheck, Heart } from 'lucide-react';

export default function CompareDishPage() {
  const params = useParams();
  const compareId = (params?.id as string) || 'pad-thai-reformulated';

  const data = MOCK_REFORMULATION_PAD_THAI;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
      {/* Top Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <Link
          href={`/result/pad-thai-classic`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#3A2E2C]/70 hover:text-[#C27B66] transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Back to Analysis</span>
        </Link>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8D5CE]/60 text-[#3A2E2C] text-xs font-bold uppercase tracking-widest">
          <Sparkles size={14} className="text-[#C27B66]" />
          <span>Culinary Reformulation &bull; Side-by-Side</span>
        </div>

        <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#3A2E2C] tracking-tight">
          Optimizing your dish for <span className="italic font-normal text-[#C27B66]">harmony</span>.
        </h1>

        <p className="text-sm sm:text-base text-[#3A2E2C]/80 leading-relaxed">
          See how targeted culinary substitutions transform physiological risk into 100% safe nourishment without sacrificing flavor or texture.
        </p>
      </div>

      {/* Active Profile Context Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-[#EDE0DA] shadow-xs">
        <div className="flex items-center gap-2.5 text-xs text-[#3A2E2C]">
          <ShieldCheck size={18} className="text-[#3A4432]" />
          <span>
            Targeted for <strong className="font-bold">{CURRENT_USER_PROFILE.name}</strong>:{' '}
            {CURRENT_USER_PROFILE.conditions.concat(CURRENT_USER_PROFILE.allergies).join(' • ')}
          </span>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C27B66]">
          4 Botanical Swaps Applied
        </span>
      </div>

      {/* Side-by-Side Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left Card: Original Dish */}
        <Card variant="surface" className="p-6 sm:p-8 space-y-6 flex flex-col justify-between border-[#EDE0DA] relative">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-[#3A2E2C]/60 font-bold">
                Baseline Wok Recipe
              </span>
              <StatusBadge verdict={data.originalDish.verdict} size="sm" />
            </div>

            <h2 className="font-display text-2xl font-bold text-[#3A2E2C]">
              {data.originalDish.name}
            </h2>

            <p className="text-xs sm:text-sm text-[#3A2E2C]/80 leading-relaxed">
              {data.originalDish.explanation}
            </p>

            {/* Nutrition metrics */}
            <div className="p-3.5 bg-white/80 rounded-2xl border border-[#EDE0DA] text-xs font-semibold text-[#3A2E2C]/90">
              {data.originalDish.nutritionSummary}
            </div>

            {/* Ingredients */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#3A2E2C]/60">
                Original Ingredients
              </span>
              <div className="flex flex-wrap gap-1.5">
                {data.originalDish.ingredients.map((ing, idx) => {
                  const isRisk = ing.includes('Fish Sauce') || ing.includes('Peanuts') || ing.includes('Palm Sugar');
                  return (
                    <span
                      key={idx}
                      className={`text-xs px-2.5 py-1 rounded-xl border ${
                        isRisk
                          ? 'bg-[#FEE9E6] text-[#9B4A38] border-[#9B4A38]/30 font-bold'
                          : 'bg-white text-[#3A2E2C] border-[#EDE0DA]'
                      }`}
                    >
                      {ing}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#FEE9E6]/60 border border-[#9B4A38]/20 rounded-2xl text-xs text-[#9B4A38] space-y-1">
            <span className="font-bold block">Pathophysiological Risk:</span>
            <p className="leading-relaxed">
              Fermented anchovy produces a heavy histamine spike while crushed peanuts trigger direct nut allergy symptoms.
            </p>
          </div>
        </Card>

        {/* Right Card: Modified Compatible Dish */}
        <Card variant="highlight" className="p-6 sm:p-8 space-y-6 flex flex-col justify-between border-[#D9A8A0]/60 relative shadow-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-[#3A4432] font-bold flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#8FA382]" />
                Swaahara Bio-Optimized
              </span>
              <StatusBadge verdict={data.modifiedDish.verdict} size="sm" />
            </div>

            <h2 className="font-display text-2xl font-bold text-[#3A2E2C]">
              {data.modifiedDish.name}
            </h2>

            <p className="text-xs sm:text-sm text-[#3A2E2C]/90 leading-relaxed font-medium">
              {data.modifiedDish.explanation}
            </p>

            {/* Nutrition metrics */}
            <div className="p-3.5 bg-[#8FA382]/20 rounded-2xl border border-[#8FA382]/40 text-xs font-bold text-[#3A4432]">
              {data.modifiedDish.nutritionSummary}
            </div>

            {/* Targeted Changes list */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#3A2E2C]">
                Culinary Substitutions &amp; Impact
              </span>
              <div className="space-y-2">
                {data.modifiedDish.changesMade?.map((change, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white border border-[#D9A8A0]/40 text-xs text-[#3A2E2C] flex items-start gap-2 shadow-2xs"
                  >
                    <CheckCircle size={16} className="text-[#8FA382] shrink-0 mt-0.5" />
                    <span>{change}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#D9A8A0]/30">
            <div className="text-xs font-semibold text-[#3A4432]">
              100% Compatible with Clara M.&apos;s Profile
            </div>
            <Link href="/plan">
              <Button variant="primary" size="sm" icon={<Heart size={14} />}>
                Add to Weekly Table
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
