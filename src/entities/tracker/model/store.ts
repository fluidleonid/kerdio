import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Project, BillingType, ProjectMilestone } from "@/entities/project"
import { INITIAL_PROJECTS } from "@/entities/project"
import type { TimeSession } from "@/entities/session"
import { INITIAL_SESSIONS } from "@/entities/session"
import { capitalizeMemo } from "@/shared/lib"

export interface ActiveTimerState {
  status: "idle" | "running" | "paused"
  startTime: number | null
  accumulatedSeconds: number
  elapsedSeconds: number
  projectId: string | null
  milestoneId?: string | null
  milestoneName?: string | null
  memo: string
  rate: number | null
  billingType: BillingType | "none"
  fixedBudget?: number
  currency: string
  intervals?: number[]
}

interface TrackerStore {
  projects: Project[]
  sessions: TimeSession[]
  timer: ActiveTimerState

  // Timer actions
  startTracking: (params?: {
    projectId?: string
    milestoneId?: string | null
    milestoneName?: string | null
    memo?: string
    rate?: number | null
    billingType?: BillingType | "none"
    fixedBudget?: number
  }) => void
  pauseTracking: () => void
  resumeTracking: () => void
  stopAndSaveSession: () => TimeSession | null
  discardTracking: () => void
  tick: () => void
  updateActiveMemo: (memo: string) => void
  updateActiveProject: (projectId: string) => void
  updateActiveMilestone: (milestoneId: string | null, milestoneName?: string | null) => void
  updateActiveRate: (rate: number | null) => void
  updateActiveSessionInfo: (params: {
    memo: string
    projectId: string
    milestoneId?: string | null
    milestoneName?: string | null
    rate?: number | null
    billingType?: BillingType | "none"
    fixedBudget?: number
  }) => void
  applyProjectBillingScope: (params: {
    projectId: string
    billingType: BillingType | "none"
    hourlyRate?: number
    fixedBudget?: number
    scope: "current" | "future" | "all"
  }) => void

  // Projects actions
  addProject: (project: Omit<Project, "id" | "createdAt">) => Project
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  toggleMilestoneStatus: (projectId: string, milestoneId: string) => void
  markMilestoneDelivered: (projectId: string, milestoneId: string) => void
  addProjectMilestone: (projectId: string, milestone: Omit<ProjectMilestone, "id">) => ProjectMilestone

  // Sessions actions
  updateSession: (id: string, updates: Partial<TimeSession>) => void
  deleteSession: (id: string) => void
  addManualSession: (session: Omit<TimeSession, "id">) => void
}

const defaultTimerState: ActiveTimerState = {
  status: "idle",
  startTime: null,
  accumulatedSeconds: 0,
  elapsedSeconds: 0,
  projectId: "proj-kerd",
  memo: "Focused development session",
  rate: null,
  billingType: "hourly",
  currency: "$",
  intervals: [],
}

