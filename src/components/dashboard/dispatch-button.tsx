'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useStore } from '@/lib/store';

export function DispatchButton() {
  const store = useStore();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    payload?: unknown;
  } | null>(null);

  const handleDispatch = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/webhooks/automation-dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expenses: store.expenses,
          subscriptions: store.subscriptions,
          homeTasks: store.homeTasks,
          workTasks: store.workTasks,
          projects: store.projects,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || 'Reminders evaluated and dispatched successfully to n8n webhook!',
          payload: data.dispatched_payload,
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to dispatch reminders.',
        });
      }
    } catch (err: unknown) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : 'Network error connecting to webhook endpoint.',
      });
    } finally {
      setLoading(false);
      // Auto-hide notification after 6 seconds
      setTimeout(() => {
        setResult(null);
      }, 6000);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleDispatch}
        disabled={loading}
        className="group relative flex items-center gap-2.5 overflow-hidden rounded-xl border border-sky-500/35 bg-gradient-to-r from-sky-500/15 via-blue-500/10 to-indigo-500/15 px-3.5 py-2 text-xs font-semibold text-sky-200 shadow-[0_0_20px_rgba(56,189,248,0.2)] backdrop-blur-xl transition-all duration-300 hover:border-sky-400 hover:text-white hover:shadow-[0_0_30px_rgba(56,189,248,0.35)] disabled:opacity-60"
      >
        {/* Subtle shine line animation */}
        <div className="pointer-events-none absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-1000" />

        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
        ) : (
          <Zap className="h-4 w-4 text-sky-400 fill-sky-400/20 group-hover:fill-sky-400 transition-colors" />
        )}

        <span className="hidden sm:inline">Sync & Dispatch Reminders via n8n</span>
        <span className="sm:hidden">Sync n8n</span>
      </motion.button>

      {/* Floating Status Notification Toast */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border p-4 shadow-2xl backdrop-blur-2xl ${
              result.success
                ? 'border-emerald-500/40 bg-[#06080e]/95 text-emerald-200 shadow-emerald-950/50'
                : 'border-rose-500/40 bg-[#120709]/95 text-rose-200 shadow-rose-950/50'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 text-xs">
                <p className="font-semibold text-white">
                  {result.success ? 'n8n Dispatch Complete' : 'Dispatch Failed'}
                </p>
                <p className="mt-1 text-white/80 leading-relaxed">{result.message}</p>
                {result.payload ? (
                  <pre className="mt-2 max-h-32 overflow-auto rounded bg-black/50 p-2 text-[10px] text-sky-300 font-mono">
                    {JSON.stringify(result.payload, null, 2)}
                  </pre>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

