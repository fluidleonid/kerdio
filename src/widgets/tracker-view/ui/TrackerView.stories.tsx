import type { Meta, StoryObj } from '@storybook/react-vite'
import { TrackerView } from './TrackerView'
import { useTrackerStore } from '@/entities/tracker'
import { useEffect } from 'react'

/**
 * # Tracker View Widget
 *
 * Primary focus cockpit orchestrating the full tracking lifecycle:
 * idle command palette entry, real-time chronograph visualization,
 * session metadata header, and physical control docks.
 *
 * ### Modes & Lifecycle
 * - **1. Idle Mode**: Only the two-row borderless command input is displayed, perfectly centered.
 * - **2. Tracking Mode**:
 *   - Session Header: 20px from top edge displaying memo, project badge, and billing badge.
 *   - Chronograph Dial: Main instrument in exact physical center.
 *   - Control Dock: Centered beneath the dial with Pause/Resume, Save (⌘↵), and Reset (Esc).
 */
const meta: Meta<typeof TrackerView> = {
  title: 'Widgets/Tracker View',
  component: TrackerView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
### Tracker View Cockpit

Complete full-screen cockpit experience for Kerdio. Transitions seamlessly between the idle command input and running chronograph dial.

#### Keyboard Controls
- \`Space\`: Pause / Resume active tracking
- \`⌘ + Enter\` / \`Ctrl + Enter\`: Save session and commit to Journal
- \`Escape\`: Discard active session
        `,
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof TrackerView>

/**
 * **Default (Idle Mode)**:
 * Rested cockpit displaying the centered command input waiting for a task.
 */
export const DefaultIdle: Story = {
  render: () => {
    useEffect(() => {
      useTrackerStore.getState().discardTracking()
    }, [])

    return (
      <div className="relative h-screen w-screen bg-[#140501] overflow-hidden">
        <TrackerView />
      </div>
    )
  },
}

/**
 * **Active Tracking Mode**:
 * Active focus session with Chronograph dial centered, top header 20px from top edge,
 * and bottom playback controls.
 */
export const ActiveTracking: Story = {
  render: () => {
    useEffect(() => {
      const now = Date.now()
      const durationSeconds = 3840 // 1 hour 4 minutes
      useTrackerStore.setState((s) => ({
        timer: {
          ...s.timer,
          status: 'running',
          memo: 'Design System Architecture & Horology Dial',
          projectId: 'proj-kerd',
          startTime: now - durationSeconds * 1000,
          accumulatedSeconds: 0,
          elapsedSeconds: durationSeconds,
          rate: 120,
          billingType: 'hourly',
          currency: '$',
          intervals: [],
        },
      }))
    }, [])

    return (
      <div className="relative h-screen w-screen bg-[#140501] overflow-hidden">
        <TrackerView />
      </div>
    )
  },
}

/**
 * **Paused Tracking Mode**:
 * Mid-session paused state with resume button highlighted.
 */
export const PausedTracking: Story = {
  render: () => {
    useEffect(() => {
      const now = Date.now()
      const durationSeconds = 2400 // 40 minutes
      useTrackerStore.setState((s) => ({
        timer: {
          ...s.timer,
          status: 'paused',
          memo: 'Client Review & Feedback Iteration',
          projectId: 'proj-kerd',
          startTime: now - durationSeconds * 1000,
          accumulatedSeconds: durationSeconds,
          elapsedSeconds: durationSeconds,
          rate: 85,
          billingType: 'hourly',
          currency: '$',
          intervals: [durationSeconds],
        },
      }))
    }, [])

    return (
      <div className="relative h-screen w-screen bg-[#140501] overflow-hidden">
        <TrackerView />
      </div>
    )
  },
}
