import type { Preview } from "@storybook/react-vite"
import "@/app/styles/index.css"
import { TooltipProvider } from "@/shared/ui"
import { MemoryRouter } from "react-router-dom"

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const initialEntries = context.parameters?.router?.initialEntries || ["/"]
      return (
        <MemoryRouter initialEntries={initialEntries}>
          <TooltipProvider delayDuration={150}>
            <div className="font-sans antialiased text-white">
              <Story />
            </div>
          </TooltipProvider>
        </MemoryRouter>
      )
    },
  ],
  parameters: {
    layout: "padded",
    options: {
      storySort: {
        order: [
          "Introduction",
          ["Overview"],
          "Design System",
          ["Colors & Gradients", "Typography", "Glass & Shadows"],
          "Screens",
          ["Single-Day MVP Cockpit"],
          "Features",
          ["Chronograph", "Tracker Command Bar"],
          "Widgets",
          ["Tracker View", "Today Log Drawer"],
          "Shared",
          [
            "Tokens",
            ["Token Badges"],
            "UI Primitives",
            ["Button", "Input", "Badge", "Card", "Dialog", "Tooltip"],
          ],
          "Roadmap (Planned)",
          [
            "Navigation Sidebar",
            "Journal View",
            "Projects View",
            "Project Settings Dialog",
            "Reports View",
          ],
        ],
      },
    },
    backgrounds: {
      default: "terracotta-glow",
      values: [
        { name: "terracotta-glow", value: "#140501" },
        { name: "dark", value: "#0d0d0f" },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
  },
}

export default preview
