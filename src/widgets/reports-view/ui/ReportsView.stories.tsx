import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReportsView } from './ReportsView'

/**
 * # Reports View Widget
 *
 * Financial analytics and yield breakdown cockpit. Analyzes effective hourly returns,
 * client time distributions, and provides CSV data export and clipboard summary generators.
 *
 * ### Architectural Features
 * - **Key Metric Cards**: Billable Hours, Total Value, Effective Yield ($/h), and Active Clients.
 * - **Client Distribution**: Proportional progress bars and percentage share breakdown.
 * - **Export Tools**: One-click CSV export and markdown text report generator.
 */
const meta: Meta<typeof ReportsView> = {
  title: 'Widgets/Reports View',
  component: ReportsView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
### Reports & Analytics Widget

Financial analytics dashboard displaying client distribution ratios and calculated effective rates.
        `,
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof ReportsView>

/**
 * **Default Analytics View**:
 * Financial summary cards and client distribution bars for the current period.
 */
export const Default: Story = {
  render: () => (
    <div className="min-h-screen w-full bg-[#140501] py-6">
      <ReportsView />
    </div>
  ),
}
