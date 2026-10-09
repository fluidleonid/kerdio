import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/ui'
import { Play, Check, Trash2, Clock, Briefcase, Flag, ShieldOff, ChevronDown, Sparkles } from 'lucide-react'
import { useState } from 'react'

/**
 * # UI Primitives
 *
 * Foundational design system atoms: Buttons, Inputs, and Composite controls
 * styled in accordance with Vercel and Linear interface guidelines.
 *
 * ### Design Principles
 * - **Optical Glass Tiers**: Borderless translucent layers (\`bg-black/50\`, \`backdrop-blur-3xl\`) with diffused shadows.
 * - **Micro-Interactions**: Tactile button presses (\`active:scale-95\`), smooth focus rings, and animated spinners.
 * - **Comprehensive States**: Default, Hover, Active, Focus-visible, Loading, and Disabled states across all variants.
 */
const meta: Meta = {
  title: 'Components/UI Primitives',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
### Atomic UI Primitives

Production component kit powering Kerdio modals, action docks, and form sheets.

#### Anatomy & Specifications
- **Button**: 6 functional variants (\`default\`, \`secondary\`, \`destructive\`, \`outline\`, \`ghost\`, \`link\`) across 8 sizing scales (\`xs\` to \`icon-lg\`).
- **Input**: Borderless single-row glass field with 50% opacity, crisp white caret, and 50px diffused ambient shadow.
- **Composite Billing Input**: High-order input combining combobox type selection with adaptive currency amount input.

#### States Coverage
- **Standard**: Clean rested state.
- **Hover & Active**: Dynamic background brightening and tactile depress feedback.
- **Focus**: High-visibility ring with subtle offset.
- **Loading**: Asynchronous busy state with integrated spinning loader and \`aria-busy\`.
- **Disabled**: Dimmed opacity (40%) and pointer-events suppression.
        `,
      },
    },
  },
}

export default meta

/**
 * **Interactive Button Playground**:
 * Test all variants, sizes, loading states, and icons interactively.
 */
