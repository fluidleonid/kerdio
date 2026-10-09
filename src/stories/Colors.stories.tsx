import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * # 3-Tier Design Token Architecture (Base → Alias → Component)
 *
 * Strict separation of concerns across 3 semantic tiers:
 * 1. **Tier 1: Base (Primitives)**: Raw color scales (Terracotta, Amber, Obsidian, Warm Gray, Status). Objective values with no semantic context.
 * 2. **Tier 2: Alias (Semantic)**: Contextual system roles (Actions, Surfaces, Text, Statuses, Borders) referencing Base tokens.
 * 3. **Tier 3: Component**: Component-scoped contracts (Button, Card, Dialog, Input, Chronograph, Milestone) referencing Alias tokens.
 */
const meta: Meta = {
  title: 'Design System/Colors & Gradients',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
### Methodology: 3-Tier Token Architecture (Base → Alias → Component)

| Tier | Purpose | Token Examples | Referencing Rule |
| :--- | :--- | :--- | :--- |
| **Tier 1: Base (Primitives)** | Raw chromatic scales & physical units | \`--base-color-terracotta-500\`, \`--base-color-amber-500\` | Values only (hex, rgb, px) |
| **Tier 2: Alias (Semantic)** | Contextual roles & system intent | \`--semantic-action-primary\`, \`--semantic-surface-card\` | References **Tier 1 Base** |
| **Tier 3: Component** | Scoped UI contracts | \`--component-btn-primary-bg\`, \`--component-card-bg\` | References **Tier 2 Alias** |
        `,
      },
    },
  },
}

export default meta

