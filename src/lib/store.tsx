'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Expense, Subscription, HomeTask, WorkTask, Project } from './types';
import { initialExpenses, initialSubscriptions, initialHomeTasks, initialWorkTasks, initialProjects } from './seed-data';

interface StoreContextType {
  expenses: Expense[];
  subscriptions: Subscription[];
  homeTasks: HomeTask[];
  workTasks: WorkTask[];
  projects: Project[];
  isLoaded: boolean;

  // Expenses
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  removeExpense: (id: string) => void;
  markExpensePaid: (id: string) => void;

  // Subscriptions
  addSubscription: (sub: Omit<Subscription, 'id' | 'createdAt'>) => void;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  removeSubscription: (id: string) => void;

  // Home Tasks
  addHomeTask: (task: Omit<HomeTask, 'id' | 'createdAt'>) => void;
  updateHomeTask: (id: string, updates: Partial<HomeTask>) => void;
  removeHomeTask: (id: string) => void;
  toggleHomeTaskCompletion: (id: string) => void;

  // Work Tasks
  addWorkTask: (task: Omit<WorkTask, 'id' | 'createdAt'>) => void;
  updateWorkTask: (id: string, updates: Partial<WorkTask>) => void;
  removeWorkTask: (id: string) => void;
  toggleWorkTaskCompletion: (id: string) => void;

