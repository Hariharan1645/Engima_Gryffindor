'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { CURRENT_USER_PROFILE, MOCK_FOOD_RESULTS, MOCK_REFORMULATION_PAD_THAI } from '@/lib/mock-data';
import { SafetyVerdict, FoodAnalysisResult, MealPlanCard } from '@/lib/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Send,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Bot,
  User,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Clock,
  ShieldCheck,
  ChevronRight,
  Utensils,
  X,
  FileText,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text?: string;
  imageUrl?: string;
  analysisData?: FoodAnalysisResult;
  followUpQuestion?: {
    question: string;
    subtext: string;
    options: { id: string; label: string; details: string; targetResultId: string }[];
  };
  followUpAnswered?: string;
  recipeOffer?: boolean;
  recipeData?: any;
}

export default function ScanChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(
    'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&q=80&w=800'
  );
  const [selectedImageName, setSelectedImageName] = useState('pad_thai_sample.jpg');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset sample food items for quick demo selection
  const sampleFoods = [
    {
      name: 'Artisanal Tamarind Pad Thai',
      url: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&q=80&w=800',
      fileName: 'pad_thai_wok.jpg',
      prompt: 'I am about to order this Tamarind Pad Thai. Is it safe for my Type 2 Diabetes, Tree Nut Allergy, and Histamine Intolerance?',
      resultKey: 'pad-thai-classic',
    },
    {
      name: 'Steamed Wild Salmon Bowl',
      url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800',
      fileName: 'salmon_asparagus.jpg',
      prompt: 'Will this Steamed Wild Salmon & Asparagus Bowl spike my blood sugar or sodium limit?',
      resultKey: 'wild-salmon-bowl',
    },
    {
      name: 'Truffle & Mushroom Risotto',
      url: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&q=80&w=800',
      fileName: 'truffle_risotto.jpg',
      prompt: 'Check if this Truffle Risotto has high histamine aged cheeses or high glycemic white rice.',
      resultKey: 'wild-mushroom-risotto',
    },
  ];

  const handleSelectSample = (sample: typeof sampleFoods[0]) => {
    setSelectedImage(sample.url);
    setSelectedImageName(sample.fileName);
    setInputText(sample.prompt);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImageName(file.name);
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleSubmitAnalysis = (promptText?: string, imageOverride?: string, resultKeyOverride?: string) => {
    const textToSend = promptText || inputText || 'Analyze this dish against my clinical profile.';
    const imageToSend = imageOverride || selectedImage;

    if (!textToSend && !imageToSend) return;

    // 1. Add User Message
    const userMsgId = `user-${Date.now()}`;
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: textToSend,
      imageUrl: imageToSend || undefined,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputText('');
    setIsAnalyzing(true);

    // 2. Simulate LLM & OCR scanning response after 1 second delay
    setTimeout(() => {
      const matchedKey = resultKeyOverride || 'pad-thai-classic';
      const analysis = MOCK_FOOD_RESULTS[matchedKey] || MOCK_FOOD_RESULTS['pad-thai-classic'];

      const assistantMsgId = `assistant-${Date.now()}`;
      const newAssistantMsg: ChatMessage = {
        id: assistantMsgId,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        analysisData: analysis,
        text: `I've analyzed your food scan and cross-examined the ingredients against Clara M.'s active profile (${CURRENT_USER_PROFILE.conditions.concat(CURRENT_USER_PROFILE.allergies).join(' • ')}).`,
        followUpQuestion: matchedKey.includes('pad-thai')
          ? {
              question: 'Did the kitchen use fermented fish sauce or coconut aminos in the tamarind glaze?',
              subtext: 'Fermented anchovy sauce poses a high histamine spike for your profile, whereas organic coconut aminos is 100% safe.',
              options: [
                {
                  id: 'opt-fish-sauce',
                  label: 'Fermented Fish Sauce (Traditional)',
                  details: 'High Histamine Intolerance risk + high sodium',
                  targetResultId: 'pad-thai-classic',
                },
                {
                  id: 'opt-coconut-aminos',
                  label: 'Organic Coconut Aminos & Lime',
                  details: 'Eliminates histamine trigger, 65% lower sodium',
                  targetResultId: 'pad-thai-reformulated-safe',
                },
                {
                  id: 'opt-unknown',
                  label: 'Not sure / Kitchen Default',
                  details: 'Evaluates conservatively based on traditional recipe',
                  targetResultId: 'pad-thai-classic',
                },
              ],
            }
          : undefined,
      };

      setMessages((prev) => [...prev, newAssistantMsg]);
      setIsAnalyzing(false);
    }, 1200);
  };

  const handleSelectFollowUp = (msgId: string, option: { id: string; label: string; details: string; targetResultId: string }) => {
    // 1. Mark answer on existing message
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, followUpAnswered: option.label } : m))
    );

    // 2. User selection turn
    const userAnsMsg: ChatMessage = {
      id: `user-ans-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Kitchen prep selected: ${option.label}`,
    };

    setMessages((prev) => [...prev, userAnsMsg]);
    setIsAnalyzing(true);

    // 3. AI follow-up response turn
    setTimeout(() => {
      const isSafeOption = option.id === 'opt-coconut-aminos';
      const updatedResult = isSafeOption
        ? MOCK_FOOD_RESULTS['pad-thai-reformulated-safe']
        : MOCK_FOOD_RESULTS['pad-thai-classic'];

      const aiResponseMsg: ChatMessage = {
        id: `ai-resp-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: isSafeOption
          ? 'Great choice! Swapping fermented fish sauce for organic coconut aminos reduces the Histamine Index from Level 4 to Level 1 and drops sodium by 65%. Your dish is now 100% compatible!'
          : 'Understood. Using traditional fermented fish sauce maintains the high histamine and sodium risk flags for your profile.',
        analysisData: updatedResult,
        recipeOffer: true,
      };

      setMessages((prev) => [...prev, aiResponseMsg]);
      setIsAnalyzing(false);
    }, 1000);
  };

  const handleGenerateRecipe = (msgId: string) => {
    setIsAnalyzing(true);

    setTimeout(() => {
      const recipeMsg: ChatMessage = {
        id: `recipe-msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Here is your customized, bio-compatible recipe variant engineered specifically for Clara M.’s metabolic target (GL ≤ 10) and nut-allergy safety:',
        recipeData: {
          title: 'Swaahara Botanical Tamarind Pad Thai',
          prepTime: '20 mins',
          servings: 2,
          highlights: ['GL: 7 (Low)', 'Sodium: 260mg', 'Nut-Free', 'Histamine Level 1'],
          ingredients: [
            '1 package Kelp & Rice Noodle Blend',
            '2 tbsp Organic Coconut Aminos',
            '1 tbsp Fresh Tamarind Puree',
            '1/4 cup Toasted Pumpkin Seeds (replaces peanuts)',
            '1/2 tsp Monk Fruit Extract',
            '2 Organic Eggs',
            '1 cup Fresh Bean Sprouts',
          ],
          instructions: [
            'Sauté kelp noodles in coconut aminos and tamarind puree over medium wok heat for 4 minutes.',
            'Push noodles aside, scramble eggs, and mix in bean sprouts.',
            'Top with toasted pumpkin seeds and serve with a fresh lime wedge.',
          ],
        },
      };

      setMessages((prev) => [...prev, recipeMsg]);
      setIsAnalyzing(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6 flex flex-col min-h-[calc(100vh-6rem)]">
      {/* Active Profile Screening Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-[#EDE0DA] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#E8D5CE] flex items-center justify-center text-[#3A2E2C] shrink-0">
            <Bot size={18} className="text-[#C27B66]" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C27B66] block">
              Swaahara AI Clinical Assistant
            </span>
            <span className="text-xs font-semibold text-[#3A2E2C]">
              Screening for <strong className="font-bold">{CURRENT_USER_PROFILE.name}</strong>:{' '}
              {CURRENT_USER_PROFILE.conditions.concat(CURRENT_USER_PROFILE.allergies).join(' • ')}
            </span>
          </div>
        </div>

        <Link
          href="/profile-setup"
          className="text-xs font-bold uppercase tracking-wider text-[#C27B66] hover:underline shrink-0"
        >
          Edit Profile &rarr;
        </Link>
      </div>

      {/* Main Chat Stream Container */}
      <div className="flex-1 space-y-6 pb-24">
        {messages.length === 0 ? (
          /* Initial Hero Prompt & Image Upload Canvas */
          <div className="py-8 space-y-8 text-center max-w-2xl mx-auto animate-in fade-in duration-500">
            <div className="w-20 h-28 rounded-t-full rounded-b-2xl bg-[#F5E6E1] border border-[#EDE0DA] shadow-md flex items-center justify-center mx-auto">
              <Utensils size={36} className="text-[#C27B66]" />
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#3A2E2C]/70">
                <span className="w-2 h-2 rounded-full bg-[#C27B66] animate-ping" />
                <span>Conversational Food Safety Analysis</span>
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#3A2E2C] tracking-tight leading-tight">
                Upload your dish &amp; ask <span className="italic font-normal text-[#C27B66]">Swaahara AI</span>.
              </h1>
              <p className="text-sm text-[#3A2E2C]/80">
                Upload a food photo, package label, or menu dish. Tell the AI what you need to know and receive instant clinical analysis and follow-up guidance.
              </p>
            </div>

            {/* Quick Demo Sample Selector */}
            <div className="space-y-3 pt-2">
              <span className="text-xs uppercase tracking-wider font-bold text-[#3A2E2C]/60 block">
                Try a sample dish prompt:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                {sampleFoods.map((sample, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSample(sample)}
                    className="p-3.5 rounded-2xl bg-white border border-[#EDE0DA] hover:border-[#C27B66] hover:shadow-md transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="h-28 rounded-xl overflow-hidden bg-[#F5E6E1]">
                      <img src={sample.url} alt={sample.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <p className="font-display font-bold text-xs text-[#3A2E2C] group-hover:text-[#C27B66]">
                      {sample.name}
                    </p>
                    <p className="text-[11px] text-[#3A2E2C]/70 line-clamp-2">
                      &quot;{sample.prompt}&quot;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Active Chat Stream Messages */
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-9 h-9 rounded-full bg-[#E8D5CE] flex items-center justify-center text-[#3A2E2C] shrink-0 shadow-xs">
                    <Bot size={18} className="text-[#C27B66]" />
                  </div>
                )}

                <div
                  className={`max-w-2xl space-y-3 ${
                    msg.sender === 'user'
                      ? 'bg-[#3A2E2C] text-[#FBF6F3] p-4 sm:p-5 rounded-3xl rounded-tr-none shadow-md'
                      : 'w-full space-y-4'
                  }`}
                >
                  {/* User attached image */}
                  {msg.imageUrl && (
                    <div className="w-48 h-36 rounded-2xl overflow-hidden border border-white/20 shadow-sm">
                      <img src={msg.imageUrl} alt="Uploaded food" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Message Text */}
                  {msg.text && (
                    <p className={`text-sm sm:text-base leading-relaxed ${msg.sender === 'user' ? 'text-[#FBF6F3]' : 'text-[#3A2E2C]'}`}>
                      {msg.text}
                    </p>
                  )}

                  {/* AI Structured Analysis Result Card */}
                  {msg.analysisData && (
                    <Card variant="surface" className="p-5 sm:p-6 space-y-5 border-[#EDE0DA] shadow-md">
                      {/* Verdict Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDE0DA] pb-3">
                        <div className="flex items-center gap-2.5">
                          <StatusBadge verdict={msg.analysisData.verdict} size="md" />
                          <h3 className="font-display font-bold text-lg text-[#3A2E2C]">
                            {msg.analysisData.foodName}
                          </h3>
                        </div>
                        <span className="text-xs uppercase font-bold text-[#C27B66]">
                          {msg.analysisData.verdictTitle}
                        </span>
                      </div>

                      {/* Verdict Summary */}
                      <p className="text-xs sm:text-sm text-[#3A2E2C]/90 leading-relaxed font-medium">
                        {msg.analysisData.verdictSummary}
                      </p>

                      {/* Confirmed Risks */}
                      {msg.analysisData.confirmedRisks.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#9B4A38] flex items-center gap-1.5">
                            <AlertCircle size={14} />
                            Confirmed Risks ({msg.analysisData.confirmedRisks.length})
                          </span>
                          <div className="space-y-2">
                            {msg.analysisData.confirmedRisks.map((risk) => (
                              <div
                                key={risk.id}
                                className="p-3 bg-[#FEE9E6] border border-[#9B4A38]/20 rounded-xl text-xs space-y-0.5"
                              >
                                <span className="font-bold text-[#9B4A38] block">{risk.title}</span>
                                <p className="text-[#3A2E2C]/80">{risk.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Links */}
                      <div className="pt-2 flex items-center justify-between gap-3 text-xs border-t border-[#EDE0DA]">
                        <Link
                          href={`/result/${msg.analysisData.id}`}
                          className="font-bold text-[#C27B66] hover:underline uppercase tracking-wider flex items-center gap-1"
                        >
                          View Full Diagnostic Page &rarr;
                        </Link>
                        <Link
                          href={`/compare/${msg.analysisData.reformulation?.id || 'pad-thai-reformulated'}`}
                          className="font-bold text-[#3A2E2C] hover:underline uppercase tracking-wider flex items-center gap-1"
                        >
                          Compare Side-by-Side &rarr;
                        </Link>
                      </div>
                    </Card>
                  )}

                  {/* Interactive Follow-Up Question Chips */}
                  {msg.followUpQuestion && !msg.followUpAnswered && (
                    <Card variant="highlight" className="p-5 space-y-4 border-[#D9A8A0]/60 shadow-sm">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#C27B66] flex items-center gap-1">
                          <HelpCircle size={14} />
                          AI Follow-up Question
                        </span>
                        <h4 className="font-display font-bold text-base text-[#3A2E2C]">
                          {msg.followUpQuestion.question}
                        </h4>
                        <p className="text-xs text-[#3A2E2C]/80">
                          {msg.followUpQuestion.subtext}
                        </p>
                      </div>

                      <div className="space-y-2 pt-1">
                        {msg.followUpQuestion.options.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectFollowUp(msg.id, opt)}
                            className="w-full text-left p-3.5 rounded-2xl bg-white border border-[#EDE0DA] hover:border-[#C27B66] hover:bg-[#F5E6E1] transition-all cursor-pointer flex items-center justify-between group"
                          >
                            <div>
                              <span className="font-bold text-xs sm:text-sm text-[#3A2E2C] group-hover:text-[#C27B66] block">
                                {opt.label}
                              </span>
                              <span className="text-[11px] text-[#3A2E2C]/70">
                                {opt.details}
                              </span>
                            </div>
                            <ChevronRight size={16} className="text-[#C27B66] group-hover:translate-x-1 transition-transform" />
                          </button>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Recipe Proposal Button */}
                  {msg.recipeOffer && !messages.some((m) => m.recipeData) && (
                    <div className="pt-2">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => handleGenerateRecipe(msg.id)}
                        icon={<Sparkles size={16} className="text-[#D9A8A0]" />}
                      >
                        Generate Compatible Recipe Variant &rarr;
                      </Button>
                    </div>
                  )}

                  {/* Inline Recipe Card */}
                  {msg.recipeData && (
                    <Card variant="surface" className="p-6 space-y-4 border-[#8FA382]/40 bg-white shadow-md">
                      <div className="flex items-center justify-between border-b border-[#EDE0DA] pb-3">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3A4432]">
                          <BookOpen size={16} className="text-[#8FA382]" />
                          <span>Bio-Compatible Recipe Proposal</span>
                        </div>
                        <span className="text-xs font-bold text-[#8FA382] bg-[#8FA382]/20 px-2.5 py-0.5 rounded-full">
                          100% Safe
                        </span>
                      </div>

                      <h3 className="font-display font-bold text-xl text-[#3A2E2C]">
                        {msg.recipeData.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-[#3A2E2C]/70">
                        <span className="flex items-center gap-1 font-semibold">
                          <Clock size={14} /> {msg.recipeData.prepTime}
                        </span>
                        <span>&bull;</span>
                        <span className="font-semibold">{msg.recipeData.servings} Servings</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {msg.recipeData.highlights.map((h: string, hIdx: number) => (
                          <span
                            key={hIdx}
                            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#8FA382]/20 text-[#3A4432]"
                          >
                            {h}
                          </span>
                        ))}
                      </div>

                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#3A2E2C]">
                          Ingredients
                        </span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#3A2E2C]/80">
                          {msg.recipeData.ingredients.map((ing: string, iIdx: number) => (
                            <li key={iIdx} className="flex items-center gap-1.5 bg-[#F6ECE7] p-2 rounded-xl">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#8FA382]" />
                              <span>{ing}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#EDE0DA]">
                        <Link href="/plan">
                          <Button variant="primary" size="sm" icon={<CheckCircle2 size={14} />}>
                            Save to Weekly Table
                          </Button>
                        </Link>
                        <Link href="/compare/pad-thai-reformulated">
                          <Button variant="outline" size="sm">
                            View Side-by-Side Swaps &rarr;
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  )}

                  {msg.sender === 'user' && (
                    <span className="text-[10px] text-white/60 block text-right pt-1 font-medium">
                      {msg.timestamp}
                    </span>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-9 h-9 rounded-full bg-[#3A2E2C] flex items-center justify-center text-white shrink-0 shadow-xs">
                    <User size={18} />
                  </div>
                )}
              </div>
            ))}

            {/* Analyzing Loading Indicator */}
            {isAnalyzing && (
              <div className="flex items-center gap-3 p-4 bg-white/80 rounded-2xl border border-[#EDE0DA] text-xs text-[#3A2E2C]/80 animate-pulse">
                <RefreshCw size={16} className="text-[#C27B66] animate-spin" />
                <span>Swaahara AI is scanning image OCR &amp; screening biogenic markers against Clara M.&apos;s profile...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Bottom Chat Input Area */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#FBF6F3]/95 backdrop-blur-md border-t border-[#EDE0DA] py-4 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Selected attached image preview bar */}
          {selectedImage && (
            <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-[#EDE0DA] text-xs text-[#3A2E2C]">
              <ImageIcon size={14} className="text-[#C27B66]" />
              <span className="font-semibold truncate max-w-[200px]">{selectedImageName}</span>
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setSelectedImageName('');
                }}
                className="text-[#3A2E2C]/60 hover:text-[#3A2E2C] cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 bg-white rounded-full p-2 border border-[#EDE0DA] shadow-md focus-within:ring-2 focus-within:ring-[#C27B66]">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Image attachment button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 rounded-full bg-[#F6ECE7] hover:bg-[#E8D5CE] text-[#3A2E2C] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              title="Upload food photo or menu image"
            >
              <Upload size={18} className="text-[#C27B66]" />
            </button>

            {/* Text prompt input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmitAnalysis();
              }}
              placeholder="Ask Swaahara AI about your dish or upload a photo..."
              className="flex-1 px-3 text-xs sm:text-sm text-[#3A2E2C] placeholder-[#3A2E2C]/50 focus:outline-none bg-transparent"
            />

            {/* Submit button */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleSubmitAnalysis()}
              disabled={isAnalyzing || (!inputText && !selectedImage)}
              icon={<Send size={14} />}
            >
              <span className="hidden sm:inline">Ask AI</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
