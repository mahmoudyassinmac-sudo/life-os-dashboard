# Life OS — Personal & Work Operational Dashboard

A high-performance personal operations dashboard built with **Next.js (App Router)**, **Tailwind CSS**, **Framer Motion**, **TypeScript**, and **Lucide Icons**, adhering strictly to the Apple-style **"Warm Dark Glassy V2"** design system.

---

## 🎨 Design System: Warm Dark Glassy V2
- **Ambient Canvas**: Deep radial gradient (`radial-gradient(circle at 50% -20%, #2e1d11 0%, #120d0a 50%, #080504 100%)`) with animated floating orbs (`amber-600/15`, `orange-700/10`).
- **Glass Components**: `.glass-card` and `.glass-panel` components (`rgba(255, 255, 255, 0.07)` background, `backdrop-blur-2xl`, `border border-white/15`, top inner light reflections, and `rounded-2xl`).
- **Micro-interactions**: Smooth hover lift transitions (`whileHover={{ y: -4 }}`) and `framer-motion` layout animations.
- **Accents**: Glowing amber/gold highlights (`#f59e0b`, `amber-400`).

---

## 🏛️ Core Modules & Routes

### 1. Main Dashboard Overview (`/`)
- **Daily Tasks Today Widget**: Filtered view across Home and Work due today.
- **Upcoming Payments & Subscriptions**: Warning banner and cards for items due within next 7–14 days, with urgent highlights for $\le 3$ days.
- **Quick Action Bar**: Modals for instant entry of Expenses, Subscriptions, Tasks, and Projects.
- **KPI Summary Cards**: Total Monthly Expenses, Active Subscriptions Cost, Pending Home Tasks, and Work Project Velocity.
- **Active Projects Engine**: Highlighting top deliverables with live progress bars.

### 2. Personal Expenses Tracker (`/expenses`)
- **Fields**: Title, Category (Bills, Family, Maintenance, Health, Personal), Amount (AED/USD), Due Date, Payment Status (`Paid`, `Pending`, `Overdue`), Recurring Option (`One-time`, `Monthly`, `Yearly`).
- **Features**: Total monthly commitment tally, status filtering, due date sorting, quick "Mark as Paid" action, and add/delete modals.

### 3. Monthly Subscriptions Hub (`/subscriptions`)
- **Fields**: Service Name (ChatGPT Plus, Vercel Pro, iCloud+, Gym, Netflix, etc.), Cost, Billing Cycle (Monthly/Annual), Renewal Date, Payment Method, Status (`Active`, `Paused`, `Canceling`).
- **Features**: Live countdown (`X days remaining`), auto-amber warning alert when renewal is in $< 5$ days, and normalized monthly spend calculation.

### 4. Home Tasks Tracker (`/home-tasks`)
- **Fields**: Task Title, Category (Maintenance, Groceries, Family, Utility), Priority (`High`, `Medium`, `Low`), Due Date, Status (`To Do`, `In Progress`, `Completed`).
- **Features**: Interactive checklist view, quick one-click completion toggle, and category/priority filters.

### 5. Work Tasks & Project Engine (`/work-projects`)
- **Tasks View**: Sprint items with estimated hours, priorities, due dates, and status.
- **Projects Management Module**:
  - Interactive Project Cards with animated progress bars (0–100%).
  - **Milestones & Action Steps Tracker**: Checking nested action steps automatically recalculates milestone and project completion percentages.
  - Ability to add milestones and subtasks dynamically.
  - Context notes and external documentation links.

---

## 🔄 n8n Automation & Webhook Integration Layer

### 1. Daily Briefing API Endpoint (`GET /api/reminders`)
Extracts and structures all pending commitments for the n8n Daily Email Briefing:
- **Security Check**: Optional API key authentication via `x-api-key` header checked against `process.env.N8N_API_KEY`. Returns `401 Unauthorized` on mismatch.
- **Due Expenses**: Unpaid items where `dueDate <= target3Days` (with calculated `days_left`).
- **Due Subscriptions**: Active services where `renewalDate <= target3Days` (with calculated `days_left`).
- **Home Tasks**: Pending items where `dueDate <= today` (due today & overdue).
- **Work Tasks & Milestones**: Pending work sprint items or project milestones where `dueDate <= today`.
- **Response Format**:
  ```json
  {
    "success": true,
    "timestamp": "2026-10-28T09:00:00Z",
    "summary": {
      "expenses_count": 4,
      "subscriptions_count": 2,
      "home_tasks_count": 2,
      "work_tasks_count": 2
    },
    "due_expenses": [
      { "id": "exp-1", "title": "DEWA Electric & Water Bill", "amount": 540, "currency": "AED", "dueDate": "2026-10-30", "days_left": 2 }
    ],
    "due_subscriptions": [
      { "id": "sub-1", "title": "ChatGPT Plus & Codex", "cost": 75, "currency": "AED", "renewalDate": "2026-10-29", "days_left": 1 }
    ],
    "home_tasks": [
      { "id": "ht-1", "title": "Replace Master Bedroom Water Filter Cartridge", "priority": "High", "dueDate": "2026-10-28" }
    ],
    "work_tasks": [
      { "id": "wt-1", "title": "Finish WhatsApp Webhook Node in n8n pipeline", "project": "WhatsApp Dashboard Automation", "priority": "High", "dueDate": "2026-10-28" }
    ]
  }
  ```

### 2. Manual Test Trigger Buttons
- **`[📧 Test Daily Briefing Dispatch]`**: Located in the top header and dashboard overview. Synchronizes current state, fetches `/api/reminders`, dispatches to n8n, and displays a glassy toast notification with payload statistics.
- **`[⚡ Sync & Dispatch Reminders via n8n]`**: Evaluates full payload and triggers `/api/webhooks/automation-dispatch`.

---

## 🚀 Getting Started

```bash
cd life-os
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.
