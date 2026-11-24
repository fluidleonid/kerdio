import type { Meta, StoryObj } from "@storybook/react-vite"
import { Sidebar } from "./Sidebar"

const meta: Meta<typeof Sidebar> = {
  title: "Roadmap (Planned)/Navigation Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
> **Status: Roadmap (Planned)** — Preserved in the \`full\` branch; excluded from the current single-day MVP production release.

Adaptive navigation rail (left icon rail on desktop, bottom tab bar on mobile) with keyboard shortcuts \`Shift+1\` through \`Shift+4\`.
        `,
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof Sidebar>

export const DefaultTrackerActive: Story = {
  parameters: { router: { initialEntries: ["/"] } },
  render: () => (
    <div className="relative h-[420px] w-full bg-[#140501] flex overflow-hidden transform-gpu">
      <Sidebar />
      <div className="flex-1 p-12 text-white/70 text-sm flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-white mb-1">Tracker Cockpit View</div>
          <div className="text-xs text-[#DCDCDC]">
            Active Route: <code className="text-white">/</code> (Shortcut: Shift+1)
          </div>
        </div>
      </div>
    </div>
  ),
}

export const JournalRouteActive: Story = {
  parameters: { router: { initialEntries: ["/journal"] } },
  render: () => (
    <div className="relative h-[420px] w-full bg-[#140501] flex overflow-hidden transform-gpu">
      <Sidebar />
      <div className="flex-1 p-12 text-white/70 text-sm flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-white mb-1">Journal & Calendar View</div>
          <div className="text-xs text-[#DCDCDC]">
            Active Route: <code className="text-white">/journal</code> (Shortcut: Shift+2)
          </div>
        </div>
      </div>
    </div>
  ),
}

export const ProjectsRouteActive: Story = {
  parameters: { router: { initialEntries: ["/projects"] } },
  render: () => (
    <div className="relative h-[420px] w-full bg-[#140501] flex overflow-hidden transform-gpu">
      <Sidebar />
      <div className="flex-1 p-12 text-white/70 text-sm flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-white mb-1">Projects & Clients View</div>
          <div className="text-xs text-[#DCDCDC]">
            Active Route: <code className="text-white">/projects</code> (Shortcut: Shift+3)
          </div>
        </div>
      </div>
    </div>
  ),
}

export const ReportsRouteActive: Story = {
  parameters: { router: { initialEntries: ["/reports"] } },
  render: () => (
    <div className="relative h-[420px] w-full bg-[#140501] flex overflow-hidden transform-gpu">
      <Sidebar />
      <div className="flex-1 p-12 text-white/70 text-sm flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-white mb-1">Financial Reports View</div>
          <div className="text-xs text-[#DCDCDC]">
            Active Route: <code className="text-white">/reports</code> (Shortcut: Shift+4)
          </div>
        </div>
      </div>
    </div>
  ),
}
