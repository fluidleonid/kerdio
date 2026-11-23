import type { Meta, StoryObj } from "@storybook/react-vite"

const meta: Meta = {
  title: "Design System/Colors & Gradients",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "3-Tier Design Token Architecture (Base -> Alias -> Component) with 0%-saturation WCAG AA/AAA neutral text grays over dark terracotta optical glass.",
      },
    },
  },
}

export default meta

export const Palette: StoryObj = {
  render: () => (
    <div className="max-w-5xl mx-auto p-6 sm:p-8 space-y-10 text-white font-sans">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          Kerdio 3-Tier Color Token System
        </h1>
        <p className="text-sm text-[#DCDCDC] max-w-2xl leading-relaxed">
          Warm terracotta radial canvas paired with 0%-saturation neutral grayscale typography
          calibrated for WCAG AA/AAA contrast on frosted obsidian glass.
        </p>
      </div>

      {/* Neutral Text Scale (0% Saturation, WCAG AA/AAA) */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold tracking-wider text-[#DCDCDC] uppercase">
          Neutral Text Scale (0% Saturation · WCAG AA/AAA)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { token: "--semantic-text-primary", hex: "#FFFFFF", ratio: "11.45:1 on glass" },
            { token: "--semantic-text-on-canvas", hex: "#F2F2F2", ratio: "6.5:1 on gradient" },
            { token: "--semantic-text-secondary", hex: "#DCDCDC", ratio: "8.3:1 on glass" },
            { token: "--semantic-text-tertiary", hex: "#B8B8B8", ratio: "5.75:1 on glass" },
          ].map((c) => (
            <div key={c.token} className="rounded-2xl p-3.5 bg-black/50 space-y-2">
              <div className="h-12 rounded-xl" style={{ backgroundColor: c.hex }} />
              <div>
                <div className="font-mono text-[11px] font-semibold text-white truncate">
                  {c.token}
                </div>
                <div className="text-[11px] font-mono text-[#DCDCDC]">{c.hex}</div>
                <div className="text-[11px] text-[#B8B8B8] mt-0.5">{c.ratio}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Terracotta Brand & Action Scale */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold tracking-wider text-[#DCDCDC] uppercase">
          Terracotta Canvas & Primary Action
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { token: "--semantic-action-primary", hex: "#C2410C", label: "Primary Button (5.18:1)" },
            { token: "--base-color-terracotta-600", hex: "#CA4B10", label: "Canvas Peak" },
            { token: "--base-color-terracotta-700", hex: "#9A3412", label: "Canvas Midtone" },
            { token: "--base-color-terracotta-900", hex: "#571D05", label: "Ambient Shade" },
            { token: "--base-color-terracotta-950", hex: "#200802", label: "Outer Rim" },
            { token: "--base-color-obsidian-950", hex: "#140501", label: "Deep Substrate" },
          ].map((c) => (
            <div key={c.token} className="rounded-2xl p-3.5 bg-black/50 space-y-2">
              <div className="h-12 rounded-xl" style={{ backgroundColor: c.hex }} />
              <div>
                <div className="font-mono text-[11px] font-semibold text-white truncate">
                  {c.token}
                </div>
                <div className="text-[11px] font-mono text-[#DCDCDC]">{c.hex}</div>
                <div className="text-[11px] text-[#B8B8B8] mt-0.5">{c.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Glass Surfaces */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold tracking-wider text-[#DCDCDC] uppercase">
          Optical Glass Surfaces
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { token: "--semantic-surface-card", val: "rgba(0, 0, 0, 0.50)", blur: "48px blur" },
            { token: "--semantic-surface-popover", val: "rgba(0, 0, 0, 0.55)", blur: "48px blur" },
            { token: "--semantic-surface-overlay", val: "rgba(0, 0, 0, 0.40)", blur: "8px blur" },
          ].map((s) => (
            <div key={s.token} className="rounded-2xl p-4 bg-black/50 space-y-1">
              <div className="font-mono text-xs font-semibold text-white">{s.token}</div>
              <div className="font-mono text-xs text-[#DCDCDC]">{s.val}</div>
              <div className="text-xs text-[#B8B8B8]">{s.blur}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
}
