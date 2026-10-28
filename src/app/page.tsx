'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Receipt,
  CreditCard,
  Home,
  Briefcase,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Plus,
  Zap,
  FolderOpen,
  ArrowUpRight,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassPanel } from '@/components/ui/glass-panel';
import { KPICard } from '@/components/ui/kpi-card';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Modal } from '@/components/ui/modal';
import { DailyBriefingButton } from '@/components/dashboard/daily-briefing-button';
import { formatCurrency, formatDate, daysUntil, isOverdue } from '@/lib/utils';
import {
  ExpenseCategory,
  PriorityLevel,
} from '@/lib/types';

export default function DashboardPage() {
  const {
    expenses,
    subscriptions,
    homeTasks,
    workTasks,
    projects,
    addExpense,
    addSubscription,
    addHomeTask,
    addWorkTask,
    addProject,
    toggleHomeTaskCompletion,
    toggleWorkTaskCompletion,
  } = useStore();

  // Quick Action Modal states
  const [activeModal, setActiveModal] = useState<
    'expense' | 'subscription' | 'task' | 'project' | null
  >(null);

  // Quick entry states
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expDueDate, setExpDueDate] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('Bills');

  const [subName, setSubName] = useState('');
  const [subCost, setSubCost] = useState('');
  const [subRenewalDate, setSubRenewalDate] = useState('');
  const [subPaymentMethod, setSubPaymentMethod] = useState('');

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<PriorityLevel>('High');
  const [taskType, setTaskType] = useState<'Home' | 'Work'>('Work');

  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projDeadline, setProjDeadline] = useState('');

  // 1. KPI Calculations
  const totalMonthlyCommitment = useMemo(() => {
    return expenses
      .filter((e) => e.status !== 'Paid')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const totalMonthlySubscriptions = useMemo(() => {
    return subscriptions
      .filter((s) => s.status === 'Active')
      .reduce((total, s) => {
        const val = s.billingCycle === 'Annual' ? s.cost / 12 : s.cost;
        return total + val;
      }, 0);
  }, [subscriptions]);

  const pendingHomeTasksCount = useMemo(() => {
    return homeTasks.filter((t) => t.status !== 'Completed').length;
  }, [homeTasks]);

  const activeProjectsCount = useMemo(() => {
    return projects.filter((p) => p.status === 'In Progress' || p.status === 'Planning').length;
  }, [projects]);

  const averageProjectProgress = useMemo(() => {
    if (projects.length === 0) return 0;
    const sum = projects.reduce((acc, p) => acc + p.progress, 0);
    return Math.round(sum / projects.length);
  }, [projects]);

  // 2. Today's Combined Agenda (Home tasks & Work tasks due today)
  const todayTasks = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      type: 'Home' | 'Work';
      priority: PriorityLevel;
      status: string;
      dueDate: string;
      completed: boolean;
    }> = [];

    homeTasks.forEach((t) => {
      // Show today tasks or pending tasks
      if (t.dueDate === '2026-10-28') {
        list.push({
          id: t.id,
          title: t.title,
          type: 'Home',
          priority: t.priority,
          status: t.status,
          dueDate: t.dueDate,
          completed: t.status === 'Completed',
        });
      }
    });

    workTasks.forEach((t) => {
      if (t.dueDate === '2026-10-28') {
        list.push({
          id: t.id,
          title: t.title,
          type: 'Work',
          priority: t.priority,
          status: t.status,
          dueDate: t.dueDate,
          completed: t.status === 'Completed',
        });
      }
    });

    return list;
  }, [homeTasks, workTasks]);

  // 3. Upcoming Due Payments & Subscriptions (Next 7-14 days or overdue)
  const upcomingExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        if (e.status === 'Paid') return false;
        const days = daysUntil(e.dueDate);
        return days <= 14;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [expenses]);

  const upcomingSubscriptions = useMemo(() => {
    return subscriptions
      .filter((s) => {
        if (s.status !== 'Active') return false;
        const days = daysUntil(s.renewalDate);
        return days <= 14 && days >= 0;
      })
      .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime());
  }, [subscriptions]);

  // Urgent alerts (due in <= 3 days)
  const urgentCount = useMemo(() => {
    const urgentExp = upcomingExpenses.filter((e) => daysUntil(e.dueDate) <= 3).length;
    const urgentSub = upcomingSubscriptions.filter((s) => daysUntil(s.renewalDate) <= 3).length;
    return urgentExp + urgentSub;
  }, [upcomingExpenses, upcomingSubscriptions]);

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span>Welcome back, Mahmoud</span>
            <span className="inline-block animate-pulse">✨</span>
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Life Operating System — Unified personal commitments, household tasks & work sprints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DailyBriefingButton />
          <div className="hidden sm:flex text-xs text-slate-400 items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span>n8n Services Active</span>
          </div>
        </div>
      </div>

      {/* QUICK ACTION DISPATCH BAR */}
      <GlassPanel className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" />
            Quick Action Dispatch
          </span>
          <span className="text-[11px] text-slate-500">Instant Entry</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <motion.button
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveModal('expense')}
            className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left transition-all hover:border-sky-500/40 hover:bg-sky-500/10 group"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/15 text-sky-400 group-hover:scale-110 transition-transform">
              <Receipt className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Add Expense</p>
              <p className="text-[10px] text-slate-400">Bills & dues</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveModal('subscription')}
            className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left transition-all hover:border-sky-500/40 hover:bg-sky-500/10 group"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/15 text-sky-400 group-hover:scale-110 transition-transform">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Add Subscription</p>
              <p className="text-[10px] text-slate-400">Recurring SaaS</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveModal('task')}
            className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left transition-all hover:border-sky-500/40 hover:bg-sky-500/10 group"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/15 text-sky-400 group-hover:scale-110 transition-transform">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">New Task</p>
              <p className="text-[10px] text-slate-400">Home / Work</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveModal('project')}
            className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left transition-all hover:border-sky-500/40 hover:bg-sky-500/10 group"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/15 text-sky-400 group-hover:scale-110 transition-transform">
              <FolderOpen className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">New Project</p>
              <p className="text-[10px] text-slate-400">Milestone engine</p>
            </div>
          </motion.button>
        </div>
      </GlassPanel>

      {/* KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={Receipt}
          label="Total Monthly Expenses"
          value={formatCurrency(totalMonthlyCommitment, 'AED')}
          subtitle="Pending commitments"
          glow
        />
        <KPICard
          icon={CreditCard}
          label="Active Subscriptions"
          value={formatCurrency(Math.round(totalMonthlySubscriptions), 'AED')}
          subtitle="Monthly SaaS spend"
        />
        <KPICard
          icon={Home}
          label="Pending Home Tasks"
          value={pendingHomeTasksCount}
          subtitle="Household action items"
        />
        <KPICard
          icon={Briefcase}
          label="Work Projects Velocity"
          value={`${averageProjectProgress}%`}
          subtitle={`${activeProjectsCount} active work streams`}
        />
      </div>

      {/* URGENT WARNING BANNER (If any payment due in <= 3 days) */}
      {urgentCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-sky-500/40 bg-gradient-to-r from-sky-500/15 via-blue-600/10 to-cyan-500/15 p-4 sm:p-5 shadow-[0_0_30px_rgba(56,189,248,0.2)] backdrop-blur-2xl"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-500/40 bg-sky-500/20 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Action Required: {urgentCount} Urgent Payment(s) Due Within 3 Days
              </h3>
              <p className="mt-1 text-xs text-slate-300">
                You have expenses or automated recurring subscriptions arriving at their renewal deadline. Review your scheduled balances or dispatch reminders via n8n.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* 2-COLUMN MAIN CONTENT: DAILY TASKS & UPCOMING PAYMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WIDGET 1: Daily Tasks Today */}
        <GlassPanel className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Daily Tasks Today</h3>
                  <p className="text-xs text-slate-400">Due today across Home & Work</p>
                </div>
              </div>
              <span className="rounded-full bg-sky-500/15 border border-sky-500/30 px-2.5 py-0.5 text-xs font-semibold text-sky-300">
                {todayTasks.length} tasks
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {todayTasks.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-400/60 mb-2" />
                  <p className="text-sm font-medium text-slate-200">All clear for today! ✨</p>
                  <p className="text-xs text-slate-500">No immediate deadlines due today.</p>
                </div>
              ) : (
                todayTasks.map((task) => (
                  <GlassCard
                    key={`${task.type}-${task.id}`}
                    hover
                    className="p-3 flex items-center justify-between gap-3 border-white/10"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => {
                          if (task.type === 'Home') toggleHomeTaskCompletion(task.id);
                          else toggleWorkTaskCompletion(task.id);
                        }}
                        className="text-sky-400 hover:text-sky-300 shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <div className="h-4 w-4 rounded border border-white/40 hover:border-sky-400" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs font-medium text-white truncate ${
                            task.completed ? 'line-through text-slate-500' : ''
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            {task.type === 'Home' ? (
                              <Home className="h-3 w-3 text-sky-400" />
                            ) : (
                              <Briefcase className="h-3 w-3 text-cyan-400" />
                            )}
                            {task.type}
                          </span>
                          <span>•</span>
                          <PriorityBadge priority={task.priority} />
                        </div>
                      </div>
                    </div>

                    <StatusBadge status={task.status} size="sm" />
                  </GlassCard>
                ))
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/10 flex justify-between text-xs">
            <Link
              href="/home-tasks"
              className="text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              <span>View Home Checklist</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/work-projects"
              className="text-slate-400 hover:text-white flex items-center gap-1"
            >
              <span>View Work Sprint</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </GlassPanel>

        {/* WIDGET 2: Upcoming Due Payments & Subscriptions */}
        <GlassPanel className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-400">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Upcoming Dues & Renewals</h3>
                  <p className="text-xs text-slate-400">Due within next 7–14 days</p>
                </div>
              </div>

              <span className="rounded-full bg-white/10 border border-white/15 px-2.5 py-0.5 text-xs text-slate-300">
                {upcomingExpenses.length + upcomingSubscriptions.length} upcoming
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {upcomingExpenses.slice(0, 3).map((exp) => {
                const days = daysUntil(exp.dueDate);
                const isUrgent = days <= 3;
                const overdue = isOverdue(exp.dueDate);

                return (
                  <GlassCard
                    key={exp.id}
                    hover
                    glow={isUrgent}
                    className="p-3 flex items-center justify-between gap-3 border-white/10"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sky-500/20 bg-sky-500/10 text-sky-400">
                        <Receipt className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{exp.title}</p>
                        <p className="text-[10px] text-slate-400">
                          Due: {formatDate(exp.dueDate)} ({exp.category})
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-white">
                        {formatCurrency(exp.amount, exp.currency)}
                      </div>
                      <span
                        className={`text-[10px] font-semibold ${
                          overdue
                            ? 'text-rose-400'
                            : isUrgent
                            ? 'text-sky-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {overdue ? 'Overdue' : days === 0 ? 'Today' : `${days}d left`}
                      </span>
                    </div>
                  </GlassCard>
                );
              })}

              {upcomingSubscriptions.slice(0, 3).map((sub) => {
                const days = daysUntil(sub.renewalDate);
                const isUrgent = days <= 3;

                return (
                  <GlassCard
                    key={sub.id}
                    hover
                    glow={isUrgent}
                    className="p-3 flex items-center justify-between gap-3 border-white/10"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sky-500/25 bg-sky-500/10 text-sky-400">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          {sub.serviceName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Renewal: {formatDate(sub.renewalDate)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-white">
                        {formatCurrency(sub.cost, sub.currency)}
                      </div>
                      <span
                        className={`text-[10px] font-semibold ${
                          isUrgent ? 'text-sky-400' : 'text-slate-400'
                        }`}
                      >
                        {days === 0 ? 'Renews Today' : `${days}d left`}
                      </span>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/10 flex justify-between text-xs">
            <Link
              href="/expenses"
              className="text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              <span>View All Expenses</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/subscriptions"
              className="text-slate-400 hover:text-white flex items-center gap-1"
            >
              <span>Manage Subscriptions</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </GlassPanel>
      </div>

      {/* ACTIVE WORK PROJECTS HIGHLIGHT */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-400">
              <FolderOpen className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Active Projects Engine</h3>
              <p className="text-xs text-slate-400">High priority deliverables and milestone status</p>
            </div>
          </div>

          <Link
            href="/work-projects"
            className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            <span>Open Projects Engine</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.slice(0, 3).map((project) => (
            <GlassCard key={project.id} hover className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-white text-sm line-clamp-1">
                    {project.title}
                  </h4>
                  <StatusBadge status={project.status} size="sm" />
                </div>
                <p className="mt-1.5 text-xs text-slate-400 line-clamp-2">
                  {project.description}
                </p>
              </div>

              <div className="mt-5 space-y-2">
                <ProgressBar progress={project.progress} showLabel size="sm" />
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-white/5">
                  <span>Target: {formatDate(project.targetDeadline)}</span>
                  <span>{project.milestones.length} milestones</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* QUICK ADD MODALS */}
      {/* 1. Expense Modal */}
      <Modal
        isOpen={activeModal === 'expense'}
        onClose={() => setActiveModal(null)}
        title="Quick Add Expense"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!expTitle || !expAmount || !expDueDate) return;
            addExpense({
              title: expTitle,
              category: expCategory,
              amount: parseFloat(expAmount),
              currency: 'AED',
              dueDate: expDueDate,
              status: 'Pending',
              recurring: 'Monthly',
            });
            setExpTitle('');
            setExpAmount('');
            setExpDueDate('');
            setActiveModal(null);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
            <input
              type="text"
              required
              placeholder="e.g. DEWA Electric Bill"
              value={expTitle}
              onChange={(e) => setExpTitle(e.target.value)}
              className="w-full text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Amount (AED)</label>
              <input
                type="number"
                step="any"
                required
                placeholder="450"
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
                className="w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
              <select
                value={expCategory}
                onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                className="w-full text-sm"
              >
                <option value="Bills">Bills</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Family">Family</option>
                <option value="Health">Health</option>
                <option value="Personal">Personal</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Due Date</label>
            <input
              type="date"
              required
              value={expDueDate}
              onChange={(e) => setExpDueDate(e.target.value)}
              className="w-full text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
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

      {/* 2. Subscription Modal */}
      <Modal
        isOpen={activeModal === 'subscription'}
        onClose={() => setActiveModal(null)}
        title="Quick Add Subscription"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!subName || !subCost || !subRenewalDate) return;
            addSubscription({
              serviceName: subName,
              cost: parseFloat(subCost),
              currency: 'AED',
              billingCycle: 'Monthly',
              renewalDate: subRenewalDate,
              paymentMethod: subPaymentMethod || 'Apple Pay',
              status: 'Active',
            });
            setSubName('');
            setSubCost('');
            setSubRenewalDate('');
            setSubPaymentMethod('');
            setActiveModal(null);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Service Name</label>
            <input
              type="text"
              required
              placeholder="e.g. ChatGPT Plus"
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              className="w-full text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Cost (AED/mo)</label>
              <input
                type="number"
                step="any"
                required
                placeholder="75"
                value={subCost}
                onChange={(e) => setSubCost(e.target.value)}
                className="w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Renewal Date</label>
              <input
                type="date"
                required
                value={subRenewalDate}
                onChange={(e) => setSubRenewalDate(e.target.value)}
                className="w-full text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Payment Method</label>
            <input
              type="text"
              placeholder="e.g. Apple Pay, Emirates NBD"
              value={subPaymentMethod}
              onChange={(e) => setSubPaymentMethod(e.target.value)}
              className="w-full text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
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

      {/* 3. Task Modal */}
      <Modal
        isOpen={activeModal === 'task'}
        onClose={() => setActiveModal(null)}
        title="Quick Add Task"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!taskTitle || !taskDueDate) return;
            if (taskType === 'Home') {
              addHomeTask({
                title: taskTitle,
                category: 'Maintenance',
                priority: taskPriority,
                dueDate: taskDueDate,
                status: 'To Do',
              });
            } else {
              addWorkTask({
                title: taskTitle,
                priority: taskPriority,
                estimatedHours: 2,
                dueDate: taskDueDate,
                status: 'To Do',
              });
            }
            setTaskTitle('');
            setTaskDueDate('');
            setActiveModal(null);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Review WhatsApp API callback node"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Domain</label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as 'Home' | 'Work')}
                className="w-full text-sm"
              >
                <option value="Work">Work</option>
                <option value="Home">Home</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as PriorityLevel)}
                className="w-full text-sm"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Due Date</label>
            <input
              type="date"
              required
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className="w-full text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl border border-sky-500/40 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 px-5 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] transition-all"
            >
              Save Task
            </button>
          </div>
        </form>
      </Modal>

      {/* 4. Project Modal */}
      <Modal
        isOpen={activeModal === 'project'}
        onClose={() => setActiveModal(null)}
        title="Quick Create Project"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!projTitle || !projDeadline) return;
            addProject({
              title: projTitle,
              description: projDesc,
              status: 'In Progress',
              targetDeadline: projDeadline,
              progress: 0,
              notes: '',
              links: [],
              milestones: [
                {
                  id: 'm-' + Date.now(),
                  title: 'Phase 1: Architecture & Setup',
                  completed: false,
                  subtasks: [
                    { id: 'st-' + Date.now(), title: 'Initial setup & requirements', completed: false },
                  ],
                },
              ],
            });
            setProjTitle('');
            setProjDesc('');
            setProjDeadline('');
            setActiveModal(null);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Project Title</label>
            <input
              type="text"
              required
              placeholder="e.g. WhatsApp Dashboard Automation"
              value={projTitle}
              onChange={(e) => setProjTitle(e.target.value)}
              className="w-full text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              required
              placeholder="Deliverables and sprint milestones..."
              value={projDesc}
              onChange={(e) => setProjDesc(e.target.value)}
              className="w-full text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Deadline</label>
            <input
              type="date"
              required
              value={projDeadline}
              onChange={(e) => setProjDeadline(e.target.value)}
              className="w-full text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl border border-sky-500/40 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 px-5 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] transition-all"
            >
              Create Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
