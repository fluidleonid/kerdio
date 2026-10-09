import type { Meta, StoryObj } from '@storybook/react-vite'
import { within, userEvent, expect, fn } from '@storybook/test'
import { ProjectSettingsDialog } from './ProjectSettingsDialog'

/**
 * # ProjectSettingsDialog
 *
 * Dedicated modal dialog component for configuring project metadata and billing models.
 * Shares the exact same optical frosted glass background and shadow as the application `Card` components:
 * `bg-black/50 backdrop-blur-3xl border-none shadow-[0_20px_50px_rgba(0,0,0,0.32)] rounded-3xl`.
 */
const meta: Meta<typeof ProjectSettingsDialog> = {
  title: 'Widgets/Projects View/Project Settings Dialog',
  component: ProjectSettingsDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    isOpen: true,
    onClose: fn(),
    onSave: fn(),
  },
}

export default meta
type Story = StoryObj<typeof ProjectSettingsDialog>

/**
 * **New Project Mode**:
 * Clean creation state with default billable toggle active and hourly rate configured.
 */
export const CreateNewProject: Story = {
  args: {
    isOpen: true,
    project: null,
  },
}

/**
 * **Edit Existing Project Mode**:
 * Pre-populated with existing project settings, color, and billing configuration.
 */
export const EditExistingProject: Story = {
  args: {
    isOpen: true,
    project: {
      id: 'proj-kerd',
      name: 'Kerdio Core',
      slug: 'kerdio-core',
      color: '#E25822',
      billingType: 'hourly',
      hourlyRate: 120,
      fixedBudget: 5000,
      currency: '$',
      createdAt: 1710000000000,
    },
  },
}

/**
 * **Interactive: Toggle Billable Model**:
 * Verifies that switching the Billable toggle smoothly hides and reveals the billing settings input.
 */
export const InteractiveToggleBillable: Story = {
  args: {
    isOpen: true,
    project: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 1. Verify billable toggle is active by default
    const billableToggle = await canvas.findByRole('switch')
    await expect(billableToggle).toBeInTheDocument()
    await expect(billableToggle).toHaveAttribute('aria-checked', 'true')

    // 2. Verify billing amount input is visible
    const rateInput = await canvas.findByPlaceholderText('0')
    await expect(rateInput).toBeInTheDocument()

    // 3. Switch off billable
    await userEvent.click(billableToggle)
    await expect(billableToggle).toHaveAttribute('aria-checked', 'false')

    // 4. Rate input should disappear
    await expect(canvas.queryByPlaceholderText('0')).not.toBeInTheDocument()

    // 5. Switch back on
    await userEvent.click(billableToggle)
    await expect(billableToggle).toHaveAttribute('aria-checked', 'true')
    await expect(await canvas.findByPlaceholderText('0')).toBeInTheDocument()
  },
}
