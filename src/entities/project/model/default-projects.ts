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
    milestones: [
      {
        id: "ms-kerd-1",
        number: 1,
        name: "M 1 Horological Dial & Physics",
        amount: 1500,
        status: "delivered",
        deliveredAt: Date.now() - 86400000 * 3,
      },
      {
        id: "ms-kerd-2",
        number: 2,
        name: "M 2 Token Command Palette",
        amount: 2300,
        status: "open",
      },
      {
        id: "ms-kerd-3",
        number: 3,
        name: "M 3 Multi-Slot Arc Engine",
        amount: 1800,
        status: "open",
      },
    ],
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
    milestones: [
      {
        id: "ms-ray-1",
        number: 1,
        name: "M 1 OAuth & Store Submission",
        amount: 950,
        status: "open",
      },
    ],
  },
  {
    id: "proj-design",
    name: "Fintech Design System",
    slug: "fintech",
    color: "#10B981", // Emerald
    billingType: "milestone",
    hourlyRate: 110,
    fixedBudget: 3500,
    currency: "$",
    createdAt: Date.now() - 86400000 * 3,
    milestones: [
      {
        id: "ms-des-1",
        number: 1,
        name: "M 1 Design phase 1",
        amount: 2300,
        status: "open",
      },
      {
        id: "ms-des-2",
        number: 2,
        name: "M 2 Figma token synchronizer",
        amount: 1200,
        status: "open",
      },
    ],
  },
]
