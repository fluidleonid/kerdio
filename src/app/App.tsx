import { BrowserRouter } from "react-router-dom"
import { ThemeProvider } from "./providers/theme-provider"
import { TooltipProvider } from "@/shared/ui"
import { AppRouter } from "./routes"

export function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider delayDuration={150}>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App
