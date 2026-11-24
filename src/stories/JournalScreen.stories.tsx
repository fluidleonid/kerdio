import { useEffect } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { Sidebar } from "@/widgets/sidebar"
import { JournalView } from "@/widgets/journal-view"
import { useTrackerStore } from "@/entities/tracker"
import { createWeeklyDemoSessions } from "./mock-sessions"

const meta: Meta = {
  title: "Screens/Journal (Roadmap)",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    router: { initialEntries: ["/journal"] },
    docs: {
      description: {
        component: `
### Full App Screen — Journal & Weekly Timeline (Roadmap · \`full\` branch)

**User Story (US-R1)**: *As a freelancer reviewing my week, I want a 24-hour visual timeline of all tracked blocks across days with weekly hours, earnings, and manual entry backfill, so that I can spot schedule gaps and verify client billing before invoicing.*

#### Status
- **Scope**: Planned multi-page expansion (implemented on branch \`full\`; not enabled in single-day MVP on \`main\`).
- **Layout**: Floating desktop navigation rail (\`Sidebar\`) + 24-hour weekly timeline grid (\`JournalView\`) with real-time current-minute indicator and manual entry dialog.
        `,
      },
    },
  },
}

export default meta

export const PopulatedWeeklyTimeline: StoryObj = {
  parameters: {
    docs: {
      description: {
        story:
          "**State: Populated Week** · **US-R1**: Full screen with `Sidebar` active on `Journal` (`⇧2`) and realistic multi-day sessions across `Kerdio Core`, `Raycast Extension`, and `Fintech Design System`.",
      },
    },
  },
  render: () => {
    useEffect(() => {
      useTrackerStore.setState({ sessions: createWeeklyDemoSessions() })
    }, [])

    return (
      <div className="relative h-[780px] w-full overflow-y-auto bg-[#140501] transform-gpu">
        <Sidebar />
        <main className="pl-20 pr-6 py-6">
          <JournalView />
        </main>
      </div>
    )
  },
}
