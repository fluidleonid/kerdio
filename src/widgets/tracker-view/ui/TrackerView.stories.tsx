import type { Meta, StoryObj } from "@storybook/react-vite"
import { TrackerView } from "./TrackerView"
import type { ActiveTimerState } from "@/entities/tracker"
import type { TimeSession } from "@/entities/session"

const getTodayAt = (hours: number, minutes: number) => {
  const d = new Date()
  d.setHours(hours, minutes, 0, 0)
  return d.getTime()
}

const SAMPLE_TODAY_SESSIONS: TimeSession[] = [
  {
    id: "tv-1",
    projectId: "proj-kerd",
    milestoneId: "ms-kerd-2",
    milestoneName: "M 2 Token Command Palette",
    memo: "Inline badge caret spacing & wrap polish",
    startTime: getTodayAt(9, 15),
    endTime: getTodayAt(10, 45),
    durationSeconds: 5400,
    rateSnapshot: 0,
    earnedAmount: 2300,
    billingType: "milestone",
    currency: "$",
  },
  {
    id: "tv-2",
    projectId: "proj-kerd",
    memo: "Accessibility contrast audit",
    startTime: getTodayAt(11, 15),
    endTime: getTodayAt(12, 30),
    durationSeconds: 4500,
    rateSnapshot: 85,
    earnedAmount: 106.25,
    billingType: "hourly",
    currency: "$",
  },
]

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

const meta: Meta<typeof TrackerView> = {
  title: "Widgets/Tracker View",
  component: TrackerView,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
### Single-Day Focus Cockpit (US-1, US-3, US-4, US-5)

Combines the centered \`TokenCommandInput\`, horological \`Chronograph\`, full-width centered session header, and floating \`Today's Log\` trigger pill (shortcut \`L\`).

#### Header & Controls Contract
- **No Billing Badge in Header**: Hourly rate or milestone payout lives inside the chronograph subtitle; the top header shows only memo, project badge (or \`No project\`), and milestone name badge (only when \`billingType === "milestone"\`).
- **In-Flight Editing**: Clicking the top header opens \`TokenCommandInput\` over a blurred backdrop (\`bg-black/35 backdrop-blur-md\`) without pausing the timer.
- **Floating Today's Log Pill**: Pure white typography + optically aligned icon + \`time · $amount\` summary when sessions exist today.
        `,
      },
    },
  },
  argTypes: {
    timerOverride: { table: { disable: true } },
    sessionsOverride: { table: { disable: true } },
    initialEditingHeader: { table: { disable: true } },
    initialLogOpen: { table: { disable: true } },
  },
}

export default meta
type Story = StoryObj<typeof TrackerView>

export const DefaultIdle: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**State: Idle Cockpit** · **US-1**: Initial launch state with centered `TokenCommandInput` and floating `Today's Log` pill showing today's running summary (`2h 45m · $2406`).",
      },
    },
  },
  render: () => (
    <div className="relative h-[620px] w-full overflow-hidden transform-gpu">
      <TrackerView timerOverride={IDLE_TIMER} sessionsOverride={SAMPLE_TODAY_SESSIONS} />
    </div>
  ),
}

export const ActiveHourlyTracking: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**State: Running (Hourly)** · **US-3**: Active hourly session (`Kerdio Core`, `$85/h`). Top header shows memo + project badge only (no duplicate billing badge); controls sit beneath the dial (`Space` Pause, `⌘↵` Save, `Esc` Reset).",
      },
    },
  },
  render: () => {
    const now = Date.now()
    const durationSeconds = 3840
    return (
      <div className="relative h-[620px] w-full overflow-hidden transform-gpu">
        <TrackerView
          sessionsOverride={SAMPLE_TODAY_SESSIONS}
          timerOverride={{
            ...IDLE_TIMER,
            status: "running",
            memo: "Design System Architecture & Horology Dial",
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

export const ActiveMilestoneTracking: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**State: Running (Milestone)** · **US-2 / US-3**: Active milestone session (`Fintech Design System` · `M 1 Design phase 1`). Top header includes the milestone flag pill alongside the project badge.",
      },
    },
  },
  render: () => {
    const now = Date.now()
    const durationSeconds = 5400
    return (
      <div className="relative h-[620px] w-full overflow-hidden transform-gpu">
        <TrackerView
          sessionsOverride={SAMPLE_TODAY_SESSIONS}
          timerOverride={{
            ...IDLE_TIMER,
            status: "running",
            memo: "Token parser & badge geometry",
            projectId: "proj-design",
            milestoneId: "ms-des-1",
            milestoneName: "M 1 Design phase 1",
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

export const NoProjectNonBillable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**State: Running (No Project · Non-Billable)** · **US-1**: Started with plain memo only. Header explicitly renders the `No project` neutral pill and chronograph displays `Non-billable`.",
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
            memo: "Weekly review & inbox zero",
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

export const EditingActiveHeader: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**State: In-Flight Session Edit** · **US-4**: Triggered by clicking the session header while the timer runs. Renders `TokenCommandInput` over a blurred scrim (`bg-black/35 backdrop-blur-md`) so the user can update memo, project, or billing without interrupting elapsed time.",
      },
    },
  },
  render: () => {
    const now = Date.now()
    const durationSeconds = 2700
    return (
      <div className="relative h-[620px] w-full overflow-hidden transform-gpu">
        <TrackerView
          initialEditingHeader={true}
          sessionsOverride={SAMPLE_TODAY_SESSIONS}
          timerOverride={{
            ...IDLE_TIMER,
            status: "running",
            memo: "Refining receipt table alignment",
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
