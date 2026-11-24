import type { TimeSession } from "@/entities/session"

function atDayOffset(dayOffset: number, hours: number, minutes: number): number {
  const d = new Date()
  d.setDate(d.getDate() + dayOffset)
  d.setHours(hours, minutes, 0, 0)
  return d.getTime()
}

export function createWeeklyDemoSessions(): TimeSession[] {
  return [
    // Today
    {
      id: "demo-today-1",
      projectId: "proj-kerd",
      milestoneId: "ms-kerd-2",
      milestoneName: "M 2 Token Command Palette",
      memo: "Inline badge caret spacing & wrap polish",
      startTime: atDayOffset(0, 9, 15),
      endTime: atDayOffset(0, 10, 45),
      durationSeconds: 5400,
      rateSnapshot: 0,
      earnedAmount: 2300,
      billingType: "milestone",
      currency: "$",
    },
    {
      id: "demo-today-2",
      projectId: "proj-kerd",
      memo: "WCAG AA monochrome contrast audit",
      startTime: atDayOffset(0, 11, 30),
      endTime: atDayOffset(0, 12, 45),
      durationSeconds: 4500,
      rateSnapshot: 85,
      earnedAmount: 106.25,
      billingType: "hourly",
      currency: "$",
    },
    {
      id: "demo-today-3",
      projectId: "proj-raycast",
      memo: "Extension store manifest & icons",
      startTime: atDayOffset(0, 14, 0),
      endTime: atDayOffset(0, 15, 30),
      durationSeconds: 5400,
      rateSnapshot: 95,
      earnedAmount: 142.5,
      billingType: "hourly",
      currency: "$",
    },
    {
      id: "demo-today-4",
      projectId: "no-project",
      memo: "Inbox triage & daily planning",
      startTime: atDayOffset(0, 16, 15),
      endTime: atDayOffset(0, 16, 45),
      durationSeconds: 1800,
      rateSnapshot: 0,
      earnedAmount: 0,
      billingType: "hourly",
      currency: "$",
    },
    // Yesterday
    {
      id: "demo-yest-1",
      projectId: "proj-design",
      milestoneId: "ms-des-1",
      milestoneName: "M 1 Design phase 1",
      memo: "Component token mapping & Figma sync",
      startTime: atDayOffset(-1, 10, 0),
      endTime: atDayOffset(-1, 12, 30),
      durationSeconds: 9000,
      rateSnapshot: 0,
      earnedAmount: 2300,
      billingType: "milestone",
      currency: "$",
    },
    {
      id: "demo-yest-2",
      projectId: "proj-kerd",
      memo: "Chronograph 12-hour arc segment physics",
      startTime: atDayOffset(-1, 14, 0),
      endTime: atDayOffset(-1, 16, 30),
      durationSeconds: 9000,
      rateSnapshot: 85,
      earnedAmount: 212.5,
      billingType: "hourly",
      currency: "$",
    },
    // 2 days ago
    {
      id: "demo-prev-1",
      projectId: "proj-raycast",
      memo: "OAuth token refresh & quick-start action",
      startTime: atDayOffset(-2, 9, 30),
      endTime: atDayOffset(-2, 11, 30),
      durationSeconds: 7200,
      rateSnapshot: 95,
      earnedAmount: 190,
      billingType: "hourly",
      currency: "$",
    },
    {
      id: "demo-prev-2",
      projectId: "proj-design",
      milestoneId: "ms-des-1",
      milestoneName: "M 1 Design phase 1",
      memo: "Typography scale & tabular numerals",
      startTime: atDayOffset(-2, 13, 30),
      endTime: atDayOffset(-2, 15, 0),
      durationSeconds: 5400,
      rateSnapshot: 0,
      earnedAmount: 0,
      billingType: "milestone",
      currency: "$",
    },
  ]
}
