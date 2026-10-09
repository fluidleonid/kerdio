import type { Meta, StoryObj } from '@storybook/react-vite'
import { ProjectsView } from './ProjectsView'

/**
 * # Projects View Widget
 *
 * Client registry and billing management view. Displays project cards,
 * milestones deliverable lists with "Mark as delivered" status toggles,
 * hourly yield calculations, and the New Project glass modal.
 *
 * ### Architectural Features
 * - **Project Cards**: Glassmorphic cards with custom accent stripes, metrics, and billing models.
 * - **Milestones List**: Interactive delivery status tracking with one-click delivery toggles.
 * - **Composite Billing Configuration**: Unified modal for configuring hourly, fixed, or milestone rates.
 */
const meta: Meta<typeof ProjectsView> = {
  title: 'Widgets/Projects View',
  component: ProjectsView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
### Projects & Billing Widget

Central registry for managing clients, color tags, billing rates, and contract milestones.
        `,
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof ProjectsView>

/**
 * **Default Registry View**:
 * Standard view with existing projects, milestone checklists, and billing badges.
 */
export const Default: Story = {
  render: () => (
    <div className="min-h-screen w-full bg-[#140501] py-6">
      <ProjectsView />
    </div>
  ),
}
