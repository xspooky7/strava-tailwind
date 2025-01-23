import { Loader } from "lucide-react"

export const Spinner = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader className="size-6 animate-spin text-muted-foreground" />
    </div>
  )
}
