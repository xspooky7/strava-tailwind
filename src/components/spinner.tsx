import { Loader } from "lucide-react"

export const Spinner = ({ size }: { size: number }) => {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader size={size} className="animate-spin text-muted-foreground" />
    </div>
  )
}
