import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './badge'
import { Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, Tag } from 'lucide-react'

/**
 * # Badge Component
 *
 * Compact status marker and metadata chip built in the style of Vercel and Linear design systems.
 * Provides subtle glass tinting, semantic color treatments, and micro-spinner async states.
 *
 * ### Anatomy & Specifications
 * - **Variants**: `default` (high-contrast orange fill), `secondary` (glass translucent `bg-white/10`), `outline`, `destructive`, `ghost`, `link`.
 * - **States**: Rested, Hover/Active (interactive links/buttons), Loading (`Loader2` micro-spinner), and Disabled.
 * - **Typography**: 12px text (`text-xs font-medium`), rounded-full pill geometry with integrated SVG sizing.
 */
const meta: Meta<typeof Badge> = {
  title: 'Shared/UI Primitives/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Badge Primitive

Pill-shaped indicator for tags, feature states, and contextual labels across tables, dialogs, and cockpit headers.

#### States & Features
- **Default**: Rested compact chip.
- **Hover / Active**: Interactive styling when rendered with \`asChild\` or interactive triggers.
- **Loading State**: Auto-embeds a size-3 spinning loader (\`Loader2\`).
- **Disabled State**: Dims opacity to 40% and disables pointer interactions (\`aria-disabled\`).
        `,
      },
    },
  },
  argTypes: {
    variant: {
      description: 'Color theme and visual hierarchy variant.',
      control: 'select',
      options: ['default', 'secondary', 'outline', 'destructive', 'ghost', 'link'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    loading: {
      description: 'Replaces or prefixes content with a micro spinning loader.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      description: 'Disables badge interaction and sets opacity to 40%.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    children: {
      description: 'Badge content or text label.',
      control: 'text',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
  },
  args: {
    variant: 'default',
    loading: false,
    disabled: false,
    children: 'Active State',
  },
}

export default meta
type Story = StoryObj<typeof Badge>

/**
 * **Default State**:
 * Standard rested default pill badge.
 */
export const Default: Story = {
  args: {
    children: 'Production',
  },
}

/**
 * **Hover / Active Interaction**:
 * Interactive link badges demonstrating hover brighten feedback.
 */
export const HoverAndActive: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center p-6 bg-black/40 rounded-3xl border border-white/5">
      <Badge variant="default" className="cursor-pointer hover:opacity-90 active:scale-95 transition-all">
        <Sparkles className="size-3" /> Clickable Default
      </Badge>
      <Badge variant="secondary" className="cursor-pointer hover:bg-white/20 active:scale-95 transition-all">
        <Tag className="size-3" /> Clickable Secondary
      </Badge>
      <Badge variant="destructive" className="cursor-pointer hover:opacity-90 active:scale-95 transition-all">
        <AlertTriangle className="size-3" /> Clickable Destructive
      </Badge>
    </div>
  ),
}

/**
 * **Loading State**:
 * Integrated spinning loader for real-time background sync or async validation.
 */
export const Loading: Story = {
  args: {
    loading: true,
    children: 'Syncing...',
  },
  render: (args) => (
    <div className="flex flex-wrap gap-3 items-center p-6 bg-black/40 rounded-3xl border border-white/5">
      <Badge {...args} variant="default" />
      <Badge {...args} variant="secondary">
        Updating Data...
      </Badge>
      <Badge {...args} variant="outline">
        Validating
      </Badge>
    </div>
  ),
}

/**
 * **Disabled State**:
 * Dimmed opacity (40%) and pointer suppression for inactive or archived states.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Archived',
  },
  render: (args) => (
    <div className="flex flex-wrap gap-3 items-center p-6 bg-black/40 rounded-3xl border border-white/5">
      <Badge {...args} variant="default" />
      <Badge {...args} variant="secondary" />
      <Badge {...args} variant="destructive" />
    </div>
  ),
}

/**
 * **Variants Gallery**:
 * Full overview of all 6 variants with and without icons.
 */
export const VariantsGallery: Story = {
  render: () => (
    <div className="max-w-xl p-6 bg-black/40 rounded-3xl backdrop-blur-2xl border border-white/5 space-y-6">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-orange-400 mb-1">
          Badge Variants Matrix
        </h3>
        <p className="text-xs text-[#806060]">
          Visual hierarchy options across UI surfaces
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <span className="text-[11px] font-semibold text-white/70 block mb-2">With Icons</span>
          <div className="flex flex-wrap gap-2.5">
            <Badge variant="default">
              <Sparkles className="size-3" /> Default
            </Badge>
            <Badge variant="secondary">
              <CheckCircle2 className="size-3" /> Secondary
            </Badge>
            <Badge variant="outline">
              <ShieldCheck className="size-3" /> Outline
            </Badge>
            <Badge variant="destructive">
              <AlertTriangle className="size-3" /> Destructive
            </Badge>
            <Badge variant="ghost">
              <Sparkles className="size-3" /> Ghost
            </Badge>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-white/70 block mb-2">Without Icons</span>
          <div className="flex flex-wrap gap-2.5">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="ghost">Ghost</Badge>
            <Badge variant="link">Link</Badge>
          </div>
        </div>
      </div>
    </div>
  ),
}
