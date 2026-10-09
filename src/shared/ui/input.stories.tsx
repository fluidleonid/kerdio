import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Input } from './input'
import { Clock, Briefcase, Flag, ShieldOff, ChevronDown, Search } from 'lucide-react'

/**
 * # Input Component
 *
 * Borderless, single-row glassmorphic text field engineered with 50% opacity,
 * deep optical blur (`backdrop-blur-3xl`), and soft diffused ambient shadows.
 *
 * ### Design System Anatomy
 * - **Optical Glass**: `bg-black/50` tinted layer with `backdrop-blur-3xl`.
 * - **Focus Elevation**: Transitions to `bg-black/60` with expanded 35px diffused shadow.
 * - **Placeholder Tone**: Calibrated warm grey `#6E5353` for legible guidance without visual competition.
 * - **Height & Geometry**: 44px height (`h-11`) with generous 16px corner radius (`rounded-2xl`).
 */
const meta: Meta<typeof Input> = {
  title: 'Shared/UI Primitives/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Input Primitive

Foundational single-row input used for task descriptions, project names, and search queries across forms and dialogs.

#### States & Features
- **Default**: Rested empty state with calibrated placeholder.
- **Filled**: High-contrast white input value with crisp caret.
- **Disabled**: Dimmed opacity to 50% with disabled pointer interactions.
- **Focus**: Elevated shadow (\`0 15px 35px rgba(0,0,0,0.35)\`) without sharp outer borders.
        `,
      },
    },
  },
  argTypes: {
    placeholder: {
      description: 'Placeholder guidance text.',
      control: 'text',
      defaultValue: 'What are you working on?',
    },
    disabled: {
      description: 'Disables user input and dims field opacity.',
      control: 'boolean',
      defaultValue: false,
    },
    defaultValue: {
      description: 'Initial text value.',
      control: 'text',
    },
  },
  args: {
    placeholder: 'What are you working on?',
    disabled: false,
  },
}

export default meta
type Story = StoryObj<typeof Input>

/**
 * **Default State**:
 * Standard rested input with placeholder.
 */
export const Default: Story = {
  render: (args) => (
    <div className="w-[420px] p-6 bg-black/40 rounded-3xl border border-white/5">
      <Input {...args} />
    </div>
  ),
}

/**
 * **Hover / Focused & Filled**:
 * Demonstrates input filled with text and focused elevation.
 */
export const Filled: Story = {
  render: () => (
    <div className="w-[420px] p-6 bg-black/40 rounded-3xl border border-white/5 space-y-3">
      <label className="text-xs font-semibold text-white/80 block">Active Task</label>
      <Input defaultValue="Kerdio Brand Design Tokens & Horological Bezel" />
    </div>
  ),
}

/**
 * **Disabled State**:
 * Read-only or locked input representation.
 */
export const Disabled: Story = {
  render: () => (
    <div className="w-[420px] p-6 bg-black/40 rounded-3xl border border-white/5 space-y-3">
      <label className="text-xs font-semibold text-white/80 block">Read-only Workspace ID</label>
      <Input disabled defaultValue="proj-kerd-production-master" />
    </div>
  ),
}

/**
 * **With Search Icon**:
 * Filter input containing a leading icon and clean placeholder.
 */
export const WithSearchIcon: Story = {
  render: () => (
    <div className="w-[420px] p-6 bg-black/40 rounded-3xl border border-white/5">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 h-4 w-4 text-[#806060] pointer-events-none" />
        <Input className="pl-10" placeholder="Search sessions or project tags..." />
      </div>
    </div>
  ),
}

/**
 * **Composite Billing Input**:
 * High-order unified input container pairing a billing type combobox with an adaptive rate suffix.
 */
function CompositeBillingDemo() {
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
    <div className="w-[440px] p-6 bg-black/40 rounded-3xl border border-white/5 space-y-2">
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
  )
}

export const CompositeBilling: StoryObj = {
  render: () => <CompositeBillingDemo />,
}
