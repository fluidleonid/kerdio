import { useEffect } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { MemoryRouter } from "react-router-dom"
import { TrackerView } from "@/widgets/tracker-view"
import { TodayLogDrawer } from "@/widgets/today-log"
import { useTrackerStore } from "@/entities/tracker"

const meta: Meta = {
  title: "Screens/Single-Day MVP Cockpit",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Production single-day MVP screens: centered command cockpit, active horological timer, and receipt-style Today's Log drawer.",
      },
    },
  },
}

export default meta

export const IdleCockpit: StoryObj = {
  render: () => {
    useEffect(() => {
      useTrackerStore.getState().discardTracking()
    }, [])

    return (
      <MemoryRouter initialEntries={["/"]}>
        <div className="relative min-h-dvh w-screen overflow-hidden">
          <TrackerView />
        </div>
      </MemoryRouter>
    )
  },
}

export const ActiveTimerCockpit: StoryObj = {
  render: () => {
    useEffect(() => {
      const now = Date.now()
      const durationSeconds = 4200
      useTrackerStore.setState((s) => ({
        timer: {
          ...s.timer,
          status: "running",
          memo: "SVG Chronograph bezel trigonometry",
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
      <MemoryRouter initialEntries={["/"]}>
        <div className="relative min-h-dvh w-screen overflow-hidden">
          <TrackerView />
        </div>
      </MemoryRouter>
    )
  },
}

export const TodayLogReceiptOpen: StoryObj = {
  render: () => {
    useEffect(() => {
      const d = new Date()
      const at = (h: number, m: number) => {
        const t = new Date(d)
        t.setHours(h, m, 0, 0)
        return t.getTime()
      }
      useTrackerStore.getState().discardTracking()
      useTrackerStore.setState({
        sessions: [
          {
            id: "scr-1",
            projectId: "proj-kerd",
            milestoneId: "ms-kerd-2",
            milestoneName: "M 2 Token Command Palette",
            memo: "Token badges & responsive polish",
            startTime: at(10, 0),
            endTime: at(11, 30),
            durationSeconds: 5400,
            rateSnapshot: 0,
            earnedAmount: 2300,
            billingType: "milestone",
            currency: "$",
          },
          {
            id: "scr-2",
            projectId: "proj-kerd",
            memo: "WCAG contrast & Storybook audit",
            startTime: at(12, 0),
            endTime: at(13, 0),
            durationSeconds: 3600,
            rateSnapshot: 85,
            earnedAmount: 85,
            billingType: "hourly",
            currency: "$",
          },
        ],
      })
    }, [])

    return (
      <MemoryRouter initialEntries={["/"]}>
        <div className="relative min-h-dvh w-screen overflow-hidden">
          <TrackerView />
          <TodayLogDrawer isOpen={true} onClose={() => {}} />
        </div>
      </MemoryRouter>
    )
  },
}
