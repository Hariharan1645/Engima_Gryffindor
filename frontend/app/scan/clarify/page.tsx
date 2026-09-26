'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_CLARIFICATION_QUESTION } from '@/lib/mock-data';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { HelpCircle, Check, ArrowRight, ShieldCheck, Utensils } from 'lucide-react';

export default function ClarifyPage() {
  const router = useRouter();
  const q = MOCK_CLARIFICATION_QUESTION;
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const handleSelectOption = (optId: string) => {
    setSelectedOptionId(optId);
  };

  const handleContinue = () => {
    const selected = q.options.find((o) => o.id === selectedOptionId);
    const targetId = selected ? selected.targetResultId : 'pad-thai-classic';
    router.push(`/result/${targetId}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-8">
      {/* Evaluation Progress Indicator */}
      <div className="flex items-center justify-between text-xs uppercase tracking-widest font-semibold text-[#3A2E2C]/70">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C27B66] animate-pulse" />
          Evaluation In Progress
        </span>
        <span>Question 1 of 1</span>
      </div>

      {/* Editorial Clarification Card */}
      <Card variant="surface" className="p-6 sm:p-10 space-y-6 shadow-xl border-[#EDE0DA] relative">
        {/* Context Tag Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-[#3A2E2C] border border-[#EDE0DA] text-xs font-semibold uppercase tracking-wider">
          <Utensils size={14} className="text-[#C27B66]" />
          <span>Quick Clarification &bull; {q.foodName}</span>
        </div>

        {/* Question Headline */}
        <h1 className="font-display text-2xl sm:text-4xl font-bold text-[#3A2E2C] leading-tight">
          {q.question.split('or')[0]}
          or <span className="italic font-normal text-[#C27B66]">coconut aminos</span>?
        </h1>

        {/* Subtext */}
        <p className="text-sm sm:text-base text-[#3A2E2C]/80 leading-relaxed">
          {q.subtext}
        </p>

        {/* Answer Options */}
        <div className="space-y-3 pt-2">
          {q.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`group p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#3A2E2C] text-[#FBF6F3] border-[#3A2E2C] shadow-md scale-[1.01]'
                    : 'bg-white text-[#3A2E2C] border-[#EDE0DA] hover:bg-[#F5E6E1] hover:border-[#D9A8A0]'
                }`}
              >
                <div className="space-y-1">
                  <div className="font-bold text-sm sm:text-base flex items-center gap-2">
                    <span>{opt.label}</span>
                  </div>
                  <p
                    className={`text-xs ${
                      isSelected ? 'text-[#E8D5CE]' : 'text-[#3A2E2C]/70'
                    }`}
                  >
                    {opt.details}
                  </p>
                </div>

                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                    isSelected
                      ? 'bg-[#C27B66] border-[#C27B66] text-white'
                      : 'border-[#EDE0DA] bg-[#F6ECE7] text-transparent group-hover:border-[#C27B66]'
                  }`}
                >
                  <Check size={16} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#EDE0DA]">
          <button
            onClick={() => {
              setSelectedOptionId('opt-unknown');
            }}
            className="text-xs text-[#3A2E2C]/70 hover:text-[#C27B66] underline underline-offset-4 cursor-pointer"
          >
            I&apos;m not sure — assume standard wok recipe
          </button>

          <Button
            variant="primary"
            size="md"
            disabled={!selectedOptionId}
            onClick={handleContinue}
            icon={<ArrowRight size={16} />}
          >
            Analyze Safety
          </Button>
        </div>
      </Card>

      {/* Clinical Callout */}
      <div className="p-4 rounded-2xl bg-[#F6ECE7] border border-[#EDE0DA] flex items-start gap-3 text-xs text-[#3A2E2C]/80">
        <ShieldCheck size={18} className="text-[#3A4432] shrink-0 mt-0.5" />
        <p>
          <strong className="font-semibold text-[#3A2E2C]">Why this matters:</strong> Swaahara cross-examines biogenic amines and hidden sweeteners against Clara M.&apos;s active histamine and reactive glucose parameters.
        </p>
      </div>
    </div>
  );
}
