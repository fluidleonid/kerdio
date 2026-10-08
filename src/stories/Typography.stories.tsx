import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Design System/Typography',
  parameters: {
    layout: 'padded',
  },
}

export default meta

export const TypographyScale: StoryObj = {
  render: () => (
    <div className="max-w-4xl mx-auto p-8 space-y-10 text-white font-sans">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Typography & Digital Numerals</h1>
        <p className="text-sm text-[#806060]">
          Custom display typeface <strong>Oxanium</strong> with tabular numbers, engineered for high-precision digital instruments.
        </p>
      </div>

      {/* Tabular Monospace Counter Showcase */}
      <div className="p-8 rounded-3xl bg-black/50 backdrop-blur-3xl border border-white/5 space-y-4">
        <div className="text-xs font-semibold tracking-wider uppercase text-orange-400">
          Chronograph Tabular Timer (Tabular Figures)
        </div>
        <div className="flex flex-wrap items-baseline gap-6">
          <div className="text-5xl sm:text-7xl font-bold tracking-tight text-white tabular-nums font-sans">
            03:53:18
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-sm font-semibold">
            +$245.50
          </div>
        </div>
        <p className="text-xs text-[#806060]">
          Zero width variance: digits never jump or jitter during live second updates.
        </p>
      </div>

      {/* Type Hierarchy Scale */}
      <div className="space-y-6">
        <h2 className="text-sm font-semibold tracking-wider uppercase text-orange-400">Scale & Roles</h2>

        <div className="space-y-4 border-t border-white/10 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 items-baseline gap-4">
            <span className="text-xs font-mono text-[#806060]">Display / 48px</span>
            <div className="md:col-span-3 text-4xl font-extrabold tracking-tight">Kerdio Focused Value</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 items-baseline gap-4">
            <span className="text-xs font-mono text-[#806060]">Heading 1 / 24px</span>
            <div className="md:col-span-3 text-2xl font-bold">24-Hour Calendar Journal</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 items-baseline gap-4">
            <span className="text-xs font-mono text-[#806060]">Heading 2 / 18px</span>
            <div className="md:col-span-3 text-lg font-semibold">Project Billing Settings</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 items-baseline gap-4">
            <span className="text-xs font-mono text-[#806060]">Body / 14px</span>
            <div className="md:col-span-3 text-sm text-white/90 leading-relaxed">
              Keyboard-driven workflow: type <code className="text-orange-400 bg-white/10 px-1.5 py-0.5 rounded">@</code> to autocomplete projects, <code className="text-orange-400 bg-white/10 px-1.5 py-0.5 rounded">/</code> to set hourly rate or milestone budget.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 items-baseline gap-4">
            <span className="text-xs font-mono text-[#806060]">Label / 12px</span>
            <div className="md:col-span-3 text-xs font-medium text-[#806060] tracking-wide uppercase">
              Effective Hourly Rate: $95.50/h
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 items-baseline gap-4">
            <span className="text-xs font-mono text-[#806060]">Keyboard / 10px</span>
            <div className="md:col-span-3 flex items-center gap-2">
              <kbd className="px-2 py-1 rounded bg-white/10 text-xs font-mono text-white/80 border border-white/10">⇧ 1</kbd>
              <kbd className="px-2 py-1 rounded bg-white/10 text-xs font-mono text-white/80 border border-white/10">⌘ Enter</kbd>
              <kbd className="px-2 py-1 rounded bg-white/10 text-xs font-mono text-white/80 border border-white/10">Esc</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
}
