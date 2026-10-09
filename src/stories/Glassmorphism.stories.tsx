import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * # Glassmorphism & Elevation
 *
 * Multi-layer optical hierarchy: borderless glass, deep blurs, and diffused ambient shadows
 * adhering to Linear and Apple HIG visual design standards.
 *
 * ### Elevation Tiers
 * - **Tier 1 (Card Glass)**: \`bg-black/50\`, \`blur-3xl\`, diffused 50px black shadow.
 * - **Tier 2 (Input Field)**: \`bg-black/40\`, \`blur-3xl\`, \`shadow-[0_10px_25px_rgba(0,0,0,0.25)]\`.
 * - **Tier 3 (Floating Popover)**: \`bg-black/95\`, \`blur-3xl\`, high-contrast contrast border.
 * - **Tier 4 (Token Badge)**: \`bg-white/10\`, \`blur-xl\`, rounded-full pill.
 */
const meta: Meta = {
  title: 'Design System/Glass & Shadows',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
### Optical Glass System & Elevation

Our multi-layered optical hierarchy eliminates harsh solid borders in favor of diffused backdrop blurs and ambient shadows.

#### Core Tiers
1. **Container Glass**: Used for main dashboard cards and the command palette shell.
2. **Field Glass**: Semi-translucent inputs that gracefully deepen upon focus.
3. **Floating Popovers**: Ultra-dense backdrop blur ensuring crisp legibility over active graphics.
4. **Interactive Chips**: Micro-pill tokens with translucent white fills.
        `,
      },
    },
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
