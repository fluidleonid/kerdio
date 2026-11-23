import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/shared/ui"
import { ROUTES } from "@/shared/config"

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4 my-auto">
      <span aria-hidden="true" className="font-mono text-7xl font-extrabold text-white/25">
        404
      </span>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
        Page Not Found
      </h1>
      <p className="mt-2 text-sm text-[#F2F2F2] max-w-sm">
        The requested screen does not exist or has been moved.
      </p>
      <div className="mt-6">
        <Link to={ROUTES.TRACKER}>
          <Button className="gap-2 bg-[#C2410C] hover:bg-[#D44B12] text-white rounded-2xl h-10 px-5 cursor-pointer">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Tracker
          </Button>
        </Link>
      </div>
    </div>
  )
}
