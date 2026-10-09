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
    milestoneId: "ms-kerd-1",
    milestoneName: "M 1 Horological Dial & Physics",
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
    id: "sess-1b",
    projectId: "proj-kerd",
    milestoneId: "ms-kerd-1",
    milestoneName: "M 1 Horological Dial & Physics",
    memo: "Spring physics calibration & tick vibration haptics",
    startTime: getTodayTime(14, 30),
    endTime: getTodayTime(16, 0),
    durationSeconds: 5400, // 1h 30m
    rateSnapshot: 85,
    earnedAmount: 127.5,
    billingType: "hourly",
    currency: "$",
  },
  {
    id: "sess-1c",
    projectId: "proj-kerd",
    milestoneId: "ms-kerd-2",
    milestoneName: "M 2 Token Command Palette",
    memo: "Token command parser and badge input mechanics",
    startTime: getTodayTime(16, 15),
    endTime: getTodayTime(17, 45),
    durationSeconds: 5400, // 1h 30m
    rateSnapshot: 85,
    earnedAmount: 127.5,
    billingType: "hourly",
    currency: "$",
  },
  {
    id: "sess-2",
    projectId: "proj-raycast",
    milestoneId: "ms-ray-1",
    milestoneName: "M 1 OAuth & Store Submission",
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
