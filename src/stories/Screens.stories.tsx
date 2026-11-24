import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { TrackerView } from "@/widgets/tracker-view"
import { TodayLogDrawer } from "@/widgets/today-log"
import { INITIAL_PROJECTS } from "@/entities/project"
import type { ActiveTimerState } from "@/entities/tracker"
import type { TimeSession } from "@/entities/session"

const IDLE_TIMER: ActiveTimerState = {
  status: "idle",
  startTime: null,
  accumulatedSeconds: 0,
  elapsedSeconds: 0,
  projectId: null,
  milestoneId: null,
  milestoneName: null,
  memo: "",
  rate: null,
  billingType: "none",
  fixedBudget: 0,
  currency: "$",
  pausedAt: null,
  segments: [],
}

const createTodaySessions = (): TimeSession[] => {
  const d = new Date()
  const at = (h: number, m: number) => {
    const t = new Date(d)
    t.setHours(h, m, 0, 0)
    return t.getTime()
  }
  return [
    {
      id: "scr-1",
      projectId: "proj-kerd",
      milestoneId: "ms-kerd-2",
      milestoneName: "M 2 Token Command Palette",
      memo: "Token badges & responsive polish",
      startTime: at(9, 30),
      endTime: at(11, 0),
      durationSeconds: 5400,
      rateSnapshot: 0,
      earnedAmount: 2300,
      billingType: "milestone",
      currency: "$",
    },
    {
      id: "scr-2",
      projectId: "proj-kerd",
      memo: "WCAG contrast & Storybook audit",
      startTime: at(11, 30),
      endTime: at(12, 30),
      durationSeconds: 3600,
      rateSnapshot: 85,
      earnedAmount: 85,
      billingType: "hourly",
      currency: "$",
    },
    {
      id: "scr-3",
      projectId: "proj-raycast",
      memo: "Extension store manifest & icons",
      startTime: at(14, 0),
      endTime: at(15, 15),
      durationSeconds: 4500,
      rateSnapshot: 95,
      earnedAmount: 118.75,
      billingType: "hourly",
      currency: "$",
    },
    {
      id: "scr-4",
      projectId: "no-project",
      memo: "Inbox triage & daily planning",
      startTime: at(16, 0),
      endTime: at(16, 30),
      durationSeconds: 1800,
      rateSnapshot: 0,
      earnedAmount: 0,
      billingType: "hourly",
      currency: "$",
    },
  ]
}

const meta: Meta = {
  title: "Screens/Single-Day MVP Cockpit",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
### End-to-End Production MVP Screens (US-1 through US-5)

Complete single-day focus journey on \`main\`: no sidebar or multi-page navigation — just the centered command cockpit, active horological chronograph, in-flight header editor, and receipt-style \`Today's Log\` drawer.
        `,
      },
    },
  },
}

export default meta

export const IdleCockpit: StoryObj = {
  parameters: {
    docs: {
      description: {
        story:
          "**Screen 1 · Idle Cockpit (US-1)**: Entry screen ready for natural-language task input (`@project`, `/hourly`, `/milestone`, or plain non-billable memo) with the floating `Today's Log` summary pill docked at the bottom.",
      },
    },
  },
  render: () => (
    <div className="relative h-[580px] w-full overflow-hidden transform-gpu">
      <TrackerView timerOverride={IDLE_TIMER} sessionsOverride={createTodaySessions()} />
    </div>
  ),
}

export const ActiveTimerCockpit: StoryObj = {
  parameters: {
    docs: {
      description: {
        story:
          "**Screen 2 · Active Horological Focus — Hourly (US-3)**: Running 1h 10m hourly session (`Kerdio Core` · `$85/h`). Centered session header above, 12-hour chronograph dial in physical center, and quick transport controls (`Space`, `⌘↵`, `Esc`) below.",
      },
    },
  },
  render: () => {
    const now = Date.now()
    const durationSeconds = 4200
    return (
      <div className="relative h-[620px] w-full overflow-hidden transform-gpu">
        <TrackerView
          sessionsOverride={createTodaySessions()}
          timerOverride={{
            ...IDLE_TIMER,
            status: "running",
            memo: "SVG Chronograph bezel trigonometry",
            projectId: "proj-kerd",
            startTime: now - durationSeconds * 1000,
            elapsedSeconds: durationSeconds,
            rate: 85,
            billingType: "hourly",
          }}
        />
      </div>
    )
  },
}

