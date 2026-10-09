export type BillingType = 'hourly' | 'fixed' | 'milestone' | 'none'

export interface ProjectMilestone {
  id: string
  number?: number
  name: string
  amount: number
  status: 'open' | 'delivered'
  deliveredAt?: number
}

export interface Project {
  id: string
  name: string
  slug: string
  color: string
  billingType: BillingType
  hourlyRate: number
  fixedBudget?: number
  currency: string
  createdAt: number
  milestones?: ProjectMilestone[]
}
