import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Input } from '@/shared/ui'
import { Play, Check, Trash2, Plus } from 'lucide-react'

const meta: Meta = {
  title: 'Shared/UIPrimitives',
  parameters: {
    layout: 'centered',
  },
}

export default meta

export const Buttons: StoryObj = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4 p-8 bg-black/40 rounded-3xl backdrop-blur-3xl">
      <Button className="rounded-full bg-orange-600 hover:bg-orange-500 text-white gap-2">
        <Play className="h-4 w-4" /> Start Session
      </Button>
      <Button variant="outline" className="rounded-full gap-2">
        <Check className="h-4 w-4" /> Save
      </Button>
      <Button variant="ghost" className="rounded-full text-white/70 hover:text-white">
        Cancel
      </Button>
      <Button variant="destructive" size="sm" className="gap-2">
        <Trash2 className="h-4 w-4" /> Delete
      </Button>
      <Button size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  ),
}

export const GlassInput: StoryObj = {
  render: () => (
    <div className="w-[380px] space-y-4 p-8 bg-black/40 rounded-3xl backdrop-blur-3xl">
      <div>
        <label className="text-xs font-semibold text-white/80 block mb-1.5">Project Name</label>
        <Input placeholder="e.g. Kerdio Core" defaultValue="Kerdio Brand" />
      </div>
      <div>
        <label className="text-xs font-semibold text-white/80 block mb-1.5">Task Note</label>
        <Input placeholder="What did you work on?" />
      </div>
    </div>
  ),
}
