import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Design System/Colors & Gradients',
  parameters: {
    layout: 'padded',
  },
}

export default meta

export const Palette: StoryObj = {
  render: () => (
    <div className="max-w-4xl mx-auto p-8 space-y-10 text-white font-sans">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Kerdio Color Tokens</h1>
        <p className="text-sm text-[#806060]">
          Atmospheric warm amber and burnt orange palette combining analogue chronograph physics with ultra-modern glassmorphism.
        </p>
      </div>

      {/* Brand & Ambient Glow */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wider uppercase text-orange-400">Brand & Core Accents</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl p-4 bg-black/40 border border-white/5 space-y-3">
            <div className="h-16 rounded-xl bg-[#E25822] shadow-lg shadow-orange-950/50" />
            <div>
              <div className="font-semibold text-sm">Terracotta Core</div>
              <div className="text-xs font-mono text-[#806060]">#E25822 • rgb(226, 88, 34)</div>
              <div className="text-[11px] text-white/50 mt-1">Primary buttons, active indicators</div>
            </div>
          </div>

          <div className="rounded-2xl p-4 bg-black/40 border border-white/5 space-y-3">
            <div className="h-16 rounded-xl bg-[#F59E0B] shadow-lg shadow-amber-950/50" />
            <div>
              <div className="font-semibold text-sm">Amber Glow</div>
              <div className="text-xs font-mono text-[#806060]">#F59E0B • rgb(245, 158, 11)</div>
              <div className="text-[11px] text-white/50 mt-1">Clock markers, highlight tags</div>
            </div>
          </div>

          <div className="rounded-2xl p-4 bg-black/40 border border-white/5 space-y-3">
            <div className="h-16 rounded-xl bg-[#7C2D12]" />
            <div>
              <div className="font-semibold text-sm">Terracotta Deep</div>
              <div className="text-xs font-mono text-[#806060]">#7C2D12 • rgb(124, 45, 18)</div>
              <div className="text-[11px] text-white/50 mt-1">Radial dial midtone</div>
            </div>
          </div>

          <div className="rounded-2xl p-4 bg-black/40 border border-white/5 space-y-3">
            <div className="h-16 rounded-xl bg-[#140501] border border-white/10" />
            <div>
              <div className="font-semibold text-sm">Dark Obsidian</div>
              <div className="text-xs font-mono text-[#806060]">#140501 • rgb(20, 5, 1)</div>
              <div className="text-[11px] text-white/50 mt-1">Deep background base</div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Accent Palette */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wider uppercase text-orange-400">Project Accent Palette</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: 'Terracotta', hex: '#E25822', role: 'Default project' },
            { name: 'Amber', hex: '#F97316', role: 'Operations & tasks' },
            { name: 'Emerald', hex: '#10B981', role: 'Growth & revenue' },
            { name: 'Cyan', hex: '#06B6D4', role: 'Engineering' },
            { name: 'Indigo', hex: '#6366F1', role: 'Product & apps' },
            { name: 'Pink', hex: '#EC4899', role: 'Design & creative' },
            { name: 'Purple', hex: '#8B5CF6', role: 'Research & AI' },
            { name: 'Yellow', hex: '#EAB308', role: 'Client delivery' },
          ].map((item) => (
            <div key={item.hex} className="rounded-2xl p-4 bg-black/40 border border-white/5 space-y-3">
              <div className="h-12 rounded-xl" style={{ backgroundColor: item.hex }} />
              <div>
                <div className="font-semibold text-sm">{item.name}</div>
                <div className="text-xs font-mono text-[#806060]">{item.hex}</div>
                <div className="text-[11px] text-white/50 mt-1">{item.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Text & Typography Tiers */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wider uppercase text-orange-400">Typography Colors</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl p-5 bg-black/40 border border-white/5 space-y-2">
            <div className="text-lg font-bold text-white">White Primary (100%)</div>
            <div className="text-xs font-mono text-white/60">#FFFFFF • text-white</div>
            <p className="text-xs text-white/80">Headers, active timer digits, active token values.</p>
          </div>
          <div className="rounded-2xl p-5 bg-black/40 border border-white/5 space-y-2">
            <div className="text-lg font-bold text-[#806060]">Secondary Muted</div>
            <div className="text-xs font-mono text-[#806060]">#806060 • text-[#806060]</div>
            <p className="text-xs text-[#806060]">Descriptions, ghost button icons, shortcuts.</p>
          </div>
          <div className="rounded-2xl p-5 bg-black/40 border border-white/5 space-y-2">
            <div className="text-lg font-bold text-[#6E5353]">Tertiary Subtle</div>
            <div className="text-xs font-mono text-[#6E5353]">#6E5353 • text-[#6E5353]</div>
            <p className="text-xs text-[#6E5353]">Placeholders, borders, timestamps.</p>
          </div>
        </div>
      </div>
    </div>
  ),
}
