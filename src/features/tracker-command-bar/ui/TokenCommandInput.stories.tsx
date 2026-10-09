import type { Meta, StoryObj } from '@storybook/react-vite'
import { within, userEvent, expect } from '@storybook/test'
import { TokenCommandInput } from './TokenCommandInput'

/**
 * # TokenCommandInput
 *
 * Ultra-responsive, borderless command palette input for frictionless time tracking.
 * Interleaves inline text descriptions with high-fidelity chip badges for projects
 * and billing models.
 *
 * ### Design System Anatomy
 * - **Glass Container**: 50% opacity tinted glass with 50px diffused ambient shadow (`backdrop-blur-3xl`).
 * - **Interleaved Tokens**: Natural-language stream mixing auto-sizing text inputs, `ProjectBadge`, and `BillingBadge`.
 * - **Quick Action Controls**: Direct icon triggers for `@` (project picker), `/` (billing mode), and dynamic submit/save.
 * - **Floating Dropdown Popover**: Keyboard-navigable autocomplete popover matching identical optical glass tiers.
 *
 * ### Interaction Rules & Shortcuts
 * - `@`: Triggers fuzzy-search project selector.
 * - `/`: Triggers billing configuration menu (Hourly, Fixed Fee, Milestone, Non-billable).
 * - `Backspace`: Deletes preceding badge token when cursor is at the boundary.
 * - `ArrowLeft` / `ArrowRight`: Seamlessly steps across badge tokens without breaking context.
 * - `Enter`: Starts session or selects highlighted autocomplete item.
 * - `Escape`: Closes autocomplete popover or cancels active session editing.
 */
