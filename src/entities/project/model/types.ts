export type BillingType = 'hourly' | 'fixed' | 'milestone' | 'none'

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
}
