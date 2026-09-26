'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { MOCK_FOOD_RESULTS, CURRENT_USER_PROFILE } from '@/lib/mock-data';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AlertCircle, AlertTriangle, HelpCircle, ArrowRight, RefreshCw, CheckCircle2, ChevronLeft, Sparkles, Activity } from 'lucide-react';

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const foodId = (params?.id as string) || 'pad-thai-classic';

  const data = MOCK_FOOD_RESULTS[foodId] || MOCK_FOOD_RESULTS['pad-thai-classic'];

  const getGaugeColor = (v: string) => {
    switch (v) {
      case 'safe':
        return '#8FA382';
      case 'caution':
        return '#C9973E';
      case 'risk':
        return '#9B4A38';
      default:
        return '#A39285';
    }
  };

  const getGaugeScore = (v: string) => {
    switch (v) {
      case 'safe':
        return 94;
      case 'caution':
        return 65;
      case 'risk':
        return 28;
      default:
        return 50;
    }
  };

  const score = getGaugeScore(data.verdict);
  const strokeDashoffset = 125.6 - (125.6 * score) / 100;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Top Back & Action Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#3A2E2C]/70 hover:text-[#C27B66] transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Back to Scan</span>
        </button>

        <div className="flex items-center gap-3">
          <Link href={`/compare-profiles/${foodId}`}>
            <Button variant="outline" size="sm" icon={<Activity size={14} />}>
              Compare Profiles
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge verdict={data.verdict} size="lg" />
          <span className="text-xs uppercase tracking-widest text-[#3A2E2C]/60 font-semibold">
            Clinical Evaluation &bull; Ref #FS-{data.id.substring(0, 6).toUpperCase()}
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#3A2E2C] leading-tight">
          {data.foodName.split(' ')[0]}{' '}
          <span className="italic font-normal text-[#C27B66]">
            {data.foodName.split(' ').slice(1).join(' ')}
          </span>
        </h1>

        <p className="text-sm sm:text-base text-[#3A2E2C]/80 max-w-2xl">
          Screened against <strong className="font-semibold text-[#3A2E2C]">{CURRENT_USER_PROFILE.name}&apos;s</strong> active clinical profile:{' '}
          {CURRENT_USER_PROFILE.conditions.concat(CURRENT_USER_PROFILE.allergies).join(' • ')}.
        </p>
      </div>

      {/* Hero Visual 2-Second Quick Glance Graphic Bar */}
      <Card variant="surface" className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 border-[#EDE0DA]">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 48 48">
              <circle
                className="text-[#E8D5CE]/60"
                cx="24"
                cy="24"
                fill="transparent"
                r="20"
                stroke="currentColor"
                strokeWidth="3"
              />
              <circle
                cx="24"
                cy="24"
                fill="transparent"
                r="20"
                stroke={getGaugeColor(data.verdict)}
                strokeDasharray="125.6"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth="3.5"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-display font-bold text-lg leading-none text-[#3A2E2C]">{score}</span>
              <span className="text-[9px] uppercase tracking-tighter text-[#3A2E2C]/60 font-medium">Score</span>
            </div>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-[#C27B66]">
              {data.verdictTitle}
            </span>
            <p className="text-xs sm:text-sm text-[#3A2E2C]/90 mt-0.5 max-w-md">
              {data.verdictSummary}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-[#EDE0DA]">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-widest text-[#3A2E2C]/60 block font-semibold">
              Biomarkers Checked
            </span>
            <span className="font-semibold text-sm text-[#3A2E2C]">Histamine &bull; Sodium &bull; GL</span>
          </div>
          <div className="h-8 w-px bg-[#EDE0DA] hidden md:block" />
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-widest text-[#3A2E2C]/60 block font-semibold">
              Almanac Verdict
            </span>
            <span className="font-display italic text-base font-bold text-[#C27B66] capitalize">
              {data.verdict}
            </span>
          </div>
        </div>
      </Card>

      {/* Three Diagnostic Cards (Confirmed Risks / Potential Risks / Unknowns) */}
      <div className="space-y-6">
        {/* Card 1: Confirmed Risks */}
        <section className="bg-[#FFFFFF] border border-[#EDE0DA] rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(58,46,44,0.05)] hover:shadow-[0_8px_30px_rgba(58,46,44,0.08)] transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <StatusBadge verdict="risk" label="Confirmed Risk" size="sm" />
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#3A2E2C]">
                Confirmed Risks ({data.confirmedRisks.length})
              </h2>
            </div>
            <span className="text-xs uppercase tracking-wider font-semibold text-[#3A2E2C]/60">
              Physiological Conflicts
            </span>
          </div>

          {data.confirmedRisks.length === 0 ? (
            <div className="p-4 bg-[#8FA382]/10 border border-[#8FA382]/30 rounded-2xl flex items-center gap-3 text-sm text-[#3A4432]">
              <CheckCircle2 size={18} className="text-[#8FA382] shrink-0" />
              <span>Zero confirmed allergen or metabolic risks detected for your active profile!</span>
            </div>
          ) : (
            <div className="space-y-4">
              {data.confirmedRisks.map((risk) => (
                <div key={risk.id} className="p-4 bg-[#FEE9E6] border border-[#9B4A38]/20 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-[#9B4A38] flex items-center gap-2">
                      <AlertCircle size={16} />
                      {risk.title}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#9B4A38]/10 text-[#9B4A38]">
                      Triggers: {risk.affectedConditionOrAllergy}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#3A2E2C]/90 leading-relaxed">
                    {risk.description}
                  </p>
                  <div className="text-[11px] text-[#3A2E2C]/70 pt-1 font-medium">
                    Trigger ingredient: <span className="italic font-semibold">{risk.triggeredBy}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Card 2: Potential Risks */}
        <section className="bg-[#FFFFFF] border border-[#EDE0DA] rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(58,46,44,0.05)] hover:shadow-[0_8px_30px_rgba(58,46,44,0.08)] transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <StatusBadge verdict="caution" label="Potential Risk" size="sm" />
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#3A2E2C]">
                Potential Risks ({data.potentialRisks.length})
              </h2>
            </div>
            <span className="text-xs uppercase tracking-wider font-semibold text-[#3A2E2C]/60">
              Metabolic Advisories
            </span>
          </div>

          {data.potentialRisks.length === 0 ? (
            <p className="text-sm text-[#3A2E2C]/70 italic">No secondary metabolic warnings flagged.</p>
          ) : (
            <div className="space-y-4">
              {data.potentialRisks.map((risk) => (
                <div key={risk.id} className="p-4 bg-[#FFF8EE] border border-[#C9973E]/20 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-[#C9973E] flex items-center gap-2">
                      <AlertTriangle size={16} />
                      {risk.title}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#C9973E]/10 text-[#5C4420]">
                      Advisory: {risk.affectedConditionOrAllergy}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#3A2E2C]/90 leading-relaxed">
                    {risk.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Card 3: Unknowns */}
        <section className="bg-[#FFFFFF] border border-[#EDE0DA] rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(58,46,44,0.05)] hover:shadow-[0_8px_30px_rgba(58,46,44,0.08)] transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <StatusBadge verdict="unknown" label="Unknown" size="sm" />
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#3A2E2C]">
                Unknowns ({data.unknowns.length})
              </h2>
            </div>
            <span className="text-xs uppercase tracking-wider font-semibold text-[#3A2E2C]/60">
              Unverified Kitchen Factors
            </span>
          </div>

          {data.unknowns.length === 0 ? (
            <p className="text-sm text-[#3A2E2C]/70 italic">All ingredients fully verified.</p>
          ) : (
            <div className="space-y-4">
              {data.unknowns.map((unkn) => (
                <div key={unkn.id} className="p-4 bg-[#F5E6E1]/50 border border-[#A39285]/20 rounded-2xl space-y-1.5">
                  <span className="font-bold text-sm text-[#3A2E2C] flex items-center gap-2">
                    <HelpCircle size={16} className="text-[#A39285]" />
                    {unkn.title}
                  </span>
                  <p className="text-xs sm:text-sm text-[#3A2E2C]/80 leading-relaxed">
                    {unkn.description}
                  </p>
                  <div className="text-[11px] text-[#3A2E2C]/60 italic">
                    Reason: {unkn.reason}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Action Footer Button: "Make It More Compatible" */}
      <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F6ECE7] p-6 rounded-3xl border border-[#EDE0DA]">
        <div>
          <h3 className="font-display font-bold text-lg text-[#3A2E2C]">
            Want a 100% compatible version?
          </h3>
          <p className="text-xs sm:text-sm text-[#3A2E2C]/80">
            View ingredient substitutions to eliminate histamine and peanut allergen risks.
          </p>
        </div>

        <Link href={`/compare/${data.reformulation?.id || 'pad-thai-reformulated'}`}>
          <Button
            variant="primary"
            size="lg"
            icon={<Sparkles size={18} className="text-[#D9A8A0]" />}
          >
            Make It More Compatible <ArrowRight size={16} className="ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
