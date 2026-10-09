import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppTooltip, TooltipProvider } from './tooltip'
import { Button } from './button'
import { Pause, Square, RotateCcw, Info } from 'lucide-react'

/**
 * # Tooltip Component
 *
 * Micro-surface tooltip built on Radix UI Tooltip primitives.
 * Features dark glassmorphism (`bg-zinc-950/95`, `backdrop-blur-xl`),
 * subtle micro-animations, and integrated `<kbd>` shortcut badges.
 *
 * ### Design System Anatomy
 * - **Optical Styling**: Deep black translucent surface with soft shadow and zoom entrance.
 * - **Shortcut Tag**: Built-in `<kbd>` badge for keyboard power-users.
 * - **Placement**: Supports `top`, `right`, `bottom`, and `left` alignments.
 */
const meta: Meta = {
  title: 'Shared/UI Primitives/Tooltip',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <TooltipProvider delayDuration={100}>
        <div className="p-16 flex items-center justify-center">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Tooltip Primitive (\`AppTooltip\`)

Contextual hover guidance for icon buttons, status indicators, and keyboard shortcuts throughout Kerdio.

#### Features
- **Fast Response**: Tuned hover delay for instant feedback.
- **Shortcut Badge**: Optional \`shortcut\` prop auto-rendering styled keyboard labels.
- **Directional Placement**: Fluid repositioning across top, right, bottom, and left sides.
        `,
      },
    },
  },
}

export default meta
type Story = StoryObj

/**
 * **Default State**:
 * Hover over the trigger to reveal standard tooltip guidance.
 */
export const Default: Story = {
  render: () => (
    <AppTooltip content="Session overview and statistics" side="top">
      <Button variant="outline" className="rounded-full gap-2 border-white/10 text-white">
        <Info className="h-4 w-4" /> Hover for info
      </Button>
    </AppTooltip>
  ),
}

/**
 * **With Keyboard Shortcut**:
 * Tooltip showcasing integrated keyboard hotkey tags.
 */
export const WithShortcut: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <AppTooltip content="Pause tracking" shortcut="Space" side="bottom">
        <Button size="icon" variant="ghost" className="rounded-full text-white hover:bg-white/10">
          <Pause className="h-5 w-5" />
        </Button>
      </AppTooltip>

      <AppTooltip content="Save to Journal" shortcut="⌘↵" side="bottom">
        <Button size="icon" className="rounded-full bg-white/10 text-white hover:bg-white/20">
          <Square className="h-4 w-4 fill-current" />
        </Button>
      </AppTooltip>

      <AppTooltip content="Discard session" shortcut="Esc" side="bottom">
        <Button size="icon" variant="ghost" className="rounded-full text-white/80 hover:bg-white/10">
          <RotateCcw className="h-5 w-5" />
        </Button>
      </AppTooltip>
    </div>
  ),
}

/**
 * **Placements Gallery**:
 * Demonstrates tooltips positioned on Top, Right, Bottom, and Left edges.
 */
export const PlacementsGallery: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-6 bg-black/40 rounded-3xl border border-white/5">
      <AppTooltip content="Top positioned tooltip" side="top">
        <Button variant="secondary" className="rounded-full">Top Side</Button>
      </AppTooltip>

      <AppTooltip content="Right positioned tooltip" side="right">
        <Button variant="secondary" className="rounded-full">Right Side</Button>
      </AppTooltip>

      <AppTooltip content="Bottom positioned tooltip" side="bottom">
        <Button variant="secondary" className="rounded-full">Bottom Side</Button>
      </AppTooltip>

      <AppTooltip content="Left positioned tooltip" side="left">
        <Button variant="secondary" className="rounded-full">Left Side</Button>
      </AppTooltip>
    </div>
  ),
}
