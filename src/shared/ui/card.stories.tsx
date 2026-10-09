import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { Clock, TrendingUp, Sparkles, ArrowRight } from 'lucide-react'

/**
 * # Card Component
 *
 * Glassmorphic surface container engineered with deep optical blur (`backdrop-blur-3xl`),
 * borderless 50% black tinting, and diffused 50px ambient drop shadow.
 *
 * ### Anatomy & Subcomponents
 * - **Card**: Root container with `rounded-3xl` corners and ambient depth shadow.
 * - **CardHeader**: Auto-responsive container grid for title, description, and top-right actions.
 * - **CardTitle**: High-contrast typography with tight tracking.
 * - **CardDescription**: Dimmed auxiliary guidance text (`text-[#806060]`).
 * - **CardAction**: Optional slot pinned to the top-right corner of the header.
 * - **CardContent**: Main body area with standard padding.
 * - **CardFooter**: Bottom actions row with aligned buttons.
 */
const meta: Meta<typeof Card> = {
  title: 'Shared/UI Primitives/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Glass Surface Card

The primary structural container for metrics, project records, settings, and modal content across Kerdio.

#### Visual Architecture
- **Tint**: \`bg-black/50\` (exact 50% opacity neutral glass).
- **Backdrop Filter**: \`backdrop-blur-3xl\` (64px blur radius).
- **Shadow**: \`shadow-[0_20px_50px_rgba(0,0,0,0.32)]\` for physical elevation.
- **Border**: Borderless design adhering to contemporary glassmorphism principles.
        `,
      },
    },
  },
  argTypes: {
    className: {
      description: 'Custom Tailwind CSS utility classes.',
      control: 'text',
    },
  },
}

export default meta
type Story = StoryObj<typeof Card>

/**
 * **Default State**:
 * Standard rested card showcasing complete subcomponent anatomy.
 */
export const Default: Story = {
  render: () => (
    <div className="w-[420px] p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#806060] tracking-wider">Metrics</span>
            <Badge variant="secondary" className="text-[10px]">Weekly</Badge>
          </div>
          <CardTitle className="text-xl font-bold text-white mt-1">Focus Time</CardTitle>
          <CardDescription className="text-xs text-[#806060]">
            Tracked hours accumulated over the current billing cycle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tabular-nums">34.5</span>
            <span className="text-sm font-semibold text-orange-400">hours</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-orange-600 rounded-full w-[70%]" />
          </div>
        </CardContent>
        <CardFooter className="justify-between text-xs text-[#806060] border-t border-white/5 pt-4">
          <span>Target: 40 hrs</span>
          <span className="text-emerald-400 font-semibold">+12% vs last week</span>
        </CardFooter>
      </Card>
    </div>
  ),
}

/**
 * **Hover / Interactive Card**:
 * Card with interactive hover brightening, tactile scale, and action button.
 */
export const HoverAndActive: Story = {
  render: () => (
    <div className="w-[420px] p-4">
      <Card className="hover:bg-black/60 transition-all cursor-pointer group hover:shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
        <CardHeader>
          <CardAction>
            <Button size="icon-sm" variant="ghost" className="rounded-full text-white/70 group-hover:text-white">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardAction>
          <CardTitle className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">
            Interactive Project Card
          </CardTitle>
          <CardDescription className="text-xs text-[#806060]">
            Hover to observe subtle surface transition and action trigger.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#806060]">Rate:</span>
            <span className="font-mono font-bold text-white">$120/h</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#806060]">Yield:</span>
            <span className="font-mono font-bold text-emerald-400">$4,140</span>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
}

/**
 * **Disabled / Dimmed State**:
 * Visual appearance when a card represents archived or inactive workspace entities.
 */
export const Disabled: Story = {
  render: () => (
    <div className="w-[420px] p-4">
      <Card className="opacity-45 pointer-events-none select-none">
        <CardHeader>
          <Badge variant="outline" className="w-fit">Archived</Badge>
          <CardTitle className="text-lg font-bold text-white mt-1">Archived Client Vault</CardTitle>
          <CardDescription className="text-xs text-[#806060]">
            This project has been deactivated and is read-only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <span className="text-xs text-[#806060] font-mono">No active time sessions recorded.</span>
        </CardContent>
      </Card>
    </div>
  ),
}

/**
 * **Dashboard Grid Layout**:
 * Multiple cards organized in a responsive summary grid.
 */
export const GridDashboard: Story = {
  render: () => (
    <div className="max-w-4xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between text-[#806060]">
            <span className="text-[11px] font-mono uppercase tracking-wider">Hours</span>
            <Clock className="h-4 w-4 text-orange-400" />
          </div>
          <CardTitle className="text-2xl font-bold font-mono text-white tabular-nums">42.8 h</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-[11px] text-[#806060]">Across 18 sessions</CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between text-[#806060]">
            <span className="text-[11px] font-mono uppercase tracking-wider">Accrued</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <CardTitle className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">$3,640</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-[11px] text-[#806060]">Effective: $85/h</CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between text-[#806060]">
            <span className="text-[11px] font-mono uppercase tracking-wider">Yield</span>
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
          <CardTitle className="text-2xl font-bold font-mono text-white tabular-nums">94.2%</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-[11px] text-[#806060]">Target billable ratio</CardContent>
      </Card>
    </div>
  ),
}
