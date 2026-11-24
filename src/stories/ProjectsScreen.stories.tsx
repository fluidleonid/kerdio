import type { Meta, StoryObj } from "@storybook/react-vite"
import { Sidebar } from "@/widgets/sidebar"
import { ProjectsView } from "@/widgets/projects-view"

const meta: Meta = {
  title: "Screens/Projects (Roadmap)",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    router: { initialEntries: ["/projects"] },
    docs: {
      description: {
        component: `
### Full App Screen — Projects & Milestones Registry (Roadmap · \`full\` branch)

**User Story (US-R2)**: *As an independent contractor managing multiple clients, I want a dedicated registry of projects with color tags, billing models, and deliverable milestones that I can mark as delivered, so that my command bar tokens and earnings stay organized.*

#### Status
- **Scope**: Planned multi-page expansion (implemented on branch \`full\`; not enabled in single-day MVP on \`main\`).
- **Layout**: Floating desktop navigation rail (\`Sidebar\`) + project cards grid (\`ProjectsView\`) with inline milestone delivery toggles and New Project modal.
        `,
      },
    },
  },
}

export default meta

export const ClientRegistryAndMilestones: StoryObj = {
  parameters: {
    docs: {
      description: {
        story:
          "**State: Populated Project Registry** · **US-R2**: Full screen with `Sidebar` active on `Projects` (`⇧3`), displaying `Kerdio Core`, `Raycast Extension`, and `Fintech Design System` with open/delivered milestones and billing models.",
      },
    },
  },
  render: () => (
    <div className="relative h-[760px] w-full overflow-y-auto bg-[#140501] transform-gpu">
      <Sidebar />
      <main className="pl-20 pr-6 py-6">
        <ProjectsView />
      </main>
    </div>
  ),
}
