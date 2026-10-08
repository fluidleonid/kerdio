import type { Meta, StoryObj } from '@storybook/react-vite'
import { TrackerView } from '@/widgets/tracker-view'
import { ProjectsView } from '@/widgets/projects-view'
import { JournalView } from '@/widgets/journal-view'
import { ReportsView } from '@/widgets/reports-view'
import { Sidebar } from '@/widgets/sidebar'
import { MemoryRouter } from 'react-router-dom'

const meta: Meta = {
  title: 'Screens/Full Application Views',
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

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
