import { useEffect } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { Sidebar } from "@/widgets/sidebar"
import { ReportsView } from "@/widgets/reports-view"
import { useTrackerStore } from "@/entities/tracker"
import { createWeeklyDemoSessions } from "./mock-sessions"

const meta: Meta = {
  title: "Screens/Reports (Roadmap)",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    router: { initialEntries: ["/reports"] },
    docs: {
      description: {
        component: `
### Full App Screen — Financial Yield & Reports (Roadmap · \`full\` branch)

**User Story (US-R3)**: *As a studio founder or freelancer, I want to see my total billable hours, accrued revenue, effective hourly yield across fixed/milestone projects, and proportional client time breakdown with one-click CSV/Markdown export, so that I know which clients are most profitable.*

#### Status
- **Scope**: Planned multi-page expansion (implemented on branch \`full\`; not enabled in single-day MVP on \`main\`).
- **Layout**: Floating desktop navigation rail (\`Sidebar\`) + KPI summary & client distribution analytics (\`ReportsView\`).
        `,
      },
    },
  },
}

export default meta

export const PopulatedAnalyticsDashboard: StoryObj = {
  parameters: {
    docs: {
      description: {
        story:
          "**State: Populated Analytics** · **US-R3**: Full screen with `Sidebar` active on `Reports` (`⇧4`), populated with multi-project weekly sessions showing Billable Hours, Total Value, Effective Yield (`$/h`), Active Clients, and client share bars.",
      },
    },
  },
  render: () => {
    useEffect(() => {
      useTrackerStore.setState({ sessions: createWeeklyDemoSessions() })
    }, [])

    return (
      <div className="relative h-[760px] w-full overflow-y-auto bg-[#140501] transform-gpu">
        <Sidebar />
        <main className="pl-20 pr-6 py-6">
          <ReportsView />
        </main>
      </div>
    )
  },
}
