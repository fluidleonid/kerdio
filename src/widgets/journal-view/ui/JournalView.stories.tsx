import type { Meta, StoryObj } from '@storybook/react-vite'
import { JournalView } from './JournalView'

/**
 * # Journal View Widget
 *
 * Visual 24-hour weekly timeline and calendar grid for tracked work sessions,
 * hours analytics, and accrued financial yield.
 *
 * ### Architectural Features
 * - **24-Hour Calendar Grid**: Vertical 24-hour columns (00:00 to 23:00) with 56px hour rows.
 * - **Session Blocks**: Color-coded blocks mapped precisely to session start time and duration.
 * - **Weekly Metrics**: Summaries for total hours, accrued billing, and session count.
 * - **Real-Time Indicator**: Live horizontal indicator line for today's current minute.
 * - **Manual Logging**: Integrated modal dialog for manual time entry.
 */
const meta: Meta<typeof JournalView> = {
  title: 'Widgets/Journal View',
  component: JournalView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
### Journal & Calendar Widget

Full calendar interface providing complete visibility into daily and weekly productivity patterns, client billable hours, and logged intervals.
        `,
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof JournalView>

/**
 * **Default View**:
 * Standard weekly calendar grid populated with sessions.
 */
export const Default: Story = {
  render: () => (
    <div className="min-h-screen w-full bg-[#140501] py-6">
      <JournalView />
    </div>
  ),
}
