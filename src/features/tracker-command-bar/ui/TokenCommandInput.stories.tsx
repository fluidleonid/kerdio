import type { Meta, StoryObj } from "@storybook/react-vite"
import { within, userEvent, expect } from "@storybook/test"
import { TokenCommandInput } from "./TokenCommandInput"

const meta: Meta<typeof TokenCommandInput> = {
  title: "Features/Tracker Command Bar",
  component: TokenCommandInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
### Command Input Bar (US-1, US-2, US-4)

**User Story**: *As a freelancer, I want to type what I'm working on in a single command bar using \`@project\` and \`/hourly\` or \`/milestone\` tokens (or start with no project/rate at all), so that I can begin tracking in under 3 seconds.*

#### Anatomy & Typography Contract
1. **Glass Container**: Borderless \`bg-black/50 backdrop-blur-3xl\` with diffused drop shadow.
2. **Unified \`14px\` Scale**: Plain text, placeholders, and inline \`ProjectBadge\` / \`BillingBadge\` tokens all share \`14px\` (\`text-sm\`) for seamless inline reading.
3. **Clean Placeholder Wrapping**: Single-line placeholders (\`whitespace-nowrap\`) drop cleanly onto line 2 below badges instead of splitting awkwardly across two lines beside tags.
4. **Explicit Defaults**: Omitting \`@project\` saves under \`No project\`; omitting \`/\` billing starts as \`Non-billable\`. Picking a project never silently forces an hourly rate.
5. **Two-Step \`/milestone\` Flow**: Step 1 confirms milestone name on \`Enter\`; Step 2 asks for total payout on \`Enter\` and saves the milestone to the project.
6. **Minimalist Recent List**: Focusing an empty command bar reveals recent hourly rates and milestones in a borderless vertical list (\`bg-transparent\`, \`bg-white/15\` on hover/selection).

#### Keyboard Shortcuts
- \`@\`: Fuzzy project selector (+ pure-white \`Create project\` option).
- \`/\`: Billing selector (\`/hourly\`, \`/milestone\`, \`/none\`).
- \`Backspace\`: Removes preceding token badge when caret is at boundary.
- \`ArrowLeft\` / \`ArrowRight\`: Steps smoothly across inline badges.
- \`Enter\`: Confirms selection / advances milestone step / starts timer.
- \`Escape\`: Closes popover or cancels in-flight edit mode.
        `,
      },
    },
  },
  argTypes: {
    autoFocus: {
      description: "Automatically sets focus and caret to the trailing text input on mount.",
      control: "boolean",
      table: {
        category: "Behavior",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    isEditingActive: {
      description: "Puts the command bar into edit mode for an active running session (US-4).",
      control: "boolean",
      table: {
        category: "State",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    initialMemo: {
      description: "Initial text memo populated inside the task input.",
      control: "text",
      table: { category: "Content", type: { summary: "string" } },
    },
    initialProjectId: {
      description: "ID of pre-selected project token (`null` = No project).",
      control: "select",
      options: ["proj-kerd", "proj-raycast", "proj-design", null],
      table: { category: "Content", type: { summary: "string | null" } },
    },
    initialBilling: {
      description: "Pre-selected billing configuration (`hourly`, `milestone`, or `none`).",
      control: "object",
      table: { category: "Content", type: { summary: "BillingConfig | null" } },
    },
    className: {
      description: "Additional Tailwind CSS classes applied to root container.",
      control: "text",
      table: { category: "Appearance", type: { summary: "string" } },
    },
    onStart: {
      description: "Callback fired when a new tracking session is initiated.",
      action: "started",
      table: { category: "Events" },
    },
    onSaveActive: {
      description: "Callback fired when active session metadata is updated in-flight.",
      action: "saved",
      table: { category: "Events" },
    },
    onClose: {
      description: "Callback fired when closing/escaping edit mode.",
      action: "closed",
      table: { category: "Events" },
    },
  },
}

export default meta
type Story = StoryObj<typeof TokenCommandInput>

export const DefaultIdle: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**State: Idle (Unfocused)** · **US-1**: Clean standby bar displaying `What are you working on?` at `14px` alongside quick `@`, `/`, and Start triggers.",
      },
    },
  },
  render: (args) => (
    <div className="w-[580px] p-6">
      <TokenCommandInput {...args} autoFocus={false} />
    </div>
  ),
}

export const WithRecognizedProject: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**State: Project Token Only (Non-Billable)** · **US-1**: Selecting `@Kerdio Core` inserts only the project badge (`14px`) without forcing an hourly rate — ideal for non-billable project work.",
      },
    },
  },
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

export const WithHourlyRate: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**State: Project + Hourly Rate** · **US-1**: Interleaves `Raycast Extension` project badge and `$95/h` billing badge inline with the session memo. Per-session rate overrides are allowed freely with no confirmation modal.",
      },
    },
  },
  render: (args) => (
    <div className="w-[580px] p-6">
      <TokenCommandInput
        {...args}
        autoFocus={false}
        isEditingActive={true}
        initialProjectId="proj-raycast"
        initialBilling={{ type: "hourly", amount: 95 }}
        initialMemo="Extension Command Palette Integration"
      />
    </div>
  ),
}

