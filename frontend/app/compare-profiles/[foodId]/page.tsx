'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MOCK_PROFILE_COMPARISONS } from '@/lib/mock-data';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Users, ChevronLeft, ShieldCheck, Heart, Sparkles, Activity } from 'lucide-react';

export default function CompareProfilesPage() {
  const params = useParams();
  const foodId = (params?.foodId as string) || 'truffle-risotto';

  const data = MOCK_PROFILE_COMPARISONS[foodId] || MOCK_PROFILE_COMPARISONS['truffle-risotto'];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
      {/* Header Section */}
      <div className="space-y-4 max-w-3xl">
        <Link
          href={`/result/pad-thai-classic`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#3A2E2C]/70 hover:text-[#C27B66] transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Back to Food Analysis</span>
        </Link>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8D5CE]/60 text-[#3A2E2C] text-xs font-bold uppercase tracking-wider">
          <Users size={14} className="text-[#C27B66]" />
          <span>Comparative Cohort Assessment</span>
        </div>

        <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#3A2E2C] tracking-tight">
          One dish. Three unique <span className="italic font-normal text-[#C27B66]">bodies</span>.
        </h1>

        <p className="text-sm sm:text-base text-[#3A2E2C]/80 leading-relaxed">
          Illustrating how individual biochemistry, active sensitivities, and clinical diagnoses alter nutritional safety for the exact same meal.
        </p>
      </div>

      {/* Top Single Food Banner (Shown Once) */}
      <Card variant="surface" className="p-6 sm:p-8 space-y-4 border-[#EDE0DA] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 shadow-inner border border-[#EDE0DA]">
              <img
                src={data.imageUrl}
                alt={data.foodName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C27B66]">
                  Evaluated Food Item
                </span>
                <span className="text-[#EDE0DA]">&bull;</span>
                <span className="text-[10px] uppercase font-bold text-[#3A2E2C]/60">
                  {data.category}
                </span>
              </div>

              <h2 className="font-display font-bold text-2xl text-[#3A2E2C]">
                {data.foodName}
              </h2>

              <p className="text-xs sm:text-sm text-[#3A2E2C]/80 leading-relaxed max-w-xl">
                {data.description}
              </p>
            </div>
          </div>

          <div className="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-[#EDE0DA]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#3A2E2C]/60 block">
              Cohort Analysis
            </span>
            <span className="font-display font-bold text-lg text-[#3A2E2C]">
              3 Parallel Profiles
            </span>
          </div>
        </div>
      </Card>

      {/* Three Profile Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.profiles.map((item, idx) => {
          const isCurrentUser = item.userProfile.id === 'clara-m';
          return (
            <Card
              key={idx}
              variant={isCurrentUser ? 'highlight' : 'surface'}
              className={`p-6 space-y-5 flex flex-col justify-between border transition-all duration-300 hover:shadow-md ${
                isCurrentUser ? 'border-[#D9A8A0] ring-2 ring-[#D9A8A0]/30' : 'border-[#EDE0DA]'
              }`}
            >
              <div className="space-y-4">
                {/* Profile Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.userProfile.avatarUrl}
                      alt={item.userProfile.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-[#D9A8A0]"
                    />
                    <div>
                      <h3 className="font-display font-bold text-base text-[#3A2E2C] flex items-center gap-1.5">
                        {item.userProfile.name}
                        {isCurrentUser && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-[#3A2E2C] text-white">
                            You
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-[#3A2E2C]/70 font-semibold truncate max-w-[150px]">
                        {item.userProfile.conditions.concat(item.userProfile.allergies).slice(0, 2).join(', ')}
                      </p>
                    </div>
                  </div>

                  <StatusBadge verdict={item.verdict} size="sm" />
                </div>

                {/* Verdict Summary */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#C27B66]">
                    Almanac Verdict
                  </span>
                  <p className="font-display font-bold text-base text-[#3A2E2C]">
                    {item.verdictSummary}
                  </p>
                </div>

                {/* Key Reason */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#3A2E2C]/60">
                    Biochemical Rationale
                  </span>
                  <p className="text-xs text-[#3A2E2C]/80 leading-relaxed">
                    {item.keyReason}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {item.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-[#3A2E2C]/80 border border-[#EDE0DA]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#EDE0DA] text-[11px] text-[#3A2E2C]/70 italic">
                {isCurrentUser
                  ? 'Active profile protocol in effect'
                  : `Comparison profile (${item.userProfile.dietType})`}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
