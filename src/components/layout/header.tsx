'use client';

import React from 'react';
import { Menu, Calendar, RotateCcw } from 'lucide-react';
import { DispatchButton } from '@/components/dashboard/dispatch-button';
import { DailyBriefingButton } from '@/components/dashboard/daily-briefing-button';
import { useStore } from '@/lib/store';

interface HeaderProps {
  onMobileMenuToggle: () => void;
  title?: string;
}

export function Header({ onMobileMenuToggle, title = 'Life OS Dashboard' }: HeaderProps) {
  const { resetToDefaults } = useStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/10 bg-[#080b12]/70 px-4 sm:px-8 backdrop-blur-2xl">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Reset Mock Data button */}
        <button
          onClick={() => {
            if (confirm('Reset all demo data back to default initial seed?')) {
              resetToDefaults();
            }
          }}
          title="Reset to default seed data"
          className="hidden xl:flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </button>

        {/* Live Date Pill */}
        <div className="hidden lg:flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
          <Calendar className="h-3.5 w-3.5 text-sky-400" />
          <span>Wed, Oct 28, 2026</span>
        </div>

        {/* Test Daily Briefing Dispatch Button */}
        <DailyBriefingButton />

        {/* Full Automation Dispatch Button */}
        <div className="hidden md:block">
          <DispatchButton />
        </div>
      </div>
    </header>
  );
}
