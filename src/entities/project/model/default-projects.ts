import type { Project } from "./types"

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-kerd",
    name: "Kerdio Core",
    slug: "kerd",
    color: "#E25822", // Terracotta
    billingType: "hourly",
    hourlyRate: 85,
    currency: "$",
    createdAt: Date.now() - 86400000 * 7,
  },
  {
    id: "proj-raycast",
    name: "Raycast Extension",
    slug: "raycast",
    color: "#F97316", // Amber
    billingType: "hourly",
    hourlyRate: 95,
    currency: "$",
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: "proj-design",
    name: "Fintech Design System",
    slug: "fintech",
    color: "#10B981", // Emerald
    billingType: "fixed",
    hourlyRate: 110,
    fixedBudget: 3500,
    currency: "$",
    createdAt: Date.now() - 86400000 * 3,
  },
]
