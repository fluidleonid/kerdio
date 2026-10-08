import type { Meta, StoryObj } from '@storybook/react-vite'
import { Sidebar } from '@/widgets/sidebar'
import { MemoryRouter } from 'react-router-dom'

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Navigation Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

export const Default: StoryObj = {
  render: () => (
    <MemoryRouter initialEntries={['/']}>
      <div className="relative h-screen w-screen bg-[#0d0d0f] flex">
        <Sidebar />
        <div className="flex-1 p-12 text-white/50 text-sm">
          Main content area (use Shift+1..4 to navigate)
        </div>
      </div>
    </MemoryRouter>
  ),
}
