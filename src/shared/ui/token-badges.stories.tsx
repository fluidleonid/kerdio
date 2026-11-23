import type { Meta, StoryObj } from "@storybook/react-vite"
import { ProjectBadge, BillingBadge } from "./token-badges"

const meta: Meta = {
  title: "Shared/Tokens/Token Badges",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Uniform-height (h-7, max-w-[160px]) optical-glass badges for projects and billing modes. Project badges omit the @ prefix by default; milestone badges truncate the name while keeping the payout amount visible.",
      },
    },
  },
}

export default meta

export const InteractiveProjectBadge: StoryObj<{
  name: string
  color: string
  hasRemove: boolean
  disabled: boolean
  loading: boolean
}> = {
  argTypes: {
    name: { control: "text", table: { category: "Content" } },
    color: { control: "color", table: { category: "Appearance" } },
    hasRemove: { control: "boolean", table: { category: "Content" } },
    disabled: { control: "boolean", table: { category: "State" } },
    loading: { control: "boolean", table: { category: "State" } },
  },
  args: {
    name: "Kerdio Core",
    color: "#E25822",
    hasRemove: true,
    disabled: false,
    loading: false,
  },
  render: (args) => (
    <div className="p-8 bg-black/50 rounded-3xl backdrop-blur-2xl flex items-center justify-center">
      <ProjectBadge
        project={{ name: args.name, color: args.color }}
        onRemove={args.hasRemove ? () => {} : undefined}
        disabled={args.disabled}
        loading={args.loading}
        onClick={() => {}}
      />
    </div>
  ),
}

export const ProjectBadgesStates: StoryObj = {
  render: () => (
    <div className="max-w-2xl p-6 bg-black/50 rounded-3xl backdrop-blur-2xl space-y-5">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-1">
          Project Badge States
        </h3>
        <p className="text-xs text-[#B8B8B8]">
          Uniform h-7, max-w-[160px] truncation, no @ prefix, plus No project fallback
        </p>
      </div>

      <div className="flex flex-wrap gap-2.5 items-center">
        <ProjectBadge project={{ name: "Kerdio Core", color: "#E25822" }} onRemove={() => {}} />
        <ProjectBadge
          project={{ name: "Very Long Client Project Name Truncated", color: "#10B981" }}
          onRemove={() => {}}
        />
        <ProjectBadge project={{ name: "Read-only Tag", color: "#F97316" }} />
        <ProjectBadge
          project={{ name: "Syncing...", color: "#F59E0B" }}
          loading={true}
          onRemove={() => {}}
        />
        <ProjectBadge
          project={{ name: "Archived", color: "#9A9A9A" }}
          disabled={true}
          onRemove={() => {}}
        />
        <span className="inline-flex h-7 max-w-[160px] items-center gap-1.5 px-3 rounded-full text-xs font-medium leading-none bg-white/10 text-[#DCDCDC]">
          No project
        </span>
      </div>
    </div>
  ),
}

export const BillingBadgesStates: StoryObj = {
  render: () => (
    <div className="max-w-2xl p-6 bg-black/50 rounded-3xl backdrop-blur-2xl space-y-5">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-1">
          Billing Token States
        </h3>
        <p className="text-xs text-[#B8B8B8]">
          Hourly, Milestone (truncated name with always-visible $ amount inside 160px), Non-billable
        </p>
      </div>

      <div className="flex flex-wrap gap-2.5 items-center">
        <BillingBadge billingType="hourly" amount={85} onRemove={() => {}} onClick={() => {}} />
        <BillingBadge
          billingType="milestone"
          milestoneName="M 1 Design phase 1"
          amount={2300}
          onRemove={() => {}}
          onClick={() => {}}
        />
        <BillingBadge
          billingType="milestone"
          milestoneName="M 2 Extremely Long Milestone Title Name"
          amount={5550}
          onRemove={() => {}}
        />
        <BillingBadge billingType="none" onRemove={() => {}} onClick={() => {}} />
        <BillingBadge billingType="hourly" amount={95} loading={true} onRemove={() => {}} />
        <BillingBadge billingType="hourly" amount={85} disabled={true} onRemove={() => {}} />
      </div>
    </div>
  ),
}