export const ActiveMilestoneCockpit: StoryObj = {
  parameters: {
    docs: {
      description: {
        story:
          "**Screen 3 · Active Horological Focus — Milestone (US-2 / US-3)**: Running 1h 30m milestone session (`Kerdio Core` · `M 2 Token Command Palette` · `$2300`). Top header displays the milestone flag pill; clicking the dial centerpiece reveals the live effective hourly rate.",
      },
    },
  },
  render: () => {
    const now = Date.now()
    const durationSeconds = 5400
    return (
      <div className="relative h-[620px] w-full overflow-hidden transform-gpu">
        <TrackerView
          sessionsOverride={createTodaySessions()}
          timerOverride={{
            ...IDLE_TIMER,
            status: "running",
            memo: "Two-step milestone entry & caret polish",
            projectId: "proj-kerd",
            milestoneId: "ms-kerd-2",
            milestoneName: "M 2 Token Command Palette",
            startTime: now - durationSeconds * 1000,
            elapsedSeconds: durationSeconds,
            rate: null,
            billingType: "milestone",
            fixedBudget: 2300,
          }}
        />
      </div>
    )
  },
}

export const PausedCockpit: StoryObj = {
  parameters: {
    docs: {
      description: {
        story:
          "**Screen 4 · Paused Focus Session (US-3)**: Paused at 1h 20m (`Raycast Extension` · `$95/h`). Inward particles and `15s` digit pulse stop immediately; Pause button switches to Play (`Space` to resume).",
      },
    },
  },
  render: () => {
    const now = Date.now()
    const durationSeconds = 4800
    return (
      <div className="relative h-[620px] w-full overflow-hidden transform-gpu">
        <TrackerView
          sessionsOverride={createTodaySessions()}
          timerOverride={{
            ...IDLE_TIMER,
            status: "paused",
            memo: "Extension store manifest & icons",
            projectId: "proj-raycast",
            startTime: null,
            pausedAt: now,
            accumulatedSeconds: durationSeconds,
            elapsedSeconds: durationSeconds,
            rate: 95,
            billingType: "hourly",
            segments: [{ startTime: now - durationSeconds * 1000, endTime: now }],
          }}
        />
      </div>
    )
  },
}

export const NoProjectNonBillableCockpit: StoryObj = {
  parameters: {
    docs: {
      description: {
        story:
          "**Screen 5 · No Project & Non-Billable Focus (US-1)**: Session started with a memo only — explicitly displays the neutral `No project` badge in the header and `Non-billable` beneath the dial.",
      },
    },
  },
  render: () => {
    const now = Date.now()
    const durationSeconds = 1200
    return (
      <div className="relative h-[620px] w-full overflow-hidden transform-gpu">
        <TrackerView
          sessionsOverride={[]}
          timerOverride={{
            ...IDLE_TIMER,
            status: "running",
            memo: "Inbox triage & daily planning",
            projectId: null,
            startTime: now - durationSeconds * 1000,
            elapsedSeconds: durationSeconds,
            rate: null,
            billingType: "none",
          }}
        />
      </div>
    )
  },
}

export const EditingActiveSession: StoryObj = {
  parameters: {
    docs: {
      description: {
        story:
          "**Screen 3 · In-Flight Session Editing (US-4)**: Clicking the top session header opens `TokenCommandInput` over a blurred backdrop (`bg-black/35 backdrop-blur-md`) to adjust project, billing, or memo while the chronograph keeps running underneath.",
      },
    },
  },
  render: () => {
    const now = Date.now()
    const durationSeconds = 4200
    return (
      <div className="relative h-[620px] w-full overflow-hidden transform-gpu">
        <TrackerView
          initialEditingHeader={true}
          sessionsOverride={createTodaySessions()}
          timerOverride={{
            ...IDLE_TIMER,
            status: "running",
            memo: "SVG Chronograph bezel trigonometry",
            projectId: "proj-kerd",
            startTime: now - durationSeconds * 1000,
            elapsedSeconds: durationSeconds,
            rate: 85,
            billingType: "hourly",
          }}
        />
      </div>
    )
  },
}

export const TodayLogReceiptOpen: StoryObj = {
  parameters: {
    docs: {
      description: {
        story:
          "**Screen 4 · End-of-Day Receipt Drawer (US-5)**: Opened via the floating `Today's Log` pill or shortcut `L`. Shows grouped projects (`Kerdio Core` milestone + hourly, `Raycast Extension`, `No project`), 2-line Subtotals & Grand Total, and Copy/CSV actions.",
      },
    },
  },
  render: () => {
    const [sessions, setSessions] = useState<TimeSession[]>(createTodaySessions)

    return (
      <div className="relative h-[680px] w-full overflow-hidden transform-gpu">
        <TrackerView timerOverride={IDLE_TIMER} sessionsOverride={sessions} />
        <TodayLogDrawer
          isOpen={true}
          onClose={() => {}}
          sessionsOverride={sessions}
          projectsOverride={INITIAL_PROJECTS}
          onDeleteSession={(id) => setSessions((prev) => prev.filter((s) => s.id !== id))}
        />
      </div>
    )
  },
}
