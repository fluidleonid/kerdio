import { useEffect } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { ReportsView } from "./ReportsView"
import { useTrackerStore } from "@/entities/tracker"
import { createWeeklyDemoSessions } from "@/stories/mock-sessions"

const meta: Meta<typeof ReportsView> = {
  title: "Roadmap (Planned)/Reports View",
  component: ReportsView,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
### Reports & Financial Yield Analytics Widget (US-R3 · Roadmap)

Financial analytics dashboard displaying billable hours, total accrued revenue, effective hourly yield, and proportional client distribution bars (planned for the full multi-page version on branch \`full\`).
        `,
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof ReportsView>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**State: Populated Analytics** · **US-R3**: Financial summary metrics and proportional client share breakdown for the current week.",
      },
    },
  },
  render: () => {
    useEffect(() => {
      useTrackerStore.setState({ sessions: createWeeklyDemoSessions() })
    }, [])

    return (
      <div className="min-h-screen w-full bg-[#140501] py-6">
        <ReportsView />
      </div>
    )
  },
}
