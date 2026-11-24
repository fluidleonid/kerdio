import { useEffect } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { TodayLogDrawer } from "./TodayLogDrawer"
import { useTrackerStore } from "@/entities/tracker"

const getTodayAt = (hours: number, minutes: number) => {
  const d = new Date()
  d.setHours(hours, minutes, 0, 0)
  return d.getTime()
}

const meta: Meta<typeof TodayLogDrawer> = {
  title: "Widgets/Today Log Drawer",
  component: TodayLogDrawer,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Minimalist receipt-style daily activity log grouped by project and milestone, with strict 5-column tabular alignment (Memo, Start, End, Duration, Earning), 2-line Subtotals and Grand Total, and Copy/CSV export.",
      },
    },
  },
  argTypes: {
    isOpen: {
      control: "boolean",
      table: { category: "State" },
    },
    onClose: {
      table: { disable: true },
    },
  },
  args: {
    isOpen: true,
    onClose: () => {},
  },
}

export default meta
type Story = StoryObj<typeof TodayLogDrawer>

export const ReceiptWithProjectsAndMilestones: Story = {
  render: (args) => {
    useEffect(() => {
      useTrackerStore.setState({
        sessions: [
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
        ],
      })
    }, [])

    return (
      <div className="relative h-[620px] w-full overflow-hidden transform-gpu">
        <TodayLogDrawer {...args} />
      </div>
    )
  },
}

export const EmptyState: Story = {
  render: (args) => {
    useEffect(() => {
      useTrackerStore.setState({ sessions: [] })
    }, [])

    return (
      <div className="relative h-[620px] w-full overflow-hidden transform-gpu">
        <TodayLogDrawer {...args} />
      </div>
    )
  },
}
