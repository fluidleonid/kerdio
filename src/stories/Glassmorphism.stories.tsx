import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Design System/Glass & Shadows',
  parameters: {
    layout: 'padded',
  },
}

export default meta

export const GlassTiers: StoryObj = {
  render: () => (
    <div className="max-w-4xl mx-auto p-8 space-y-10 text-white font-sans">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Glassmorphism & Elevation</h1>
        <p className="text-sm text-[#806060]">
          Multi-layer optical hierarchy: borderless glass, deep blurs, and diffused ambient shadows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tier 1: Main Container Card */}
        <div className="rounded-3xl bg-black/50 p-6 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.35)] border-none space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">Card Glass Tier</span>
            <span className="text-xs font-mono text-[#806060]">bg-black/50 • blur-3xl</span>
          </div>
          <p className="text-sm text-white/90">
            Primary surface for Modals, the Command Bar wrapper, and Project metric cards. Borderless with diffused 50px black shadow.
          </p>
          <div className="p-3 rounded-2xl bg-white/5 text-xs text-white/70">
            shadow-[0_20px_50px_rgba(0,0,0,0.35)]
          </div>
        </div>

        {/* Tier 2: Input Field Glass */}
        <div className="rounded-3xl bg-black/40 p-6 backdrop-blur-3xl shadow-[0_10px_25px_rgba(0,0,0,0.25)] border-none space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">Input Glass Tier</span>
            <span className="text-xs font-mono text-[#806060]">bg-black/40 • rounded-2xl</span>
          </div>
          <p className="text-sm text-white/90">
            Single-row form inputs and composite billing selectors. Smoothly deepens to <code className="text-white">bg-black/60</code> on focus.
          </p>
          <div className="p-3 rounded-2xl bg-white/5 text-xs text-white/70">
            shadow-[0_10px_25px_rgba(0,0,0,0.25)]
          </div>
        </div>

        {/* Tier 3: Floating Popover Dropdown */}
        <div className="rounded-2xl bg-black/95 p-5 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">Popover Dropdown Tier</span>
            <span className="text-xs font-mono text-[#806060]">bg-black/95 • border-white/10</span>
          </div>
          <p className="text-sm text-white/90">
            Autocomplete dropdowns for @projects, /billing commands, and combobox menus. Maximum contrast against busy backgrounds.
          </p>
        </div>

        {/* Tier 4: Token Badges */}
        <div className="rounded-3xl bg-black/30 p-6 backdrop-blur-xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">Pill Badge Tier</span>
            <span className="text-xs font-mono text-[#806060]">bg-white/10 • rounded-full</span>
          </div>
          <p className="text-sm text-white/90">
            Tactile inline chips for projects and rates. Translucent white pill with hover transition.
          </p>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium">@Kerdio</span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium">$85/h</span>
          </div>
        </div>
      </div>
    </div>
  ),
}
