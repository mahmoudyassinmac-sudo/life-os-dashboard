'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Plus,
  CheckCircle2,
  Trash2,
  Calendar,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  ListTodo,
  CheckSquare,
  Square,
  FileText,
  Link as LinkIcon,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassPanel } from '@/components/ui/glass-panel';
import { KPICard } from '@/components/ui/kpi-card';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Modal } from '@/components/ui/modal';
import { formatDate, isToday } from '@/lib/utils';
import { PriorityLevel, TaskStatus, ProjectStatus } from '@/lib/types';

export default function WorkProjectsPage() {
  const {
    workTasks,
    projects,
    addWorkTask,
    removeWorkTask,
    toggleWorkTaskCompletion,
    updateWorkTask,
    addProject,
    removeProject,
    toggleSubtask,
    addMilestone,
    addSubtask,
    updateProject,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'projects' | 'tasks'>('projects');

  // Work tasks filter state
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('All');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>('All');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  // New task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<PriorityLevel>('High');
  const [estimatedHours, setEstimatedHours] = useState('2');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskProjectId, setTaskProjectId] = useState<string>('');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('To Do');

  // Projects state
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>('proj-1');
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);

  // New project form
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projDeadline, setProjDeadline] = useState('');
  const [projStatus, setProjStatus] = useState<ProjectStatus>('In Progress');
  const [projNotes, setProjNotes] = useState('');
  const [projLinkInput, setProjLinkInput] = useState('');

  // Milestone/Subtask inline adding
  const [newMilestoneTitles, setNewMilestoneTitles] = useState<{ [projectId: string]: string }>({});
  const [newSubtaskTitles, setNewSubtaskTitles] = useState<{ [milestoneId: string]: string }>({});

  // Stats calculation
  const totalProjects = projects.length;
  const activeProjectsCount = useMemo(
    () => projects.filter((p) => p.status === 'In Progress' || p.status === 'Planning').length,
    [projects]
  );
  const avgProgress = useMemo(() => {
    if (projects.length === 0) return 0;
    return Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length);
  }, [projects]);

  const totalWorkHours = useMemo(() => {
    return workTasks
      .filter((t) => t.status !== 'Completed')
      .reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  }, [workTasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return workTasks.filter((t) => {
      if (taskStatusFilter !== 'All' && t.status !== taskStatusFilter) return false;
      if (taskPriorityFilter !== 'All' && t.priority !== taskPriorityFilter) return false;
      return true;
    });
  }, [workTasks, taskStatusFilter, taskPriorityFilter]);

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskDueDate) return;

    addWorkTask({
      title: taskTitle,
      priority: taskPriority,
      estimatedHours: parseFloat(estimatedHours) || 1,
      dueDate: taskDueDate,
      projectId: taskProjectId || undefined,
      status: taskStatus,
    });

    setTaskTitle('');
    setTaskDueDate('');
    setIsAddTaskModalOpen(false);
  };

  const handleAddProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle || !projDeadline) return;

    const links = projLinkInput
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    addProject({
      title: projTitle,
      description: projDesc,
      status: projStatus,
      targetDeadline: projDeadline,
      progress: 0,
      notes: projNotes,
      links,
      milestones: [
        {
          id: 'm-' + Date.now(),
          title: 'Phase 1: Architecture & Foundation',
          completed: false,
          subtasks: [
            { id: 'st-' + Date.now(), title: 'Initialize project structure & setup', completed: false },
          ],
        },
      ],
    });

    setProjTitle('');
    setProjDesc('');
    setProjDeadline('');
    setProjNotes('');
    setProjLinkInput('');
    setIsAddProjectModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Briefcase className="h-7 w-7 text-sky-400" />
            Work Tasks & Project Engine
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Sprint management, milestone breakdown, subtask action tracking, and project deliverables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'projects' ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAddProjectModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-sky-500/40 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] transition-all"
            >
              <Plus className="h-4 w-4" />
              Create Project
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAddTaskModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-sky-500/40 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Work Task
            </motion.button>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KPICard
          icon={Layers}
          label="Active Projects"
          value={activeProjectsCount}
          subtitle={`Out of ${totalProjects} total portfolios`}
          glow
        />
        <KPICard
          icon={Sparkles}
          label="Average Velocity"
          value={`${avgProgress}%`}
          subtitle="Portfolio completion"
        />
        <KPICard
          icon={Clock}
          label="Pending Work Hours"
          value={`${totalWorkHours} hrs`}
          subtitle="Estimated backlog"
        />
        <KPICard
          icon={CheckCircle2}
          label="Active Sprint Tasks"
          value={workTasks.filter((t) => t.status !== 'Completed').length}
          subtitle="In flight work items"
        />
      </div>

      {/* Glass Tab Selector */}
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur-xl w-fit">
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium transition-all ${
            activeTab === 'projects'
              ? 'border border-sky-500/40 bg-gradient-to-r from-sky-500/15 to-blue-500/15 text-white shadow-[0_0_20px_rgba(56,189,248,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FolderOpen className="h-4 w-4 text-sky-400" />
          Projects Management ({projects.length})
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium transition-all ${
            activeTab === 'tasks'
              ? 'border border-sky-500/40 bg-gradient-to-r from-sky-500/15 to-blue-500/15 text-white shadow-[0_0_20px_rgba(56,189,248,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ListTodo className="h-4 w-4 text-sky-400" />
          Work Sprint Tasks ({workTasks.length})
        </button>
      </div>

      {/* TAB 1: PROJECTS VIEW */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {projects.map((project) => {
            const isExpanded = expandedProjectId === project.id;

            return (
              <GlassPanel
                key={project.id}
                className="transition-all duration-300 hover:border-white/20"
              >
                {/* Project Header Row */}
                <div
                  onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-400">
                      <FolderOpen className="h-5 w-5" />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-lg font-bold text-white hover:text-sky-300 transition-colors">
                          {project.title}
                        </h3>
                        <StatusBadge status={project.status} />
                      </div>
                      <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="w-44 hidden sm:block">
                      <ProgressBar progress={project.progress} showLabel size="sm" />
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-slate-500 block">Target:</span>
                      <span className="font-semibold text-white">
                        {formatDate(project.targetDeadline)}
                      </span>
                    </div>

                    <div className="text-slate-400">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile Progress Bar */}
                <div className="mt-3 sm:hidden">
                  <ProgressBar progress={project.progress} showLabel size="sm" />
                </div>

                {/* Expanded Details Section */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-white/10 space-y-6"
                    >
                      {/* Milestones & Steps Tracker */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                            <Layers className="h-4 w-4" />
                            Milestones & Action Steps Tracker
                          </h4>
                          <span className="text-xs text-slate-400">
                            {project.milestones.filter((m) => m.completed).length} of{' '}
                            {project.milestones.length} milestones finished
                          </span>
                        </div>

                        <div className="space-y-4">
                          {project.milestones.map((milestone) => (
                            <div
                              key={milestone.id}
                              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <span
                                    className={`h-2.5 w-2.5 rounded-full ${
                                      milestone.completed ? 'bg-emerald-400' : 'bg-sky-400'
                                    }`}
                                  />
                                  <span
                                    className={`text-sm font-semibold text-white ${
                                      milestone.completed ? 'line-through text-slate-500' : ''
                                    }`}
                                  >
                                    {milestone.title}
                                  </span>
                                </div>
                                <span className="text-xs text-slate-400">
                                  {milestone.subtasks.filter((s) => s.completed).length}/
                                  {milestone.subtasks.length} steps
                                </span>
                              </div>

                              {/* Nested Subtasks List */}
                              <div className="mt-3 pl-4 space-y-2 border-l border-white/10">
                                {milestone.subtasks.map((subtask) => (
                                  <div
                                    key={subtask.id}
                                    onClick={() =>
                                      toggleSubtask(project.id, milestone.id, subtask.id)
                                    }
                                    className="flex items-center gap-2.5 cursor-pointer py-1 group"
                                  >
                                    {subtask.completed ? (
                                      <CheckSquare className="h-4 w-4 text-emerald-400 shrink-0" />
                                    ) : (
                                      <Square className="h-4 w-4 text-slate-500 group-hover:text-sky-400 shrink-0 transition-colors" />
                                    )}
                                    <span
                                      className={`text-xs ${
                                        subtask.completed
                                          ? 'line-through text-slate-500'
                                          : 'text-slate-300 group-hover:text-white'
                                      }`}
                                    >
                                      {subtask.title}
                                    </span>
                                  </div>
                                ))}

                                {/* Add Subtask Input */}
                                <div className="flex items-center gap-2 pt-2">
                                  <input
                                    type="text"
                                    placeholder="Add action step..."
                                    value={newSubtaskTitles[milestone.id] || ''}
                                    onChange={(e) =>
                                      setNewSubtaskTitles({
                                        ...newSubtaskTitles,
                                        [milestone.id]: e.target.value,
                                      })
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const title = newSubtaskTitles[milestone.id]?.trim();
                                        if (title) {
                                          addSubtask(project.id, milestone.id, title);
                                          setNewSubtaskTitles({
                                            ...newSubtaskTitles,
                                            [milestone.id]: '',
                                          });
                                        }
                                      }
                                    }}
                                    className="w-full text-xs py-1 px-2.5"
                                  />
                                  <button
                                    onClick={() => {
                                      const title = newSubtaskTitles[milestone.id]?.trim();
                                      if (title) {
                                        addSubtask(project.id, milestone.id, title);
                                        setNewSubtaskTitles({
                                          ...newSubtaskTitles,
                                          [milestone.id]: '',
                                        });
                                      }
                                    }}
                                    className="rounded-lg border border-sky-500/30 bg-sky-500/15 px-2.5 py-1 text-xs text-sky-300 hover:bg-sky-500/25 shrink-0"
                                  >
                                    Add Step
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Add New Milestone */}
                          <div className="flex items-center gap-2 pt-2">
                            <input
                              type="text"
                              placeholder="New milestone title..."
                              value={newMilestoneTitles[project.id] || ''}
                              onChange={(e) =>
                                setNewMilestoneTitles({
                                  ...newMilestoneTitles,
                                  [project.id]: e.target.value,
                                })
                              }
                              className="text-xs flex-1 py-1.5 px-3"
                            />
                            <button
                              onClick={() => {
                                const title = newMilestoneTitles[project.id]?.trim();
                                if (title) {
                                  addMilestone(project.id, title);
                                  setNewMilestoneTitles({
                                    ...newMilestoneTitles,
                                    [project.id]: '',
                                  });
                                }
                              }}
                              className="rounded-xl border border-sky-500/30 bg-sky-500/15 px-4 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/25"
                            >
                              Add Milestone
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Notes & Links Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Context Notes */}
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-sky-400" />
                            Context Notes & Architecture
                          </h5>
                          <textarea
                            rows={3}
                            value={project.notes}
                            onChange={(e) =>
                              updateProject(project.id, { notes: e.target.value })
                            }
                            placeholder="Add architecture notes, credentials guidelines, and sprint thoughts..."
                            className="w-full text-xs"
                          />
                        </div>

                        {/* Project Links */}
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                            <LinkIcon className="h-3.5 w-3.5 text-sky-400" />
                            Key Repositories & Docs Links
                          </h5>
                          <div className="space-y-1.5 max-h-24 overflow-y-auto">
                            {project.links && project.links.length > 0 ? (
                              project.links.map((link, idx) => (
                                <a
                                  key={idx}
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-xs text-sky-400 hover:underline truncate"
                                >
                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{link}</span>
                                </a>
                              ))
                            ) : (
                              <p className="text-xs text-slate-500">No links added yet.</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Project Action Bar */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400">Change Status:</span>
                          <select
                            value={project.status}
                            onChange={(e) =>
                              updateProject(project.id, {
                                status: e.target.value as ProjectStatus,
                              })
                            }
                            className="py-1 px-2.5 text-xs"
                          >
                            <option value="Planning">Planning</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Review">Review</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>

                        <button
                          onClick={() => {
                            if (confirm('Delete this project and its milestones?')) {
                              removeProject(project.id);
                            }
                          }}
                          className="flex items-center gap-1.5 text-rose-400/70 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete Project</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassPanel>
            );
          })}
        </div>
      )}

      {/* TAB 2: TASKS VIEW */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <GlassPanel className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={taskStatusFilter}
                  onChange={(e) => setTaskStatusFilter(e.target.value)}
                  className="text-xs"
                >
                  <option value="All">All Statuses</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                <select
                  value={taskPriorityFilter}
                  onChange={(e) => setTaskPriorityFilter(e.target.value)}
                  className="text-xs"
                >
                  <option value="All">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <span className="text-xs text-slate-400">
                {filteredTasks.length} task(s) active
              </span>
            </div>
          </GlassPanel>

          {/* Tasks List */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task) => {
                const isCompleted = task.status === 'Completed';
                const isDueToday = isToday(task.dueDate);
                const linkedProject = projects.find((p) => p.id === task.projectId);

                return (
                  <GlassCard
                    key={task.id}
                    hover
                    glow={!isCompleted && isDueToday}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 ${
                      isCompleted ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                      <button
                        onClick={() => toggleWorkTaskCompletion(task.id)}
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
                            className={`font-semibold text-white text-sm sm:text-base ${
                              isCompleted ? 'line-through text-slate-500' : ''
                            }`}
                          >
                            {task.title}
                          </span>
                          <PriorityBadge priority={task.priority} />
                          {linkedProject && (
                            <span className="rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-300">
                              {linkedProject.title}
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-slate-500" />
                            {task.estimatedHours} hrs est.
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-slate-500" />
                            Due: {formatDate(task.dueDate)}
                          </span>
                          {isDueToday && !isCompleted && (
                            <span className="text-sky-400 font-semibold">• Due Today</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                      <StatusBadge status={task.status} />

                      <select
                        value={task.status}
                        onChange={(e) =>
                          updateWorkTask(task.id, { status: e.target.value as TaskStatus })
                        }
                        className="py-1 px-2 text-xs"
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>

                      <button
                        onClick={() => removeWorkTask(task.id)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </GlassCard>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
        title="Create Dedicated Project"
        description="Launch an operational work stream with milestones and action steps."
      >
        <form onSubmit={handleAddProjectSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Project Title</label>
            <input
              type="text"
              required
              placeholder="e.g. n8n Enterprise Workflow Automation"
              value={projTitle}
              onChange={(e) => setProjTitle(e.target.value)}
              className="w-full text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Description & Objectives
            </label>
            <textarea
              rows={2}
              required
              placeholder="Primary deliverables, sprint roadmap, and success criteria..."
              value={projDesc}
              onChange={(e) => setProjDesc(e.target.value)}
              className="w-full text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Deadline
              </label>
              <input
                type="date"
                required
                value={projDeadline}
                onChange={(e) => setProjDeadline(e.target.value)}
                className="w-full text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Status</label>
              <select
                value={projStatus}
                onChange={(e) => setProjStatus(e.target.value as ProjectStatus)}
                className="w-full text-sm"
              >
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Context Notes</label>
            <textarea
              rows={2}
              placeholder="Architecture notes, API keys location, etc."
              value={projNotes}
              onChange={(e) => setProjNotes(e.target.value)}
              className="w-full text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Key Links (one per line)
            </label>
            <textarea
              rows={2}
              placeholder="https://github.com/...&#10;https://n8n.cloud/..."
              value={projLinkInput}
              onChange={(e) => setProjLinkInput(e.target.value)}
              className="w-full text-sm font-mono text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsAddProjectModalOpen(false)}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
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

      {/* Add Work Task Modal */}
      <Modal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        title="Add Work Sprint Task"
        description="Create an actionable development or operational task."
      >
        <form onSubmit={handleAddTaskSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Finish WhatsApp Webhook Node in n8n"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Priority</label>
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

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Estimated Hours
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                className="w-full text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Due Date</label>
              <input
                type="date"
                required
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Status</label>
              <select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                className="w-full text-sm"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Associated Project
              </label>
              <select
                value={taskProjectId}
                onChange={(e) => setTaskProjectId(e.target.value)}
                className="w-full text-sm"
              >
                <option value="">None (Independent)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsAddTaskModalOpen(false)}
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
