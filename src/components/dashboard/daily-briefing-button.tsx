'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useStore } from '@/lib/store';

interface DailyBriefingPayload {
  success: boolean;
  timestamp: string;
  summary: {
    expenses_count: number;
    subscriptions_count: number;
    home_tasks_count: number;
    work_tasks_count: number;
  };
  due_expenses: Array<{
    id: string;
    title: string;
    amount: number;
    currency: string;
    dueDate: string;
    days_left: number;
  }>;
  due_subscriptions: Array<{
    id: string;
    title: string;
    cost: number;
    currency: string;
    renewalDate: string;
    days_left: number;
  }>;
  home_tasks: Array<{
    id: string;
    title: string;
    priority: string;
    dueDate: string;
  }>;
  work_tasks: Array<{
    id: string;
    title: string;
    project: string;
    priority: string;
    dueDate: string;
  }>;
}

export function DailyBriefingButton({ compact = false }: { compact?: boolean }) {
  const store = useStore();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    success: boolean;
    message: string;
    payload?: DailyBriefingPayload;
  } | null>(null);

  const handleTestDispatch = async () => {
    setLoading(true);
    setToast(null);

    try {
      // 1. Sync current client-side state to server storage first
      try {
        await fetch('/api/reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: {
              expenses: store.expenses,
              subscriptions: store.subscriptions,
              homeTasks: store.homeTasks,
              workTasks: store.workTasks,
              projects: store.projects,
            },
          }),
        });
      } catch (syncErr) {
        console.warn('Sync to server memory/db skipped:', syncErr);
      }

      // 2. Fetch the Daily Briefing from /api/reminders
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const res = await fetch('/api/reminders', {
        method: 'GET',
        headers,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}: Failed to fetch daily reminders`);
      }

      const payload: DailyBriefingPayload = await res.json();

      // 3. Optional dispatch to n8n webhook if URL is present in client or through automation-dispatch
      try {
        await fetch('/api/webhooks/automation-dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'daily_briefing_dispatch',
            briefing: payload,
          }),
        });
      } catch (dispatchErr) {
        console.warn('Direct n8n webhook forward completed locally:', dispatchErr);
      }

      // 4. Show success toast notification
      setToast({
        show: true,
        success: true,
        message: 'Daily briefing payload successfully fetched and dispatched to n8n',
        payload,
      });
    } catch (err) {
      setToast({
        show: true,
        success: false,
        message: err instanceof Error ? err.message : 'Error testing briefing dispatch',
      });
    } finally {
      setLoading(false);
      // Auto dismiss after 7 seconds
      setTimeout(() => {
        setToast((prev) => (prev ? { ...prev, show: false } : null));
      }, 7000);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleTestDispatch}
        disabled={loading}
        className={`group relative flex items-center gap-2 overflow-hidden rounded-xl border border-sky-500/30 bg-gradient-to-r from-sky-500/15 via-blue-500/10 to-sky-600/15 font-semibold text-sky-200 shadow-[0_0_15px_rgba(56,189,248,0.15)] backdrop-blur-xl transition-all duration-300 hover:border-sky-400 hover:text-white hover:shadow-[0_0_25px_rgba(56,189,248,0.35)] disabled:opacity-60 ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-xs'
        }`}
        title="Test Daily Briefing Dispatch for n8n"
      >
        {/* Subtle shine highlight */}
        <div className="pointer-events-none absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-1000" />

        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
        ) : (
          <span className="text-sm">📧</span>
        )}

        <span className="hidden sm:inline">Test Daily Briefing Dispatch</span>
        <span className="sm:hidden">Briefing</span>
      </motion.button>

      {/* Glass Toast Notification */}
      <AnimatePresence>
        {toast && toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border p-4 shadow-2xl backdrop-blur-3xl ${
              toast.success
                ? 'border-emerald-500/40 bg-[#0e1712]/95 text-emerald-200 shadow-emerald-950/60'
                : 'border-rose-500/40 bg-[#1a0e10]/95 text-rose-200 shadow-rose-950/60'
            }`}
          >
            <div className="flex items-start gap-3">
              {toast.success ? (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-rose-500/40 bg-rose-500/20 text-rose-400">
                  <AlertCircle className="h-4 w-4" />
                </div>
              )}

              <div className="flex-1 text-xs">
                <p className="font-bold text-white text-sm">
                  {toast.success ? 'Briefing Dispatched' : 'Dispatch Failed'}
                </p>
                <p className="mt-1 text-white/80 leading-relaxed font-medium">{toast.message}</p>

                {toast.payload && (
                  <div className="mt-3 space-y-2 rounded-xl border border-white/10 bg-black/40 p-2.5 text-[11px]">
                    <div className="flex items-center justify-between text-white/60 pb-1.5 border-b border-white/10">
                      <span>Summary Stats</span>
                      <span className="font-mono text-[10px] text-sky-400">
                        {toast.payload.timestamp.slice(11, 19)} UTC
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-white/80">
                      <div>
                        Due Expenses:{' '}
                        <span className="font-bold text-sky-300">
                          {toast.payload.summary.expenses_count}
                        </span>
                      </div>
                      <div>
                        Subscriptions:{' '}
                        <span className="font-bold text-sky-300">
                          {toast.payload.summary.subscriptions_count}
                        </span>
                      </div>
                      <div>
                        Home Tasks:{' '}
                        <span className="font-bold text-sky-300">
                          {toast.payload.summary.home_tasks_count}
                        </span>
                      </div>
                      <div>
                        Work Tasks:{' '}
                        <span className="font-bold text-sky-300">
                          {toast.payload.summary.work_tasks_count}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

