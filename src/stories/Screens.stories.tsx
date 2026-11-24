import { useEffect, useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { TrackerView } from "@/widgets/tracker-view"
import { TodayLogDrawer } from "@/widgets/today-log"
import { INITIAL_PROJECTS } from "@/entities/project"
import type { TimeSession } from "@/entities/session"
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
      <div className="relative h-[560px] w-full overflow-hidden transform-gpu">
        <TrackerView />
      </div>
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
      <div className="relative h-[620px] w-full overflow-hidden transform-gpu">
        <TrackerView />
      </div>
    )
  },
}

export const TodayLogReceiptOpen: StoryObj = {
  render: () => {
    const [sessions, setSessions] = useState<TimeSession[]>(() => {
      const d = new Date()
      const at = (h: number, m: number) => {
        const t = new Date(d)
        t.setHours(h, m, 0, 0)
        return t.getTime()
      }
      return [
        {
          id: "scr-1",
          projectId: "proj-kerd",
          milestoneId: "ms-kerd-2",
          milestoneName: "M 2 Token Command Palette",
          memo: "Token badges & responsive polish",
          startTime: at(9, 30),
          endTime: at(11, 0),
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
          startTime: at(11, 30),
          endTime: at(12, 30),
          durationSeconds: 3600,
          rateSnapshot: 85,
          earnedAmount: 85,
          billingType: "hourly",
          currency: "$",
        },
        {
          id: "scr-3",
          projectId: "proj-raycast",
          memo: "Extension store manifest & icons",
          startTime: at(14, 0),
          endTime: at(15, 15),
          durationSeconds: 4500,
          rateSnapshot: 95,
          earnedAmount: 118.75,
          billingType: "hourly",
          currency: "$",
        },
        {
          id: "scr-4",
          projectId: "no-project",
          memo: "Inbox triage & daily planning",
          startTime: at(16, 0),
          endTime: at(16, 30),
          durationSeconds: 1800,
          rateSnapshot: 0,
          earnedAmount: 0,
          billingType: "hourly",
          currency: "$",
        },
      ]
    })

    return (
      <div className="relative h-[680px] w-full overflow-hidden transform-gpu">
        <TrackerView />
        <TodayLogDrawer
          isOpen={true}
          onClose={() => {}}
          sessionsOverride={sessions}
          projectsOverride={INITIAL_PROJECTS}
          onDeleteSession={(id) => setSessions((prev) => prev.filter((s) => s.id !== id))}
        />
      </div>
    )
  },
}