export const MilestoneSession: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**State: Project + Milestone Token** · **US-2**: Displays the milestone badge (`[Flag] M 2 Token Command Palette · $2300`) where the milestone name truncates gracefully while the `$2300` payout stays always visible.",
      },
    },
  },
  render: (args) => (
    <div className="w-[580px] p-6">
      <TokenCommandInput
        {...args}
        autoFocus={false}
        isEditingActive={true}
        initialProjectId="proj-kerd"
        initialBilling={{
          type: "milestone",
          amount: 2300,
          milestoneName: "M 2 Token Command Palette",
        }}
        initialMemo="Two-step milestone entry & caret polish"
      />
    </div>
  ),
}

export const LongTextOverflow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**Edge Case: Long Multi-Line Memo** · **US-1**: Verifies flex-wrapping resilience and container integrity when a long task description follows project and billing badges.",
      },
    },
  },
  render: (args) => (
    <div className="w-[580px] p-6">
      <TokenCommandInput
        {...args}
        autoFocus={false}
        isEditingActive={true}
        initialProjectId="proj-design"
        initialBilling={{ type: "hourly", amount: 120 }}
        initialMemo="Comprehensive design token audit across mobile viewport breakpoints, high-DPI retina display calibration, and WCAG AA monochrome contrast verification"
      />
    </div>
  ),
}

export const EditingActiveSession: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**State: In-Flight Active Edit** · **US-4**: Opened when clicking the top session header during a running timer. Replaces the Start icon with a Save checkmark while preserving elapsed time.",
      },
    },
  },
  render: (args) => (
    <div className="w-[580px] p-6">
      <TokenCommandInput
        {...args}
        autoFocus={false}
        isEditingActive={true}
        initialProjectId="proj-kerd"
        initialBilling={{ type: "hourly", amount: 85 }}
        initialMemo="Auditing SVG Bezels and Storybook Interactions"
      />
    </div>
  ),
}

export const InteractiveTypingAndProjectSelect: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**Interactive Flow (US-1): `@` Project Autocomplete** — Types a memo, triggers `@ker`, selects `Kerdio Core` from the floating popover, and verifies conversion into an inline project token.",
      },
    },
  },
  render: () => (
    <div className="w-[580px] p-6">
      <TokenCommandInput autoFocus={false} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const inputs = canvas.getAllByRole("textbox")
    const primaryInput = inputs[0]

    await expect(primaryInput).toBeInTheDocument()
    await userEvent.click(primaryInput)
    await userEvent.type(primaryInput, "Engine calibration @ker")

    const projectOption = await canvas.findByText(/Kerdio Core/i)
    await expect(projectOption).toBeInTheDocument()
    await userEvent.click(projectOption)

    const badge = await canvas.findByText("Kerdio Core")
    await expect(badge).toBeInTheDocument()
  },
}

export const InteractiveSlashHourlyCommand: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**Interactive Flow (US-1): `/` Hourly Rate Entry** — Types `/` to open the billing command menu, picks `/hourly`, and verifies the inline rate prompt (`Rate (e.g. 85)`).",
      },
    },
  },
  render: () => (
    <div className="w-[580px] p-6">
      <TokenCommandInput autoFocus={false} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const inputs = canvas.getAllByRole("textbox")
    const primaryInput = inputs[0]

    await expect(primaryInput).toBeInTheDocument()
    await userEvent.click(primaryInput)
    await userEvent.type(primaryInput, "Deep focus sprint /")

    const hourlyOption = await canvas.findByText(/\/hourly/i)
    await expect(hourlyOption).toBeInTheDocument()
    await userEvent.click(hourlyOption)

    const activeInputs = canvas.getAllByRole("textbox")
    const activeInput = activeInputs[activeInputs.length - 1]
    await expect(activeInput).toHaveAttribute("placeholder", "Rate (e.g. 85)")
  },
}

export const InteractiveTwoStepMilestoneFlow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**Interactive Flow (US-2): Two-Step `/milestone` Creation** — Triggers `/milestone`, enters a milestone name (Step 1 → `Enter`), verifies the price prompt appears (Step 2), enters `1800` → `Enter`, and confirms the tokenized milestone badge.",
      },
    },
  },
  render: () => (
    <div className="w-[580px] p-6">
      <TokenCommandInput autoFocus={false} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const inputs = canvas.getAllByRole("textbox")
    const primaryInput = inputs[0]

    await userEvent.click(primaryInput)
    await userEvent.type(primaryInput, "/")

    const milestoneOption = await canvas.findByText(/\/milestone/i)
    await expect(milestoneOption).toBeInTheDocument()
    await userEvent.click(milestoneOption)

    const step1Inputs = canvas.getAllByRole("textbox")
    const nameInput = step1Inputs[step1Inputs.length - 1]
    await userEvent.type(nameInput, "M 3 Arc Engine{enter}")

    const step2Inputs = canvas.getAllByRole("textbox")
    const priceInput = step2Inputs[step2Inputs.length - 1]
    await userEvent.type(priceInput, "1800{enter}")

    await expect(await canvas.findByText(/M 3 Arc Engine/i)).toBeInTheDocument()
    await expect(await canvas.findByText(/\$1800/i)).toBeInTheDocument()
  },
}