export const useTrackerStore = create<TrackerStore>()(
  persist(
    (set, get) => ({
      projects: INITIAL_PROJECTS,
      sessions: INITIAL_SESSIONS,
      timer: defaultTimerState,

      startTracking: (params) => {
        const state = get()
        const selectedProj = params?.projectId
          ? state.projects.find((p) => p.id === params.projectId)
          : state.projects.find((p) => p.id === state.timer.projectId) || state.projects[0]

        // Determine active milestone
        let mId = params?.milestoneId
        let mName = params?.milestoneName
        if (mId === undefined && selectedProj?.milestones && selectedProj.milestones.length > 0) {
          const activeMs = selectedProj.milestones.find((m) => m.status === "open") || selectedProj.milestones[0]
          if (activeMs) {
            mId = activeMs.id
            mName = activeMs.name
          }
        }

        const now = Date.now()
        set({
          timer: {
            status: "running",
            startTime: now,
            accumulatedSeconds: 0,
            elapsedSeconds: 0,
            projectId: selectedProj?.id || null,
            milestoneId: mId || null,
            milestoneName: mName || null,
            memo: capitalizeMemo(params?.memo?.trim() || state.timer.memo || "Focused session"),
            rate: params?.rate !== undefined ? params.rate : null,
            billingType: params?.billingType ?? selectedProj?.billingType ?? "hourly",
            fixedBudget: params?.fixedBudget !== undefined ? params.fixedBudget : selectedProj?.fixedBudget,
            currency: selectedProj?.currency ?? "$",
            intervals: [],
          },
        })
      },

      pauseTracking: () => {
        const { timer } = get()
        if (timer.status !== "running") return

        const now = Date.now()
        const currentSegment = timer.startTime
          ? Math.max(0, Math.floor((now - timer.startTime) / 1000))
          : 0
        const totalElapsed = (timer.accumulatedSeconds || 0) + currentSegment
        const prevIntervals = timer.intervals || []
        const updatedIntervals = currentSegment > 0 ? [...prevIntervals, currentSegment] : prevIntervals

        set({
          timer: {
            ...timer,
            status: "paused",
            accumulatedSeconds: totalElapsed,
            elapsedSeconds: totalElapsed,
            startTime: null,
            intervals: updatedIntervals,
          },
        })
      },

      resumeTracking: () => {
        const { timer } = get()
        if (timer.status !== "paused") return

        const now = Date.now()
        set({
          timer: {
            ...timer,
            status: "running",
            startTime: now,
          },
        })
      },

      stopAndSaveSession: () => {
        const { timer, sessions } = get()
        if (timer.status === "idle" || timer.elapsedSeconds < 2) {
          get().discardTracking()
          return null
        }

        const duration = timer.elapsedSeconds
        let earned = 0
        if (timer.billingType === "hourly" && timer.rate) {
          earned = (duration / 3600) * timer.rate
        } else if (timer.billingType === "milestone" && timer.fixedBudget) {
          const normMemo = capitalizeMemo(timer.memo).trim().toLowerCase()
          const isContinuation = sessions.some(
            (s) =>
              s.projectId === timer.projectId &&
              s.billingType === "milestone" &&
              capitalizeMemo(s.memo).trim().toLowerCase() === normMemo
          )
          earned = isContinuation ? 0 : timer.fixedBudget
        } else if (timer.billingType === "fixed" && timer.fixedBudget) {
          earned = timer.fixedBudget
        }

        const newSession: TimeSession = {
          id: `sess-${Date.now()}`,
          projectId: timer.projectId || "proj-kerd",
          milestoneId: timer.milestoneId || undefined,
          milestoneName: timer.milestoneName || undefined,
          memo: capitalizeMemo(timer.memo || "Focused session"),
          startTime: (timer.startTime || Date.now()) - duration * 1000,
          endTime: Date.now(),
          durationSeconds: duration,
          rateSnapshot: timer.rate || 0,
          earnedAmount: Math.round(earned * 100) / 100,
          billingType: timer.billingType === "none" ? "hourly" : timer.billingType,
          currency: timer.currency,
        }

        set({
          sessions: [newSession, ...sessions],
          timer: {
            ...defaultTimerState,
            projectId: timer.projectId,
            milestoneId: timer.milestoneId,
            milestoneName: timer.milestoneName,
            rate: timer.rate,
            currency: timer.currency,
          },
        })

        return newSession
      },

      discardTracking: () => {
        set({
          timer: defaultTimerState,
        })
      },

      tick: () => {
        const { timer } = get()
        if (timer.status !== "running" || !timer.startTime) return

        const now = Date.now()
        const currentSegment = Math.floor((now - timer.startTime) / 1000)
        const totalElapsed = timer.accumulatedSeconds + currentSegment

        set({
          timer: {
            ...timer,
            elapsedSeconds: totalElapsed,
          },
        })
      },

      updateActiveMemo: (memo) => {
        set((state) => ({
          timer: { ...state.timer, memo: capitalizeMemo(memo) },
        }))
      },

      updateActiveProject: (projectId) => {
        const project = get().projects.find((p) => p.id === projectId)
        if (!project) return
        const activeMs = project.milestones?.find((m) => m.status === "open") || project.milestones?.[0]
        set((state) => ({
          timer: {
            ...state.timer,
            projectId: project.id,
            milestoneId: activeMs?.id || null,
            milestoneName: activeMs?.name || null,
            rate: project.hourlyRate,
            billingType: project.billingType,
            currency: project.currency,
          },
        }))
      },

      updateActiveMilestone: (milestoneId, milestoneName) => {
        set((state) => {
          const project = state.projects.find((p) => p.id === state.timer.projectId)
          const matchedMs = project?.milestones?.find((m) => m.id === milestoneId)
          return {
            timer: {
              ...state.timer,
              milestoneId: milestoneId || null,
              milestoneName: milestoneName || matchedMs?.name || null,
            },
          }
        })
      },

      updateActiveRate: (rate) => {
        set((state) => ({
          timer: { ...state.timer, rate },
        }))
      },

      updateActiveSessionInfo: (params) => {
        const project = get().projects.find((p) => p.id === params.projectId)
        set((state) => ({
          timer: {
            ...state.timer,
            memo: capitalizeMemo(params.memo),
            projectId: params.projectId,
            milestoneId: params.milestoneId !== undefined ? params.milestoneId : state.timer.milestoneId,
            milestoneName: params.milestoneName !== undefined ? params.milestoneName : state.timer.milestoneName,
            rate: params.rate !== undefined ? params.rate : state.timer.rate,
            billingType: params.billingType ?? project?.billingType ?? state.timer.billingType,
            fixedBudget: params.fixedBudget !== undefined ? params.fixedBudget : project?.fixedBudget,
            currency: project?.currency ?? state.timer.currency,
          },
        }))
      },

      applyProjectBillingScope: ({ projectId, billingType, hourlyRate, fixedBudget, scope }) => {
        const state = get()
        const project = state.projects.find((p) => p.id === projectId)
        if (!project) return

        // 1. If scope is "future" or "all", update the project settings
        if (scope === "future" || scope === "all") {
          set((s) => ({
            projects: s.projects.map((p) =>
              p.id === projectId
                ? {
                    ...p,
                    billingType: billingType === "none" ? "hourly" : billingType,
                    hourlyRate: hourlyRate !== undefined ? hourlyRate : p.hourlyRate,
                    fixedBudget: fixedBudget !== undefined ? fixedBudget : p.fixedBudget,
                  }
                : p
            ),
          }))
        }

        // 2. If scope is "all", update all past sessions of this project in Journal
        if (scope === "all") {
          const effectiveRate = hourlyRate !== undefined ? hourlyRate : project.hourlyRate
          const effectiveBudget = fixedBudget !== undefined ? fixedBudget : project.fixedBudget
          const effectiveType = billingType === "none" ? "hourly" : billingType

          set((s) => ({
            sessions: s.sessions.map((sess) => {
              if (sess.projectId !== projectId) return sess

              let earned = 0
              if (effectiveType === "hourly" && effectiveRate) {
                earned = (sess.durationSeconds / 3600) * effectiveRate
              } else if ((effectiveType === "fixed" || effectiveType === "milestone") && effectiveBudget) {
                earned = effectiveBudget
              }

              return {
                ...sess,
                billingType: effectiveType,
                rateSnapshot: effectiveRate || 0,
                earnedAmount: Math.round(earned * 100) / 100,
              }
            }),
          }))
        }

        // 3. If timer currently tracks this project, update active timer state
        if (state.timer.projectId === projectId) {
          set((s) => ({
            timer: {
              ...s.timer,
              rate: hourlyRate !== undefined ? hourlyRate : s.timer.rate,
              billingType: billingType,
              fixedBudget: fixedBudget !== undefined ? fixedBudget : s.timer.fixedBudget,
            },
          }))
        }
      },

      addProject: (projectData) => {
        const newProj: Project = {
          ...projectData,
          id: `proj-${Date.now()}`,
          createdAt: Date.now(),
        }
        set((state) => ({
          projects: [...state.projects, newProj],
        }))
        return newProj
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }))
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }))
      },

      toggleMilestoneStatus: (projectId, milestoneId) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p
            const updated = (p.milestones || []).map((m) => {
              if (m.id !== milestoneId) return m
              const newStatus = m.status === "open" ? ("delivered" as const) : ("open" as const)
              return {
                ...m,
                status: newStatus,
                deliveredAt: newStatus === "delivered" ? Date.now() : undefined,
              }
            })
            return { ...p, milestones: updated }
          }),
        }))
      },

      markMilestoneDelivered: (projectId, milestoneId) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p
            const updated = (p.milestones || []).map((m) => {
              if (m.id !== milestoneId) return m
              return {
                ...m,
                status: "delivered" as const,
                deliveredAt: Date.now(),
              }
            })
            return { ...p, milestones: updated }
          }),
        }))
      },

      addProjectMilestone: (projectId, milestoneData) => {
        const newMs: ProjectMilestone = {
          ...milestoneData,
          id: `ms-${Date.now()}`,
        }
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p
            return {
              ...p,
              milestones: [...(p.milestones || []), newMs],
            }
          }),
        }))
        return newMs
      },

      updateSession: (id, updates) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id
              ? {
                  ...s,
                  ...updates,
                  memo: updates.memo !== undefined ? capitalizeMemo(updates.memo) : s.memo,
                }
              : s
          ),
        }))
      },

      deleteSession: (id) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        }))
      },

      addManualSession: (sessionData) => {
        const newSession: TimeSession = {
          ...sessionData,
          memo: capitalizeMemo(sessionData.memo),
          id: `sess-${Date.now()}`,
        }
        set((state) => ({
          sessions: [newSession, ...state.sessions],
        }))
      },
    }),
    {
      name: "kerd-tracker-storage",
      partialize: (state) => ({
        projects: state.projects,
        sessions: state.sessions,
        timer: state.timer,
      }),
    }
  )
)
