import { useState, useRef, useEffect, useMemo } from "react"
import {
  Play,
  X,
  AtSign,
  Slash,
  Clock,
  Briefcase,
  Flag,
  ShieldOff,
  Check,
} from "lucide-react"
import { useTrackerStore } from "@/entities/tracker"
import type { Project, BillingType } from "@/entities/project"
import type { TimeSession } from "@/entities/session"
import { AppTooltip, ProjectBadge, BillingBadge } from "@/shared/ui"
import { capitalizeMemo, formatAsMilestone, getProjectMilestones } from "@/shared/lib"

interface TokenCommandInputProps {
  onStart?: () => void
  autoFocus?: boolean
  className?: string
  isEditingActive?: boolean
  initialMemo?: string
  initialProjectId?: string | null
  initialBilling?: BillingConfig | null
  onSaveActive?: (params: {
    memo: string
    projectId: string
    rate?: number | null
    billingType?: BillingType | "none"
    fixedBudget?: number
  }) => void
  onClose?: () => void
}

export interface BillingConfig {
  type: BillingType | "none"
  amount: number
}

// Token segment for inline rich editing
export type TokenSegment =
  | { id: string; type: "text"; text: string }
  | { id: string; type: "project"; project: Project }
  | { id: string; type: "billing"; billing: BillingConfig }

/**
 * Ensures strict interleaved structure:
 * - Merges consecutive text segments
 * - Inserts an empty text segment between any two consecutive badges
 * - Ensures a leading text segment if starts with badge
 * - Ensures a trailing text segment if ends with badge
 */
export function cleanupSegments(rawList: TokenSegment[]): TokenSegment[] {
  // 1. Merge adjacent text segments
  const merged: TokenSegment[] = []
  for (const seg of rawList) {
    const last = merged[merged.length - 1]
    if (last && last.type === "text" && seg.type === "text") {
      last.text = `${last.text}${seg.text}`
    } else {
      merged.push({ ...seg })
    }
  }

  // 2. Interleave empty text segments between adjacent badges
  const interleaved: TokenSegment[] = []
  for (let i = 0; i < merged.length; i++) {
    const curr = merged[i]
    interleaved.push(curr)
    const next = merged[i + 1]
    if (curr.type !== "text" && next && next.type !== "text") {
      interleaved.push({
        id: `seg-mid-${curr.id}-${next.id}`,
        type: "text",
        text: "",
      })
    }
  }

  // 3. Ensure leading text segment if starts with badge
  if (interleaved.length > 0 && interleaved[0].type !== "text") {
    interleaved.unshift({
      id: `seg-lead-${interleaved[0].id}`,
      type: "text",
      text: "",
    })
  }

  // 4. Ensure trailing text segment if ends with badge
  if (interleaved.length > 0 && interleaved[interleaved.length - 1].type !== "text") {
    interleaved.push({
      id: `seg-tail-${interleaved[interleaved.length - 1].id}`,
      type: "text",
      text: "",
    })
  }

  // 5. If empty, ensure at least one text segment
  if (interleaved.length === 0) {
    interleaved.push({
      id: `seg-init-${Date.now()}`,
      type: "text",
      text: "",
    })
  }

  return interleaved
}

