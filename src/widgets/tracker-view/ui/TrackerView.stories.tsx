import { useEffect } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { TrackerView } from "./TrackerView"
import { useTrackerStore } from "@/entities/tracker"

const meta: Meta<typeof TrackerView> = {
  title: "Widgets/Tracker View",
  component: TrackerView,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Single-day MVP focus cockpit combining the centered TokenCommandInput, horological Chronograph dial, top session header (no billing badge), and floating Today's Log receipt drawer trigger (shortcut L).",
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof TrackerView>

export const DefaultIdle: Story = {
  render: () => {
    useEffect(() => {
      useTrackerStore.getState().discardTracking()
    }, [])

    return (
      <div className="relative h-[620px] w-full overflow-hidden transform-gpu">
        <TrackerView />
      </div>
    )
  },
}

export const ActiveHourlyTracking: Story = {
  render: () => {
    useEffect(() => {
      const now = Date.now()
      const durationSeconds = 3840 // 1h 4m
      useTrackerStore.setState((s) => ({
        timer: {
          ...s.timer,
          status: "running",
          memo: "Design System Architecture & Horology Dial",
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
      <div className="relative h-[620px] w-full overflow-hidden transform-gpu">
        <TrackerView />
      </div>
    )
  },
}

export const ActiveMilestoneTracking: Story = {
  render: () => {
    useEffect(() => {
      const now = Date.now()
      const durationSeconds = 5400 // 1h 30m
      useTrackerStore.setState((s) => ({
        timer: {
          ...s.timer,
          status: "running",
          memo: "Token parser & badge geometry",
          projectId: "proj-design",
          milestoneId: "ms-des-1",
          milestoneName: "M 1 Design phase 1",
          startTime: now - durationSeconds * 1000,
          accumulatedSeconds: 0,
          elapsedSeconds: durationSeconds,
          rate: null,
          billingType: "milestone",
          fixedBudget: 2300,
          currency: "$",
          segments: [],
        },
      }))
    }, [])

    return (
      <div className="relative h-[620px] w-full overflow-hidden transform-gpu">
        <TrackerView />
      </div>
    )
  },
}

export const NoProjectNonBillable: Story = {
  render: () => {
    useEffect(() => {
      const now = Date.now()
      const durationSeconds = 1200 // 20m
      useTrackerStore.setState((s) => ({
        timer: {
          ...s.timer,
          status: "running",
          memo: "Weekly review & inbox zero",
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
      <div className="relative h-[620px] w-full overflow-hidden transform-gpu">
        <TrackerView />
      </div>
    )
  },
}
