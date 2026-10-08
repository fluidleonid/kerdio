import type { Preview } from '@storybook/react-vite'
import '@/app/styles/index.css'
import { TooltipProvider } from '@/shared/ui'
import { MemoryRouter } from 'react-router-dom'

const preview: Preview = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <TooltipProvider delayDuration={150}>
          <div className="font-sans antialiased text-white">
            <Story />
          </div>
        </TooltipProvider>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0d0d0f' },
        { name: 'terracotta-glow', value: '#140501' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
}

export default preview