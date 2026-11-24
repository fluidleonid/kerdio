import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { TodayLogDrawer } from "./TodayLogDrawer"
import { INITIAL_PROJECTS } from "@/entities/project"
import type { TimeSession } from "@/entities/session"

const getTodayAt = (hours: number, minutes: number) => {
  const d = new Date()
  d.setHours(hours, minutes, 0, 0)
  return d.getTime()
}

const createSampleSessions = (): TimeSession[] => [
  {
    id: "story-1",
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
    id: "story-2",
    projectId: "proj-kerd",
    milestoneId: "ms-kerd-2",
    milestoneName: "M 2 Token Command Palette",
    memo: "Two-step milestone entry flow",
    startTime: getTodayAt(11, 0),
    endTime: getTodayAt(12, 0),
    durationSeconds: 3600,
    rateSnapshot: 0,
    earnedAmount: 0,
    billingType: "milestone",
    currency: "$",
  },
  {
    id: "story-3",
    projectId: "proj-kerd",
    memo: "Accessibility contrast audit",
    startTime: getTodayAt(13, 30),
    endTime: getTodayAt(14, 45),
    durationSeconds: 4500,
    rateSnapshot: 85,
    earnedAmount: 106.25,
    billingType: "hourly",
    currency: "$",
  },
  {
    id: "story-4",
    projectId: "proj-raycast",
    memo: "Extension store manifest & icons",
    startTime: getTodayAt(15, 0),
    endTime: getTodayAt(16, 15),
    durationSeconds: 4500,
    rateSnapshot: 95,
    earnedAmount: 118.75,
    billingType: "hourly",
    currency: "$",
  },
  {
    id: "story-5",
    projectId: "no-project",
    memo: "Inbox triage & daily planning",
    startTime: getTodayAt(16, 30),
    endTime: getTodayAt(17, 0),
    durationSeconds: 1800,
    rateSnapshot: 0,
    earnedAmount: 0,
    billingType: "hourly",
    currency: "$",
  },
]

const meta: Meta<typeof TodayLogDrawer> = {
  title: "Widgets/Today Log Drawer",
  component: TodayLogDrawer,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
### Receipt-Style Today's Log Drawer (US-5)

**User Story**: *As a freelancer wrapping up my day, I want to open a clean receipt-style Today's Log drawer (shortcut \`L\`), review grouped projects/milestones with subtotals and grand total, and copy a formatted summary or export CSV.*

#### Receipt Anatomy & Rules
- **Single-Day Scope**: Persists and displays only sessions started on the current calendar day.
- **Hierarchy**: \`Project → Milestone subgroup (with nested entries) + Standalone entries → 2-line Project Subtotal → 2-line Grand Total\`.
- **Strict 5-Column Alignment (Zero Column Headers)**: \`Memo\` (left) · \`Start\` · \`End\` · \`Duration\` · \`Earning\` (right, \`—\` when non-billable or covered by milestone payout).
- **Zero Inner Card Chrome**: Plain typographic hierarchy separated only by dashed receipt rules (\`border-dashed\`).
- **Actions**: \`Copy Summary\` (formatted plain-text receipt) and \`Export CSV\` (UTF-8 BOM spreadsheet).
        `,
      },
    },
  },
  argTypes: {
    isOpen: {
      control: "boolean",
      table: { category: "State" },
    },
    onClose: { table: { disable: true } },
    sessionsOverride: { table: { disable: true } },
    projectsOverride: { table: { disable: true } },
    onDeleteSession: { table: { disable: true } },
  },
  args: {
    isOpen: true,
    onClose: () => {},
  },
}

export default meta
type Story = StoryObj<typeof TodayLogDrawer>

export const ReceiptWithProjectsAndMilestones: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**State: Populated Daily Receipt** · **US-5**: Full realistic day showing `Kerdio Core` (milestone subgroup `M 2 Token Command Palette` with 2 entries + standalone hourly entry), `Raycast Extension` (hourly), and `No project` (non-billable with `—`). Hover any row to test interactive deletion.",
      },
    },
  },
  render: (args) => {
    const [sessions, setSessions] = useState<TimeSession[]>(createSampleSessions)

    return (
      <div className="relative h-[680px] w-full overflow-hidden transform-gpu">
        <TodayLogDrawer
          {...args}
          sessionsOverride={sessions}
          projectsOverride={INITIAL_PROJECTS}
          onDeleteSession={(id) => setSessions((prev) => prev.filter((s) => s.id !== id))}
        />
      </div>
    )
  },
}

export const EmptyState: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**State: Empty Day** · **US-5**: Start of a new calendar day (or after deleting all entries). Renders clean centered typography with no empty-state card box and disables `Copy Summary` / `Export CSV`.",
      },
    },
  },
  render: (args) => (
    <div className="relative h-[520px] w-full overflow-hidden transform-gpu">
      <TodayLogDrawer
        {...args}
        sessionsOverride={[]}
        projectsOverride={INITIAL_PROJECTS}
        onDeleteSession={() => {}}
      />
    </div>
  ),
}
