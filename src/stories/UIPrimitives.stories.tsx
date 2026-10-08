import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Input, AppTooltip } from '@/shared/ui'
import { Play, Check, Trash2, Plus, Clock, Briefcase, Flag, ShieldOff, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const meta: Meta = {
  title: 'Components/UI Primitives',
  parameters: {
    layout: 'padded',
  },
}

export default meta

export const InteractiveButton: StoryObj<{
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size: 'default' | 'sm' | 'lg' | 'icon'
  disabled: boolean
  label: string
}> = {
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    variant: 'default',
    size: 'default',
    disabled: false,
    label: 'Start Session',
  },
  render: (args) => (
    <div className="p-8 max-w-xl mx-auto rounded-3xl bg-black/40 backdrop-blur-3xl border border-white/5 flex items-center justify-center">
      <Button
        variant={args.variant}
        size={args.size}
        disabled={args.disabled}
        className={args.variant === 'default' ? 'rounded-full bg-orange-600 hover:bg-orange-500 text-white' : 'rounded-full'}
      >
        <Play className="h-4 w-4 mr-2" />
        {args.label}
      </Button>
    </div>
  ),
}

export const ButtonGallery: StoryObj = {
  render: () => (
    <div className="max-w-3xl mx-auto p-8 space-y-8 text-white font-sans">
      <div>
        <h2 className="text-xl font-bold mb-1">Button Variants</h2>
        <p className="text-xs text-[#806060]">All button styles used across modals and controls</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
          <span className="text-xs font-semibold text-orange-400 uppercase">Primary Run Action</span>
          <div>
            <Button className="rounded-full bg-orange-600 hover:bg-orange-500 text-white gap-2">
              <Play className="h-4 w-4 fill-current" /> Start Session
            </Button>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
          <span className="text-xs font-semibold text-orange-400 uppercase">Secondary / Outline</span>
          <div>
            <Button variant="outline" className="rounded-full gap-2 text-white border-white/10 hover:bg-white/10">
              <Check className="h-4 w-4" /> Save Changes
            </Button>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
          <span className="text-xs font-semibold text-orange-400 uppercase">Ghost Navigation</span>
          <div>
            <Button variant="ghost" className="rounded-full text-[#806060] hover:text-white hover:bg-white/10">
              Cancel
            </Button>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
          <span className="text-xs font-semibold text-orange-400 uppercase">Destructive Action</span>
          <div>
            <Button variant="destructive" size="sm" className="rounded-full gap-2">
              <Trash2 className="h-3.5 w-3.5" /> Delete Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  ),
}

export const SingleRowGlassInput: StoryObj = {
  render: () => (
    <div className="max-w-md mx-auto p-8 space-y-6 text-white font-sans">
      <div>
        <h2 className="text-xl font-bold mb-1">Single-Row Glass Inputs</h2>
        <p className="text-xs text-[#806060]">Ultra-clean inputs with 50% opacity glass and soft diffused shadow</p>
      </div>

      <div className="p-6 rounded-3xl bg-black/50 backdrop-blur-3xl border border-white/5 space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
        <div>
          <label className="text-xs font-semibold text-white/80 block mb-1">Project Name</label>
          <Input placeholder="e.g. Kerdio Core" defaultValue="Kerdio Brand System" />
        </div>

        <div>
          <label className="text-xs font-semibold text-white/80 block mb-1">Session Memo</label>
          <Input placeholder="What did you deliver?" />
        </div>

        <div>
          <label className="text-xs font-semibold text-white/80 block mb-1">Disabled Input</label>
          <Input disabled defaultValue="Read-only token value" />
        </div>
      </div>
    </div>
  ),
}

export const CompositeBillingInput: StoryObj = {
  render: () => {
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
  },
}