  // Projects
  addProject: (proj: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  toggleSubtask: (projectId: string, milestoneId: string, subtaskId: string) => void;
  addMilestone: (projectId: string, title: string) => void;
  addSubtask: (projectId: string, milestoneId: string, title: string) => void;

  // Reset/Reset Seed
  resetToDefaults: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY = 'life_os_data_v2';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [homeTasks, setHomeTasks] = useState<HomeTask[]>([]);
  const [workTasks, setWorkTasks] = useState<WorkTask[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage or seed
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setExpenses(parsed.expenses || initialExpenses);
        setSubscriptions(parsed.subscriptions || initialSubscriptions);
        setHomeTasks(parsed.homeTasks || initialHomeTasks);
        setWorkTasks(parsed.workTasks || initialWorkTasks);
        setProjects(parsed.projects || initialProjects);
      } else {
        setExpenses(initialExpenses);
        setSubscriptions(initialSubscriptions);
        setHomeTasks(initialHomeTasks);
        setWorkTasks(initialWorkTasks);
        setProjects(initialProjects);
      }
    } catch {
      setExpenses(initialExpenses);
      setSubscriptions(initialSubscriptions);
      setHomeTasks(initialHomeTasks);
      setWorkTasks(initialWorkTasks);
      setProjects(initialProjects);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    setIsLoaded(true);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          expenses,
          subscriptions,
          homeTasks,
          workTasks,
          projects,
        })
      );
    } catch (e) {
      console.error('Failed to sync to localStorage:', e);
    }
  }, [expenses, subscriptions, homeTasks, workTasks, projects, isLoaded]);

  // Expenses actions
  const addExpense = (data: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExp: Expense = {
      ...data,
      id: 'exp-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const removeExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const markExpensePaid = (id: string) => {
    updateExpense(id, { status: 'Paid' });
  };

  // Subscriptions actions
  const addSubscription = (data: Omit<Subscription, 'id' | 'createdAt'>) => {
    const newSub: Subscription = {
      ...data,
      id: 'sub-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setSubscriptions((prev) => [newSub, ...prev]);
  };

  const updateSubscription = (id: string, updates: Partial<Subscription>) => {
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const removeSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  };

  // Home Tasks actions
  const addHomeTask = (data: Omit<HomeTask, 'id' | 'createdAt'>) => {
    const newTask: HomeTask = {
      ...data,
      id: 'ht-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setHomeTasks((prev) => [newTask, ...prev]);
  };

  const updateHomeTask = (id: string, updates: Partial<HomeTask>) => {
    setHomeTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const removeHomeTask = (id: string) => {
    setHomeTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleHomeTaskCompletion = (id: string) => {
    setHomeTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const newStatus = t.status === 'Completed' ? 'To Do' : 'Completed';
        return { ...t, status: newStatus };
      })
    );
  };

  // Work Tasks actions
  const addWorkTask = (data: Omit<WorkTask, 'id' | 'createdAt'>) => {
    const newTask: WorkTask = {
      ...data,
      id: 'wt-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setWorkTasks((prev) => [newTask, ...prev]);
  };

  const updateWorkTask = (id: string, updates: Partial<WorkTask>) => {
    setWorkTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const removeWorkTask = (id: string) => {
    setWorkTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleWorkTaskCompletion = (id: string) => {
    setWorkTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const newStatus = t.status === 'Completed' ? 'To Do' : 'Completed';
        return { ...t, status: newStatus };
      })
    );
  };

  // Projects actions
  const addProject = (data: Omit<Project, 'id' | 'createdAt'>) => {
    const newProj: Project = {
      ...data,
      id: 'proj-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProj, ...prev]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const removeProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleSubtask = (projectId: string, milestoneId: string, subtaskId: string) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        const updatedMilestones = project.milestones.map((milestone) => {
          if (milestone.id !== milestoneId) return milestone;

          const updatedSubtasks = milestone.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          const allSubtasksDone =
            updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed);

          return {
            ...milestone,
            completed: allSubtasksDone,
            subtasks: updatedSubtasks,
          };
        });

        // Recalculate total project progress %
        let totalSubs = 0;
        let completedSubs = 0;
        updatedMilestones.forEach((m) => {
          totalSubs += m.subtasks.length;
          completedSubs += m.subtasks.filter((s) => s.completed).length;
        });

        const newProgress = totalSubs > 0 ? Math.round((completedSubs / totalSubs) * 100) : 0;
        const newStatus = newProgress === 100 ? 'Completed' : project.status;

        return {
          ...project,
          milestones: updatedMilestones,
          progress: newProgress,
          status: newStatus,
        };
      })
    );
  };

  const addMilestone = (projectId: string, title: string) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;
        const newM = {
          id: 'm-' + Date.now(),
          title,
          completed: false,
          subtasks: [],
        };
        return {
          ...project,
          milestones: [...project.milestones, newM],
        };
      })
    );
  };

  const addSubtask = (projectId: string, milestoneId: string, title: string) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;
        const updatedMilestones = project.milestones.map((m) => {
          if (m.id !== milestoneId) return m;
          const newSub = {
            id: 'st-' + Date.now(),
            title,
            completed: false,
          };
          return {
            ...m,
            completed: false,
            subtasks: [...m.subtasks, newSub],
          };
        });

        // recalculate progress
        let totalSubs = 0;
        let completedSubs = 0;
        updatedMilestones.forEach((m) => {
          totalSubs += m.subtasks.length;
          completedSubs += m.subtasks.filter((s) => s.completed).length;
        });
        const newProgress = totalSubs > 0 ? Math.round((completedSubs / totalSubs) * 100) : 0;

        return {
          ...project,
          milestones: updatedMilestones,
          progress: newProgress,
        };
      })
    );
  };

  const resetToDefaults = () => {
    setExpenses(initialExpenses);
    setSubscriptions(initialSubscriptions);
    setHomeTasks(initialHomeTasks);
    setWorkTasks(initialWorkTasks);
    setProjects(initialProjects);
  };

  return (
    <StoreContext.Provider
      value={{
        expenses,
        subscriptions,
        homeTasks,
        workTasks,
        projects,
        isLoaded,
        addExpense,
        updateExpense,
        removeExpense,
        markExpensePaid,
        addSubscription,
        updateSubscription,
        removeSubscription,
        addHomeTask,
        updateHomeTask,
        removeHomeTask,
        toggleHomeTaskCompletion,
        addWorkTask,
        updateWorkTask,
        removeWorkTask,
        toggleWorkTaskCompletion,
        addProject,
        updateProject,
        removeProject,
        toggleSubtask,
        addMilestone,
        addSubtask,
        resetToDefaults,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