export function TokenCommandInput({
  onStart,
  autoFocus = true,
  className,
  isEditingActive = false,
  initialMemo = "",
  initialProjectId = null,
  initialBilling = null,
  onSaveActive,
  onClose,
}: TokenCommandInputProps) {
  const {
    projects,
    sessions,
    addProject,
    startTracking,
    applyProjectBillingScope,
  } = useTrackerStore()

  // Pending billing change scope confirmation modal
  const [pendingBillingChange, setPendingBillingChange] = useState<{
    project: Project
    newBilling: BillingConfig
    apply: () => void
  } | null>(null)

  // Inline token segments flow (text and badges interleaved)
  const [segments, setSegments] = useState<TokenSegment[]>(() => {
    if (isEditingActive) {
      const segs: TokenSegment[] = []
      if (initialMemo) {
        segs.push({ id: "seg-memo", type: "text", text: initialMemo })
      }
      if (initialProjectId) {
        const proj = projects.find((p) => p.id === initialProjectId)
        if (proj) {
          segs.push({ id: "seg-proj", type: "project", project: proj })
        }
      }
      if (initialBilling && initialBilling.type !== "none") {
        segs.push({ id: "seg-bill", type: "billing", billing: initialBilling })
      }
      return cleanupSegments(segs)
    }
    return [{ id: "seg-init", type: "text", text: "" }]
  })
  const [activeSegId, setActiveSegId] = useState<string>(() => {
    if (isEditingActive && initialMemo) {
      return "seg-memo"
    }
    return "seg-init"
  })

  // Dropdown states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [dropdownIndex, setDropdownIndex] = useState(0)
  const [mode, setMode] = useState<"projects" | "recents" | "slash">("recents")
  const [atQuery, setAtQuery] = useState<string | null>(null)
  const [slashQuery, setSlashQuery] = useState<string | null>(null)

  // Dynamic input refs for each text segment
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const handleStartSessionRef = useRef<() => void>(() => {})

  useEffect(() => {
    if (autoFocus && activeSegId) {
      const el = inputRefs.current[activeSegId]
      if (el) {
        el.focus()
        if (el.value) {
          el.setSelectionRange(el.value.length, el.value.length)
        }
      }
    }
  }, [autoFocus, activeSegId])

  // Get active text segment
  const activeSeg = useMemo(() => {
    return segments.find((s) => s.id === activeSegId && s.type === "text") as
      | { id: string; type: "text"; text: string }
      | undefined
  }, [segments, activeSegId])

  // Current selected project and billing from segments
  const currentProject = useMemo(() => {
    const projSeg = segments.find((s) => s.type === "project")
    return projSeg && projSeg.type === "project" ? projSeg.project : null
  }, [segments])

  // Assembled memo from all text segments (always capitalized on first word)
  const assembledMemo = useMemo(() => {
    const raw = segments
      .filter((s) => s.type === "text")
      .map((s) => (s as { text: string }).text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
    return capitalizeMemo(raw)
  }, [segments])

  // Cannot start session without at least a memo
  const canStart = assembledMemo.length > 0

  // Whether milestone billing is currently active (via badge or selected project)
  const isMilestoneActive = useMemo(() => {
    const billSeg = segments.find((s) => s.type === "billing")
    if (billSeg && billSeg.type === "billing") {
      return billSeg.billing.type === "milestone"
    }
    const projSeg = segments.find((s) => s.type === "project")
    if (projSeg && projSeg.type === "project") {
      return projSeg.project.billingType === "milestone"
    }
    return currentProject?.billingType === "milestone"
  }, [segments, currentProject])

  const activeProjId =
    currentProject?.id ||
    (segments.find((s) => s.type === "project") as { project?: { id: string } } | undefined)?.project?.id

  // Project milestones analysis
  const milestoneStats = useMemo(() => {
    if (!activeProjId) {
      return { milestones: [], latestMilestone: null, maxNumber: 0, nextNumber: 1, totalCount: 0 }
    }
    return getProjectMilestones(sessions, activeProjId)
  }, [sessions, activeProjId])

  const activePlaceholder = isMilestoneActive
    ? `Milestone ${milestoneStats.nextNumber}: What are you delivering?`
    : "What are you working on?"

  const handleContinueMilestone = (memoText: string) => {
    setSegments((prev) => {
      const textSeg = prev.find((s) => s.type === "text")
      if (textSeg) {
        return prev.map((s) => (s.id === textSeg.id ? { ...s, text: memoText } : s))
      }
      return [{ id: `seg-${Date.now()}`, type: "text", text: memoText }, ...prev]
    })
  }

  // Filtered projects for autocomplete
  const filteredProjects = useMemo(() => {
    if (atQuery === null) return projects
    const q = atQuery.trim().toLowerCase()
    if (!q) return projects
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    )
  }, [projects, atQuery])

  // Dynamic slash options parsed from user input without hardcoded presets
  const parsedSlashOptions = useMemo(() => {
    const raw = (slashQuery || "").trim().toLowerCase()
    const parts = raw.split(/\s+/)
    const cmdToken = parts[0] || ""
    const numToken = parts[1] ? parseFloat(parts[1]) : (parseFloat(cmdToken) || null)

    const isRate = "rate".startsWith(cmdToken) || cmdToken === "r"
    const isFixed = "fixed".startsWith(cmdToken) || cmdToken === "f"
    const isMilestone = "milestone".startsWith(cmdToken) || cmdToken === "m"
    const isNobill = "nobill".startsWith(cmdToken) || cmdToken === "free"

    const options = []

    if (!raw || isRate) {
      options.push({
        id: "rate",
        command: "/rate",
        type: "hourly" as const,
        amount: numToken,
        title: numToken ? `Hourly Rate: $${numToken}/h` : "/rate <amount>",
        description: numToken
          ? "Press Enter ↵ to apply hourly billing"
          : "Bill per hour with real-time dollar accrual",
        icon: Clock,
      })
    }

    if (!raw || isFixed) {
      options.push({
        id: "fixed",
        command: "/fixed",
        type: "fixed" as const,
        amount: numToken,
        title: numToken ? `Fixed Fee: $${numToken}` : "/fixed <amount>",
        description: numToken
          ? "Press Enter ↵ to apply fixed task fee"
          : "Flat rate for entire task/project, tracks hourly yield",
        icon: Briefcase,
      })
    }

    if (!raw || isMilestone) {
      options.push({
        id: "milestone",
        command: "/milestone",
        type: "milestone" as const,
        amount: numToken,
        title: numToken ? `Milestone: $${numToken}` : "/milestone <amount>",
        description: numToken
          ? "Press Enter ↵ to apply milestone payment"
          : "Fixed payout for this specific delivery",
        icon: Flag,
      })
    }

    if (!raw || isNobill) {
      options.push({
        id: "nobill",
        command: "/nobill",
        type: "none" as const,
        amount: 0,
        title: "Non-billable (Free)",
        description: "Track focus time only without client billing or money",
        icon: ShieldOff,
      })
    }

    return options
  }, [slashQuery])

  // Last 5 unique recent entries (always capitalized)
  const recentEntries = useMemo(() => {
    const seen = new Set<string>()
    const recents: TimeSession[] = []
    for (const s of sessions) {
      const capMemo = capitalizeMemo(s.memo)
      const key = `${s.projectId}:${capMemo.toLowerCase()}`
      if (!seen.has(key) && capMemo) {
        seen.add(key)
        recents.push({ ...s, memo: capMemo })
      }
      if (recents.length >= 5) break
    }
    return recents
  }, [sessions])

  // Close dropdown on outside click or commit active edit
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
        if (isEditingActive && onClose) {
          if (canStart && onSaveActive) {
            handleStartSessionRef.current()
          } else {
            onClose()
          }
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isEditingActive, onClose, canStart, onSaveActive])

  // Handle typing inside any text segment
  const handleTextChange = (segId: string, val: string) => {
    // If typing the very first letter of the overall memo, auto-capitalize it
    let nextVal = val
    const segIdx = segments.findIndex((s) => s.id === segId)
    const priorText = segments
      .slice(0, segIdx)
      .filter((s) => s.type === "text")
      .map((s) => (s as { text: string }).text)
      .join("")
      .trim()

    if (!priorText && val.length === 1 && !val.startsWith("@") && !val.startsWith("/")) {
      nextVal = val.toUpperCase()
    }

    // 1. Calculate next segments with the updated text
    const nextSegments = segments.map((s) =>
      s.id === segId && s.type === "text" ? { ...s, text: nextVal } : s
    )

    // 2. Check if everything is completely empty (no badges and all text empty)
    const hasBadges = nextSegments.some((s) => s.type === "project" || s.type === "billing")
    const totalText = nextSegments
      .map((s) => (s.type === "text" ? s.text : ""))
      .join("")
      .trim()

    if (!hasBadges && !totalText) {
      // RESET TO DEFAULT CLEAN STATE WITH PLACEHOLDER & RECENTS DROPDOWN
      const freshId = `seg-init-${Date.now()}`
      setSegments([{ id: freshId, type: "text", text: "" }])
      setActiveSegId(freshId)
      setAtQuery(null)
      setSlashQuery(null)
      if (recentEntries.length > 0) {
        setMode("recents")
        setIsDropdownOpen(true)
        setDropdownIndex(0)
      } else {
        setIsDropdownOpen(false)
      }
      return
    }

    setSegments(nextSegments)

    // Check for @ trigger in the current segment
    const atMatch = val.match(/@([a-zA-Z0-9_\-\s]*)$/)
    // Check for / trigger in the current segment
    const slashMatch = val.match(/\/([a-zA-Z0-9_\-\s]*)$/)

    if (atMatch) {
      setAtQuery(atMatch[1])
      setSlashQuery(null)
      setMode("projects")
      setIsDropdownOpen(true)
      setDropdownIndex(0)
    } else if (slashMatch) {
      setSlashQuery(slashMatch[1])
      setAtQuery(null)
      setMode("slash")
      setIsDropdownOpen(true)
      setDropdownIndex(0)
    } else {
      setAtQuery(null)
      setSlashQuery(null)
      setIsDropdownOpen(false)
    }
  }

  // Select project: inserts project badge inline, and IF project has billing, inserts billing badge right next to it!
  const selectProject = (proj: Project) => {
    setSegments((prev) => {
      let targetIndex = prev.findIndex((s) => s.id === activeSegId)
      if (targetIndex === -1) {
        targetIndex = [...prev].reverse().findIndex((s) => s.type === "text")
        if (targetIndex !== -1) {
          targetIndex = prev.length - 1 - targetIndex
        } else {
          targetIndex = Math.max(0, prev.length - 1)
        }
      }

      const currSeg = prev[targetIndex]
      const currText = currSeg && currSeg.type === "text" ? currSeg.text : ""
      const atIdx = currText.lastIndexOf("@")
      const textBefore = atIdx !== -1 ? currText.slice(0, atIdx).trimEnd() : currText

      // Remove any existing project badge and billing badge so project's own setting takes effect immediately
      const cleaned = prev.filter((s) => s.type !== "project" && s.type !== "billing")
      let newTargetIndex = cleaned.findIndex((s) => s.id === currSeg?.id)
      if (newTargetIndex === -1) {
        newTargetIndex = cleaned.length
      }

      const newSegs: TokenSegment[] = []

      // 1. Existing segments before target
      for (let i = 0; i < newTargetIndex; i++) {
        newSegs.push(cleaned[i])
      }

      // 2. Preserved text before '@'
      if (textBefore) {
        newSegs.push({ id: currSeg.id, type: "text", text: textBefore })
      }

      // 3. Project badge inline
      const projId = `proj-${Date.now()}`
      newSegs.push({ id: projId, type: "project", project: proj })

      // 4. "с проектом если у него установлен билинг он должен встать сразу"
      let projBill: BillingConfig | null = null
      if (proj.billingType === "hourly" && proj.hourlyRate && proj.hourlyRate > 0) {
        projBill = { type: "hourly", amount: proj.hourlyRate }
      } else if (
        (proj.billingType === "fixed" || proj.billingType === "milestone") &&
        proj.fixedBudget &&
        proj.fixedBudget > 0
      ) {
        projBill = { type: proj.billingType, amount: proj.fixedBudget }
      } else if (proj.hourlyRate && proj.hourlyRate > 0) {
        projBill = { type: "hourly", amount: proj.hourlyRate }
      } else if (proj.fixedBudget && proj.fixedBudget > 0) {
        projBill = { type: "fixed", amount: proj.fixedBudget }
      }

      if (projBill) {
        newSegs.push({
          id: `bill-${Date.now()}`,
          type: "billing",
          billing: projBill,
        })
      }

      // 5. Follow-up text segment for further typing
      const nextTextId = `seg-${Date.now() + 1}`
      newSegs.push({ id: nextTextId, type: "text", text: "" })

      // 6. Remaining segments after target
      for (let i = newTargetIndex + 1; i < cleaned.length; i++) {
        newSegs.push(cleaned[i])
      }

      const finalized = cleanupSegments(newSegs)
      const lastText = [...finalized].reverse().find((s) => s.type === "text")
      const focusId = lastText ? lastText.id : nextTextId

      setActiveSegId(focusId)
      setTimeout(() => inputRefs.current[focusId]?.focus(), 50)
      return finalized
    })

    setIsDropdownOpen(false)
    setAtQuery(null)
  }

  // Apply slash command: user enters command and value, confirms on enter
  const applySlashCommand = (
    type: BillingType | "none",
    amount: number | null
  ) => {
    const finalAmount = amount !== null ? amount : (currentProject?.hourlyRate || 85)
    const newBilling: BillingConfig = { type, amount: finalAmount }

    const apply = () => {
      setSegments((prev) => {
        const targetIndex = prev.findIndex((s) => s.id === activeSegId)
        if (targetIndex === -1) return prev

        const currSeg = prev[targetIndex]
        const currText = currSeg.type === "text" ? currSeg.text : ""
        const slashIdx = currText.lastIndexOf("/")
        const textBefore = slashIdx !== -1 ? currText.slice(0, slashIdx).trimEnd() : currText

        // Remove any previously added billing token to avoid duplicates
        const cleaned = prev.filter((s) => s.type !== "billing")
        const newTargetIndex = cleaned.findIndex((s) => s.id === activeSegId)

        const newSegs: TokenSegment[] = []
        for (let i = 0; i < newTargetIndex; i++) {
          newSegs.push(cleaned[i])
        }

        if (textBefore) {
          newSegs.push({ id: currSeg.id, type: "text", text: textBefore })
        }

        // Insert billing badge inline
        newSegs.push({
          id: `bill-${Date.now()}`,
          type: "billing",
          billing: newBilling,
        })

        const nextTextId = `seg-${Date.now() + 2}`
        newSegs.push({ id: nextTextId, type: "text", text: "" })

        for (let i = newTargetIndex + 1; i < cleaned.length; i++) {
          newSegs.push(cleaned[i])
        }

        const finalized = cleanupSegments(newSegs)
        const lastText = [...finalized].reverse().find((s) => s.type === "text")
        const focusId = lastText ? lastText.id : nextTextId

        setActiveSegId(focusId)
        setTimeout(() => inputRefs.current[focusId]?.focus(), 50)
        return finalized
      })
    }

    // If current project exists and billing differs, confirm scope with user!
    if (currentProject) {
      const isSame =
        type === currentProject.billingType &&
        ((type === "hourly" && currentProject.hourlyRate === finalAmount) ||
          (type !== "hourly" && currentProject.fixedBudget === finalAmount))

      if (!isSame) {
        setPendingBillingChange({
          project: currentProject,
          newBilling,
          apply,
        })
        setIsDropdownOpen(false)
        setSlashQuery(null)
        return
      }
    }

    apply()
    setIsDropdownOpen(false)
    setSlashQuery(null)
  }

  // Pick recent entry: text assembled, project and billing badges placed immediately
  const selectRecentEntry = (entry: TimeSession) => {
    const proj = projects.find((p) => p.id === entry.projectId)
    const newSegs: TokenSegment[] = [
      { id: "seg-rec-1", type: "text", text: capitalizeMemo(entry.memo) },
    ]

    if (proj) {
      newSegs.push({ id: `proj-${Date.now()}`, type: "project", project: proj })
    }

    // Determine billing: from entry snapshot first, or fallback to project billing
    let billConfig: BillingConfig | null = null

    if (entry.billingType === "hourly" && entry.rateSnapshot && entry.rateSnapshot > 0) {
      billConfig = { type: "hourly", amount: entry.rateSnapshot }
    } else if (
      (entry.billingType === "fixed" || entry.billingType === "milestone") &&
      entry.earnedAmount &&
      entry.earnedAmount > 0
    ) {
      billConfig = { type: entry.billingType, amount: entry.earnedAmount }
    } else if (entry.rateSnapshot && entry.rateSnapshot > 0) {
      billConfig = { type: "hourly", amount: entry.rateSnapshot }
    } else if (proj) {
      if (proj.billingType === "hourly" && proj.hourlyRate && proj.hourlyRate > 0) {
        billConfig = { type: "hourly", amount: proj.hourlyRate }
      } else if (
        (proj.billingType === "fixed" || proj.billingType === "milestone") &&
        proj.fixedBudget &&
        proj.fixedBudget > 0
      ) {
        billConfig = { type: proj.billingType, amount: proj.fixedBudget }
      } else if (proj.hourlyRate && proj.hourlyRate > 0) {
        billConfig = { type: "hourly", amount: proj.hourlyRate }
      } else if (proj.fixedBudget && proj.fixedBudget > 0) {
        billConfig = { type: "fixed", amount: proj.fixedBudget }
      }
    }

    if (billConfig) {
      newSegs.push({
        id: `bill-${Date.now()}`,
        type: "billing",
        billing: billConfig,
      })
    }

    const nextTextId = `seg-rec-tail`
    newSegs.push({ id: nextTextId, type: "text", text: "" })

    const finalized = cleanupSegments(newSegs)
    const lastText = [...finalized].reverse().find((s) => s.type === "text")
    const focusId = lastText ? lastText.id : nextTextId

    setSegments(finalized)
    setActiveSegId(focusId)
    setIsDropdownOpen(false)
    setTimeout(() => inputRefs.current[focusId]?.focus(), 50)
  }

  // Create new project on the fly if query typed
  const createNewProject = (name: string) => {
    const cleanName = name.trim()
    if (!cleanName) return

    const newProj = addProject({
      name: cleanName,
      slug: cleanName.toLowerCase().replace(/[^a-z0-9_-]/g, "-"),
      color: "#F97316",
      billingType: "hourly",
      hourlyRate: 85,
      currency: "$",
    })

    selectProject(newProj)
  }

  // Keyboard navigation & Enter confirmation
  const handleKeyDown = (
    segId: string,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (isDropdownOpen) {
      if (mode === "projects") {
        const total = filteredProjects.length + (atQuery && atQuery.trim() ? 1 : 0)

        if (e.key === "ArrowDown") {
          e.preventDefault()
          setDropdownIndex((prev) => (prev + 1) % (total || 1))
          return
        }

        if (e.key === "ArrowUp") {
          e.preventDefault()
          setDropdownIndex((prev) => (prev - 1 + total) % (total || 1))
          return
        }

        if (e.key === "Enter") {
          e.preventDefault()
          if (dropdownIndex < filteredProjects.length) {
            selectProject(filteredProjects[dropdownIndex])
          } else if (atQuery && atQuery.trim()) {
            createNewProject(atQuery.trim())
          }
          return
        }
      } else if (mode === "slash") {
        const total = parsedSlashOptions.length

        if (e.key === "ArrowDown") {
          e.preventDefault()
          setDropdownIndex((prev) => (prev + 1) % (total || 1))
          return
        }

        if (e.key === "ArrowUp") {
          e.preventDefault()
          setDropdownIndex((prev) => (prev - 1 + total) % (total || 1))
          return
        }

        if (e.key === "Enter") {
          e.preventDefault()
          const chosen = parsedSlashOptions[dropdownIndex] || parsedSlashOptions[0]
          if (chosen) {
            applySlashCommand(chosen.type, chosen.amount)
          }
          return
        }
      } else if (mode === "recents") {
        const total = recentEntries.length

        if (e.key === "ArrowDown") {
          e.preventDefault()
          setDropdownIndex((prev) => (prev + 1) % (total || 1))
          return
        }

        if (e.key === "ArrowUp") {
          e.preventDefault()
          setDropdownIndex((prev) => (prev - 1 + total) % (total || 1))
          return
        }

        if (e.key === "Enter") {
          e.preventDefault()
          if (recentEntries[dropdownIndex]) {
            selectRecentEntry(recentEntries[dropdownIndex])
          }
          return
        }
      }

      if (e.key === "Escape") {
        if (isDropdownOpen) {
          setIsDropdownOpen(false)
        } else if (isEditingActive && onClose) {
          onClose()
        }
        return
      }
    }

    if (e.key === "Escape" && !isDropdownOpen && isEditingActive && onClose) {
      onClose()
      return
    }

    // Keyboard Arrow navigation between segments and across badges
    if (!isDropdownOpen) {
      if (e.key === "ArrowLeft") {
        const inputEl = inputRefs.current[segId]
        if (inputEl && inputEl.selectionStart === 0 && inputEl.selectionEnd === 0) {
          const idx = segments.findIndex((s) => s.id === segId)
          if (idx > 0) {
            for (let i = idx - 1; i >= 0; i--) {
              if (segments[i].type === "text") {
                e.preventDefault()
                const targetSeg = segments[i] as { id: string }
                setActiveSegId(targetSeg.id)
                const targetEl = inputRefs.current[targetSeg.id]
                if (targetEl) {
                  targetEl.focus()
                  const len = targetEl.value.length
                  targetEl.setSelectionRange(len, len)
                }
                break
              }
            }
          }
        }
      } else if (e.key === "ArrowRight") {
        const inputEl = inputRefs.current[segId]
        if (
          inputEl &&
          inputEl.selectionStart === inputEl.value.length &&
          inputEl.selectionEnd === inputEl.value.length
        ) {
          const idx = segments.findIndex((s) => s.id === segId)
          if (idx !== -1 && idx < segments.length - 1) {
            for (let i = idx + 1; i < segments.length; i++) {
              if (segments[i].type === "text") {
                e.preventDefault()
                const targetSeg = segments[i] as { id: string }
                setActiveSegId(targetSeg.id)
                const targetEl = inputRefs.current[targetSeg.id]
                if (targetEl) {
                  targetEl.focus()
                  targetEl.setSelectionRange(0, 0)
                }
                break
              }
            }
          }
        }
      }
    }

    // Backspace on empty text segment removes previous badge!
    if (e.key === "Backspace") {
      const currSeg = segments.find((s) => s.id === segId)
      if (currSeg && currSeg.type === "text" && currSeg.text === "") {
        const idx = segments.findIndex((s) => s.id === segId)
        if (idx > 0) {
          e.preventDefault()
          setSegments((prev) => {
            const pIdx = prev.findIndex((s) => s.id === segId)
            if (pIdx <= 0) return prev

            // Identify text segment to focus after deletion
            let focusTargetId: string | null = null
            if (pIdx >= 2 && prev[pIdx - 2].type === "text") {
              focusTargetId = prev[pIdx - 2].id
            } else {
              focusTargetId = segId
            }

            const rawList = prev.filter((_, i) => i !== pIdx - 1)
            const cleaned = cleanupSegments(rawList)

            // Check if now completely empty (no badges and no text)
            const hasBadges = cleaned.some((s) => s.type === "project" || s.type === "billing")
            const totalText = cleaned
              .map((s) => (s.type === "text" ? s.text : ""))
              .join("")
              .trim()

            if (!hasBadges && !totalText) {
              const freshId = `seg-init-${Date.now()}`
              setActiveSegId(freshId)
              setAtQuery(null)
              setSlashQuery(null)
              if (recentEntries.length > 0) {
                setMode("recents")
                setIsDropdownOpen(true)
                setDropdownIndex(0)
              }
              setTimeout(() => inputRefs.current[freshId]?.focus(), 20)
              return [{ id: freshId, type: "text", text: "" }]
            }

            const targetSeg = cleaned.find((s) => s.id === focusTargetId && s.type === "text")
            const fallbackSeg = [...cleaned].reverse().find((s) => s.type === "text")
            const nextActive = targetSeg || fallbackSeg

            if (nextActive) {
              setActiveSegId(nextActive.id)
              setTimeout(() => {
                const el = inputRefs.current[nextActive.id]
                if (el) {
                  el.focus()
                  const len = el.value.length
                  el.setSelectionRange(len, len)
                }
              }, 20)
            }

            return cleaned
          })
          return
        }
      }
    }

    // Enter when dropdown is closed launches tracking!
    if (e.key === "Enter" && !isDropdownOpen) {
      e.preventDefault()
      if (canStart) {
        handleStartSession()
      }
    }
  }

  // Session start: assembling all text segments into clean memo!
  const handleStartSession = () => {
    if (!canStart) return

    // 2. Project from project badge
    const projSeg = segments.find((s) => s.type === "project")
    const proj = projSeg && projSeg.type === "project" ? projSeg.project : null
    const projId = proj?.id || projects[0]?.id || "proj-kerd"

    // 3. Billing from billing badge
    const billSeg = segments.find((s) => s.type === "billing")
    const bill = billSeg && billSeg.type === "billing" ? billSeg.billing : null

    let rate: number | null = null
    let billingType: BillingType | "none" = proj?.billingType || "hourly"
    let fixedBudget: number | undefined = proj?.fixedBudget

    if (bill) {
      if (bill.type === "hourly") {
        rate = bill.amount
        billingType = "hourly"
      } else if (bill.type === "fixed" || bill.type === "milestone") {
        rate = null
        billingType = bill.type
        fixedBudget = bill.amount
      } else if (bill.type === "none") {
        rate = null
        billingType = "none"
        fixedBudget = 0
      }
    }

    let finalMemo = capitalizeMemo(assembledMemo || (proj ? proj.name : "Focused session"))

    if (isMilestoneActive) {
      finalMemo = formatAsMilestone(assembledMemo, milestoneStats.nextNumber)
    }

    if (isEditingActive && onSaveActive) {
      onSaveActive({
        memo: finalMemo,
        projectId: projId,
        rate,
        billingType,
        fixedBudget,
      })
      onClose?.()
      return
    }

    startTracking({
      projectId: projId,
      memo: finalMemo,
      rate,
      billingType,
      fixedBudget,
    })

    // Reset input to clean state
    const freshId = `seg-${Date.now()}`
    setSegments([{ id: freshId, type: "text", text: "" }])
    setActiveSegId(freshId)
    setIsDropdownOpen(false)
    onStart?.()
  }

  handleStartSessionRef.current = handleStartSession

  // Helper to normalize segments when empty
  const normalizeEmptyState = (list: TokenSegment[]): TokenSegment[] => {
    const hasBadges = list.some((s) => s.type === "project" || s.type === "billing")
    const totalText = list
      .map((s) => (s.type === "text" ? s.text : ""))
      .join("")
      .trim()

    if (!hasBadges && !totalText) {
      const freshId = `seg-init-${Date.now()}`
      setActiveSegId(freshId)
      setAtQuery(null)
      setSlashQuery(null)
      if (recentEntries.length > 0) {
        setMode("recents")
        setIsDropdownOpen(true)
        setDropdownIndex(0)
      }
      setTimeout(() => inputRefs.current[freshId]?.focus(), 20)
      return [{ id: freshId, type: "text" as const, text: "" }]
    }
    return list
  }

  // Remove project token
  const removeProjectToken = (tokenId: string) => {
    setSegments((prev) => normalizeEmptyState(cleanupSegments(prev.filter((s) => s.id !== tokenId))))
    if (activeSeg) {
      inputRefs.current[activeSeg.id]?.focus()
    }
  }

  // Remove billing token
  const removeBillingToken = (tokenId: string) => {
    setSegments((prev) => normalizeEmptyState(cleanupSegments(prev.filter((s) => s.id !== tokenId))))
    if (activeSeg) {
      inputRefs.current[activeSeg.id]?.focus()
    }
  }

  // Handle resolving the billing scope confirmation choice
  const handleResolveBillingChange = (scope: "current" | "future" | "all") => {
    if (!pendingBillingChange) return
    const { project, newBilling, apply } = pendingBillingChange

    // 1. Apply local token change
    apply()

    // 2. If future or all, update project & sessions in store
    if (scope === "future" || scope === "all") {
      applyProjectBillingScope({
        projectId: project.id,
        billingType: newBilling.type,
        hourlyRate: newBilling.type === "hourly" ? newBilling.amount : undefined,
        fixedBudget:
          newBilling.type === "fixed" || newBilling.type === "milestone"
            ? newBilling.amount
            : undefined,
        scope,
      })
    }

    setPendingBillingChange(null)
    if (activeSeg) {
      setTimeout(() => inputRefs.current[activeSeg.id]?.focus(), 50)
    }
  }

  const openProjectPicker = () => {
    let target = activeSeg
    if (!target) {
      const lastText = [...segments].reverse().find((s) => s.type === "text") as
        | { id: string; type: "text"; text: string }
        | undefined
      if (lastText) {
        target = lastText
        setActiveSegId(lastText.id)
      }
    }
    setMode("projects")
    setAtQuery("")
    setSlashQuery(null)
    setIsDropdownOpen(true)
    setDropdownIndex(0)
    if (target) {
      if (!target.text.includes("@")) {
        handleTextChange(target.id, target.text ? `${target.text} @` : "@")
      }
      setTimeout(() => inputRefs.current[target.id]?.focus(), 10)
    }
  }

  const openSlashMenu = () => {
    let target = activeSeg
    if (!target) {
      const lastText = [...segments].reverse().find((s) => s.type === "text") as
        | { id: string; type: "text"; text: string }
        | undefined
      if (lastText) {
        target = lastText
        setActiveSegId(lastText.id)
      }
    }
    setMode("slash")
    setSlashQuery("")
    setAtQuery(null)
    setIsDropdownOpen(true)
    setDropdownIndex(0)
    if (target) {
      if (!target.text.includes("/")) {
        handleTextChange(target.id, target.text ? `${target.text} /` : "/")
      }
      setTimeout(() => inputRefs.current[target.id]?.focus(), 10)
    }
  }

  return (
    <div ref={containerRef} className={`relative w-full max-w-xl mx-auto ${className || ""}`}>
      {/* MILESTONE SUGGESTION CHIP "Continue" */}
      {isMilestoneActive && milestoneStats.latestMilestone && (
        <div className="flex items-center gap-2 mb-2 px-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-[#806060]">
            Active milestone:
          </span>
          <button
            type="button"
            onClick={() => handleContinueMilestone(milestoneStats.latestMilestone!)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-600/20 hover:bg-orange-600/35 text-orange-300 text-xs font-semibold backdrop-blur-xl border border-orange-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
          >
            <Play className="h-2.5 w-2.5 fill-current" />
            <span>Continue: {milestoneStats.latestMilestone}</span>
          </button>
        </div>
      )}

      {/* TWO-ROW BORDERLESS INPUT CONTAINER WITH SOFT DIFFUSED SHADOW */}
      <div className="relative flex flex-col justify-between rounded-3xl bg-black/50 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.32)] backdrop-blur-3xl transition-all border-none outline-none focus-within:bg-black/60 focus-within:shadow-[0_24px_60px_rgba(0,0,0,0.38)]">
        {/* ROW 1: INLINE RICH TOKENS FLOW (моя мемка *бейдж* по работе *бейдж*) */}
        <div
          onClick={(e) => {
            if (e.target !== e.currentTarget) return
            const lastTextSeg = [...segments].reverse().find((s) => s.type === "text")
            if (lastTextSeg) {
              setActiveSegId(lastTextSeg.id)
              inputRefs.current[lastTextSeg.id]?.focus()
            } else if (activeSeg) {
              inputRefs.current[activeSeg.id]?.focus()
            }
          }}
          className="flex flex-wrap items-center gap-[8px] min-h-[38px] cursor-text"
        >
          {segments.map((seg, idx) => {
            // 1. PROJECT BADGE (UNIFIED)
            if (seg.type === "project") {
              return (
                <span
                  key={seg.id}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex shrink-0 select-none"
                >
                  <ProjectBadge
                    project={seg.project}
                    onRemove={() => removeProjectToken(seg.id)}
                  />
                </span>
              )
            }

            // 2. BILLING BADGE (UNIFIED)
            if (seg.type === "billing") {
              return (
                <span
                  key={seg.id}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex shrink-0 select-none"
                >
                  <BillingBadge
                    billingType={seg.billing.type}
                    amount={seg.billing.amount}
                    onRemove={() => removeBillingToken(seg.id)}
                  />
                </span>
              )
            }

            // 3. TEXT INPUT SEGMENT (Auto-sizing: input is absolute over hidden span to eliminate 20ch default HTML width)
            if (seg.type === "text") {
              const isAllTextEmpty = segments
                .filter((s) => s.type === "text")
                .every((s) => !(s as { text: string }).text)

              const prevSeg = idx > 0 ? segments[idx - 1] : undefined
              const nextSeg = idx < segments.length - 1 ? segments[idx + 1] : undefined
              const isBetweenBadges = Boolean(
                prevSeg && prevSeg.type !== "text" && nextSeg && nextSeg.type !== "text"
              )
              const isLeadingEmpty =
                idx === 0 &&
                !seg.text &&
                Boolean(nextSeg && nextSeg.type !== "text")

              const isTrailingText = idx === segments.length - 1

              // 3A. EMPTY TEXT SEGMENT BETWEEN TWO BADGES
              if (isBetweenBadges && !seg.text) {
                return (
                  <span
                    key={seg.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveSegId(seg.id)
                      inputRefs.current[seg.id]?.focus()
                    }}
                    className="relative inline-flex items-center justify-center shrink-0 -mx-[4px] w-[8px] h-[28px] z-20"
                  >
                    <input
                      ref={(el) => {
                        inputRefs.current[seg.id] = el
                      }}
                      type="text"
                      value={seg.text}
                      onChange={(e) => handleTextChange(seg.id, e.target.value)}
                      onFocus={() => {
                        setActiveSegId(seg.id)
                      }}
                      onKeyDown={(e) => handleKeyDown(seg.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ caretColor: "#ffffff" }}
                      className="w-full h-full text-center bg-transparent text-lg text-white caret-white focus:outline-none border-none ring-0 shadow-none font-sans p-0 m-0 leading-normal z-20 cursor-text"
                    />
                  </span>
                )
              }

              // 3B. EMPTY LEADING TEXT SEGMENT BEFORE FIRST BADGE
              if (isLeadingEmpty) {
                return (
                  <span
                    key={seg.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveSegId(seg.id)
                      inputRefs.current[seg.id]?.focus()
                    }}
                    className="relative inline-flex items-center justify-center shrink-0 -mr-[4px] w-[8px] h-[28px] z-20"
                  >
                    <input
                      ref={(el) => {
                        inputRefs.current[seg.id] = el
                      }}
                      type="text"
                      value={seg.text}
                      onChange={(e) => handleTextChange(seg.id, e.target.value)}
                      onFocus={() => {
                        setActiveSegId(seg.id)
                      }}
                      onKeyDown={(e) => handleKeyDown(seg.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ caretColor: "#ffffff" }}
                      className="w-full h-full text-center bg-transparent text-lg text-white caret-white focus:outline-none border-none ring-0 shadow-none font-sans p-0 m-0 leading-normal z-20 cursor-text"
                    />
                  </span>
                )
              }

              // 3C. MAIN / TRAILING / TYPING TEXT SEGMENT
              // Show placeholder if this is the trailing text segment and all text is currently empty
              const showPlaceholder = isTrailingText && isAllTextEmpty

              return (
                <span
                  key={seg.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveSegId(seg.id)
                    inputRefs.current[seg.id]?.focus()
                  }}
                  className={`relative inline-flex items-center shrink-0 ${
                    isTrailingText ? "flex-1 min-w-[120px]" : ""
                  }`}
                  style={{
                    minWidth: isTrailingText
                      ? undefined
                      : (seg.text ? undefined : "12px"),
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="invisible whitespace-pre text-lg font-sans select-none pointer-events-none p-0 m-0 leading-normal"
                    style={{
                      minWidth: showPlaceholder ? undefined : (seg.text ? undefined : "12px"),
                    }}
                  >
                    {seg.text || (showPlaceholder ? activePlaceholder : "")}
                  </span>
                  <input
                    ref={(el) => {
                      inputRefs.current[seg.id] = el
                    }}
                    type="text"
                    value={seg.text}
                    onChange={(e) => handleTextChange(seg.id, e.target.value)}
                    onFocus={(e) => {
                      setActiveSegId(seg.id)
                      const val = e.target.value
                      if (val.includes("@")) {
                        const atMatch = val.match(/@([a-zA-Z0-9_\-\s]*)$/)
                        setAtQuery(atMatch ? atMatch[1] : "")
                        setSlashQuery(null)
                        setMode("projects")
                        setIsDropdownOpen(true)
                        setDropdownIndex(0)
                        return
                      }
                      if (val.includes("/")) {
                        const slashMatch = val.match(/\/([a-zA-Z0-9_\-\s]*)$/)
                        setSlashQuery(slashMatch ? slashMatch[1] : "")
                        setAtQuery(null)
                        setMode("slash")
                        setIsDropdownOpen(true)
                        setDropdownIndex(0)
                        return
                      }

                      const totalLen = segments
                        .map((s) => (s.type === "text" ? s.text : ""))
                        .join("")
                        .trim()
                      const currentHasBadges = segments.some(
                        (s) => s.type === "project" || s.type === "billing"
                      )
                      if (!totalLen && !currentHasBadges && !val && recentEntries.length > 0) {
                        setMode("recents")
                        setIsDropdownOpen(true)
                        setDropdownIndex(0)
                      }
                    }}
                    onKeyDown={(e) => handleKeyDown(seg.id, e)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={showPlaceholder ? activePlaceholder : ""}
                    style={{
                      caretColor: "#ffffff",
                    } as React.CSSProperties}
                    className="absolute inset-0 w-full h-full bg-transparent text-lg text-white caret-white placeholder:text-[#6E5353] focus:outline-none border-none ring-0 shadow-none font-sans p-0 m-0 leading-normal z-10 cursor-text"
                  />
                </span>
              )
            }

            return null
          })}
        </div>

        {/* ROW 2: CONTROLS (Right: @ project, / billing, primary Run button) */}
        <div className="mt-2 flex items-center justify-end gap-1.5 border-none">
          {/* Ghost @ button (icon-only, no label) with custom AppTooltip */}
          <AppTooltip content="Select project" shortcut="@" side="top">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
              }}
              onClick={openProjectPicker}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#806060] hover:text-white hover:bg-white/10 transition-colors active:scale-95 border-none bg-transparent"
            >
              <AtSign className="h-5 w-5" />
            </button>
          </AppTooltip>

          {/* Ghost / button for billing with custom AppTooltip */}
          <AppTooltip content="Billing command" shortcut="/" side="top">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
              }}
              onClick={openSlashMenu}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#806060] hover:text-white hover:bg-white/10 transition-colors active:scale-95 border-none bg-transparent"
            >
              <Slash className="h-5 w-5" />
            </button>
          </AppTooltip>

          {/* Primary slightly oval run/save button */}
          <AppTooltip
            content={
              isEditingActive
                ? "Save changes"
                : canStart
                ? "Start session"
                : "Enter a memo to start"
            }
            shortcut={canStart ? "↵" : undefined}
            side="top"
          >
            <span className={`inline-flex ${!canStart ? "cursor-not-allowed" : ""}`}>
              <button
                type="button"
                disabled={!canStart}
                onClick={handleStartSession}
                className={`flex h-9 px-4 items-center justify-center rounded-full transition-all border-none ${
                  canStart
                    ? "bg-orange-600 text-white hover:bg-orange-500 hover:scale-105 active:scale-95 cursor-pointer shadow-none"
                    : "bg-white/10 text-[#6E5353] cursor-not-allowed opacity-50 shadow-none pointer-events-none"
                }`}
              >
                {isEditingActive ? (
                  <Check className="h-5 w-5 stroke-current stroke-[2.5]" />
                ) : (
                  <Play className="h-5 w-5 fill-none stroke-current stroke-[2.2]" />
                )}
              </button>
            </span>
          </AppTooltip>
        </div>
      </div>

      {/* DROPDOWN IN THE EXACT SAME ULTRA-MODERN GLASS STYLE */}
      {isDropdownOpen && (
        <div className="absolute left-0 right-0 top-full mt-2.5 z-50 overflow-hidden rounded-3xl bg-black/55 p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-3xl border-none outline-none animate-in fade-in slide-in-from-top-2 duration-200">
          {/* MODE 1: RECENT ENTRIES (NO ICON, NO COUNTER, ONLY MEMO & @PROJECT) */}
          {mode === "recents" && (
            <div className="space-y-1">
              <div className="px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#6E5353]">
                Recent entries
              </div>

              {recentEntries.map((entry, index) => {
                const project = projects.find((p) => p.id === entry.projectId)
                const isSelected = index === dropdownIndex

                // Determine display rate/billing for entry
                let billingTag = ""
                if (entry.billingType === "hourly" && entry.rateSnapshot && entry.rateSnapshot > 0) {
                  billingTag = `$${entry.rateSnapshot}/h`
                } else if (
                  (entry.billingType === "fixed" || entry.billingType === "milestone") &&
                  entry.earnedAmount &&
                  entry.earnedAmount > 0
                ) {
                  billingTag = `$${entry.earnedAmount}`
                } else if (entry.rateSnapshot && entry.rateSnapshot > 0) {
                  billingTag = `$${entry.rateSnapshot}/h`
                } else if (project?.billingType === "hourly" && project?.hourlyRate) {
                  billingTag = `$${project.hourlyRate}/h`
                } else if (project?.fixedBudget) {
                  billingTag = `$${project.fixedBudget}`
                }

                return (
                  <div
                    key={entry.id}
                    onClick={() => selectRecentEntry(entry)}
                    className={`flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-white/10 text-white"
                        : "text-[#806060] hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: project?.color || "#F97316",
                        }}
                      />
                      <span className="truncate text-white font-medium text-sm">
                        {capitalizeMemo(entry.memo)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {billingTag && (
                        <span className="font-mono text-sm text-[#806060] font-semibold">
                          {billingTag}
                        </span>
                      )}
                      <span className="text-sm text-[#6E5353]">
                        @{project?.name || "project"}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* MODE 2: PROJECTS AUTOCOMPLETE LIST ON @ */}
          {mode === "projects" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#6E5353]">
                <span>Projects ({filteredProjects.length})</span>
                <span>Select ↵</span>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                {filteredProjects.map((p, index) => {
                  const isSelected = index === dropdownIndex
                  return (
                    <div
                      key={p.id}
                      onClick={() => selectProject(p)}
                      className={`flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-white/10 text-white"
                          : "text-[#806060] hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: p.color,
                          }}
                        />
                        <span className="font-semibold text-white text-sm">{p.name}</span>
                      </div>

                      {p.hourlyRate && (
                        <span className="text-[#6E5353] font-mono text-sm tabular-nums font-semibold">
                          ${p.hourlyRate}/h
                        </span>
                      )}
                    </div>
                  )
                })}

                {/* Option to create new project if custom query typed */}
                {atQuery && atQuery.trim() && (
                  <div
                    onClick={() => createNewProject(atQuery.trim())}
                    className={`flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
                      dropdownIndex === filteredProjects.length
                        ? "bg-white/10 text-orange-400"
                        : "text-orange-400/80 hover:bg-white/10 hover:text-orange-400"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 shrink-0" />
                      <span>
                        Create project <strong className="text-white font-semibold">"{atQuery.trim()}"</strong>
                      </span>
                    </div>
                    <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-[#6E5353]">
                      Enter ↵
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODE 3: DYNAMIC SLASH COMMANDS (NO PRESETS, USER ENTERS COMMAND & VALUE) */}
          {mode === "slash" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#6E5353]">
                <span>Billing Command (/)</span>
                <span>Apply ↵</span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                {parsedSlashOptions.map((opt, index) => {
                  const Icon = opt.icon
                  const isSelected = index === dropdownIndex

                  return (
                    <div
                      key={opt.id}
                      onClick={() => applySlashCommand(opt.type, opt.amount)}
                      className={`flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-white/10 text-white"
                          : "text-[#806060] hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-[#806060] shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-sm">
                            <span className="text-[#6E5353]">{opt.command}</span>
                            <span className="font-semibold text-white">{opt.title}</span>
                          </div>
                          <div className="text-xs text-[#6E5353]">
                            {opt.description}
                          </div>
                        </div>
                      </div>

                      {opt.amount !== null && opt.amount > 0 && (
                        <span className="font-mono text-sm text-[#806060] font-semibold shrink-0">
                          {opt.type === "hourly" ? `$${opt.amount}/h` : `$${opt.amount}`}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SCOPE CONFIRMATION MODAL FOR BILLING CHANGE */}
      {pendingBillingChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-black/50 backdrop-blur-3xl border-none p-6 space-y-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: pendingBillingChange.project.color }}
                  />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#806060]">
                    {pendingBillingChange.project.name}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  Изменение биллинга проекта
                </h3>
                <p className="text-xs text-[#806060] mt-0.5">
                  Новая ставка:{" "}
                  <span className="text-white font-mono font-semibold">
                    {pendingBillingChange.newBilling.type === "hourly"
                      ? `$${pendingBillingChange.newBilling.amount}/h`
                      : pendingBillingChange.newBilling.type === "none"
                      ? "Non-billable"
                      : `$${pendingBillingChange.newBilling.amount}`}
                  </span>
                  . Для каких сессий применить изменение?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPendingBillingChange(null)}
                className="p-1 rounded-xl text-[#806060] hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 3 Scope Options */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleResolveBillingChange("current")}
                className="w-full flex flex-col items-start p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all text-left group"
              >
                <div className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors">
                  Для текущей сессии
                </div>
                <div className="text-xs text-[#806060] mt-0.5">
                  Применить только к этой сессии. Настройки проекта не изменятся.
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleResolveBillingChange("future")}
                className="w-full flex flex-col items-start p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all text-left group"
              >
                <div className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors">
                  Для текущей и будущих
                </div>
                <div className="text-xs text-[#806060] mt-0.5">
                  Обновить ставку проекта для этой и всех последующих сессий.
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleResolveBillingChange("all")}
                className="w-full flex flex-col items-start p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all text-left group"
              >
                <div className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors">
                  Для всех сессий проекта
                </div>
                <div className="text-xs text-[#806060] mt-0.5">
                  Обновить настройки проекта и пересчитать все прошлые записи в журнале.
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setPendingBillingChange(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#806060] hover:text-white hover:bg-white/5 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
