import type { Meta, StoryObj } from "@storybook/react-vite"
import { within, userEvent, expect } from "@storybook/test"
import { Chronograph } from "./Chronograph"
import type { ActiveTimerState } from "@/entities/tracker"

const meta: Meta<typeof Chronograph> = {
  title: "Features/Chronograph",
  component: Chronograph,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
### Horological 12-Hour Chronograph (US-3)

**User Story**: *As a focused maker, I want a calm 12-hour chronograph dial that shows real wall-clock segments and lets me click the centerpiece to inspect my live earned amount or decreasing effective hourly rate, so that I stay aware of pace without visual noise.*

#### Key States & Contracts
- **Active Running**: Subtle inward charging particles + calm \`15s\` digit pulse.
- **Paused**: Particles and pulse stop immediately; elapsed arc stays frozen on the 12-hour dial.
- **True-Time Segments**: Brief pauses (\`< 60s\`) merge seamlessly; real breaks (\`>= 60s\`) render as visible gaps on the dial.
- **Click-to-Toggle**: Clicking the center display toggles \`HH:MM:SS\` ↔ live earnings / effective hourly rate while keeping the subtitle anchored underneath.
- **Overflow Guard**: Extreme early milestone rates compact automatically (\`k/h\`, \`M/h\`) and scale via CSS container queries (\`cqi\`) inside \`max-w-[60cqi]\` so numerals never touch the dial markers.
        `,
      },
    },
  },
  argTypes: {
    size: {
      description: "Maximum diameter of the chronograph bezel in pixels.",
      control: { type: "range", min: 280, max: 520, step: 20 },
      table: { category: "Appearance", defaultValue: { summary: "380" } },
    },
    className: {
      control: "text",
      table: { category: "Appearance" },
    },
    timerOverride: {
      table: { disable: true },
    },
  },
  args: {
    size: 380,
  },
}

export default meta
type Story = StoryObj<typeof Chronograph>

const makeTimer = (overrides: Partial<ActiveTimerState>): ActiveTimerState => ({
  status: "running",
  startTime: Date.now() - 5400 * 1000,
  accumulatedSeconds: 0,
  elapsedSeconds: 5400,
  projectId: "proj-kerd",
  milestoneId: null,
  milestoneName: null,
  memo: "Core Bezel & Geometry Engine",
  rate: 85,
  billingType: "hourly",
  fixedBudget: 0,
  currency: "$",
  pausedAt: null,
  segments: [],
  ...overrides,
})

export const ActiveHourly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**State: Running (Hourly)** · **US-3**: Active 1h 30m hourly session (`$85/h`). Displays subtle inward charging particles, `15s` digit pulse, and persistent `$85/h` subtitle. Click the center numerals to toggle between `01:30:00` and `$127.50`.",
      },
    },
  },
  render: (args) => {
    const now = Date.now()
    const durationSeconds = 5400
    return (
      <div className="p-8 flex items-center justify-center">
        <Chronograph
          {...args}
          timerOverride={makeTimer({
            status: "running",
            startTime: now - durationSeconds * 1000,
            elapsedSeconds: durationSeconds,
            rate: 85,
            billingType: "hourly",
          })}
        />
      </div>
    )
  },
}

export const PausedNoParticles: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**State: Paused** · **US-3**: Timer paused at 1h 20m (`$95/h`). Charging particles and digit pulse stop immediately so the user gets an unmistakable stillness cue.",
      },
    },
  },
  render: (args) => {
    const now = Date.now()
    const durationSeconds = 4800
    return (
      <div className="p-8 flex items-center justify-center">
        <Chronograph
          {...args}
          timerOverride={makeTimer({
            status: "paused",
            memo: "UX Flow Review",
            startTime: null,
            pausedAt: now,
            accumulatedSeconds: durationSeconds,
            elapsedSeconds: durationSeconds,
            rate: 95,
            billingType: "hourly",
            segments: [{ startTime: now - durationSeconds * 1000, endTime: now }],
          })}
        />
      </div>
    )
  },
}

