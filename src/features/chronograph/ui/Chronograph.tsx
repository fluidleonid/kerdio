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

const GAP_DEGREES = 14 // Gap in degrees between consecutive intervals
const MIN_ARC_DEGREES = 1.0 // Below 1 degree (~2 min), minimally forms a circular bead

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

    const completed = timer.intervals || []
    const segments: Array<{
      id: string
      startAngle: number
      endAngle: number
      spanDeg: number
      isCircle: boolean
      center: { x: number; y: number }
    }> = []

    // Start angle corresponds to current time on 12-hour dial when session started
    const now = Date.now()
    const sessionStart = timer.startTime
      ? timer.startTime - (timer.accumulatedSeconds || 0) * 1000
      : now - (timer.elapsedSeconds || 0) * 1000

    let currentAngle = timestampToClockAngle(sessionStart)

    const pushSegment = (id: string, durationSec: number) => {
      // 12 hours = 360° => 1 hour (3600s) = 30° => 1 minute = 0.5°
      const rawSpan = (durationSec / 3600) * 30
      const spanDeg = Math.min(rawSpan, 350)
      const isCircle = spanDeg < MIN_ARC_DEGREES
      const startAngle = currentAngle
      const endAngle = currentAngle + spanDeg
      const center = getPointOnCircle(cx, cy, dialRadius, startAngle)

      segments.push({
        id,
        startAngle,
        endAngle,
        spanDeg,
        isCircle,
        center,
      })

      // Advance start angle for the next segment:
      // Cap radius is ~5.9 deg; GAP_DEGREES = 14 leaves a clean ~7px visible spacing between rounded caps
      currentAngle = (currentAngle + spanDeg + GAP_DEGREES) % 360
    }

    // 1. All completed session intervals
    completed.forEach((duration, index) => {
      pushSegment(`completed-${index}`, duration)
    })

    // 2. Active or new paused interval
    if (timer.status === "running") {
      const activeDuration = Math.max(0, timer.elapsedSeconds - (timer.accumulatedSeconds || 0))
      pushSegment("active", activeDuration)
    } else if (timer.status === "paused") {
      // On pause, we build a new arc right next to the previous one ("если делаем паузу то мы строим рядом новую дугу")
      // Minimally at 0 seconds it forms a circle ("но минимально она кружок образует")
      pushSegment("paused-next", 0)
    }

    return segments
  }, [timer.status, timer.startTime, timer.intervals, timer.elapsedSeconds, timer.accumulatedSeconds, cx, cy, dialRadius])

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
      return {
        hasBilling: true,
        amountText: `${currency}${timer.fixedBudget.toFixed(2)}`,
        hint: timer.billingType === "fixed" ? "Fixed budget" : "Milestone",
      }
    }

    return {
      hasBilling: false,
      amountText: "Set rate",
      hint: "Non-billable session",
    }
  }, [timer.billingType, timer.rate, timer.fixedBudget, timer.elapsedSeconds, activeProject?.currency, timer.currency])

  return (
    <div className={`relative flex items-center justify-center select-none ${className || ""}`}>
      <svg
        viewBox="0 0 440 440"
        width={size}
        height={size}
        className="overflow-visible relative z-10"
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
          <div
            onClick={() => setDisplayMode((m) => (m === "time" ? "money" : "time"))}
            className="group relative cursor-pointer flex flex-col items-center justify-center p-4 rounded-3xl transition-transform active:scale-95"
          >
            {/* АНИМАЦИЯ СОЛНЕЧНЫХ ЗАЙЧИКОВ (ТОЛЬКО В ДЕНЕЖНОМ РЕЖИМЕ) */}
            {displayMode === "money" && moneyDisplay.hasBilling && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-visible">
                {/* Солнечный зайчик 1 */}
                <div className="absolute w-32 h-10 rounded-full bg-gradient-to-r from-amber-400/0 via-amber-300/45 to-yellow-200/0 blur-md animate-sunbeam-1" />
                {/* Солнечный зайчик 2 */}
                <div className="absolute w-20 h-12 rounded-full bg-yellow-300/40 blur-lg animate-sunbeam-2" />
                {/* Солнечный зайчик 3 */}
                <div className="absolute w-8 h-8 rounded-full bg-amber-200/55 blur-sm animate-sunbeam-3" />
                {/* Солнечный зайчик 4 */}
                <div className="absolute w-12 h-6 rounded-full bg-orange-300/40 blur-sm animate-sunbeam-4" />
              </div>
            )}

            {/* РЕЖИМ 1: ТЕКУЩЕЕ ВРЕМЯ */}
            {displayMode === "time" ? (
              <div className="font-['Oxanium',sans-serif] font-bold text-[48px] text-white tracking-normal tabular-nums leading-none group-hover:text-amber-100 transition-colors">
                {formattedTime}
              </div>
            ) : (
              /* РЕЖИМ 2: ДЕНЬГИ */
              moneyDisplay.hasBilling ? (
                <div className="font-['Oxanium',sans-serif] font-bold text-[48px] text-white tracking-normal tabular-nums leading-none group-hover:text-amber-200 transition-colors">
                  {moneyDisplay.amountText}
                </div>
              ) : (
                /* ЕСЛИ БИЛЛИНГ НЕ ВВЕДЕН: СООБЩЕНИЕ О ВВОДЕ СТАВКИ */
                <div className="flex flex-col items-center">
                  <div className="font-['Oxanium',sans-serif] font-bold text-[28px] text-amber-300 leading-tight">
                    {moneyDisplay.amountText}
                  </div>
                  <div className="text-xs font-semibold text-[#806060] mt-1">
                    {moneyDisplay.hint}
                  </div>
                </div>
              )
            )}
          </div>
        </AppTooltip>
      </div>
    </div>
  )
}
