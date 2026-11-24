import { useEffect } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { JournalView } from "./JournalView"
import { useTrackerStore } from "@/entities/tracker"
import { createWeeklyDemoSessions } from "@/stories/mock-sessions"

const meta: Meta<typeof JournalView> = {
  title: "Roadmap (Planned)/Journal View",
  component: JournalView,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
### Journal & Weekly Timeline Widget (US-R1 · Roadmap)

Visual 24-hour weekly timeline and calendar grid for tracked work sessions, hours analytics, and accrued financial yield (planned for the full multi-page version on branch \`full\`).
        `,
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof JournalView>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**State: Populated Weekly Timeline** · **US-R1**: Standard 24-hour calendar grid populated with multi-day project & milestone sessions.",
      },
    },
  },
  render: () => {
    useEffect(() => {
      useTrackerStore.setState({ sessions: createWeeklyDemoSessions() })
    }, [])

    return (
      <div className="min-h-screen w-full bg-[#140501] py-6">
        <JournalView />
      </div>
    )
  },
}
