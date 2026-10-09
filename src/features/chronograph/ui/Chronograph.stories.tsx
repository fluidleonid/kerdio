import type { Meta, StoryObj } from '@storybook/react-vite'
import { within, userEvent, expect } from '@storybook/test'
import { Chronograph } from './Chronograph'
import { useTrackerStore } from '@/entities/tracker'
import { useEffect } from 'react'

/**
 * # Chronograph
 *
 * High-precision digital-analogue instrument for real-time focus tracking,
 * session monetization, and multi-slot time intervals on a 12-hour circular bezel.
 *
 * ### Design System & Visual Anatomy
 * - **12-Hour Bezel**: Upright numeral markers (12, 1, 2, ..., 11) with 48 radial tick marks.
 * - **Track Segments**: 34px-wide rounded arc strokes mapped to the clock face ($1\\text{ hour} = 30^\\circ$, $1\\text{ min} = 0.5^\\circ$).
 * - **Digital Centerpiece**: High-contrast tabular numerals (`tabular-nums`) with real-time currency accrual.
 * - **Interactive Display**: Click the central counter to toggle between elapsed time and total earnings.
 * - **Multi-Slot Geometry**: Supports multiple distinct intervals with 14° gap spacing (`GAP_DEGREES`) and minimal pause beads.
 *
 * ### Usage Rules
 * - Place within centered containers with adequate padding to accommodate outer atmospheric glow.
 * - Default diameter is **420px**; scales cleanly between 280px and 600px.
 */
const meta: Meta<typeof Chronograph> = {
  title: 'Features/Chronograph',
  component: Chronograph,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Chronograph Instrument

The Chronograph is the central visual anchor of the Kerdio productivity cockpit. It blends high-end horological craft with real-time financial tracking.

#### Anatomy
1. **Outer Ambient Glow**: Dynamic radial bloom reflecting the color of the active project.
2. **Radial Bezel**: 12 numeral hour positions + 48 tick divisions calibrated for instant glanceability.
3. **Session Progress Arcs**: High-visibility orange arc segments that advance clockwise in real-time.
4. **Pause Indicator Bead**: A minimal circular bead generated adjacent to completed intervals during pause states.
5. **Center HUD**: Tabular digital readout with live billing computation and toggleable metrics.

#### Usage Guidelines
- Always render inside a high-contrast dark backdrop (\`#140501\` or \`#0d0d0f\`).
- Ensure the underlying \`useTrackerStore\` is properly initialized or mocked for deterministic previews.
        `,
      },
    },
  },
  argTypes: {
    size: {
      description: 'Diameter of the chronograph bezel in pixels (280px to 600px).',
      control: { type: 'range', min: 280, max: 600, step: 20 },
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '420' },
      },
    },
    className: {
      description: 'Optional Tailwind CSS classes for custom spacing and layout positioning.',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
  },
  args: {
    size: 420,
  },
}

export default meta
type Story = StoryObj<typeof Chronograph>

/**
 * **Default (Idle)**: Standby state when no tracking session is active.
 * Displays clean radial numerals and zeroed tabular counter with ready status.
 */
export const DefaultIdle: Story = {
  render: (args) => {
    useEffect(() => {
      useTrackerStore.getState().discardTracking()
    }, [])

    return (
      <div className="p-8 flex items-center justify-center">
        <Chronograph {...args} />
      </div>
    )
  },
}

/**
 * **Active Running**: Mid-session state with progressive arc fill.
 * Demonstrates a 1h 45m active session with live hourly rate accrual ($120/h)
 * and clockwise arc expansion.
 */
export const ActiveRunning: Story = {
  render: (args) => {
    useEffect(() => {
      const now = Date.now()
      const durationSeconds = 6300 // 1 hour 45 minutes
      useTrackerStore.setState((s) => ({
        timer: {
          ...s.timer,
          status: 'running',
          memo: 'Core Bezel & Geometry Engine',
          projectId: 'proj-kerd',
          startTime: now - durationSeconds * 1000,
          accumulatedSeconds: 0,
          elapsedSeconds: durationSeconds,
          rate: 120,
          billingType: 'hourly',
          currency: '$',
          intervals: [],
        },
      }))
    }, [])

    return (
      <div className="p-8 flex items-center justify-center">
        <Chronograph {...args} />
      </div>
    )
  },
}

/**
 * **Paused Session**: Live session paused mid-work.
 * Displays completed session duration along with a minimal adjacent bead
 * indicating where the next interval will resume.
 */
