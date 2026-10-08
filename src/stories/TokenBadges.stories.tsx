import type { Meta, StoryObj } from '@storybook/react-vite'
import { ProjectBadge, BillingBadge } from '@/shared/ui'

const meta: Meta = {
  title: 'Shared/TokenBadges',
  parameters: {
    layout: 'centered',
  },
}

export default meta

export const ProjectBadges: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-6 bg-black/40 rounded-2xl backdrop-blur-xl">
      <ProjectBadge
        project={{ name: 'Kerdio Core', color: '#E25822' }}
        onRemove={() => {}}
      />
      <ProjectBadge
        project={{ name: 'Client Brand', color: '#10B981' }}
        onRemove={() => {}}
      />
      <ProjectBadge
        project={{ name: 'Mobile App', color: '#6366F1' }}
        onRemove={() => {}}
      />
      <ProjectBadge
        project={{ name: 'No Remove Action', color: '#EC4899' }}
      />
    </div>
  ),
}

export const BillingBadges: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-6 bg-black/40 rounded-2xl backdrop-blur-xl">
      <BillingBadge
        billingType="hourly"
        amount={85}
        onRemove={() => {}}
      />
      <BillingBadge
        billingType="fixed"
        amount={2500}
        onRemove={() => {}}
      />
      <BillingBadge
        billingType="milestone"
        amount={500}
        onRemove={() => {}}
      />
      <BillingBadge
        billingType="none"
        onRemove={() => {}}
      />
    </div>
  ),
}
