'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CURRENT_USER_PROFILE } from '@/lib/mock-data';
import { Leaf, MessageSquare, CalendarDays, Users, User, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  const navLinks = [
    { href: '/scan', label: 'AI Assistant & Scan', icon: MessageSquare },
    { href: '/plan', label: 'Weekly Table', icon: CalendarDays },
    { href: '/compare-profiles/truffle-risotto', label: 'Profiles & Compare', icon: Users },
    { href: '/profile-setup', label: 'My Profile', icon: User },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FBF6F3]/90 backdrop-blur-md border-b border-[#EDE0DA] shadow-[0_2px_12px_rgba(58,46,44,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <Link href="/scan" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-[#E8D5CE] flex items-center justify-center text-[#3A2E2C] group-hover:bg-[#D9A8A0] transition-all">
            <Leaf size={20} className="text-[#3A2E2C]" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-xl tracking-tight text-[#3A2E2C] group-hover:text-[#C27B66] transition-colors">
              Swaa<span className="italic font-normal text-[#C27B66]">hara</span>
            </span>
            <span className="hidden xl:inline-block text-[10px] uppercase tracking-widest text-[#3A2E2C]/60 font-semibold">
              Botanical Clinical Assistant
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#F5E6E1]/60 p-1.5 rounded-full border border-[#EDE0DA]">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? 'bg-[#3A2E2C] text-[#FBF6F3] shadow-sm'
                    : 'text-[#3A2E2C]/80 hover:text-[#3A2E2C] hover:bg-[#E8D5CE]/50'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-[#D9A8A0]' : ''} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Badge */}
        <Link href="/profile-setup" className="flex items-center gap-2.5 bg-[#F6ECE7] hover:bg-[#E8D5CE] px-3.5 py-1.5 rounded-full border border-[#EDE0DA] transition-all shadow-xs group">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-xs font-bold text-[#3A2E2C] leading-tight group-hover:text-[#C27B66] transition-colors">
              {CURRENT_USER_PROFILE.name}
            </span>
            <span className="text-[10px] font-semibold text-[#3A4432] bg-[#8FA382]/30 px-1.5 py-0.5 rounded-full inline-flex items-center justify-end gap-1">
              <ShieldCheck size={10} /> Active Profile
            </span>
          </div>
          <img
            src={CURRENT_USER_PROFILE.avatarUrl}
            alt={CURRENT_USER_PROFILE.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-[#D9A8A0]"
          />
        </Link>
      </div>
    </header>
  );
};
