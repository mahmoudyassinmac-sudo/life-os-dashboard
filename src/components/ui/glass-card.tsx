'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  hover?: boolean;
  glow?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function GlassCard({
  hover = true,
  glow = false,
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -3, transition: { duration: 0.25, ease: 'easeOut' } } : undefined}
      className={cn(
        'glass-card relative overflow-hidden rounded-2xl p-5 transition-all duration-300',
        hover && 'glass-card-hover',
        glow && 'border-sky-500/40 shadow-[0_0_25px_rgba(56,189,248,0.22)]',
        className
      )}
      {...props}
    >
      {/* Top subtle inner border highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {children}
    </motion.div>
  );
}