export const RealPauseSegments: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**State: Multi-Segment Session** · **US-3**: Demonstrates true-time dial geometry — a 30-minute break renders as a distinct gap between arcs, while a brief 15-second pause (`< 60s`) merges seamlessly into the active arc.",
      },
    },
  },
  render: (args) => {
    const now = Date.now()
    const seg1Start = now - 3 * 3600 * 1000
    const seg1End = now - 2 * 3600 * 1000
    const seg2Start = now - 1.5 * 3600 * 1000
    const seg2End = now - 30 * 60 * 1000
    const activeStart = seg2End + 15 * 1000

    return (
      <div className="p-8 flex items-center justify-center">
        <Chronograph
          {...args}
          timerOverride={makeTimer({
            status: "running",
            memo: "Deep Work Sprint",
            startTime: activeStart,
            accumulatedSeconds: 7200,
            elapsedSeconds: 9000,
            rate: 110,
            billingType: "hourly",
            segments: [
              { startTime: seg1Start, endTime: seg1End },
              { startTime: seg2Start, endTime: seg2End },
            ],
          })}
        />
      </div>
    )
  },
}

export const NonBillable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**State: Running (Non-Billable)** · **US-1 / US-3**: Session started without a rate or billing token. Shows `Non-billable` subtitle below the time; clicking the centerpiece stays in time mode.",
      },
    },
  },
  render: (args) => {
    const now = Date.now()
    const durationSeconds = 1800
    return (
      <div className="p-8 flex items-center justify-center">
        <Chronograph
          {...args}
          timerOverride={makeTimer({
            status: "running",
            memo: "Planning & inbox triage",
            projectId: null,
            startTime: now - durationSeconds * 1000,
            elapsedSeconds: durationSeconds,
            rate: null,
            billingType: "none",
          })}
        />
      </div>
    )
  },
}

export const InteractiveMilestoneEffectiveRate: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**State: Running (Milestone) + Click-to-Toggle** · **US-2 / US-3**: Displays persistent `Milestone · $2300` subtitle. Clicking the center numerals toggles from `02:00:00` to the live effective hourly rate (`$1150/h`) without shifting vertical alignment.",
      },
    },
  },
  render: (args) => {
    const now = Date.now()
    const durationSeconds = 7200
    return (
      <div className="p-8 flex items-center justify-center">
        <Chronograph
          {...args}
          timerOverride={makeTimer({
            status: "running",
            memo: "M 1 Design phase 1",
            projectId: "proj-design",
            milestoneId: "ms-des-1",
            milestoneName: "M 1 Design phase 1",
            startTime: now - durationSeconds * 1000,
            elapsedSeconds: durationSeconds,
            rate: null,
            fixedBudget: 2300,
            billingType: "milestone",
          })}
        />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const timeDisplay = await canvas.findByText("02:00:00")
    await expect(timeDisplay).toBeInTheDocument()
    await expect(await canvas.findByText("Milestone · $2300")).toBeInTheDocument()

    await userEvent.click(timeDisplay)
    await expect(await canvas.findByText("$1150/h")).toBeInTheDocument()
    await expect(await canvas.findByText("Milestone · $2300")).toBeInTheDocument()
  },
}

export const ExtremeRateOverflowGuard: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**Edge Case: High Effective Rate Overflow Guard** · **US-3**: Early seconds of a `$5550` milestone (`17s` elapsed → `$1,175,294/h`). Verifies compact formatting (`$1.2M/h`) and `cqi` fluid scaling keep numerals safely inside the dial ring.",
      },
    },
  },
  render: (args) => {
    const now = Date.now()
    const durationSeconds = 17
    return (
      <div className="p-8 flex items-center justify-center">
        <Chronograph
          {...args}
          timerOverride={makeTimer({
            status: "running",
            memo: "Launch Milestone",
            projectId: "proj-design",
            milestoneId: "ms-des-1",
            milestoneName: "Launch Milestone",
            startTime: now - durationSeconds * 1000,
            elapsedSeconds: durationSeconds,
            rate: null,
            fixedBudget: 5550,
            billingType: "milestone",
          })}
        />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const timeDisplay = await canvas.findByText("00:00:17")
    await userEvent.click(timeDisplay)
    await expect(await canvas.findByText("$1.2M/h")).toBeInTheDocument()
  },
}
