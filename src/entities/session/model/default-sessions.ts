import type { TimeSession } from "./types"

// Helper to get today's timestamp at specific hour/minute
const getTodayTime = (hours: number, minutes: number = 0) => {
  const d = new Date()
  d.setHours(hours, minutes, 0, 0)
  return d.getTime()
}

export const INITIAL_SESSIONS: TimeSession[] = [
  {
    id: "sess-1",
    projectId: "proj-kerd",
    memo: "SVG Chronograph bezel trigonometry and arc geometry",
    startTime: getTodayTime(11, 0),
    endTime: getTodayTime(14, 15),
    durationSeconds: 11700, // 3h 15m
    rateSnapshot: 85,
    earnedAmount: 276.25,
    billingType: "hourly",
    currency: "$",
  },
  {
    id: "sess-2",
    projectId: "proj-raycast",
    memo: "Raycast Command Bar token badges and @ autocomplete",
    startTime: getTodayTime(9, 30),
    endTime: getTodayTime(10, 45),
    durationSeconds: 4500, // 1h 15m
    rateSnapshot: 95,
    earnedAmount: 118.75,
    billingType: "hourly",
    currency: "$",
  },
]
