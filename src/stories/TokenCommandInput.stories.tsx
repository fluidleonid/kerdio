import type { Meta, StoryObj } from '@storybook/react-vite'
import { TokenCommandInput } from '@/features/tracker-command-bar'

const meta: Meta<typeof TokenCommandInput> = {
  title: 'Components/Command Input Bar',
  component: TokenCommandInput,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof TokenCommandInput>

export const DefaultIdle: Story = {
  render: () => (
    <div className="w-[580px] p-6">
      <TokenCommandInput autoFocus={false} />
    </div>
  ),
}

export const EditingActiveSession: Story = {
  render: () => (
    <div className="w-[580px] p-6">
      <TokenCommandInput
        isEditingActive={true}
        initialMemo="Refactoring design tokens & bezels"
        initialProjectId="proj-kerd"
        initialBilling={{ type: 'hourly', amount: 95 }}
        autoFocus={false}
      />
    </div>
  ),
}

export const MilestoneSession: Story = {
  render: () => (
    <div className="w-[580px] p-6">
      <TokenCommandInput
        isEditingActive={true}
        initialMemo="Milestone 1: Prototype"
        initialProjectId="proj-kerd"
        initialBilling={{ type: 'milestone', amount: 500 }}
        autoFocus={false}
      />
    </div>
  ),
}
