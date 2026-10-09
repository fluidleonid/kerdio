import type { Meta, StoryObj } from '@storybook/react-vite'
import { Sidebar } from './Sidebar'
import { MemoryRouter } from 'react-router-dom'

/**
 * # Navigation Sidebar
 *
 * Minimalist, ultra-compact glassmorphic sidebar delivering primary navigation
 * and workspace tools with keyboard hotkeys (`Shift+1` through `Shift+4`).
 *
 * ### Design System Anatomy
 * - **Glass Column**: High-translucency borderless rail with deep backdrop blur.
 * - **Tactile Indicators**: Active white pill indicator and smooth icon hover transitions.
 * - **Keyboard Hotkeys**: Integrated hotkey badges on tooltips for power-user speed.
 */
const meta: Meta<typeof Sidebar> = {
  title: 'Widgets/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
### Navigation Sidebar Widget

The primary navigation rail designed in the style of Linear's collapsed rail. Delivers zero-clutter access to core application views with rapid keyboard hotkey transitions.

#### Anatomy
1. **Nav Links**: Vertical icon stack with active state pill, hover feedback, and shortcut tooltips.
2. **Keyboard Hotkeys**:
   - \`Shift + 1\`: Tracker Cockpit (\`/\`)
   - \`Shift + 2\`: Journal & 24h Calendar (\`/journal\`)
   - \`Shift + 3\`: Projects & Clients (\`/projects\`)
   - \`Shift + 4\`: Analytics & Reports (\`/reports\`)
        `,
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof Sidebar>

/**
 * **Default (Tracker View Active)**:
 * Standard cockpit navigation state on root `/` route.
 */
export const DefaultTrackerActive: Story = {
  render: () => (
    <MemoryRouter initialEntries={['/']}>
      <div className="relative h-screen w-screen bg-[#140501] flex">
        <Sidebar />
        <div className="flex-1 p-12 text-white/50 text-sm flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-semibold text-white mb-1">Tracker Cockpit View</div>
            <div className="text-xs text-[#806060]">Active Route: <code className="text-orange-400">/</code> (Shortcut: Shift+1)</div>
          </div>
        </div>
      </div>
    </MemoryRouter>
  ),
}

/**
 * **Journal Route Active**:
 * Highlights the Journal & Calendar tab (`Shift+2`).
 */
export const JournalRouteActive: Story = {
  render: () => (
    <MemoryRouter initialEntries={['/journal']}>
      <div className="relative h-screen w-screen bg-[#140501] flex">
        <Sidebar />
        <div className="flex-1 p-12 text-white/50 text-sm flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-semibold text-white mb-1">Journal & Calendar View</div>
            <div className="text-xs text-[#806060]">Active Route: <code className="text-orange-400">/journal</code> (Shortcut: Shift+2)</div>
          </div>
        </div>
      </div>
    </MemoryRouter>
  ),
}

/**
 * **Projects Route Active**:
 * Highlights the Projects & Clients tab (`Shift+3`).
 */
export const ProjectsRouteActive: Story = {
  render: () => (
    <MemoryRouter initialEntries={['/projects']}>
      <div className="relative h-screen w-screen bg-[#140501] flex">
        <Sidebar />
        <div className="flex-1 p-12 text-white/50 text-sm flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-semibold text-white mb-1">Projects & Clients View</div>
            <div className="text-xs text-[#806060]">Active Route: <code className="text-orange-400">/projects</code> (Shortcut: Shift+3)</div>
          </div>
        </div>
      </div>
    </MemoryRouter>
  ),
}

/**
 * **Reports Route Active**:
 * Highlights the Reports & Analytics tab (`Shift+4`).
 */
export const ReportsRouteActive: Story = {
  render: () => (
    <MemoryRouter initialEntries={['/reports']}>
      <div className="relative h-screen w-screen bg-[#140501] flex">
        <Sidebar />
        <div className="flex-1 p-12 text-white/50 text-sm flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-semibold text-white mb-1">Financial Reports View</div>
            <div className="text-xs text-[#806060]">Active Route: <code className="text-orange-400">/reports</code> (Shortcut: Shift+4)</div>
          </div>
        </div>
      </div>
    </MemoryRouter>
  ),
}
