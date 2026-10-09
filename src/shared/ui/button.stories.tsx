import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './button'
import { Play, Check, Trash2, Sparkles, Send } from 'lucide-react'

/**
 * # Button Component
 *
 * Primary interactive primitive adhering to Vercel and Linear design language.
 * Features optical tactile transitions, accessible focus rings, and integrated async spinners.
 *
 * ### Anatomy & Specifications
 * - **Variants**: `default` (high-contrast orange primary), `secondary`, `outline`, `destructive`, `ghost`, `link`.
 * - **Sizes**: `xs` (24px), `sm` (32px), `default` (36px), `lg` (40px), and square icon scales (`icon-xs`, `icon-sm`, `icon`, `icon-lg`).
 * - **Micro-Interactions**: Tactile button presses (`active:scale-95`), smooth focus rings, and animated spinners.
 */
const meta: Meta<typeof Button> = {
  title: 'Shared/UI Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Button Component

Production-grade button primitive used for trigger actions, dialog submissions, and cockpit state toggles.

#### States & Features
- **Default**: Rested standard appearance with balanced contrast.
- **Hover & Active**: Dynamic lightening and tactile physical scale reduction on press (\`active:scale-95\`).
- **Loading State**: Auto-renders spinning loader icon (\`Loader2\`), suppresses user interactions, and sets \`aria-busy="true"\`.
- **Disabled State**: Applies 50% opacity and disables pointer events.
- **AsChild Support**: Compatible with Radix Slot for seamless link wrapping.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      description: 'Visual style and hierarchy category.',
      control: 'select',
      options: ['default', 'secondary', 'outline', 'destructive', 'ghost', 'link'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    size: {
      description: 'Physical dimension and padding scale.',
      control: 'select',
      options: ['default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    loading: {
      description: 'Renders an animated spinner, disables the button, and marks aria-busy.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      description: 'Suppresses pointer events and dims opacity to 50%.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    children: {
      description: 'Button content or text label.',
      control: 'text',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
  },
  args: {
    variant: 'default',
    size: 'default',
    loading: false,
    disabled: false,
    children: 'Start Session',
  },
}

export default meta
type Story = StoryObj<typeof Button>

/**
 * **Default State**:
 * Standard rested primary button.
 */
export const Default: Story = {
  args: {
    children: 'Start Session',
  },
  render: (args) => (
    <Button {...args} className={args.variant === 'default' ? 'rounded-full bg-orange-600 hover:bg-orange-500 text-white' : undefined}>
      <Play className="h-4 w-4 mr-2" />
      {args.children}
    </Button>
  ),
}

/**
 * **Hover / Active Interaction**:
 * Demonstrates tactile feedback and interactive transitions.
 */
export const HoverAndActive: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 items-center p-6 bg-black/40 rounded-3xl border border-white/5">
      <Button className="rounded-full bg-orange-600 hover:bg-orange-500 text-white">
        Hover Me
      </Button>
      <Button variant="secondary" className="rounded-full">
        Secondary Hover
      </Button>
      <Button variant="outline" className="rounded-full border-white/10 text-white hover:bg-white/10">
        Outline Hover
      </Button>
      <Button variant="ghost" className="rounded-full text-white/80 hover:text-white hover:bg-white/10">
        Ghost Hover
      </Button>
    </div>
  ),
}

/**
 * **Loading State**:
 * Displays the built-in spinning loader, sets `aria-busy`, and disables clicks.
 */
export const Loading: Story = {
  args: {
    loading: true,
    children: 'Saving Session...',
  },
  render: (args) => (
    <div className="flex gap-4 items-center p-6 bg-black/40 rounded-3xl border border-white/5">
      <Button {...args} className="rounded-full bg-orange-600 text-white" />
      <Button {...args} variant="secondary" className="rounded-full">
        Syncing Projects...
      </Button>
    </div>
  ),
}

/**
 * **Disabled State**:
 * Standard non-interactive state with 50% opacity and disabled pointer events.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Action Disabled',
  },
  render: (args) => (
    <div className="flex gap-4 items-center p-6 bg-black/40 rounded-3xl border border-white/5">
      <Button {...args} className="rounded-full bg-orange-600 text-white">
        <Play className="h-4 w-4 mr-2" /> Disabled Primary
      </Button>
      <Button {...args} variant="outline" className="rounded-full border-white/10 text-white">
        Disabled Outline
      </Button>
    </div>
  ),
}

/**
 * **Button States Matrix**:
 * Comprehensive overview across all key states (Default, With Icon, Loading, Disabled, Secondary, Destructive).
 */
export const StatesMatrix: Story = {
  render: () => (
    <div className="max-w-4xl mx-auto p-8 space-y-6 text-white font-sans">
      <div>
        <h3 className="text-xl font-bold mb-1">Button States Matrix</h3>
        <p className="text-xs text-[#806060]">
          Standard rested, icon variations, busy loading, and disabled safeguards.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
          <span className="text-[11px] font-semibold text-orange-400 uppercase">Default Primary</span>
          <div>
            <Button className="rounded-full bg-orange-600 hover:bg-orange-500 text-white">
              <Play className="h-4 w-4 mr-2" /> Start Timer
            </Button>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
          <span className="text-[11px] font-semibold text-orange-400 uppercase">Without Icon</span>
          <div>
            <Button className="rounded-full bg-orange-600 hover:bg-orange-500 text-white">
              Start Timer
            </Button>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
          <span className="text-[11px] font-semibold text-orange-400 uppercase">Loading (Busy)</span>
          <div>
            <Button loading={true} className="rounded-full bg-orange-600 text-white">
              Saving Session...
            </Button>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
          <span className="text-[11px] font-semibold text-orange-400 uppercase">Disabled</span>
          <div>
            <Button disabled={true} className="rounded-full bg-orange-600 text-white">
              <Play className="h-4 w-4 mr-2" /> Start Timer
            </Button>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
          <span className="text-[11px] font-semibold text-orange-400 uppercase">Secondary Outline</span>
          <div>
            <Button variant="outline" className="rounded-full gap-2 text-white border-white/10 hover:bg-white/10">
              <Check className="h-4 w-4" /> Save Changes
            </Button>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
          <span className="text-[11px] font-semibold text-orange-400 uppercase">Destructive Action</span>
          <div>
            <Button variant="destructive" size="sm" className="rounded-full gap-2">
              <Trash2 className="h-3.5 w-3.5" /> Discard
            </Button>
          </div>
        </div>
      </div>
    </div>
  ),
}

/**
 * **Size Scale Gallery**:
 * Size scaling comparison from `xs` through `lg` and `icon` variants.
 */
export const SizeScale: Story = {
  render: () => (
    <div className="p-6 rounded-3xl bg-black/40 border border-white/5 flex flex-wrap items-center gap-4">
      <Button size="xs" variant="secondary" className="rounded-full">
        Extra Small (xs)
      </Button>
      <Button size="sm" variant="secondary" className="rounded-full">
        Small (sm)
      </Button>
      <Button size="default" variant="secondary" className="rounded-full">
        Default (h-9)
      </Button>
      <Button size="lg" variant="secondary" className="rounded-full">
        Large (lg)
      </Button>
      <Button size="icon" variant="outline" className="rounded-full border-white/10 text-white">
        <Sparkles className="h-4 w-4" />
      </Button>
      <Button size="icon-sm" variant="outline" className="rounded-full border-white/10 text-white">
        <Send className="h-3.5 w-3.5" />
      </Button>
    </div>
  ),
}
