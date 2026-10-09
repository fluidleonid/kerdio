import type { Meta, StoryObj } from '@storybook/react-vite'
import { ProjectBadge, BillingBadge } from './token-badges'

/**
 * # Token Badges
 *
 * Micro-components representing contextual tokens, projects, and billing models
 * across the Kerdio workspace, command palette, and time tracker.
 *
 * ### Design System Anatomy
 * - **Project Badge**: Encapsulates client identity with a colored status bead or loading spinner, clean typography, and optional dismiss action.
 * - **Billing Badge**: Communicates financial terms (hourly yield, fixed contract, milestone) with semantic Lucide icons (`Clock`, `Briefcase`, `Flag`, `ShieldOff`).
 * - **Micro-Interactions**: Subtle glass translucency (`bg-white/10`), smooth hover brightening, and tactile active depressions.
 */
const meta: Meta = {
  title: 'Shared/Tokens/Token Badges',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Token Badges

Engineered in the style of Linear and Raycast design systems. Badges provide compact, readable metadata chips inside input bars, task tables, and metric cards.

#### Key Features
1. **Semantic Color Bezel**: Custom color beads matching client brand hex codes.
2. **Contextual Icons**: Auto-rendered Lucide icons matching billing classification.
3. **Interactive & Dismissible**: Smooth hover transitions, tactile active scale, and keyboard-accessible tooltip removal.
4. **States Matrix**: Fully covers Default, Hover, Active, Disabled, and Loading with animated micro-spinners.
        `,
      },
    },
  },
}

export default meta

/**
 * **Interactive Project Badge**:
 * Configurable playground for the ProjectBadge component with full controls.
 */
export const InteractiveProjectBadge: StoryObj<{
  name: string
  color: string
  showAtPrefix: boolean
  hasRemove: boolean
  disabled: boolean
  loading: boolean
}> = {
  argTypes: {
    name: {
      description: 'Project title displayed on the badge.',
      control: 'text',
      defaultValue: 'Kerdio Core',
    },
    color: {
      description: 'Project brand hex color dot.',
      control: 'color',
      defaultValue: '#E25822',
    },
    showAtPrefix: {
      description: 'Prefix name with @ symbol.',
      control: 'boolean',
      defaultValue: false,
    },
    hasRemove: {
      description: 'Show interactive dismiss button.',
      control: 'boolean',
      defaultValue: true,
    },
    disabled: {
      description: 'Disabled non-interactive state.',
      control: 'boolean',
      defaultValue: false,
    },
    loading: {
      description: 'Loading state with animated spinner replacing color bead.',
      control: 'boolean',
      defaultValue: false,
    },
  },
  args: {
    name: 'Kerdio Core',
    color: '#E25822',
    showAtPrefix: false,
    hasRemove: true,
    disabled: false,
    loading: false,
  },
  render: (args) => (
    <div className="p-8 bg-black/40 rounded-3xl backdrop-blur-2xl border border-white/5 flex items-center justify-center">
      <ProjectBadge
        project={{ name: args.name, color: args.color }}
        showAtPrefix={args.showAtPrefix}
        onRemove={args.hasRemove ? () => {} : undefined}
        disabled={args.disabled}
        loading={args.loading}
        onClick={() => {}}
      />
    </div>
  ),
}

/**
 * **Project Badges States Gallery**:
 * Demonstrates all states: Default, Hover, Active, Disabled, Loading, With & Without Remove action.
 */
export const ProjectBadgesStates: StoryObj = {
  render: () => (
    <div className="max-w-2xl p-6 bg-black/40 rounded-3xl backdrop-blur-2xl border border-white/5 space-y-6">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-orange-400 mb-1">
          Project Badge States
        </h3>
        <p className="text-xs text-[#806060]">
          Standard, Interactive, Disabled, and Async Loading states
        </p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        {/* Default */}
        <ProjectBadge
          project={{ name: 'Default State', color: '#E25822' }}
          onRemove={() => {}}
        />

        {/* With @ Prefix */}
        <ProjectBadge
          project={{ name: 'Kerdio Core', color: '#E25822' }}
          showAtPrefix={true}
          onRemove={() => {}}
        />

        {/* Interactive Clickable (Hover / Active) */}
        <ProjectBadge
          project={{ name: 'Clickable (Hover/Active)', color: '#3B82F6' }}
          onClick={() => {}}
          onRemove={() => {}}
        />

        {/* Read-only (No remove button) */}
        <ProjectBadge
          project={{ name: 'Read-only Tag', color: '#10B981' }}
        />

        {/* Loading */}
        <ProjectBadge
          project={{ name: 'Syncing Project...', color: '#F59E0B' }}
          loading={true}
          onRemove={() => {}}
        />

        {/* Disabled */}
        <ProjectBadge
          project={{ name: 'Archived / Disabled', color: '#6B7280' }}
          disabled={true}
          onRemove={() => {}}
        />
      </div>

      <div className="pt-2 border-t border-white/5">
        <h4 className="text-xs font-semibold text-white/70 mb-2">Color Palette Adaptation</h4>
        <div className="flex flex-wrap gap-2.5">
          <ProjectBadge project={{ name: 'Terracotta Core', color: '#E25822' }} />
          <ProjectBadge project={{ name: 'Amber Studio', color: '#F59E0B' }} />
          <ProjectBadge project={{ name: 'Emerald Fin', color: '#10B981' }} />
          <ProjectBadge project={{ name: 'Indigo Cloud', color: '#6366F1' }} />
          <ProjectBadge project={{ name: 'Fuchsia Media', color: '#D946EF' }} />
        </div>
      </div>
    </div>
  ),
}

/**
 * **Billing Badges States Gallery**:
 * Demonstrates all billing types (Hourly, Fixed, Milestone, Non-billable) across states.
 */
export const BillingBadgesStates: StoryObj = {
  render: () => (
    <div className="max-w-2xl p-6 bg-black/40 rounded-3xl backdrop-blur-2xl border border-white/5 space-y-6">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-orange-400 mb-1">
          Billing Token States
        </h3>
        <p className="text-xs text-[#806060]">
          Hourly rates, Fixed budgets, Milestones, and Non-billable work
        </p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        {/* Hourly */}
        <BillingBadge
          billingType="hourly"
          amount={125}
          onRemove={() => {}}
          onClick={() => {}}
        />

        {/* Fixed Fee */}
        <BillingBadge
          billingType="fixed"
          amount={3500}
          onRemove={() => {}}
          onClick={() => {}}
        />

        {/* Milestone */}
        <BillingBadge
          billingType="milestone"
          amount={850}
          onRemove={() => {}}
          onClick={() => {}}
        />

        {/* Non-billable */}
        <BillingBadge
          billingType="none"
          onRemove={() => {}}
          onClick={() => {}}
        />

        {/* Loading State */}
        <BillingBadge
          billingType="hourly"
          amount={95}
          loading={true}
          onRemove={() => {}}
        />

        {/* Disabled State */}
        <BillingBadge
          billingType="fixed"
          amount={2000}
          disabled={true}
          onRemove={() => {}}
        />

        {/* Without Remove Action */}
        <BillingBadge
          billingType="hourly"
          amount={85}
        />
      </div>
    </div>
  ),
}
