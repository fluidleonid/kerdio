import { useState, useMemo } from "react"
import { useTrackerStore } from "@/entities/tracker"
import { AppTooltip } from "@/shared/ui"

interface ChronographProps {
  className?: string
  size?: number
}

// Convert angle in degrees (where 0 deg = 12 o'clock, clockwise) to SVG coordinates (cx, cy)
function getPointOnCircle(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  }
}

// SVG Arc path
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  let diff = endAngle - startAngle
  while (diff < 0) diff += 360
  if (diff >= 359.99) diff = 359.99
  if (diff < 0.1) return ""

  const start = getPointOnCircle(cx, cy, r, startAngle)
  const end = getPointOnCircle(cx, cy, r, startAngle + diff)
  const largeArcFlag = diff > 180 ? 1 : 0

  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`
}

// Convert timestamp to 12-hour clock angle (0..360 deg, where 0 deg = 12 o'clock, clockwise)
function timestampToClockAngle(timestamp: number): number {
  const d = new Date(timestamp)
  const hours = d.getHours() % 12
  const minutes = d.getMinutes()
  const seconds = d.getSeconds()
  return (hours + minutes / 60 + seconds / 3600) * 30
}

const MIN_VISIBLE_PAUSE_SECONDS = 60 // Pauses under 60s merge seamlessly with no visible gap
const MIN_ARC_DEGREES = 1.0 // Below 1 degree (~2 min), minimally forms a circular bead

// 24 battery charging particles streaming inwards from perimeter to center
const CHARGE_PARTICLES = [
  { angle: 0, delay: 0.1, duration: 2.2, size: 2.5 },
  { angle: 15, delay: 1.4, duration: 2.6, size: 2 },
  { angle: 30, delay: 0.7, duration: 2.1, size: 3 },
  { angle: 45, delay: 2.0, duration: 2.8, size: 2 },
  { angle: 60, delay: 0.4, duration: 2.3, size: 2.5 },
  { angle: 75, delay: 1.8, duration: 2.5, size: 3 },
  { angle: 90, delay: 0.9, duration: 2.2, size: 2 },
  { angle: 105, delay: 2.3, duration: 2.7, size: 2.5 },
  { angle: 120, delay: 0.3, duration: 2.4, size: 2 },
  { angle: 135, delay: 1.6, duration: 2.1, size: 3 },
  { angle: 150, delay: 0.8, duration: 2.5, size: 2.5 },
  { angle: 165, delay: 2.1, duration: 2.3, size: 2 },
  { angle: 180, delay: 0.5, duration: 2.6, size: 3 },
  { angle: 195, delay: 1.9, duration: 2.2, size: 2 },
  { angle: 210, delay: 0.2, duration: 2.4, size: 2.5 },
  { angle: 225, delay: 1.5, duration: 2.7, size: 3 },
  { angle: 240, delay: 0.6, duration: 2.1, size: 2 },
  { angle: 255, delay: 2.2, duration: 2.5, size: 2.5 },
  { angle: 270, delay: 1.1, duration: 2.3, size: 2 },
  { angle: 285, delay: 1.7, duration: 2.6, size: 3 },
  { angle: 300, delay: 0.4, duration: 2.2, size: 2.5 },
  { angle: 315, delay: 1.3, duration: 2.7, size: 2 },
  { angle: 330, delay: 0.8, duration: 2.4, size: 3 },
  { angle: 345, delay: 2.0, duration: 2.5, size: 2 },
]

export function Chronograph({ className, size = 420 }: ChronographProps) {
  const { timer, projects } = useTrackerStore()
  const [displayMode, setDisplayMode] = useState<"time" | "money">("time")

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === timer.projectId) || projects[0]
  }, [projects, timer.projectId])

  // Center & Radius for the clock dial
  const cx = 220
  const cy = 220
  const dialRadius = 165
  const trackStrokeWidth = 34

  // Tracking segments on 12-hour clock face:
  // - Starts at current real-world time on 12-hour dial (12 numbers: 12, 1, 2, ..., 11)
  // - 1 hour = 30°, 1 minute = 0.5°
  // - Minimally forms a circular bead (r = 17, matching 34px track stroke)
  // - On pause, a new adjacent arc is constructed right next to the previous one
  const trackSegments = useMemo(() => {
    if (timer.status === "idle") return []

    const now = Date.now()
    const rawRanges: Array<{ startTime: number; endTime: number }> = [
      ...(timer.segments || []),
    ]

    if (timer.status === "running" && timer.startTime) {
      rawRanges.push({ startTime: timer.startTime, endTime: now })
    } else if (rawRanges.length === 0) {
      // Fallback for legacy persisted timers without segments array
      const elapsedMs = (timer.elapsedSeconds || 0) * 1000
      rawRanges.push({ startTime: now - elapsedMs, endTime: now })
    }

    // Merge adjacent intervals whose pause gap is under MIN_VISIBLE_PAUSE_SECONDS
    const merged: Array<{ startTime: number; endTime: number }> = []
    for (const r of rawRanges) {
      const last = merged[merged.length - 1]
      if (last && (r.startTime - last.endTime) / 1000 < MIN_VISIBLE_PAUSE_SECONDS) {
        last.endTime = Math.max(last.endTime, r.endTime)
      } else {
        merged.push({ startTime: r.startTime, endTime: r.endTime })
      }
    }

    return merged.map((range, index) => {
      const durationSec = Math.max(0, (range.endTime - range.startTime) / 1000)
      const startAngle = timestampToClockAngle(range.startTime)
      const spanDeg = Math.min((durationSec / 3600) * 30, 350)
      const isCircle = spanDeg < MIN_ARC_DEGREES
      const center = getPointOnCircle(cx, cy, dialRadius, startAngle)
      return {
        id: `seg-${index}`,
        startAngle,
        endAngle: startAngle + spanDeg,
        spanDeg,
        isCircle,
        center,
      }
    })
  }, [timer.status, timer.startTime, timer.segments, timer.elapsedSeconds, cx, cy, dialRadius])

  // 12 hour numbers (12, 1, 2, ..., 11) upright around the circle
  const hourMarkers = useMemo(() => {
    const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    return hours.map((h, i) => {
      const angleDeg = i * 30
      const pt = getPointOnCircle(cx, cy, dialRadius, angleDeg)
      return { hour: h, x: pt.x, y: pt.y, angleDeg }
    })
  }, [cx, cy, dialRadius])

  // 48 radial tick marks (4 between each hour number)
  const tickMarks = useMemo(() => {
    const ticks = []
    for (let i = 0; i < 60; i++) {
      // Skip the 12 positions where the numbers are rendered
      if (i % 5 === 0) continue

      const angleDeg = i * 6
      const pInner = getPointOnCircle(cx, cy, dialRadius - 7, angleDeg)
      const pOuter = getPointOnCircle(cx, cy, dialRadius + 7, angleDeg)

      ticks.push({
        index: i,
        x1: pInner.x,
        y1: pInner.y,
        x2: pOuter.x,
        y2: pOuter.y,
      })
    }
    return ticks
  }, [cx, cy, dialRadius])

  // Formatted digital time: 00:00:07
  const formattedTime = useMemo(() => {
    const hours = Math.floor(timer.elapsedSeconds / 3600)
    const minutes = Math.floor((timer.elapsedSeconds % 3600) / 60)
    const seconds = timer.elapsedSeconds % 60
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }, [timer.elapsedSeconds])

  // Accrued money calculations for money mode
  const moneyDisplay = useMemo(() => {
    const currency = activeProject?.currency || timer.currency || "$"

    if (timer.billingType === "hourly") {
      if (!timer.rate || timer.rate <= 0) {
        return {
          hasBilling: false,
          amountText: "Set rate",
          hint: "Billing rate not set",
        }
      }
      const earned = (timer.elapsedSeconds / 3600) * timer.rate
      return {
        hasBilling: true,
        amountText: `${currency}${earned.toFixed(2)}`,
        hint: `${currency}${timer.rate}/h`,
      }
    }

    if (timer.billingType === "fixed" || timer.billingType === "milestone") {
      if (!timer.fixedBudget || timer.fixedBudget <= 0) {
        return {
          hasBilling: false,
          amountText: "Set budget",
          hint: "Fixed budget not set",
        }
      }
      const elapsedHours = timer.elapsedSeconds / 3600
      const effectiveRate =
        elapsedHours > 0 ? timer.fixedBudget / elapsedHours : timer.fixedBudget
      const effectiveRateFormatted = `${currency}${Math.round(effectiveRate)}/h`

      return {
        hasBilling: true,
        amountText: `${currency}${timer.fixedBudget.toFixed(2)}`,
        hint: timer.billingType === "fixed" ? "Fixed budget" : "Milestone",
        effectiveRateText: effectiveRateFormatted,
      }
    }

    return {
      hasBilling: false,
      amountText: "Set rate",
      hint: "Non-billable session",
    }
  }, [timer.billingType, timer.rate, timer.fixedBudget, timer.elapsedSeconds, activeProject?.currency, timer.currency])

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className || ""}`}
      style={{
        width: `min(82vw, ${size}px)`,
        height: `min(82vw, ${size}px)`,
      }}
    >
      <svg
        viewBox="0 0 440 440"
        aria-hidden="true"
        className="overflow-visible relative z-10 w-full h-full"
      >
        {/* 1. ПОСТОЯННАЯ ПОЛОСКА: 4% ОПАСИТИ БЕЛАЯ (ФОНОВЫЙ КРУГ) */}
        <circle
          cx={cx}
          cy={cy}
          r={dialRadius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.04)"
          strokeWidth={trackStrokeWidth}
        />

        {/* 2. АКТИВНЫЕ ДУГИ ТРЕКИНГА: БЕЛЫЕ С ОПАСИТИ 32%, СООТВЕТСТВУЮТ МИНУТАМ, МИНИМАЛЬНО КРУЖОК, ПРИ ПАУЗЕ СТРОИТСЯ НОВАЯ ДУГА РЯДОМ */}
        {trackSegments.map((segment) =>
          segment.isCircle ? (
            <circle
              key={segment.id}
              cx={segment.center.x}
              cy={segment.center.y}
              r={trackStrokeWidth / 2}
              fill="rgba(255, 255, 255, 0.32)"
            />
          ) : (
            <path
              key={segment.id}
              d={describeArc(cx, cy, dialRadius, segment.startAngle, segment.endAngle)}
              fill="none"
              stroke="rgba(255, 255, 255, 0.32)"
              strokeWidth={trackStrokeWidth}
              strokeLinecap="round"
            />
          )
        )}

        {/* 3. РАДИАЛЬНЫЕ РИСКИ (ПОВЕРХ ДУГИ) */}
        {tickMarks.map((tick) => (
          <line
            key={tick.index}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        ))}

        {/* 4. 12 ЧАСОВЫХ ЦИФР В ШРИФТЕ OXANIUM (ПОВЕРХ ДУГИ) */}
        {hourMarkers.map(({ hour, x, y }) => (
          <text
            key={hour}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#FFFFFF"
            fontSize="18"
            fontWeight="700"
            fontFamily="'Oxanium', sans-serif"
            className="select-none pointer-events-none"
          >
            {hour}
          </text>
        ))}
      </svg>

      {/* 5. ЦЕНТРАЛЬНОЕ ОТОБРАЖЕНИЕ: ПЕРЕКЛЮЧЕНИЕ МЕЖДУ ВРЕМЕНЕМ И ДЕНЬГАМИ ПО КЛИКУ */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
        <AppTooltip
          content={displayMode === "time" ? "Switch to earnings" : "Switch to time"}
          side="top"
        >
          <button
            type="button"
            aria-label={
              displayMode === "time"
                ? `Elapsed time ${formattedTime}. Switch to earnings`
                : `Current earnings ${moneyDisplay.amountText}. Switch to elapsed time`
            }
            onClick={() => setDisplayMode((m) => (m === "time" ? "money" : "time"))}
            className="group relative cursor-pointer flex items-center justify-center p-4 rounded-3xl transition-transform active:scale-95 bg-transparent border-none"
          >
            {timer.status === "running" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-visible">
              {CHARGE_PARTICLES.map((p, idx) => {
                const rad = (p.angle * Math.PI) / 180
                const tx = Math.cos(rad) * 165
                const ty = Math.sin(rad) * 165
                return (
                  <div
                    key={idx}
                    style={
                      {
                        "--tx-start": `${tx.toFixed(1)}px`,
                        "--ty-start": `${ty.toFixed(1)}px`,
                        "--p-duration": `${p.duration}s`,
                        animationDelay: `${p.delay}s`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                      } as React.CSSProperties
                    }
                    className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.95)] animate-particle-inward"
                  />
                )
              })}
            </div>
            )}

            <div className="relative flex items-center justify-center">
              <div
                className={`font-['Oxanium',sans-serif] font-bold tracking-normal tabular-nums leading-none ${timer.status === "running" ? "animate-digit-charge-glow" : ""} transition-colors ${
                  displayMode === "money" && !moneyDisplay.hasBilling
                    ? "text-[24px] sm:text-[28px] text-white"
                    : "text-[36px] sm:text-[48px] text-white group-hover:text-[#F2F2F2]"
                }`}
              >
                {displayMode === "time" ? formattedTime : moneyDisplay.amountText}
              </div>

              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap text-xs font-mono font-medium text-[#DCDCDC]">
                {timer.billingType === "milestone"
                  ? moneyDisplay.effectiveRateText && displayMode === "money"
                    ? `Milestone · ${moneyDisplay.effectiveRateText}`
                    : "Milestone"
                  : moneyDisplay.hint}
              </div>
            </div>
          </button>
        </AppTooltip>
      </div>
    </div>
  )
}
