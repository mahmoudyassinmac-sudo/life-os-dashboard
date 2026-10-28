import { NextResponse } from 'next/server';
import { Expense, Subscription, HomeTask, WorkTask, Project } from '@/lib/types';
import { daysUntil, isToday } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const expenses: Expense[] = body.expenses || [];
    const subscriptions: Subscription[] = body.subscriptions || [];
    const homeTasks: HomeTask[] = body.homeTasks || [];
    const workTasks: WorkTask[] = body.workTasks || [];
    const projects: Project[] = body.projects || [];

    const baseDateStr = '2026-10-28';

    // 1. Subscriptions & Expenses due in <= 3 days (and not paid)
    const dueExpenses = expenses
      .filter((exp) => {
        if (exp.status === 'Paid') return false;
        const days = daysUntil(exp.dueDate, baseDateStr);
        return days <= 3; // due in <= 3 days or already overdue
      })
      .map((exp) => ({
        id: exp.id,
        title: exp.title,
        amount: exp.amount,
        currency: exp.currency,
        due_date: exp.dueDate,
        status: exp.status,
      }));

    const upcomingSubscriptions = subscriptions
      .filter((sub) => {
        if (sub.status !== 'Active') return false;
        const days = daysUntil(sub.renewalDate, baseDateStr);
        return days <= 3 && days >= 0;
      })
      .map((sub) => ({
        id: sub.id,
        service: sub.serviceName,
        cost: sub.cost,
        currency: sub.currency,
        renewal_date: sub.renewalDate,
        payment_method: sub.paymentMethod,
      }));

    // 2. High-priority Work/Home tasks due today
    const todayTasks: Array<{ title: string; type: 'Home' | 'Work'; priority: string }> = [];

    homeTasks.forEach((t) => {
      if (t.status !== 'Completed' && (isToday(t.dueDate, baseDateStr) || t.priority === 'High')) {
        todayTasks.push({
          title: t.title,
          type: 'Home',
          priority: t.priority,
        });
      }
    });

    workTasks.forEach((t) => {
      if (t.status !== 'Completed' && (isToday(t.dueDate, baseDateStr) || t.priority === 'High')) {
        todayTasks.push({
          title: t.title,
          type: 'Work',
          priority: t.priority,
        });
      }
    });

    // 3. Project milestones arriving at deadline (target deadline <= 7 days or incomplete milestones)
    const milestoneDeadlines: Array<{ project: string; deadline: string; progress: number }> = [];
    projects.forEach((p) => {
      if (p.status !== 'Completed') {
        const days = daysUntil(p.targetDeadline, baseDateStr);
        if (days <= 14) {
          milestoneDeadlines.push({
            project: p.title,
            deadline: p.targetDeadline,
            progress: p.progress,
          });
        }
      }
    });

    const payload = {
      event: 'daily_system_reminder',
      timestamp: new Date().toISOString(),
      due_expenses: dueExpenses,
      upcoming_subscriptions: upcomingSubscriptions,
      today_tasks: todayTasks,
      milestone_deadlines: milestoneDeadlines,
      notification_targets: ['whatsapp', 'email'],
    };

    // If an external n8n webhook URL is configured via environment variable, forward it
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    let n8nForwardStatus = 'local_evaluation_ready';

    if (n8nWebhookUrl) {
      try {
        const forwardRes = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        n8nForwardStatus = forwardRes.ok
          ? 'forwarded_to_n8n'
          : `n8n_returned_${forwardRes.status}`;
      } catch (fwdErr) {
        n8nForwardStatus = `forward_failed: ${fwdErr instanceof Error ? fwdErr.message : 'error'}`;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Evaluated ${dueExpenses.length} urgent expense(s), ${upcomingSubscriptions.length} renewing subscription(s), and ${todayTasks.length} priority task(s).`,
      status: n8nForwardStatus,
      dispatched_payload: payload,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process automation dispatch',
      },
      { status: 500 }
    );
  }
}

