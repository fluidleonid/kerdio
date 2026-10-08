import { capitalizeMemo } from "./utils"

export interface MilestoneInfo {
  number: number
  title: string
  fullName: string
}

/**
 * Parses milestone information from a memo string.
 * Supports:
 * - "Milestone 1: Design tokens" -> { number: 1, title: "Design tokens", fullName: ... }
 * - "Milestone 1" -> { number: 1, title: "", fullName: "Milestone 1" }
 * - "1: Design tokens" -> { number: 1, title: "Design tokens", fullName: "Milestone 1: Design tokens" }
 * - "1" -> { number: 1, title: "", fullName: "Milestone 1" }
 */
export function parseMilestone(memo: string): MilestoneInfo | null {
  if (!memo) return null
  const trimmed = memo.trim()

  // Match "Milestone 1: Title" or "Milestone 1 - Title" or "Milestone 1"
  const mMatch = trimmed.match(/^milestone\s*(\d+)(?:\s*[:\-]\s*(.*))?$/i)
  if (mMatch) {
    const num = parseInt(mMatch[1], 10)
    const title = (mMatch[2] || "").trim()
    return {
      number: num,
      title,
      fullName: title ? `Milestone ${num}: ${capitalizeMemo(title)}` : `Milestone ${num}`,
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
      fullName: title ? `Milestone ${num}: ${capitalizeMemo(title)}` : `Milestone ${num}`,
    }
  }

  // Match just a number like "1"
  if (/^\d+$/.test(trimmed)) {
    const num = parseInt(trimmed, 10)
    return {
      number: num,
      title: "",
      fullName: `Milestone ${num}`,
    }
  }

  return null
}

/**
 * Formats a memo as a milestone string.
 * If user entered "1" -> "Milestone 1"
 * If user entered "1: UI" -> "Milestone 1: UI"
 * If user entered "Milestone 1: UI" -> keeps it
 * If user entered "UI Kit" -> "Milestone ${targetNumber}: UI Kit"
 */
export function formatAsMilestone(memo: string, targetNumber: number): string {
  if (!memo || !memo.trim()) {
    return `Milestone ${targetNumber}`
  }
  const parsed = parseMilestone(memo)
  if (parsed) {
    return parsed.fullName
  }
  const cleanTitle = capitalizeMemo(memo.trim())
  return `Milestone ${targetNumber}: ${cleanTitle}`
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

  // If there were milestones that didn't have numbers, count them as total count
  const nextNumber = maxNumber > 0 ? maxNumber + 1 : (milestones.length > 0 ? milestones.length + 1 : 1)

  return {
    milestones,
    latestMilestone,
    maxNumber,
    nextNumber,
    totalCount: milestones.length,
  }
}
