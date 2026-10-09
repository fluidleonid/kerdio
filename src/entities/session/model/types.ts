export interface TimeSession {
  id: string
  projectId: string
  memo: string
  startTime: number
  endTime: number
  durationSeconds: number
  rateSnapshot: number
  earnedAmount: number
  milestoneId?: string
  milestoneName?: string
  billingType: 'hourly' | 'fixed' | 'milestone'
  currency: string
}