export const InteractiveButton: StoryObj<{
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size: 'default' | 'xs' | 'sm' | 'lg' | 'icon'
  disabled: boolean
  loading: boolean
  withIcon: boolean
  label: string
}> = {
  argTypes: {
    variant: {
      description: 'Visual treatment and color token category.',
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    size: {
      description: 'Physical dimension and padding scale.',
      control: 'select',
      options: ['default', 'xs', 'sm', 'lg', 'icon'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    disabled: {
      description: 'Suppresses interactions and applies 50% opacity.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    loading: {
      description: 'Shows animated spinner, disables button, and flags aria-busy.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    withIcon: {
      description: 'Includes a leading icon.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    label: {
      description: 'Button text label.',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Start Session' },
      },
    },
  },
  args: {
    variant: 'default',
    size: 'default',
    disabled: false,
    loading: false,
    withIcon: true,
    label: 'Start Session',
  },
  render: (args) => (
    <div className="p-12 max-w-xl mx-auto rounded-3xl bg-black/40 backdrop-blur-3xl border border-white/5 flex items-center justify-center">
      <Button
        variant={args.variant}
        size={args.size}
        disabled={args.disabled}
        loading={args.loading}
        className={args.variant === 'default' ? 'rounded-full bg-orange-600 hover:bg-orange-500 text-white' : 'rounded-full'}
      >
        {args.withIcon && !args.loading && <Play className="h-4 w-4" />}
        {args.size !== 'icon' && args.label}
      </Button>
    </div>
  ),
}

/**
 * **Button States Matrix**:
 * Hover, Active, Disabled, Loading, with Icon, and without Icon across primary actions.
 */
export const ButtonStatesMatrix: StoryObj = {
  render: () => (
    <div className="max-w-4xl mx-auto p-8 space-y-8 text-white font-sans">
      <div>
        <h2 className="text-xl font-bold mb-1">Button Interactive States</h2>
        <p className="text-xs text-[#806060]">
          Standard, Focus, Loading, and Disabled variations
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Default */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
          <span className="text-[11px] font-semibold text-orange-400 uppercase">Default Rested</span>
          <div>
            <Button className="rounded-full bg-orange-600 hover:bg-orange-500 text-white">
              <Play className="h-4 w-4 mr-2" /> Start Timer
            </Button>
          </div>
        </div>

        {/* Without Icon */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
          <span className="text-[11px] font-semibold text-orange-400 uppercase">Without Icon</span>
          <div>
            <Button className="rounded-full bg-orange-600 hover:bg-orange-500 text-white">
              Start Timer
            </Button>
          </div>
        </div>

        {/* Loading */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
          <span className="text-[11px] font-semibold text-orange-400 uppercase">Loading (Busy)</span>
          <div>
            <Button loading={true} className="rounded-full bg-orange-600 text-white">
              Saving Session...
            </Button>
          </div>
        </div>

        {/* Disabled */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
          <span className="text-[11px] font-semibold text-orange-400 uppercase">Disabled</span>
          <div>
            <Button disabled={true} className="rounded-full bg-orange-600 text-white">
              <Play className="h-4 w-4 mr-2" /> Start Timer
            </Button>
          </div>
        </div>

        {/* Secondary Outline */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
          <span className="text-[11px] font-semibold text-orange-400 uppercase">Secondary Outline</span>
          <div>
            <Button variant="outline" className="rounded-full gap-2 text-white border-white/10 hover:bg-white/10">
              <Check className="h-4 w-4" /> Save Changes
            </Button>
          </div>
        </div>

        {/* Destructive */}
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
 * **Button Sizes Gallery**:
 * Size scaling comparison from \`xs\` to \`lg\` and icon variants.
 */
export const ButtonSizesGallery: StoryObj = {
  render: () => (
    <div className="max-w-3xl mx-auto p-8 space-y-6 text-white font-sans">
      <div>
        <h2 className="text-xl font-bold mb-1">Button Size Scale</h2>
        <p className="text-xs text-[#806060]">Proportional heights and typography scaling</p>
      </div>

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
        <Button size="icon" variant="outline" className="rounded-full">
          <Sparkles className="h-4 w-4" />
        </Button>
      </div>
    </div>
  ),
}

/**
 * **Glass Input States Gallery**:
 * Empty, Focused, Filled, Disabled, and Long text overflow.
 */
export const InputStatesGallery: StoryObj = {
  render: () => (
    <div className="max-w-md mx-auto p-8 space-y-6 text-white font-sans">
      <div>
        <h2 className="text-xl font-bold mb-1">Single-Row Glass Inputs</h2>
        <p className="text-xs text-[#806060]">
          Clean inputs with 50% opacity glass and soft diffused shadow
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-black/50 backdrop-blur-3xl border border-white/5 space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
        <div>
          <label className="text-xs font-semibold text-white/80 block mb-1">Empty / Placeholder</label>
          <Input placeholder="What are you working on?" />
        </div>

        <div>
          <label className="text-xs font-semibold text-white/80 block mb-1">Filled with Value</label>
          <Input defaultValue="Kerdio Brand Design Tokens" />
        </div>

        <div>
          <label className="text-xs font-semibold text-white/80 block mb-1">Disabled Input</label>
          <Input disabled defaultValue="proj-kerd (Read-only token)" />
        </div>

        <div>
          <label className="text-xs font-semibold text-white/80 block mb-1">Long Text (Overflow Test)</label>
          <Input defaultValue="Comprehensive multi-platform design architecture and horological clock bezel synchronization review" />
        </div>
      </div>
    </div>
  ),
}

/**
 * **Composite Billing Input**:
 * Unified single-row container with billing type combobox and dynamic currency rate suffix.
 */
function CompositeBillingInputDemo() {
  const [billingType, setBillingType] = useState<'hourly' | 'fixed' | 'milestone' | 'none'>('hourly')
  const [rate, setRate] = useState('85')
  const [isOpen, setIsOpen] = useState(false)

  const options = [
    { type: 'hourly' as const, title: 'Hourly Rate', desc: 'Bill per hour with real-time dollar accrual', icon: Clock, suffix: '/h' },
    { type: 'fixed' as const, title: 'Fixed Fee', desc: 'Flat rate for entire task/project, tracks hourly yield', icon: Briefcase, suffix: '$' },
    { type: 'milestone' as const, title: 'Milestone', desc: 'Fixed payout for this specific delivery', icon: Flag, suffix: '$' },
    { type: 'none' as const, title: 'Non-billable (Free)', desc: 'Track focus time only without client billing', icon: ShieldOff, suffix: '' },
  ]

  const selected = options.find((o) => o.type === billingType) || options[0]

  return (
    <div className="max-w-md mx-auto p-8 space-y-6 text-white font-sans">
      <div>
        <h2 className="text-xl font-bold mb-1">Composite Billing Settings Input</h2>
        <p className="text-xs text-[#806060]">Unified single-row container with combobox + adaptive rate suffix</p>
      </div>

      <div className="p-6 rounded-3xl bg-black/50 backdrop-blur-3xl border border-white/5 space-y-2 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
        <label className="text-xs font-semibold text-white/80 block">Billing settings</label>
        <div className="relative flex items-center h-11 w-full rounded-2xl bg-black/50 px-3 shadow-[0_10px_25px_rgba(0,0,0,0.25)] backdrop-blur-3xl border-none focus-within:bg-black/60 transition-all">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 py-1 px-2 -ml-1 rounded-xl hover:bg-white/10 transition-colors text-left shrink-0 cursor-pointer"
          >
            <selected.icon className="h-4 w-4 text-orange-400 shrink-0" />
            <span className="text-sm font-semibold text-white select-none whitespace-nowrap">{selected.title}</span>
            <ChevronDown className={`h-3.5 w-3.5 text-[#806060] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          <div className="h-5 w-px bg-white/10 mx-2 shrink-0" />

          {billingType !== 'none' ? (
            <div className="flex items-center flex-1 min-w-0">
              <span className="text-sm font-mono font-bold text-white/50 mr-1 select-none">$</span>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-white outline-none border-none p-0"
              />
              <span className="text-xs font-mono font-semibold text-[#806060] ml-1 select-none shrink-0">{selected.suffix}</span>
            </div>
          ) : (
            <span className="text-xs text-[#806060]">No billing</span>
          )}

          {isOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-black/95 backdrop-blur-3xl p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 space-y-1">
              {options.map((opt) => (
                <div
                  key={opt.type}
                  onClick={() => {
                    setBillingType(opt.type)
                    setIsOpen(false)
                  }}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-colors ${
                    billingType === opt.type ? 'bg-white/15 text-white' : 'hover:bg-white/10 text-white/80'
                  }`}
                >
                  <opt.icon className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-white">{opt.title}</div>
                    <div className="text-xs text-[#806060]">{opt.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * **Composite Billing Input**:
 * Unified single-row container with billing type combobox and dynamic currency rate suffix.
 */
export const CompositeBillingInput: StoryObj = {
  render: () => <CompositeBillingInputDemo />,
}

/**
 * **Modal & Dialog Glass Tier**:
 * Modal dialog demonstrating exact parity with Card glassmorphism:
 * borderless `bg-black/50`, `backdrop-blur-3xl`, `shadow-[0_20px_50px_rgba(0,0,0,0.35)]`,
 * and gentle `bg-black/40 backdrop-blur-sm` ambient overlay.
 */
export const ModalDialogGlassTier: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <div className="p-8 flex flex-col items-center gap-4">
        <Button onClick={() => setOpen(true)} className="bg-orange-600 hover:bg-orange-500">
          Open Glass Modal Preview
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Project Configuration</DialogTitle>
              <DialogDescription>
                Card-parity glassmorphism dialog with 50% optical tint and 64px deep blur.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <label className="text-xs font-semibold text-white/80 block">Project Name</label>
              <Input placeholder="Kerdio Horology Bezel" defaultValue="Kerdio Horology Bezel" />
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)} className="bg-orange-600 hover:bg-orange-500">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  },
}
