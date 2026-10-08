# Kerd • Focused Time & Value Tracker ⚡

A minimalist keyboard-driven time tracker and value converter for freelancers, combining **Linear** & **Raycast** digital ergonomics with the physical charm of an analogue chronograph bezel.

---

## 🎨 Visual Identity & Core Mechanics

- **Atmosphere & Palette**: Deep amber / terracotta glowing radial gradient (`#ca4b10` → `#571d05` → `#140501`), matching the analogue chronograph physical bezel aesthetic.
- **Analogue SVG Chronograph**:
  - **Outer 12-Hour Bezel**: Clean 1–12 track where completed sessions are rendered as solid dark pill arcs (`stroke-linecap="round"`), and the active session stretches in real-time with a diagonal hatched texture (`pattern #active-session-hatch`).
  - **Inner White Dial**: High-contrast white ring with 60 minute ticks (major ticks every 5 mins) and an accent orange hand marker pointing to the active time.
  - **Central Core**: Rich terracotta radial gradient with large tabular monospace counter `03:53:18` (`HH:MM:SS`) and dynamic accrual badge (`+$142.50`) updating every second.
- **Icon-Only Sidebar**: Fixed slim sidebar with tooltips on hover (`Tracker`, `Journal`, `Projects`, `Reports`, `Theme`).
- **Tokenized Command Bar**:
  - In **Idle mode**: only the focused command input is shown on screen.
  - Typing `@` triggers an instant autocomplete dropdown. Spaces do not interrupt project names (e.g. `@Kerdio Core`).
  - Selecting a project wraps it into an inline **Project Badge**.
  - If the project has an hourly rate, a **Rate Badge** (e.g. `$85/h`) is automatically added alongside it.
  - Hitting `Enter` starts the timer and smoothly unfolds the chronograph!
- **24-Hour Calendar Journal**:
  - Weekly view with 7 day columns (Mon–Sun) and a 24-hour vertical time grid (`00:00` to `23:00`).
  - Session blocks rendered with project colors, timestamps, duration, and dollar earnings.
  - Real-time indicator line showing current time on today's column.
  - Interactive click-to-edit modal and manual logging.
- **Projects & Reports**:
  - Project registry with billing models (Hourly, Fixed Budget, Milestone), rates, and stats.
  - Performance analytics with effective hourly rate calculation, breakdown charts, and one-click **CSV** / formatted text export.
- **100% English UI** with full local offline persistence via `localStorage`.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Enter` | Confirm autocomplete / Start tracking session |
| `Space` | Pause / Resume active timer |
| `Cmd + Enter` / `Ctrl + Enter` | Save session to Journal & Reset |
| `Esc` | Discard session / Close modals |
| `@` | Trigger project autocomplete dropdown |
| `1` / `2` / `3` / `4` | Navigate between screens via Sidebar |

---

## 🚀 Getting Started

```bash
# Start development server
npm run dev

# Production build
npm run build

# TypeScript validation
npx tsc --noEmit
```
