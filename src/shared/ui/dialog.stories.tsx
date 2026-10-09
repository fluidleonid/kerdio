import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog'
import { Button } from './button'
import { Input } from './input'
import { Trash2, AlertTriangle } from 'lucide-react'

/**
 * # Dialog Component
 *
 * Accessible modal primitive built upon Radix UI Dialog primitives,
 * styled to match the Card optical glass tier (`bg-black/50`, `backdrop-blur-3xl`, `shadow-[0_20px_50px_rgba(0,0,0,0.35)]`).
 *
 * ### Anatomy & Specifications
 * - **Overlay**: Translucent `bg-black/40` backdrop with subtle `backdrop-blur-sm` blurring background surfaces.
 * - **Content Frame**: Floating rounded modal (`rounded-3xl`) with smooth entrance/exit zoom animations.
 * - **Header**: High-contrast title (`text-lg font-bold`) and explanatory description (`text-[#806060]`).
 * - **Footer**: Responsive action controls with primary submission and secondary cancel triggers.
 */
const meta: Meta = {
  title: 'Shared/UI Primitives/Dialog',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
### Optical Glass Dialog

Production modal system ensuring parity with Kerdio card and panel aesthetics. Includes focus traps, escape dismissal, and smooth backdrop transitions.

#### Subcomponents
- \`Dialog\`: State controller root (Radix UI).
- \`DialogContent\`: Modal container with glassmorphic backdrop filter and ambient shadow.
- \`DialogHeader\`, \`DialogTitle\`, \`DialogDescription\`: Semantic typography headers.
- \`DialogFooter\`: Standard actions alignment container.
        `,
      },
    },
  },
}

export default meta
type Story = StoryObj

/**
 * **Default State**:
 * Standard interactive configuration dialog.
 */
export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <div className="p-8 flex flex-col items-center gap-4">
        <Button onClick={() => setOpen(true)} className="rounded-full bg-orange-600 hover:bg-orange-500 text-white">
          Open Configuration Dialog
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Project Configuration</DialogTitle>
              <DialogDescription>
                Card-parity glassmorphism dialog with 50% optical tint and 64px deep blur.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">Project Name</label>
                <Input placeholder="e.g. Kerdio Core" defaultValue="Kerdio Brand Design" />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/80 block mb-1">Hourly Rate ($/h)</label>
                <Input type="number" defaultValue="95" />
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-full">
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)} className="rounded-full bg-orange-600 hover:bg-orange-500 text-white">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  },
}

/**
 * **Confirmation / Destructive Dialog**:
 * Modal safeguarding irreversible destructive actions such as deleting projects or discarding sessions.
 */
export const DestructiveConfirmation: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <div className="p-8 flex flex-col items-center gap-4">
        <Button variant="destructive" onClick={() => setOpen(true)} className="rounded-full">
          <Trash2 className="h-4 w-4 mr-2" /> Delete Project
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="h-10 w-10 rounded-2xl bg-destructive/20 text-destructive flex items-center justify-center mb-2">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <DialogTitle>Delete Project Confirmation</DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete this project? All associated sessions, milestone logs, and billing history will be discarded.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-full">
                Keep Project
              </Button>
              <Button variant="destructive" onClick={() => setOpen(false)} className="rounded-full">
                Confirm Deletion
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  },
}

/**
 * **Loading / Submitting State**:
 * Dialog in active submission state with animated loading button and disabled inputs.
 */
export const LoadingState: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <div className="p-8 flex flex-col items-center gap-4">
        <Button onClick={() => setOpen(true)} className="rounded-full bg-orange-600 hover:bg-orange-500 text-white">
          Simulate Submitting Dialog
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Syncing Remote Workspace</DialogTitle>
              <DialogDescription>
                Committing session parameters to cloud storage.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <Input disabled defaultValue="Synchronizing 24 tracked intervals..." />
            </div>

            <DialogFooter>
              <Button disabled variant="ghost" className="rounded-full">
                Cancel
              </Button>
              <Button loading={true} className="rounded-full bg-orange-600 text-white">
                Synchronizing...
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  },
}
