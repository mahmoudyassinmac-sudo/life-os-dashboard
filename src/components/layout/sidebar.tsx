'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  Home,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Command,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
  { name: 'Home Tasks', href: '/home-tasks', icon: Home },
  { name: 'Work & Projects', href: '/work-projects', icon: Briefcase },
];

export function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4">
      {/* Top Logo / App Title */}
      <div>
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-500/30 bg-gradient-to-br from-sky-500/20 to-blue-600/20 shadow-[0_0_20px_rgba(56,189,248,0.25)] backdrop-blur-xl group-hover:border-sky-400 transition-all">
              <Command className="h-5 w-5 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold tracking-tight text-white text-base">Life OS</span>
                  <span className="rounded-full bg-sky-500/15 border border-sky-500/30 px-1.5 py-0.2 text-[9px] font-semibold text-sky-300">
                    Titanium
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 tracking-wider font-mono">Personal & Work</p>
              </motion.div>
            )}
          </Link>

          {/* Desktop Collapse Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'group relative flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'border border-sky-500/35 bg-gradient-to-r from-sky-500/15 via-blue-500/10 to-transparent text-white shadow-[0_0_20px_rgba(56,189,248,0.15)] backdrop-blur-xl'
                    : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                )}
              >
                {/* Active Indicator Glow Pip */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavPip"
                    className="absolute -left-1 h-5 w-1 rounded-r-full bg-sky-400 shadow-[0_0_10px_#38bdf8]"
                  />
                )}

                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                    isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200'
                  )}
                />

                {!collapsed && (
                  <span className="truncate tracking-wide">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User / Info Area */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-md"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full border border-sky-500/30 bg-sky-500/10 flex items-center justify-center text-sky-300 font-semibold text-xs">
              M
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">Mahmoud</p>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-sky-400" />
                Dubai (GST)
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          'hidden lg:block fixed left-0 top-0 bottom-0 z-40 transition-all duration-300 ease-in-out',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="h-full border-r border-white/10 bg-[#06080e]/90 backdrop-blur-3xl">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 border-r border-white/15 bg-[#080b12]/95 backdrop-blur-3xl shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
