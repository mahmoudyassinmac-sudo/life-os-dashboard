import fs from 'fs';
import path from 'path';
import { Expense, Subscription, HomeTask, WorkTask, Project } from './types';
import {
  initialExpenses,
  initialSubscriptions,
  initialHomeTasks,
  initialWorkTasks,
  initialProjects,
} from './seed-data';

export interface StorageData {
  expenses: Expense[];
  subscriptions: Subscription[];
  homeTasks: HomeTask[];
  workTasks: WorkTask[];
  projects: Project[];
}

const DB_FILE = path.join(process.cwd(), 'src', 'data', 'db.json');

export function getServerData(): StorageData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        expenses: parsed.expenses || initialExpenses,
        subscriptions: parsed.subscriptions || initialSubscriptions,
        homeTasks: parsed.homeTasks || initialHomeTasks,
        workTasks: parsed.workTasks || initialWorkTasks,
        projects: parsed.projects || initialProjects,
      };
    }
  } catch (err) {
    console.error('Failed to read db.json, falling back to seed data:', err);
  }

  return {
    expenses: initialExpenses,
    subscriptions: initialSubscriptions,
    homeTasks: initialHomeTasks,
    workTasks: initialWorkTasks,
    projects: initialProjects,
  };
}

export function saveServerData(data: Partial<StorageData>): void {
  try {
    const existing = getServerData();
    const merged: StorageData = {
      expenses: data.expenses || existing.expenses,
      subscriptions: data.subscriptions || existing.subscriptions,
      homeTasks: data.homeTasks || existing.homeTasks,
      workTasks: data.workTasks || existing.workTasks,
      projects: data.projects || existing.projects,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save to db.json:', err);
  }
}

