'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { GlassCard } from './glass-card';
import { cn } from '@/lib/utils';

interface KPICardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendPositive?: boolean;
  glow?: boolean;
  className?: string;
}

export function KPICard({
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
  trendPositive = true,
  glow = false,
  className,
}: KPICardProps) {
  return (
    <GlassCard glow={glow} className={cn('flex flex-col justify-between', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-500/25 bg-sky-500/10 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
          {value}
        </div>
        {(subtitle || trend) && (
          <div className="mt-1.5 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  'font-semibold',
                  trendPositive ? 'text-emerald-400' : 'text-rose-400'
                )}
              >
                {trend}
              </span>
            )}
            {subtitle && <span className="text-slate-400">{subtitle}</span>}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
