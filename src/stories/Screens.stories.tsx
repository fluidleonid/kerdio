import type { Meta, StoryObj } from '@storybook/react-vite'
import { TrackerView } from '@/widgets/tracker-view'
import { ProjectsView } from '@/widgets/projects-view'
import { JournalView } from '@/widgets/journal-view'
import { ReportsView } from '@/widgets/reports-view'
import { Sidebar } from '@/widgets/sidebar'
import { MemoryRouter } from 'react-router-dom'

/**
 * # Full Application Views
 *
 * End-to-end composite screen layouts integrating all atomic primitives,
 * feature modules, and widgets inside a production-grade workspace frame.
 *
 * ### Architectural Layout
 * - **Atmospheric Shell**: Dark terracotta glow background (\`#140501\`) with hardware-accelerated blur surfaces.
 * - **Fixed Sidebar Dock**: Collapsed navigation rail on the left.
 * - **Scrollable Viewport Canvas**: Dynamic main viewport responsive across desktop and tablet breakpoints.
 */
const meta: Meta = {
  title: 'Screens/Full Application Views',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
### Application Screen Views

Production-grade composite screens demonstrating real-world layouts, widget composition, and navigation flows.

#### Views Overview
1. **Tracker Cockpit**: The primary screen centering the Horological Chronograph and Token Command Bar.
2. **Projects View**: Client portfolio management, rate configuration, and budget tracking.
3. **Journal View**: Chronological timeline of focus blocks and recorded work sessions.
4. **Reports View**: High-level financial analytics, hourly yield distributions, and invoice summaries.
        `,
      },
    },
  },
}

export default meta

/**
 * **Tracker Cockpit**:
 * Central workspace screen with the 12-hour Chronograph and Token Command Bar.
 */
export const TrackerScreen: StoryObj = {
  render: () => (
    <MemoryRouter initialEntries={['/']}>
      <div className="relative min-h-screen w-screen bg-[#140501] overflow-hidden flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <TrackerView />
        </main>
      </div>
    </MemoryRouter>
  ),
}

/**
 * **Projects & Clients Screen**:
 * Project rate configuration, budget tracking cards, and portfolio status.
 */
export const ProjectsScreen: StoryObj = {
  render: () => (
    <MemoryRouter initialEntries={['/projects']}>
      <div className="relative min-h-screen w-screen bg-[#140501] overflow-hidden flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-12">
          <ProjectsView />
        </main>
      </div>
    </MemoryRouter>
  ),
}

/**
 * **Journal & Calendar Screen**:
 * Session log, multi-slot time entries, and calendar view.
 */
export const JournalCalendarScreen: StoryObj = {
  render: () => (
    <MemoryRouter initialEntries={['/journal']}>
      <div className="relative min-h-screen w-screen bg-[#140501] overflow-hidden flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-12">
          <JournalView />
        </main>
      </div>
    </MemoryRouter>
  ),
}

/**
 * **Reports & Financial Analytics**:
 * Aggregated yield metrics, hourly revenue curves, and client totals.
 */
export const ReportsScreen: StoryObj = {
  render: () => (
    <MemoryRouter initialEntries={['/reports']}>
      <div className="relative min-h-screen w-screen bg-[#140501] overflow-hidden flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-12">
          <ReportsView />
        </main>
      </div>
    </MemoryRouter>
  ),
}
