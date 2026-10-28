import { NextRequest, NextResponse } from 'next/server';
import { getServerData, saveServerData } from '@/lib/server-storage';

export async function GET(request: NextRequest) {
  // 1. Security Check
  const expectedApiKey = process.env.N8N_API_KEY;
  if (expectedApiKey) {
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== expectedApiKey) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or missing x-api-key header' },
        { status: 401 }
      );
    }
  }

  // 2. Date Math
  const { searchParams } = new URL(request.url);
  // Allow date override via query param for deterministic testing, defaulting to current system date
  const now = new Date();
  const defaultToday = now.toISOString().slice(0, 10);
  const todayStr = searchParams.get('date') || defaultToday;

  const baseDate = new Date(`${todayStr}T00:00:00Z`);
  const target3DaysDate = new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000);
  const target3DaysStr = target3DaysDate.toISOString().slice(0, 10);

  const getDaysLeft = (dateStr: string): number => {
    if (!dateStr) return 0;
    const target = new Date(`${dateStr}T00:00:00Z`);
    const diff = target.getTime() - baseDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // 3. Load Data
  const data = getServerData();

  // Due Expenses: status !== 'Paid' AND dueDate <= target3Days
  const dueExpenses = data.expenses
    .filter((exp) => exp.status !== 'Paid' && exp.dueDate <= target3DaysStr)
    .map((exp) => ({
      id: exp.id,
      title: exp.title,
      amount: exp.amount,
      currency: exp.currency,
      dueDate: exp.dueDate,
      days_left: getDaysLeft(exp.dueDate),
    }))
    .sort((a, b) => a.days_left - b.days_left);

  // Due Subscriptions: status === 'Active' AND renewalDate <= target3Days
  const dueSubscriptions = data.subscriptions
    .filter((sub) => sub.status === 'Active' && sub.renewalDate <= target3DaysStr)
    .map((sub) => ({
      id: sub.id,
      title: sub.serviceName,
      cost: sub.cost,
      currency: sub.currency,
      renewalDate: sub.renewalDate,
      days_left: getDaysLeft(sub.renewalDate),
    }))
    .sort((a, b) => a.days_left - b.days_left);

  // Home Tasks: status !== 'Completed' AND dueDate <= today (Today & Overdue)
  const homeTasks = data.homeTasks
    .filter((task) => task.status !== 'Completed' && task.dueDate <= todayStr)
    .map((task) => ({
      id: task.id,
      title: task.title,
      priority: task.priority,
      dueDate: task.dueDate,
    }))
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));

  // Work Tasks & Project Milestones: status !== 'Completed' AND dueDate <= today
  const projectMap = new Map<string, string>();
  data.projects.forEach((p) => {
    projectMap.set(p.id, p.title);
  });

  const workTasks: Array<{
    id: string;
    title: string;
    project: string;
    priority: string;
    dueDate: string;
  }> = [];

  // Work Tasks
  data.workTasks
    .filter((task) => task.status !== 'Completed' && task.dueDate <= todayStr)
    .forEach((task) => {
      workTasks.push({
        id: task.id,
        title: task.title,
        project: (task.projectId && projectMap.get(task.projectId)) || 'Independent',
        priority: task.priority,
        dueDate: task.dueDate,
      });
    });

  // Project Milestones arriving at deadline (today or overdue)
  data.projects
    .filter((p) => p.status !== 'Completed' && p.targetDeadline <= todayStr)
    .forEach((p) => {
      p.milestones
        .filter((m) => !m.completed)
        .forEach((m) => {
          workTasks.push({
            id: m.id,
            title: `[Milestone] ${m.title}`,
            project: p.title,
            priority: 'High',
            dueDate: p.targetDeadline,
          });
        });
    });

  // 4. Construct Response Payload
  const payload = {
    success: true,
    timestamp: now.toISOString(),
    summary: {
      expenses_count: dueExpenses.length,
      subscriptions_count: dueSubscriptions.length,
      home_tasks_count: homeTasks.length,
      work_tasks_count: workTasks.length,
    },
    due_expenses: dueExpenses,
    due_subscriptions: dueSubscriptions,
    home_tasks: homeTasks,
    work_tasks: workTasks,
  };

  return NextResponse.json(payload, { status: 200 });
}

// Optional POST handler allowing client or tests to sync current state
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.data) {
      saveServerData(body.data);
    }
    return NextResponse.json({ success: true, message: 'Server data synced' });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Invalid request' },
      { status: 400 }
    );
  }
}

