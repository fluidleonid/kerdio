import type { Meta, StoryObj } from '@storybook/react-vite'
import { Chronograph } from '@/features/chronograph'
import { useTrackerStore } from '@/entities/tracker'
import { useEffect } from 'react'

const meta: Meta<typeof Chronograph> = {
  title: 'Components/Analogue Chronograph',
  component: Chronograph,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: { type: 'range', min: 280, max: 600, step: 20 },
    },
  },
}

export default meta
type Story = StoryObj<typeof Chronograph>

export const Idle: Story = {
  render: (args) => {
    useEffect(() => {
      useTrackerStore.getState().discardTracking()
    }, [])

    return (
      <div className="p-8 flex items-center justify-center">
        <Chronograph {...args} size={420} />
      </div>
    )
  },
}

export const ActiveHourlySession: Story = {
  render: (args) => {
    useEffect(() => {
      const now = Date.now()
      useTrackerStore.setState((s) => ({
        timer: {
          ...s.timer,
          status: 'running',
          memo: 'Design System & SVG Bezel',
          projectId: 'proj-kerd',
          startTime: now - 3600 * 1000 * 2.5, // 2.5 hours ago
          accumulatedSeconds: 9000,
          elapsedSeconds: 9000,
          rate: 120,
          billingType: 'hourly',
          currency: '$',
        },
      }))
    }, [])

    return (
      <div className="p-8 flex items-center justify-center">
        <Chronograph {...args} size={420} />
      </div>
    )
  },
}

export const MilestoneSession: Story = {
  render: (args) => {
    useEffect(() => {
      const now = Date.now()
      useTrackerStore.setState((s) => ({
        timer: {
          ...s.timer,
          status: 'running',
          memo: 'Milestone 2: Production Polish',
          projectId: 'proj-kerd',
          startTime: now - 3600 * 1000 * 1.2,
          accumulatedSeconds: 4320,
          elapsedSeconds: 4320,
          fixedBudget: 750,
          billingType: 'milestone',
          currency: '$',
        },
      }))
    }, [])

    return (
      <div className="p-8 flex items-center justify-center">
        <Chronograph {...args} size={420} />
      </div>
    )
  },
}
