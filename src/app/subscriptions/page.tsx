'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  AlertTriangle,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { GlassCard } from '@/components/ui/glass-card';
import { KPICard } from '@/components/ui/kpi-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { formatCurrency, formatDate, daysUntil } from '@/lib/utils';
import { SubscriptionStatus, BillingCycle, Currency } from '@/lib/types';

export default function SubscriptionsPage() {
  const { subscriptions, addSubscription, removeSubscription, updateSubscription } = useStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Form State
  const [serviceName, setServiceName] = useState('');
  const [cost, setCost] = useState('');
  const [currency, setCurrency] = useState<Currency>('AED');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('Monthly');
  const [renewalDate, setRenewalDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [status, setStatus] = useState<SubscriptionStatus>('Active');

  // Total monthly recurring cost calculation
  const totalMonthlyCost = useMemo(() => {
    return subscriptions
      .filter((s) => s.status === 'Active')
      .reduce((total, s) => {
        const monthlyEquivalent = s.billingCycle === 'Annual' ? s.cost / 12 : s.cost;
        return total + monthlyEquivalent;
      }, 0);
  }, [subscriptions]);

  const activeCount = useMemo(() => {
    return subscriptions.filter((s) => s.status === 'Active').length;
  }, [subscriptions]);

  const upcomingRenewalsCount = useMemo(() => {
    return subscriptions.filter((s) => {
      if (s.status !== 'Active') return false;
      const days = daysUntil(s.renewalDate);
      return days <= 5 && days >= 0;
    }).length;
  }, [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter((s) => (filterStatus === 'All' ? true : s.status === filterStatus))
      .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime());
  }, [subscriptions, filterStatus]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName || !cost || !renewalDate) return;

    addSubscription({
      serviceName,
      cost: parseFloat(cost),
      currency,
      billingCycle,
      renewalDate,
      paymentMethod: paymentMethod || 'Card',
      status,
    });

    setServiceName('');
    setCost('');
    setRenewalDate('');
    setPaymentMethod('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <CreditCard className="h-7 w-7 text-sky-400" />
            Monthly Subscriptions Hub
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Monitor digital services, SaaS tools, gym memberships, and upcoming auto-renewals.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl border border-sky-500/40 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Subscription
        </motion.button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          icon={DollarSign}
          label="Total Monthly Recurring Cost"
          value={formatCurrency(Math.round(totalMonthlyCost), 'AED')}
          subtitle="Normalized monthly spend"
          glow
        />
        <KPICard
          icon={Sparkles}
          label="Active Subscriptions"
          value={activeCount}
          subtitle="Active SaaS & services"
        />
        <KPICard
          icon={AlertTriangle}
          label="Renewing In < 5 Days"
          value={upcomingRenewalsCount}
          subtitle="Imminent automated renewals"
          trendPositive={upcomingRenewalsCount === 0}
          trend={upcomingRenewalsCount > 0 ? `${upcomingRenewalsCount} Approaching` : 'All Clear'}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        {['All', 'Active', 'Paused', 'Canceling'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`rounded-xl px-4 py-1.5 text-xs font-medium transition-colors ${
              filterStatus === tab
                ? 'border border-sky-500/40 bg-sky-500/15 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filteredSubscriptions.map((sub) => {
            const days = daysUntil(sub.renewalDate);
            const isWarning = sub.status === 'Active' && days <= 5 && days >= 0;
            const isOverdueRenewal = sub.status === 'Active' && days < 0;

            return (
              <GlassCard
                key={sub.id}
                hover
                glow={isWarning}
                className={`flex flex-col justify-between p-6 ${
                  isWarning ? 'border-sky-500/50 shadow-[0_0_25px_rgba(56,189,248,0.25)]' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-500/25 bg-sky-500/10 text-sky-400">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-base leading-snug">
                          {sub.serviceName}
                        </h4>
                        <p className="text-xs text-slate-400">{sub.paymentMethod}</p>
                      </div>
                    </div>
                    <StatusBadge status={sub.status} />
                  </div>

                  {/* Cost & Cycle */}
                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold tracking-tight text-white">
                      {formatCurrency(sub.cost, sub.currency)}
                    </span>
                    <span className="text-xs text-slate-400">
                      /{sub.billingCycle === 'Monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>

                  {/* Renewal Date & Countdown */}
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        Next Renewal:
                      </span>
                      <span className="font-medium text-white">{formatDate(sub.renewalDate)}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        Countdown:
                      </span>
                      <span
                        className={`font-semibold ${
                          isOverdueRenewal
                            ? 'text-rose-400'
                            : isWarning
                            ? 'text-sky-400 animate-pulse'
                            : 'text-emerald-400'
                        }`}
                      >
                        {isOverdueRenewal
                          ? `Passed (${Math.abs(days)}d ago)`
                          : days === 0
                          ? 'Renews Today!'
                          : `${days} days remaining`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-5 flex items-center justify-between pt-4 border-t border-white/10 text-xs">
                  <select
                    value={sub.status}
                    onChange={(e) =>
                      updateSubscription(sub.id, {
                        status: e.target.value as SubscriptionStatus,
                      })
                    }
                    className="py-1 px-2 text-xs rounded-lg"
                  >
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Canceling">Canceling</option>
                  </select>

                  <button
                    onClick={() => removeSubscription(sub.id)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                    title="Remove subscription"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add Subscription Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Subscription"
        description="Register a recurring SaaS or household subscription."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Service Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ChatGPT Plus, Vercel, iCloud"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Cost</label>
              <input
                type="number"
                step="any"
                required
                placeholder="75"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full text-sm"
              >
                <option value="AED">AED</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Billing Cycle
              </label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                className="w-full text-sm"
              >
                <option value="Monthly">Monthly</option>
                <option value="Annual">Annual</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Renewal Date
              </label>
              <input
                type="date"
                required
                value={renewalDate}
                onChange={(e) => setRenewalDate(e.target.value)}
                className="w-full text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Payment Method / Card Used
            </label>
            <input
              type="text"
              placeholder="e.g. Apple Pay, Emirates NBD ****4112"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
              className="w-full text-sm"
            >
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
              <option value="Canceling">Canceling</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl border border-sky-500/40 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 px-5 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] transition-all"
            >
              Save Subscription
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
