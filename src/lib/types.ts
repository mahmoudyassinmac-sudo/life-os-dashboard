export type Currency = 'AED' | 'USD';

export type ExpenseCategory = 'Bills' | 'Family' | 'Maintenance' | 'Health' | 'Personal';
export type ExpenseStatus = 'Paid' | 'Pending' | 'Overdue';
export type RecurringFrequency = 'One-time' | 'Monthly' | 'Yearly';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  currency: Currency;
  dueDate: string; // ISO Date YYYY-MM-DD
  status: ExpenseStatus;
  recurring: RecurringFrequency;
  createdAt: string;
}

export type SubscriptionStatus = 'Active' | 'Paused' | 'Canceling';
export type BillingCycle = 'Monthly' | 'Annual';

export interface Subscription {
  id: string;
  serviceName: string;
  cost: number;
  currency: Currency;
  billingCycle: BillingCycle;
  renewalDate: string; // ISO Date YYYY-MM-DD
  paymentMethod: string; // e.g. "ADCB Card ****1234", "Apple Pay"
  status: SubscriptionStatus;
  createdAt: string;
}

export type HomeTaskCategory = 'Maintenance' | 'Groceries' | 'Family' | 'Utility';
export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'To Do' | 'In Progress' | 'Completed';

export interface HomeTask {
  id: string;
  title: string;
  category: HomeTaskCategory;
  priority: PriorityLevel;
  dueDate: string; // YYYY-MM-DD
  status: TaskStatus;
  createdAt: string;
}

export interface WorkTask {
  id: string;
  title: string;
  priority: PriorityLevel;
  estimatedHours: number;
  dueDate: string; // YYYY-MM-DD
  status: TaskStatus;
  projectId?: string;
  createdAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  subtasks: Subtask[];
}

export type ProjectStatus = 'Planning' | 'In Progress' | 'Review' | 'Completed';

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  targetDeadline: string; // YYYY-MM-DD
  progress: number; // 0-100
  milestones: Milestone[];
  notes: string;
  links: string[];
  createdAt: string;
}
