import type { BillingType } from "@/entities/project"

export interface ParsedCommand {
  raw: string
  memo: string
  projectSlug?: string
  rate?: number
  fixedBudget?: number
  milestone?: string
  billingType: BillingType
}

export function parseTrackerCommand(input: string): ParsedCommand {
  const trimmed = input.trim()
  if (!trimmed) {
    return {
      raw: "",
      memo: "",
      billingType: "hourly",
    }
  }

  let text = trimmed
  let projectSlug: string | undefined
  let rate: number | undefined
  let fixedBudget: number | undefined
  let milestone: string | undefined
  let billingType: BillingType = "hourly"

  // 1. Extract @project
  const projectMatch = text.match(/@([a-zA-Z0-9_\u0400-\u04FF-]+)/)
  if (projectMatch) {
    projectSlug = projectMatch[1].toLowerCase()
    text = text.replace(projectMatch[0], "")
  }

  // 2. Extract /rate <number>
  const rateMatch = text.match(/\/rate\s+(\d+(?:\.\d+)?)/i)
  if (rateMatch) {
    rate = parseFloat(rateMatch[1])
    billingType = "hourly"
    text = text.replace(rateMatch[0], "")
  }

  // 3. Extract /fix <number>
  const fixMatch = text.match(/\/fix\s+(\d+(?:\.\d+)?)/i)
  if (fixMatch) {
    fixedBudget = parseFloat(fixMatch[1])
    billingType = "fixed"
    text = text.replace(fixMatch[0], "")
  }

  // 4. Extract /milestone <text>
  const milestoneMatch = text.match(/\/milestone\s+([^/@\s]+)/i)
  if (milestoneMatch) {
    milestone = milestoneMatch[1]
    billingType = "milestone"
    text = text.replace(milestoneMatch[0], "")
  }

  // Cleanup memo text
  const cleanMemo = text.replace(/\s+/g, " ").trim()

  return {
    raw: trimmed,
    memo: cleanMemo || "Focused session",
    projectSlug,
    rate,
    fixedBudget,
    milestone,
    billingType,
  }
}