export const Palette: StoryObj = {
  render: () => (
    <div className="max-w-5xl mx-auto p-8 space-y-12 text-white font-sans">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-semibold text-orange-400 uppercase tracking-widest mb-3">
          Architecture: Base → Alias → Component
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Kerdio 3-Tier Color Token System</h1>
        <p className="text-sm text-[#806060] max-w-2xl leading-relaxed">
          Low-level primitives like Terracotta and Amber are strictly abstracted through semantic aliases, ensuring that UI components only consume contextual intent rather than raw chromatic values.
        </p>
      </div>

      {/* TIER 1: BASE PRIMITIVES */}
      <section className="space-y-5">
        <div className="border-b border-white/10 pb-3 flex items-baseline justify-between">
          <div>
            <h2 className="text-base font-bold tracking-wide text-orange-400 uppercase">Tier 1: Base Tokens (Primitives)</h2>
            <p className="text-xs text-[#806060] mt-0.5">Raw color scales and units. No semantic intent assigned at this level.</p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-[#806060]">Raw Values</span>
        </div>

        {/* Terracotta Scale */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-white/70 uppercase tracking-wider">Terracotta Scale (Brand Core)</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { token: '--base-color-terracotta-400', hex: '#FB923C', label: '400 / Highlight' },
              { token: '--base-color-terracotta-500', hex: '#E25822', label: '500 / Core Brand' },
              { token: '--base-color-terracotta-600', hex: '#CA4B10', label: '600 / Inner Dial' },
              { token: '--base-color-terracotta-700', hex: '#9A3412', label: '700 / Midtone' },
              { token: '--base-color-terracotta-800', hex: '#7C2D12', label: '800 / Shadow' },
              { token: '--base-color-terracotta-950', hex: '#200802', label: '950 / Rim' },
            ].map((c) => (
              <div key={c.token} className="rounded-2xl p-3 bg-black/40 border border-white/5 space-y-2">
                <div className="h-12 rounded-xl" style={{ backgroundColor: c.hex }} />
                <div>
                  <div className="font-mono text-[11px] font-semibold text-white truncate">{c.token}</div>
                  <div className="text-[10px] font-mono text-[#806060]">{c.hex}</div>
                  <div className="text-[10px] text-white/40 mt-0.5">{c.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Amber Scale */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-white/70 uppercase tracking-wider">Amber Scale (Accent & Glow)</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { token: '--base-color-amber-300', hex: '#FCD34D', label: '300 / High Glow' },
              { token: '--base-color-amber-400', hex: '#FBBF24', label: '400 / Marker Accent' },
              { token: '--base-color-amber-500', hex: '#F59E0B', label: '500 / Amber Glow' },
              { token: '--base-color-amber-700', hex: '#B45309', label: '700 / Deep Amber' },
            ].map((c) => (
              <div key={c.token} className="rounded-2xl p-3 bg-black/40 border border-white/5 space-y-2">
                <div className="h-12 rounded-xl" style={{ backgroundColor: c.hex }} />
                <div>
                  <div className="font-mono text-[11px] font-semibold text-white truncate">{c.token}</div>
                  <div className="text-[10px] font-mono text-[#806060]">{c.hex}</div>
                  <div className="text-[10px] text-white/40 mt-0.5">{c.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Obsidian & Warm Gray */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-white/70 uppercase tracking-wider">Substrate & Neutral Scale</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { token: '--base-color-obsidian-950', hex: '#140501', label: 'Dark Obsidian Base' },
              { token: '--base-color-white', hex: '#FFFFFF', label: 'Neutral 100% White' },
              { token: '--base-color-warm-gray-400', hex: '#806060', label: 'Warm Gray 400 (Secondary)' },
              { token: '--base-color-warm-gray-500', hex: '#6E5353', label: 'Warm Gray 500 (Tertiary)' },
            ].map((c) => (
              <div key={c.token} className="rounded-2xl p-3 bg-black/40 border border-white/5 space-y-2">
                <div className="h-12 rounded-xl border border-white/10" style={{ backgroundColor: c.hex }} />
                <div>
                  <div className="font-mono text-[11px] font-semibold text-white truncate">{c.token}</div>
                  <div className="text-[10px] font-mono text-[#806060]">{c.hex}</div>
                  <div className="text-[10px] text-white/40 mt-0.5">{c.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIER 2: ALIAS TOKENS (SEMANTIC) */}
      <section className="space-y-5">
        <div className="border-b border-white/10 pb-3 flex items-baseline justify-between">
          <div>
            <h2 className="text-base font-bold tracking-wide text-orange-400 uppercase">Tier 2: Alias Tokens (Semantic)</h2>
            <p className="text-xs text-[#806060] mt-0.5">Semantic intent mapping Base primitives into system roles.</p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-orange-500/10 text-orange-400">Maps to Tier 1</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Action Aliases */}
          <div className="rounded-2xl p-5 bg-black/40 border border-white/5 space-y-3">
            <div className="text-sm font-semibold text-white flex items-center justify-between">
              <span>Interactive Actions</span>
              <span className="text-xs text-orange-400 font-mono">--semantic-action-*</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#E25822]" />
                  <span className="font-mono text-white/90">--semantic-action-primary</span>
                </div>
                <span className="font-mono text-[#806060]">var(--base-color-terracotta-500)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#CA4B10]" />
                  <span className="font-mono text-white/90">--semantic-action-primary-hover</span>
                </div>
                <span className="font-mono text-[#806060]">var(--base-color-terracotta-600)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#F59E0B]" />
                  <span className="font-mono text-white/90">--semantic-action-accent</span>
                </div>
                <span className="font-mono text-[#806060]">var(--base-color-amber-500)</span>
              </div>
            </div>
          </div>

          {/* Surface Aliases */}
          <div className="rounded-2xl p-5 bg-black/40 border border-white/5 space-y-3">
            <div className="text-sm font-semibold text-white flex items-center justify-between">
              <span>Glass & Background Surfaces</span>
              <span className="text-xs text-orange-400 font-mono">--semantic-surface-*</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-black/50 border border-white/20" />
                  <span className="font-mono text-white/90">--semantic-surface-card</span>
                </div>
                <span className="font-mono text-[#806060]">rgba(0, 0, 0, 0.50)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-black/55 border border-white/20" />
                  <span className="font-mono text-white/90">--semantic-surface-popover</span>
                </div>
                <span className="font-mono text-[#806060]">rgba(0, 0, 0, 0.55)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-black/40 border border-white/20" />
                  <span className="font-mono text-white/90">--semantic-surface-overlay</span>
                </div>
                <span className="font-mono text-[#806060]">rgba(0, 0, 0, 0.40)</span>
              </div>
            </div>
          </div>

          {/* Typography Aliases */}
          <div className="rounded-2xl p-5 bg-black/40 border border-white/5 space-y-3">
            <div className="text-sm font-semibold text-white flex items-center justify-between">
              <span>Semantic Typography</span>
              <span className="text-xs text-orange-400 font-mono">--semantic-text-*</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-white" />
                  <span className="font-mono text-white/90">--semantic-text-primary</span>
                </div>
                <span className="font-mono text-[#806060]">var(--base-color-white)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#806060]" />
                  <span className="font-mono text-white/90">--semantic-text-secondary</span>
                </div>
                <span className="font-mono text-[#806060]">var(--base-color-warm-gray-400)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#6E5353]" />
                  <span className="font-mono text-white/90">--semantic-text-tertiary</span>
                </div>
                <span className="font-mono text-[#806060]">var(--base-color-warm-gray-500)</span>
              </div>
            </div>
          </div>

          {/* Status Aliases */}
          <div className="rounded-2xl p-5 bg-black/40 border border-white/5 space-y-3">
            <div className="text-sm font-semibold text-white flex items-center justify-between">
              <span>Status & Milestones</span>
              <span className="text-xs text-orange-400 font-mono">--semantic-status-*</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#34D399]" />
                  <span className="font-mono text-white/90">--semantic-status-delivered</span>
                </div>
                <span className="font-mono text-[#806060]">var(--base-color-emerald-400)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#E25822]" />
                  <span className="font-mono text-white/90">--semantic-status-open</span>
                </div>
                <span className="font-mono text-[#806060]">var(--base-color-terracotta-500)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#F59E0B]" />
                  <span className="font-mono text-white/90">--semantic-status-warning</span>
                </div>
                <span className="font-mono text-[#806060]">var(--base-color-amber-500)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TIER 3: COMPONENT TOKENS */}
      <section className="space-y-5">
        <div className="border-b border-white/10 pb-3 flex items-baseline justify-between">
          <div>
            <h2 className="text-base font-bold tracking-wide text-orange-400 uppercase">Tier 3: Component Tokens</h2>
            <p className="text-xs text-[#806060] mt-0.5">Scoped component contracts consumed directly in UI components.</p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Maps to Tier 2</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="rounded-2xl p-4 bg-black/40 border border-white/5 space-y-3">
            <div className="font-semibold text-sm text-white">Button Component</div>
            <div className="space-y-1.5 font-mono text-[11px] text-[#806060]">
              <div className="text-white/80">--component-btn-primary-bg: <span className="text-orange-400">--semantic-action-primary</span></div>
              <div className="text-white/80">--component-btn-primary-fg: <span className="text-orange-400">--semantic-text-inverse</span></div>
              <div className="text-white/80">--component-btn-ghost-fg: <span className="text-orange-400">--semantic-text-secondary</span></div>
            </div>
          </div>

          <div className="rounded-2xl p-4 bg-black/40 border border-white/5 space-y-3">
            <div className="font-semibold text-sm text-white">Card & Dialog</div>
            <div className="space-y-1.5 font-mono text-[11px] text-[#806060]">
              <div className="text-white/80">--component-card-bg: <span className="text-orange-400">--semantic-surface-card</span></div>
              <div className="text-white/80">--component-dialog-overlay-bg: <span className="text-orange-400">--semantic-surface-overlay</span></div>
              <div className="text-white/80">--component-popover-bg: <span className="text-orange-400">--semantic-surface-popover</span></div>
            </div>
          </div>

          <div className="rounded-2xl p-4 bg-black/40 border border-white/5 space-y-3">
            <div className="font-semibold text-sm text-white">Input & Tokens</div>
            <div className="space-y-1.5 font-mono text-[11px] text-[#806060]">
              <div className="text-white/80">--component-input-bg: <span className="text-orange-400">--semantic-surface-input</span></div>
              <div className="text-white/80">--component-input-placeholder: <span className="text-orange-400">--semantic-text-tertiary</span></div>
              <div className="text-white/80">--component-input-border-focus: <span className="text-orange-400">--semantic-border-focus</span></div>
            </div>
          </div>

          <div className="rounded-2xl p-4 bg-black/40 border border-white/5 space-y-3">
            <div className="font-semibold text-sm text-white">Chronograph Physics</div>
            <div className="space-y-1.5 font-mono text-[11px] text-[#806060]">
              <div className="text-white/80">--component-chronograph-dial-bg: <span className="text-orange-400">--semantic-surface-card</span></div>
              <div className="text-white/80">--component-chronograph-particle-fg: <span className="text-orange-400">--base-color-white</span></div>
              <div className="text-white/80">--component-chronograph-accent: <span className="text-orange-400">--semantic-action-accent</span></div>
            </div>
          </div>

          <div className="rounded-2xl p-4 bg-black/40 border border-white/5 space-y-3">
            <div className="font-semibold text-sm text-white">Milestone Status Badges</div>
            <div className="space-y-1.5 font-mono text-[11px] text-[#806060]">
              <div className="text-white/80">--component-milestone-open-fg: <span className="text-orange-400">--semantic-status-open</span></div>
              <div className="text-white/80">--component-milestone-delivered-fg: <span className="text-emerald-400">--semantic-status-delivered</span></div>
            </div>
          </div>

          <div className="rounded-2xl p-4 bg-black/40 border border-white/5 space-y-3">
            <div className="font-semibold text-sm text-white">Tailwind @theme Inline</div>
            <div className="space-y-1.5 font-mono text-[11px] text-[#806060]">
              <div className="text-white/80">bg-primary → <span className="text-orange-400">--semantic-action-primary</span></div>
              <div className="text-white/80">text-secondary-text → <span className="text-orange-400">--semantic-text-secondary</span></div>
              <div className="text-white/80">bg-card → <span className="text-orange-400">--semantic-surface-card</span></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  ),
}
