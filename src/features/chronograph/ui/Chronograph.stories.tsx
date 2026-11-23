import { useEffect } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { within, userEvent, expect } from "@storybook/test"
import { Chronograph } from "./Chronograph"
import { useTrackerStore } from "@/entities/tracker"

const meta: Meta<typeof Chronograph> = {
  title: "Features/Chronograph",
  component: Chronograph,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "12-hour horological chronograph bezel with true-time arc segments (brief pauses <60s merge seamlessly), inward charging particles while running, soft 15s pulse, and fluid container-query digit scaling.",
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
  },
  args: {
    size: 380,
  },
}

export default meta
type Story = StoryObj<typeof Chronograph>

export const ActiveHourly: Story = {
  render: (args) => {
    useEffect(() => {
      const now = Date.now()
      const durationSeconds = 5400 // 1h 30m
      useTrackerStore.setState((s) => ({
        timer: {
          ...s.timer,
          status: "running",
          memo: "Core Bezel & Geometry Engine",
          projectId: "proj-kerd",
          milestoneId: null,
          milestoneName: null,
          startTime: now - durationSeconds * 1000,
          accumulatedSeconds: 0,
          elapsedSeconds: durationSeconds,
          rate: 85,
          billingType: "hourly",
          fixedBudget: 0,
          currency: "$",
          segments: [],
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

export const PausedNoParticles: Story = {
  render: (args) => {
    useEffect(() => {
      const now = Date.now()
      const durationSeconds = 4800 // 1h 20m
      useTrackerStore.setState((s) => ({
        timer: {
          ...s.timer,
          status: "paused",
          memo: "UX Flow Review",
          projectId: "proj-kerd",
          startTime: null,
          pausedAt: now,
          accumulatedSeconds: durationSeconds,
          elapsedSeconds: durationSeconds,
          rate: 95,
          billingType: "hourly",
          currency: "$",
          segments: [{ startTime: now - durationSeconds * 1000, endTime: now }],
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

export const RealPauseSegments: Story = {
  render: (args) => {
    useEffect(() => {
      const now = Date.now()
      const seg1Start = now - 3 * 3600 * 1000
      const seg1End = now - 2 * 3600 * 1000
      // 30-minute real break -> visible gap on dial
      const seg2Start = now - 1.5 * 3600 * 1000
      const seg2End = now - 30 * 60 * 1000
      // 15-second brief pause -> seamlessly merged with active segment
      const activeStart = seg2End + 15 * 1000

      useTrackerStore.setState((s) => ({
        timer: {
          ...s.timer,
          status: "running",
          memo: "Deep Work Sprint",
          projectId: "proj-kerd",
          startTime: activeStart,
          accumulatedSeconds: 7200,
          elapsedSeconds: 9000,
          rate: 110,
          billingType: "hourly",
          currency: "$",
          segments: [
            { startTime: seg1Start, endTime: seg1End },
            { startTime: seg2Start, endTime: seg2End },
          ],
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

export const NonBillable: Story = {
  render: (args) => {
    useEffect(() => {
      const now = Date.now()
      const durationSeconds = 1800
      useTrackerStore.setState((s) => ({
        timer: {
          ...s.timer,
          status: "running",
          memo: "Planning & inbox triage",
          projectId: null,
          milestoneId: null,
          milestoneName: null,
          startTime: now - durationSeconds * 1000,
          accumulatedSeconds: 0,
          elapsedSeconds: durationSeconds,
          rate: null,
          billingType: "none",
          fixedBudget: 0,
          currency: "$",
          segments: [],
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

export const InteractiveMilestoneEffectiveRate: Story = {
  render: (args) => {
    useEffect(() => {
      const now = Date.now()
      const durationSeconds = 7200 // 2 hours
      useTrackerStore.setState((s) => ({
        timer: {
          ...s.timer,
          status: "running",
          memo: "M 1 Design phase 1",
          projectId: "proj-design",
          milestoneId: "ms-des-1",
          milestoneName: "M 1 Design phase 1",
          startTime: now - durationSeconds * 1000,
          accumulatedSeconds: 0,
          elapsedSeconds: durationSeconds,
          fixedBudget: 2300,
          billingType: "milestone",
          currency: "$",
          segments: [],
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

    // 1. Initial time display & persistent Milestone subtitle
    const timeDisplay = await canvas.findByText("02:00:00")
    await expect(timeDisplay).toBeInTheDocument()
    await expect(await canvas.findByText("Milestone · $2300")).toBeInTheDocument()

    // 2. Click centerpiece to toggle from time -> live effective hourly rate ($2300 / 2h = $1150/h)
    await userEvent.click(timeDisplay)
    await expect(await canvas.findByText("$1150/h")).toBeInTheDocument()
    await expect(await canvas.findByText("Milestone · $2300")).toBeInTheDocument()
  },
}

export const ExtremeRateOverflowGuard: Story = {
  render: (args) => {
    useEffect(() => {
      const now = Date.now()
      const durationSeconds = 17 // $5550 / 17s -> $1.2M/h compact format
      useTrackerStore.setState((s) => ({
        timer: {
          ...s.timer,
          status: "running",
          memo: "Launch Milestone",
          projectId: "proj-design",
          milestoneId: "ms-des-1",
          milestoneName: "Launch Milestone",
          startTime: now - durationSeconds * 1000,
          accumulatedSeconds: 0,
          elapsedSeconds: durationSeconds,
          fixedBudget: 5550,
          billingType: "milestone",
          currency: "$",
          segments: [],
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
    const timeDisplay = await canvas.findByText("00:00:17")
    await userEvent.click(timeDisplay)
    await expect(await canvas.findByText("$1.2M/h")).toBeInTheDocument()
  },
}
