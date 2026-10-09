import type { Meta, StoryObj } from '@storybook/react-vite'
import { Sidebar } from '@/widgets/sidebar'
import { MemoryRouter } from 'react-router-dom'

/**
 * # Navigation Sidebar
 *
 * Minimalist, ultra-compact glassmorphic sidebar delivering primary navigation
 * and workspace tools with keyboard hotkeys (\`Shift+1\` through \`Shift+4\`).
 *
 * ### Design System Anatomy
 * - **Glass Column**: High-translucency borderless rail with deep backdrop blur.
 * - **Tactile Indicators**: Active orange pill indicator and smooth icon hover transitions.
 * - **Keyboard Hotkeys**: Integrated hotkey badges on tooltips for power-user speed.
 */
const meta: Meta<typeof Sidebar> = {
  title: 'Components/Navigation Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
### Navigation Sidebar

The primary navigation rail designed in the style of Linear's collapsed rail. Delivers zero-clutter access to core application views with rapid keyboard hotkey transitions.

#### Anatomy
1. **Brand Emblem**: Top anchor linking to default Cockpit view.
2. **Nav Links**: Icons with active glow indicator, label tooltips, and shortcut tags.
3. **Workspace Trigger**: Bottom button for project settings and workspace preferences.

#### Keyboard Shortcuts
- \`Shift + 1\`: Chronograph Cockpit (\`/\`)
- \`Shift + 2\`: Projects & Clients (\`/projects\`)
- \`Shift + 3\`: Journal & Calendar (\`/journal\`)
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
 * Standard cockpit navigation state on root \`/\` route.
 */
export const DefaultTrackerActive: Story = {
  render: () => (
    <MemoryRouter initialEntries={['/']}>
      <div className="relative h-screen w-screen bg-[#140501] flex">
        <Sidebar />
        <div className="flex-1 p-12 text-white/50 text-sm flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-semibold text-white mb-1">Tracker Cockpit View</div>
            <div className="text-xs text-[#806060]">Active Route: <code className="text-orange-400">/</code></div>
          </div>
        </div>
      </div>
    </MemoryRouter>
  ),
}

/**
 * **Projects Route Active**:
 * Highlights the Projects & Clients tab (\`Shift+2\`).
 */
export const ProjectsRouteActive: Story = {
  render: () => (
    <MemoryRouter initialEntries={['/projects']}>
      <div className="relative h-screen w-screen bg-[#140501] flex">
        <Sidebar />
        <div className="flex-1 p-12 text-white/50 text-sm flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-semibold text-white mb-1">Projects & Clients View</div>
            <div className="text-xs text-[#806060]">Active Route: <code className="text-orange-400">/projects</code></div>
          </div>
        </div>
      </div>
    </MemoryRouter>
  ),
}

/**
 * **Journal Route Active**:
 * Highlights the Journal & History calendar tab (\`Shift+3\`).
 */
export const JournalRouteActive: Story = {
  render: () => (
    <MemoryRouter initialEntries={['/journal']}>
      <div className="relative h-screen w-screen bg-[#140501] flex">
        <Sidebar />
        <div className="flex-1 p-12 text-white/50 text-sm flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-semibold text-white mb-1">Journal & Calendar View</div>
            <div className="text-xs text-[#806060]">Active Route: <code className="text-orange-400">/journal</code></div>
          </div>
        </div>
      </div>
    </MemoryRouter>
  ),
}

/**
 * **Reports Route Active**:
 * Highlights the Reports & Analytics tab (\`Shift+4\`).
 */
export const ReportsRouteActive: Story = {
  render: () => (
    <MemoryRouter initialEntries={['/reports']}>
      <div className="relative h-screen w-screen bg-[#140501] flex">
        <Sidebar />
        <div className="flex-1 p-12 text-white/50 text-sm flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-semibold text-white mb-1">Financial Reports View</div>
            <div className="text-xs text-[#806060]">Active Route: <code className="text-orange-400">/reports</code></div>
          </div>
        </div>
      </div>
    </MemoryRouter>
  ),
}