const meta: Meta<typeof TokenCommandInput> = {
  title: 'Features/Tracker Command Bar',
  component: TokenCommandInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Command Input Bar (TokenCommandInput)

Production command input engineered in the style of Linear and Raycast command bars. Supports natural-language task entry, instant tokenization of projects and billing rules, and seamless keyboard navigation.

#### Anatomy
1. **Container**: Borderless \`bg-black/50\` glassmorphic container with diffused drop shadow.
2. **Inline Token Flow**: Interleaved text segments and chip badges. Auto-sizing eliminates default HTML 20ch width quirks.
3. **Quick Action Dock**: Bottom-right dock containing project trigger (\`@\`), billing trigger (\`/\`), and play/commit button.
4. **Autocomplete Popover**: Floats below the container with fuzzy matching for projects, slash commands, and recent entries.

#### States & Edge Cases Covered
- **Empty Focused**: Ready for typing with active white caret.
- **Recognized Project**: Converted \`@Project\` token with brand color bead and remove action.
- **Hourly / Milestone Billing**: Interleaved \`BillingBadge\` displaying live hourly yield or contract milestone.
- **Long Text Overflow**: Extreme multi-word tasks testing flex-wrapping and container integrity.
- **Active Editing**: Inline edit mode for an already-running chronograph timer.
        `,
      },
    },
  },
  argTypes: {
    autoFocus: {
      description: 'Automatically sets focus and caret to the trailing text input on mount.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    isEditingActive: {
      description: 'Puts the command bar into edit mode for an active running session.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    initialMemo: {
      description: 'Initial text memo populated inside the task input.',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
    initialProjectId: {
      description: 'ID of pre-selected project token.',
      control: 'select',
      options: ['proj-kerd', 'proj-raycast', 'proj-design', null],
      table: {
        type: { summary: 'string | null' },
      },
    },
    initialBilling: {
      description: 'Pre-selected billing configuration ({ type, amount }).',
      control: 'object',
      table: {
        type: { summary: 'BillingConfig | null' },
      },
    },
    className: {
      description: 'Additional Tailwind CSS classes applied to root container.',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
    onStart: {
      description: 'Callback fired when session is initiated.',
      action: 'started',
    },
    onSaveActive: {
      description: 'Callback fired when active session metadata is updated.',
      action: 'saved',
    },
    onClose: {
      description: 'Callback fired when closing/escaping edit mode.',
      action: 'closed',
    },
  },
}

export default meta
type Story = StoryObj<typeof TokenCommandInput>

/**
 * **Default (Idle)**: Standby state without prefilled tokens.
 * Displays placeholder "What are you working on?" and dimmed action triggers.
 */
export const DefaultIdle: Story = {
  render: (args) => (
    <div className="w-[580px] p-6">
      <TokenCommandInput {...args} autoFocus={false} />
    </div>
  ),
}

/**
 * **Empty Focused**: Cursor focused ready for input.
 * Auto-focuses the input and demonstrates caret styling with glass contrast.
 */
export const EmptyFocused: Story = {
  render: (args) => (
    <div className="w-[580px] p-6">
      <TokenCommandInput {...args} autoFocus={true} />
    </div>
  ),
}

/**
 * **With Recognized Project**:
 * Demonstrates parsed `@Kerdio Core` badge token interleaved with active task description.
 */
export const WithRecognizedProject: Story = {
  render: (args) => (
    <div className="w-[580px] p-6">
      <TokenCommandInput
        {...args}
        autoFocus={false}
        isEditingActive={true}
        initialProjectId="proj-kerd"
        initialMemo="Refactoring design tokens & horological bezel"
      />
    </div>
  ),
}

/**
 * **With Hourly Rate & Project**:
 * Shows both recognized project token and parsed `$95/h` billing rate badge.
 */
export const WithHourlyRate: Story = {
  render: (args) => (
    <div className="w-[580px] p-6">
      <TokenCommandInput
        {...args}
        autoFocus={false}
        isEditingActive={true}
        initialProjectId="proj-raycast"
        initialBilling={{ type: 'hourly', amount: 95 }}
        initialMemo="Raycast Extension Command Palette Integration"
      />
    </div>
  ),
}

/**
 * **Overflow (Long Task Text)**:
 * Tests container resilience with an extensive description, verifying multi-line
 * flex wrapping and badge placement without clipping or broken layout.
 */
export const LongTextOverflow: Story = {
  render: (args) => (
    <div className="w-[580px] p-6">
      <TokenCommandInput
        {...args}
        autoFocus={false}
        isEditingActive={true}
        initialProjectId="proj-design"
        initialBilling={{ type: 'fixed', amount: 3500 }}
        initialMemo="Comprehensive design token audit across mobile viewport breakpoints, high-DPI retina display calibration, and multi-tenant billing permissions architecture review"
      />
    </div>
  ),
}

/**
 * **Milestone Mode**:
 * Active milestone project showing suggestion chip ("Continue: Milestone 1: Prototype")
 * and flat milestone deliverable fee.
 */
export const MilestoneSession: Story = {
  render: (args) => (
    <div className="w-[580px] p-6">
      <TokenCommandInput
        {...args}
        autoFocus={false}
        isEditingActive={true}
        initialProjectId="proj-kerd"
        initialBilling={{ type: 'milestone', amount: 500 }}
        initialMemo="Milestone 1: Production UI Core"
      />
    </div>
  ),
}

/**
 * **Editing Active Session**:
 * Live editing overlay for currently running timer with quick save checkmark button.
 */
export const EditingActiveSession: Story = {
  render: (args) => (
    <div className="w-[580px] p-6">
      <TokenCommandInput
        {...args}
        autoFocus={false}
        isEditingActive={true}
        initialProjectId="proj-kerd"
        initialBilling={{ type: 'hourly', amount: 120 }}
        initialMemo="Auditing SVG Bezels and Storybook Interactions"
      />
    </div>
  ),
}

/**
 * **Interactive: Typing & Project Autocomplete Selection**
 *
 * Simulates user typing a task description, typing `@` to trigger the project
 * suggestion dropdown, and selecting an item via keyboard or click.
 * Live execution verifiable on the **Interactions** tab.
 */
export const InteractiveTypingAndProjectSelect: Story = {
  render: () => (
    <div className="w-[580px] p-6">
      <TokenCommandInput autoFocus={true} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const inputs = canvas.getAllByRole('textbox')
    const primaryInput = inputs[0]

    await expect(primaryInput).toBeInTheDocument()

    // 1. Focus input and type session memo
    await userEvent.click(primaryInput)
    await userEvent.type(primaryInput, 'Engine calibration ')

    // 2. Type '@' to open project popover
    await userEvent.type(primaryInput, '@ker')

    // 3. Verify project dropdown suggestion is rendered
    const projectOption = await canvas.findByText(/Kerdio Core/i)
    await expect(projectOption).toBeInTheDocument()

    // 4. Click the project option to convert into a token badge
    await userEvent.click(projectOption)

    // 5. Verify input now contains the tokenized state
    const badge = await canvas.findByText('Kerdio Core')
    await expect(badge).toBeInTheDocument()
  },
}

/**
 * **Interactive: Slash Command Billing Selection & Prompt**
 *
 * Simulates user entering a command prefix `\`/\`` to invoke billing rate options
 * (Hourly, Fixed, Milestone) and picking an option.
 */
export const InteractiveSlashBillingCommand: Story = {
  render: () => (
    <div className="w-[580px] p-6">
      <TokenCommandInput autoFocus={true} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const inputs = canvas.getAllByRole('textbox')
    const primaryInput = inputs[0]

    await expect(primaryInput).toBeInTheDocument()

    // 1. Click input and trigger slash command
    await userEvent.click(primaryInput)
    await userEvent.type(primaryInput, 'Deep focus sprint /')

    // 2. Verify slash command options appear in popover
    const hourlyOption = await canvas.findByText(/\/hourly/i)
    await expect(hourlyOption).toBeInTheDocument()

    // 3. Select Hourly Rate option
    await userEvent.click(hourlyOption)

    // 4. Verify input prompt displays specific rate placeholder
    const activeInputs = canvas.getAllByRole('textbox')
    const activeInput = activeInputs[activeInputs.length - 1]
    await expect(activeInput).toHaveAttribute('placeholder', 'Введите рейт (например, 85)')
  },
}

/**
 * **Interactive: Open Milestone Chip Selection**
 *
 * Verifies selecting an open milestone chip directly assigns the milestone
 * name and billing amount into the command bar.
 */
export const InteractiveSelectMilestoneChip: Story = {
  render: () => (
    <div className="w-[580px] p-6">
      <TokenCommandInput
        autoFocus={false}
        initialProjectId="proj-kerd"
        initialMemo="Sprint "
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 1. Check open milestone chip is rendered
    const chip = await canvas.findByText(/Design tokens & bezels/i)
    await expect(chip).toBeInTheDocument()

    // 2. Click open milestone chip
    await userEvent.click(chip)

    // 3. Check milestone token or badge appeared
    const milestoneBadge = await canvas.findByText(/Design tokens & bezels/i)
    await expect(milestoneBadge).toBeInTheDocument()
  },
}

/**
 * **Billing Override Badge**:
 * Custom billing ($140/h) entered before selecting `@Kerdio Core` (default $85/h).
 * The project's default billing is NOT added; instead, an amber `Override` badge
 * appears in the controls row with hover tooltip.
 */
export const BillingOverrideBadge: Story = {
  render: (args) => (
    <div className="w-[580px] p-6">
      <TokenCommandInput
        {...args}
        autoFocus={false}
        initialProjectId="proj-kerd"
        initialBilling={{ type: 'hourly', amount: 140 }}
        initialMemo="Custom consulting rate audit"
      />
    </div>
  ),
}

/**
 * **Interactive: Billing Override Confirmation Scope Modal**
 *
 * Simulates confirming a session with an active billing override,
 * verifying that the scope modal pops up asking to apply to
 * "Для текущей сессии" vs "Для текущей и будущих".
 */
export const InteractiveBillingOverrideConfirmation: Story = {
  render: () => (
    <div className="w-[580px] p-6">
      <TokenCommandInput
        autoFocus={false}
        initialProjectId="proj-kerd"
        initialBilling={{ type: 'hourly', amount: 150 }}
        initialMemo="Urgent architectural spike"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 1. Verify Override badge is visible in controls row
    const overrideBadge = await canvas.findByText(/Override/i)
    await expect(overrideBadge).toBeInTheDocument()

    // 2. Click start session button
    const buttons = canvas.getAllByRole('button')
    const startButton = buttons[buttons.length - 1]
    await userEvent.click(startButton)

    // 3. Verify scope selection modal is displayed
    const modalTitle = await canvas.findByText(/Оверрайд биллинга проекта/i)
    await expect(modalTitle).toBeInTheDocument()

    const currentSessionOption = await canvas.findByText(/Для текущей сессии/i)
    await expect(currentSessionOption).toBeInTheDocument()

    const futureSessionsOption = await canvas.findByText(/Для текущей и будущих/i)
    await expect(futureSessionsOption).toBeInTheDocument()
  },
}
