'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Leaf, ShieldCheck, HeartPulse, ArrowRight, UserCheck, Lock, Mail, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LandingAuthPage() {
  const router = useRouter();
  const { user, isProfileCompleted, signIn, signUp, loginAsDemoUser } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect appropriate path
  React.useEffect(() => {
    if (user || isProfileCompleted) {
      if (isProfileCompleted) {
        router.push('/scan');
      } else {
        router.push('/profile-setup');
      }
    }
  }, [user, isProfileCompleted, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    if (!email || !password) {
      setErrorMsg('Please provide both email and password.');
      setIsSubmitting(false);
      return;
    }

    if (mode === 'register' && !fullName) {
      setErrorMsg('Please enter your full name.');
      setIsSubmitting(false);
      return;
    }

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) {
        setErrorMsg(error.message || 'Login failed. Please check credentials.');
        setIsSubmitting(false);
      } else {
        // Redirect will happen via useEffect or fallback route
        router.push(isProfileCompleted ? '/scan' : '/profile-setup');
      }
    } else {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        setErrorMsg(error.message || 'Registration failed.');
        setIsSubmitting(false);
      } else {
        router.push('/profile-setup');
      }
    }
  };

  const handleDemoLogin = () => {
    loginAsDemoUser();
    router.push('/scan');
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-8 max-w-6xl mx-auto">
      {/* Hero Header Section */}
      <div className="text-center max-w-3xl mb-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8D5CE]/60 border border-[#EDE0DA] text-[#3A2E2C] text-xs font-semibold uppercase tracking-wider mb-2">
          <Leaf size={14} className="text-[#C27B66]" />
          <span>Clinical Botanical Intelligence</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#3A2E2C]">
          Swaa<span className="italic font-normal text-[#C27B66]">hara</span>
        </h1>

        <p className="text-lg sm:text-xl text-[#3A2E2C]/80 font-normal leading-relaxed max-w-2xl mx-auto">
          Intelligent AI-powered personalized food safety &amp; bio-compatibility assistant tailored to your medical profile, allergies, and health goals.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs font-medium text-[#3A2E2C]/70">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-[#8FA382]" /> Deterministic Clinical Risk Rules
          </span>
          <span className="flex items-center gap-1.5">
            <HeartPulse size={16} className="text-[#C27B66]" /> Multi-Factor Profile Screening
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles size={16} className="text-[#C9973E]" /> Supabase Auth &amp; AI Context
          </span>
        </div>
      </div>

      {/* Authentication Card */}
      <div className="w-full max-w-md bg-[#FBF6F3] border border-[#EDE0DA] rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(58,46,44,0.06)] backdrop-blur-xs">
        {/* Toggle Mode Tabs */}
        <div className="flex rounded-full bg-[#F5E6E1]/80 p-1 mb-6 border border-[#EDE0DA]">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              mode === 'login'
                ? 'bg-[#3A2E2C] text-[#FBF6F3] shadow-xs'
                : 'text-[#3A2E2C]/70 hover:text-[#3A2E2C]'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              mode === 'register'
                ? 'bg-[#3A2E2C] text-[#FBF6F3] shadow-xs'
                : 'text-[#3A2E2C]/70 hover:text-[#3A2E2C]'
            }`}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#FBF6F3] border border-[#9B4A38]/30 text-[#9B4A38] text-xs font-medium flex items-center gap-2">
            <Lock size={14} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3A2E2C] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ananya Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F6ECE7] border border-[#EDE0DA] rounded-xl text-sm text-[#3A2E2C] focus:outline-none focus:ring-2 focus:ring-[#C27B66]/40 transition-all placeholder:text-[#3A2E2C]/40"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3A2E2C] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#F6ECE7] border border-[#EDE0DA] rounded-xl text-sm text-[#3A2E2C] focus:outline-none focus:ring-2 focus:ring-[#C27B66]/40 transition-all placeholder:text-[#3A2E2C]/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3A2E2C] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#F6ECE7] border border-[#EDE0DA] rounded-xl text-sm text-[#3A2E2C] focus:outline-none focus:ring-2 focus:ring-[#C27B66]/40 transition-all placeholder:text-[#3A2E2C]/40"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="primary"
              size="lg"
              className="w-full justify-center"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : mode === 'login' ? (
                <span className="flex items-center gap-2">
                  Log In <ArrowRight size={16} />
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Get Started &bull; Set Up Profile <ArrowRight size={16} />
                </span>
              )}
            </Button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#EDE0DA]" />
          </div>
          <span className="relative bg-[#FBF6F3] px-3 text-[11px] uppercase tracking-widest text-[#3A2E2C]/50 font-semibold">
            or instant evaluation
          </span>
        </div>

        {/* Demo Quick Login Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full py-3 px-4 bg-[#F5E6E1] hover:bg-[#E8D5CE] border border-[#EDE0DA] rounded-xl text-xs font-bold uppercase tracking-wider text-[#3A2E2C] flex items-center justify-center gap-2 transition-all shadow-2xs"
        >
          <UserCheck size={16} className="text-[#C27B66]" />
          <span>Quick Hackathon Demo Login</span>
        </button>
      </div>
    </div>
  );
}
