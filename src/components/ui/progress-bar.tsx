'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number; // 0 - 100
  showLabel?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({
  progress,
  showLabel = false,
  className,
  size = 'md',
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1.5 flex justify-between text-xs font-medium">
          <span className="text-white/60">Progress</span>
          <span className="text-sky-400 font-semibold">{clamped}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full overflow-hidden rounded-full bg-white/10 p-0.5 backdrop-blur-sm border border-white/10',
          heightClasses[size]
        )}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-500 shadow-[0_0_12px_rgba(56,189,248,0.5)]"
        />
      </div>
    </div>
  );
}