export const Paused: Story = {
  render: (args) => {
    useEffect(() => {
      const now = Date.now()
      const durationSeconds = 4800 // 1 hour 20 minutes
      useTrackerStore.setState((s) => ({
        timer: {
          ...s.timer,
          status: 'paused',
          memo: 'UX Flow Review & Architecture',
          projectId: 'proj-kerd',
          startTime: now - durationSeconds * 1000,
          accumulatedSeconds: durationSeconds,
          elapsedSeconds: durationSeconds,
          rate: 150,
          billingType: 'hourly',
          currency: '$',
          intervals: [durationSeconds],
        },
      }))
    }, [])

    return (
      <div className="p-8 flex items-center justify-center">
        <Chronograph {...args} />
      </div>
    )
  },
}

/**
 * **Multiple Slots (Interleaved Intervals)**:
 * Session with multiple distinct intervals separated by pauses.
 * Shows segmented arcs with clean 14° gap spacing (`GAP_DEGREES`)
 * representing broken focus slots throughout the day.
 */
export const MultipleSlots: Story = {
  render: (args) => {
    useEffect(() => {
      const now = Date.now()
      const intervals = [3600, 2400, 1800] // 1h, 40m, 30m slots
      const accumulated = intervals.reduce((a, b) => a + b, 0)
      const currentActive = 1200 // 20m in current running slot
      const total = accumulated + currentActive

      useTrackerStore.setState((s) => ({
        timer: {
          ...s.timer,
          status: 'running',
          memo: 'Deep Work Sprint: 3 Focus Intervals',
          projectId: 'proj-kerd',
          startTime: now - total * 1000,
          accumulatedSeconds: accumulated,
          elapsedSeconds: total,
          rate: 110,
          billingType: 'hourly',
          currency: '$',
          intervals: intervals,
        },
      }))
    }, [])

    return (
      <div className="p-8 flex items-center justify-center">
        <Chronograph {...args} />
      </div>
    )
  },
}

/**
 * **Milestone Billing Session**:
 * Fixed-fee deliverable tracking against a contract milestone budget.
 * Shows flat rate valuation ($850.00) with milestone target details.
 */
export const MilestoneSession: Story = {
  render: (args) => {
    useEffect(() => {
      const now = Date.now()
      const durationSeconds = 5400 // 1.5 hours
      useTrackerStore.setState((s) => ({
        timer: {
          ...s.timer,
          status: 'running',
          memo: 'Milestone 2: Design Tokens & Bezels',
          projectId: 'proj-kerd',
          startTime: now - durationSeconds * 1000,
          accumulatedSeconds: 0,
          elapsedSeconds: durationSeconds,
          fixedBudget: 850,
          billingType: 'milestone',
          currency: '$',
          intervals: [],
        },
      }))
    }, [])

    return (
      <div className="p-8 flex items-center justify-center">
        <Chronograph {...args} />
      </div>
    )
  },
}

/**
 * **Interactive: Toggle to Money Mode & Effective Hourly Rate**:
 * Tests clicking the digital centerpiece to switch the chronograph to financial mode.
 * For fixed/milestone sessions, confirms display of total contract budget and
 * calculated useful hourly rate ($budget / elapsed hours) under the sum.
 */
export const InteractiveMilestoneEffectiveRate: Story = {
  render: (args) => {
    useEffect(() => {
      const now = Date.now()
      const durationSeconds = 7200 // 2 hours
      useTrackerStore.setState((s) => ({
        timer: {
          ...s.timer,
          status: 'running',
          memo: 'M 1 Design phase 1',
          projectId: 'proj-kerd',
          startTime: now - durationSeconds * 1000,
          accumulatedSeconds: 0,
          elapsedSeconds: durationSeconds,
          fixedBudget: 2300,
          billingType: 'milestone',
          currency: '$',
          intervals: [],
        },
      }))
    }, [])

    return (
      <div className="p-8 flex items-center justify-center">
        <Chronograph {...args} />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 1. Initial time display
    const timeDisplay = await canvas.findByText('02:00:00')
    await expect(timeDisplay).toBeInTheDocument()

    // 2. Click centerpiece to toggle displayMode from time -> money
    await userEvent.click(timeDisplay)

    // 3. Confirm budget amount $2300
    const moneySum = await canvas.findByText('$2300')
    await expect(moneySum).toBeInTheDocument()

    // 4. Confirm calculated effective hourly rate: $2300 / 2h = $1150/h
    const effectiveRateLabel = await canvas.findByText(/Полезный рейт:/i)
    await expect(effectiveRateLabel).toBeInTheDocument()

    const effectiveRateVal = await canvas.findByText('$1150/h')
    await expect(effectiveRateVal).toBeInTheDocument()
  },
}
