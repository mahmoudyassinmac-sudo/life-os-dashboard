'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Plus,
  CheckCircle2,
  Trash2,
  Calendar,
  Filter,
  CheckSquare,
  Square,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassPanel } from '@/components/ui/glass-panel';
import { KPICard } from '@/components/ui/kpi-card';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { formatDate, isToday } from '@/lib/utils';
import { HomeTaskCategory, PriorityLevel, TaskStatus } from '@/lib/types';

export default function HomeTasksPage() {
  const { homeTasks, addHomeTask, removeHomeTask, toggleHomeTaskCompletion, updateHomeTask } =
    useStore();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HomeTaskCategory>('Maintenance');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TaskStatus>('To Do');

  // Stats
  const totalTasks = homeTasks.length;
  const completedTasks = useMemo(() => {
    return homeTasks.filter((t) => t.status === 'Completed').length;
  }, [homeTasks]);

  const pendingTasks = totalTasks - completedTasks;

  const dueTodayCount = useMemo(() => {
    return homeTasks.filter((t) => t.status !== 'Completed' && isToday(t.dueDate)).length;
  }, [homeTasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return homeTasks.filter((t) => {
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;
      if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
      if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
      return true;
    });
  }, [homeTasks, statusFilter, categoryFilter, priorityFilter]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return;

    addHomeTask({
      title,
      category,
      priority,
      dueDate,
      status,
    });

    setTitle('');
    setDueDate('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Home className="h-7 w-7 text-sky-400" />
            Home Tasks Tracker
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Household maintenance, family errands, groceries, and residential checklist items.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl border border-sky-500/40 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Home Task
        </motion.button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KPICard
          icon={CheckSquare}
          label="Total Tasks"
          value={totalTasks}
          subtitle="Household ledger"
        />
        <KPICard
          icon={AlertCircle}
          label="Due Today"
          value={dueTodayCount}
          subtitle="Requires attention today"
          glow={dueTodayCount > 0}
          trend={dueTodayCount > 0 ? `${dueTodayCount} Due Today` : 'None'}
          trendPositive={dueTodayCount === 0}
        />
        <KPICard
          icon={Sparkles}
          label="Pending / In Progress"
          value={pendingTasks}
          subtitle="Actionable items"
        />
        <KPICard
          icon={CheckCircle2}
          label="Completed"
          value={completedTasks}
          subtitle="Finished chores"
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

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs"
            >
              <option value="All">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs"
            >
              <option value="All">All Categories</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Groceries">Groceries</option>
              <option value="Family">Family</option>
              <option value="Utility">Utility</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          <div className="text-xs text-slate-400">
            Showing <span className="font-semibold text-white">{filteredTasks.length}</span> items
          </div>
        </div>
      </GlassPanel>

      {/* Checklist View */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center"
            >
              <CheckCircle2 className="mx-auto h-12 w-12 text-slate-500" />
              <p className="mt-3 text-base font-medium text-slate-300">No home tasks found</p>
              <p className="mt-1 text-xs text-slate-500">Adjust your filter options or add a new task.</p>
            </motion.div>
          ) : (
            filteredTasks.map((task) => {
              const isCompleted = task.status === 'Completed';
              const isDueToday = isToday(task.dueDate);

              return (
                <GlassCard
                  key={task.id}
                  hover
                  glow={!isCompleted && isDueToday}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 transition-opacity ${
                    isCompleted ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    {/* Toggle Checkbox */}
                    <button
                      onClick={() => toggleHomeTaskCompletion(task.id)}
                      className="mt-0.5 sm:mt-0 text-sky-400 hover:text-sky-300 transition-colors shrink-0"
                    >
                      {isCompleted ? (
                        <CheckSquare className="h-5 w-5 fill-sky-500/20 text-sky-400" />
                      ) : (
                        <Square className="h-5 w-5 text-slate-500 hover:text-white" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`font-medium text-white text-sm sm:text-base ${
                            isCompleted ? 'line-through text-slate-500' : ''
                          }`}
                        >
                          {task.title}
                        </span>
                        <PriorityBadge priority={task.priority} />
                        <span className="rounded-md border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-300">
                          {task.category}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-500" />
                          Due: {formatDate(task.dueDate)}
                        </span>
                        {isDueToday && !isCompleted && (
                          <span className="text-sky-400 font-semibold flex items-center gap-1">
                            • Due Today
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                    <StatusBadge status={task.status} />

                    <select
                      value={task.status}
                      onChange={(e) =>
                        updateHomeTask(task.id, { status: e.target.value as TaskStatus })
                      }
                      className="py-1 px-2 text-xs"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>

                    <button
                      onClick={() => removeHomeTask(task.id)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </GlassCard>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Home Task"
        description="Create a household maintenance or family chore."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Schedule AC maintenance inspection"
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
                onChange={(e) => setCategory(e.target.value as HomeTaskCategory)}
                className="w-full text-sm"
              >
                <option value="Maintenance">Maintenance</option>
                <option value="Groceries">Groceries</option>
                <option value="Family">Family</option>
                <option value="Utility">Utility</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full text-sm"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full text-sm"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
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
              Save Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
