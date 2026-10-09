import { capitalizeMemo } from "./utils"

export interface MilestoneInfo {
  number: number
  title: string
  fullName: string
}

export interface ParsedMilestoneInput {
  memo: string
  number?: number
  title: string
  amount: number | null
  isMilestone: boolean
}

/**
 * Parses milestone information from a memo string.
 * Supports:
 * - "M 1 Design phase 1" -> { number: 1, title: "Design phase 1", fullName: "M 1 Design Phase 1" }
 * - "M1 Design phase 1" -> { number: 1, title: "Design phase 1", fullName: "M 1 Design Phase 1" }
 * - "Milestone 1: Design tokens" -> { number: 1, title: "Design tokens", fullName: "Milestone 1: Design Tokens" }
 * - "Milestone 1" -> { number: 1, title: "", fullName: "Milestone 1" }
 * - "1: Design tokens" -> { number: 1, title: "Design tokens", fullName: "Milestone 1: Design Tokens" }
 * - "1" -> { number: 1, title: "", fullName: "Milestone 1" }
 */
export function parseMilestone(memo: string): MilestoneInfo | null {
  if (!memo) return null
  const trimmed = memo.trim()

  // Match "M 1 Title" or "M1: Title" or "Milestone 1: Title" or "Milestone 1 Title"
  const mMatch = trimmed.match(/^(?:milestone|m)\s*(\d+)(?:(?:\s*[:\-]\s*|\s+)(.*))?$/i)
  if (mMatch) {
    const num = parseInt(mMatch[1], 10)
    const title = (mMatch[2] || "").trim()
    return {
      number: num,
      title,
      fullName: title ? `M ${num} ${capitalizeMemo(title)}` : `M ${num}`,
    }
  }

  // Match "1: Title" or "1 - Title"
  const numPrefixMatch = trimmed.match(/^(\d+)\s*[:\-]\s*(.*)$/)
  if (numPrefixMatch) {
    const num = parseInt(numPrefixMatch[1], 10)
    const title = numPrefixMatch[2].trim()
    return {
      number: num,
      title,
      fullName: title ? `M ${num} ${capitalizeMemo(title)}` : `M ${num}`,
    }
  }

  // Match just a number like "1"
  if (/^\d+$/.test(trimmed)) {
    const num = parseInt(trimmed, 10)
    return {
      number: num,
      title: "",
      fullName: `M ${num}`,
    }
  }

  return null
}

/**
 * Parses a string that may contain milestone identifiers and a trailing amount.
 * Examples:
 * - "M 1 Design phase 1 2300" -> memo: "M 1 Design Phase 1", amount: 2300, isMilestone: true
 * - "M1 Design phase 1 2300" -> memo: "M 1 Design Phase 1", amount: 2300, isMilestone: true
 * - "Milestone 2 Backend API 1500" -> memo: "M 2 Backend API", amount: 1500, isMilestone: true
 * - "Design system 850" -> memo: "Design System", amount: 850, isMilestone: false
 */
export function parseMilestoneWithAmount(rawInput: string): ParsedMilestoneInput {
  if (!rawInput) {
    return { memo: "", title: "", amount: null, isMilestone: false }
  }
  const trimmed = rawInput.trim()

  // 1. Check for trailing amount at the end: e.g. "M 1 Design phase 1 2300" -> amount 2300
  let remainder = trimmed
  let amount: number | null = null

  const pureNumberMatch = trimmed.match(/^[$€£]?(\d+(?:\.\d{1,2})?)[$€£]?$/)
  if (pureNumberMatch) {
    remainder = ""
    amount = parseFloat(pureNumberMatch[1])
  } else {
    const trailingAmountMatch = trimmed.match(/^(.*?)\s+[$€£]?(\d+(?:\.\d{1,2})?)[$€£]?$/)
    if (trailingAmountMatch) {
      remainder = trailingAmountMatch[1].trim()
      amount = parseFloat(trailingAmountMatch[2])
    }
  }

  if (!remainder) {
    return {
      memo: "",
      title: "",
      amount,
      isMilestone: amount !== null,
    }
  }

  // 2. Parse milestone pattern from remainder: "M 1 ...", "M1 ...", "Milestone 1 ...", "1: ..."
  const mMatch = remainder.match(/^(?:milestone|m)\s*(\d+)(?:(?:\s*[:\-]\s*|\s+)(.*))?$/i)
  if (mMatch) {
    const num = parseInt(mMatch[1], 10)
    const title = (mMatch[2] || "").trim()
    const memo = title ? `M ${num} ${capitalizeMemo(title)}` : `M ${num}`
    return {
      memo,
      number: num,
      title: capitalizeMemo(title),
      amount,
      isMilestone: true,
    }
  }

  // 3. Match "1: Title"
  const numPrefixMatch = remainder.match(/^(\d+)\s*[:\-]\s*(.*)$/)
  if (numPrefixMatch) {
    const num = parseInt(numPrefixMatch[1], 10)
    const title = numPrefixMatch[2].trim()
    const memo = title ? `M ${num} ${capitalizeMemo(title)}` : `M ${num}`
    return {
      memo,
      number: num,
      title: capitalizeMemo(title),
      amount,
      isMilestone: true,
    }
  }

  // 4. Default: regular memo with optional amount
  return {
    memo: capitalizeMemo(remainder),
    title: capitalizeMemo(remainder),
    amount,
    isMilestone: false,
  }
}

/**
 * Formats a memo as a milestone string.
 * If user entered "1" -> "M 1"
 * If user entered "1: UI" -> "M 1 UI"
 * If user entered "M 1 UI" -> keeps it
 * If user entered "UI Kit" -> "M ${targetNumber} UI Kit"
 */
export function formatAsMilestone(memo: string, targetNumber: number): string {
  if (!memo || !memo.trim()) {
    return `M ${targetNumber}`
  }
  const parsed = parseMilestone(memo)
  if (parsed) {
    return parsed.fullName
  }
  const cleanTitle = capitalizeMemo(memo.trim())
  return `M ${targetNumber} ${cleanTitle}`
}

/**
 * Extracts milestone stats for a project from past session history.
 */
export function getProjectMilestones(
  sessions: Array<{ projectId: string; memo: string; billingType?: string }>,
  projectId: string
) {
  const projectSessions = sessions.filter((s) => s.projectId === projectId)
  const seenMemos = new Set<string>()
  const milestones: Array<{ memo: string; parsed: MilestoneInfo | null }> = []

  let maxNumber = 0
  let latestMilestone: string | null = null

  for (const s of projectSessions) {
    const norm = capitalizeMemo(s.memo).trim()
    if (!norm) continue
    if (!latestMilestone) {
      latestMilestone = norm
    }
    const key = norm.toLowerCase()
    if (!seenMemos.has(key)) {
      seenMemos.add(key)
      const parsed = parseMilestone(norm)
      if (parsed && parsed.number > maxNumber) {
        maxNumber = parsed.number
      }
      milestones.push({ memo: norm, parsed })
    }
  }

  const nextNumber = maxNumber > 0 ? maxNumber + 1 : (milestones.length > 0 ? milestones.length + 1 : 1)

  return {
    milestones,
    latestMilestone,
    maxNumber,
    nextNumber,
    totalCount: milestones.length,
  }
}
