'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt,
  Plus,
  CheckCircle2,
  Trash2,
  Calendar,
  DollarSign,
  AlertCircle,
  Filter,
  Check,
  Clock,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassPanel } from '@/components/ui/glass-panel';
import { KPICard } from '@/components/ui/kpi-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { formatCurrency, formatDate, daysUntil, isOverdue } from '@/lib/utils';
import { ExpenseCategory, RecurringFrequency, Currency } from '@/lib/types';

export default function ExpensesPage() {
  const { expenses, addExpense, removeExpense, markExpensePaid } = useStore();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'dueDate' | 'amount'>('dueDate');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Bills');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('AED');
  const [dueDate, setDueDate] = useState('');
  const [recurring, setRecurring] = useState<RecurringFrequency>('Monthly');

  // Stats calculation
  const totalMonthlyCommitment = useMemo(() => {
    return expenses
      .filter((e) => e.status !== 'Paid')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const pendingCount = useMemo(() => {
    return expenses.filter((e) => e.status === 'Pending').length;
  }, [expenses]);

  const overdueCount = useMemo(() => {
    return expenses.filter((e) => e.status === 'Overdue' || (e.status !== 'Paid' && isOverdue(e.dueDate))).length;
  }, [expenses]);

  const paidCount = useMemo(() => {
    return expenses.filter((e) => e.status === 'Paid').length;
  }, [expenses]);

  // Filtered and sorted expenses
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        if (statusFilter !== 'All' && e.status !== statusFilter) return false;
        if (categoryFilter !== 'All' && e.category !== categoryFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return b.amount - a.amount;
      });
  }, [expenses, statusFilter, categoryFilter, sortBy]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !dueDate) return;

    addExpense({
      title,
      category,
      amount: parseFloat(amount),
      currency,
      dueDate,
      status: 'Pending',
      recurring,
    });

    setTitle('');
    setAmount('');
    setDueDate('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Receipt className="h-7 w-7 text-sky-400" />
            Personal Expenses Tracker
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Track utility bills, maintenance, family dues, and recurring living commitments.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl border border-sky-500/40 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Expense
        </motion.button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={DollarSign}
          label="Total Monthly Commitment"
          value={formatCurrency(totalMonthlyCommitment, 'AED')}
          subtitle="Unpaid active liabilities"
          glow
        />
        <KPICard
          icon={Clock}
          label="Pending Payments"
          value={pendingCount}
          subtitle="Scheduled dues"
        />
        <KPICard
          icon={AlertCircle}
          label="Overdue Alert"
          value={overdueCount}
          subtitle="Requires urgent settlement"
          trendPositive={false}
          trend={overdueCount > 0 ? `${overdueCount} Critical` : 'None'}
        />
        <KPICard
          icon={CheckCircle2}
          label="Settled This Month"
          value={paidCount}
          subtitle="Cleared expenses"
        />
      </div>

      {/* Filter and Control Bar */}
      <GlassPanel className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400">
              <Filter className="h-3.5 w-3.5" />
              Filter:
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
              <option value="Paid">Paid</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs"
            >
              <option value="All">All Categories</option>
              <option value="Bills">Bills</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Family">Family</option>
              <option value="Health">Health</option>
              <option value="Personal">Personal</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'amount')}
              className="text-xs"
            >
              <option value="dueDate">Due Date</option>
              <option value="amount">Amount (High to Low)</option>
            </select>
          </div>
        </div>
      </GlassPanel>

      {/* Expense List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredExpenses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center"
            >
              <Receipt className="mx-auto h-12 w-12 text-slate-500" />
              <p className="mt-3 text-base font-medium text-slate-300">No expenses found</p>
              <p className="mt-1 text-xs text-slate-500">Try adjusting your filters or add a new expense.</p>
            </motion.div>
          ) : (
            filteredExpenses.map((expense) => {
              const days = daysUntil(expense.dueDate);
              const isUrgent = expense.status !== 'Paid' && days <= 3;

              return (
                <GlassCard
                  key={expense.id}
                  hover
                  glow={isUrgent}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Category Icon Badge */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10 text-sky-400">
                      <Receipt className="h-5 w-5" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-white text-base">{expense.title}</h4>
                        <span className="rounded-md border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-300">
                          {expense.category}
                        </span>
                        <span className="rounded-md border border-white/10 px-2 py-0.5 text-[11px] text-slate-400">
                          {expense.recurring}
                        </span>
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-500" />
                          Due: {formatDate(expense.dueDate)}
                        </span>
                        {expense.status !== 'Paid' && (
                          <span
                            className={
                              days < 0
                                ? 'text-rose-400 font-semibold'
                                : days <= 3
                                ? 'text-sky-400 font-semibold'
                                : 'text-slate-400'
                            }
                          >
                            {days < 0 ? `Overdue by ${Math.abs(days)}d` : days === 0 ? 'Due Today' : `In ${days} days`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side: Amount, Status, Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
                    <div className="text-left sm:text-right">
                      <div className="text-lg font-bold text-white">
                        {formatCurrency(expense.amount, expense.currency)}
                      </div>
                      <div className="mt-1">
                        <StatusBadge status={expense.status} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {expense.status !== 'Paid' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => markExpensePaid(expense.id)}
                          className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/25 transition-colors"
                          title="Mark as Paid"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span className="hidden md:inline">Mark Paid</span>
                        </motion.button>
                      )}

                      <button
                        onClick={() => removeExpense(expense.id)}
                        className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-500 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Expense"
        description="Record a new household or personal liability."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Expense Title</label>
            <input
              type="text"
              required
              placeholder="e.g. DEWA Electricity Bill, Car Service"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full text-sm"
              >
                <option value="Bills">Bills</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Family">Family</option>
                <option value="Health">Health</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Recurring</label>
              <select
                value={recurring}
                onChange={(e) => setRecurring(e.target.value as RecurringFrequency)}
                className="w-full text-sm"
              >
                <option value="One-time">One-time</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Amount</label>
              <input
                type="number"
                step="any"
                required
                placeholder="450"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Due Date</label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-sm"
            />
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
              Save Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
