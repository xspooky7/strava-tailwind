import { Loader } from "lucide-react"

export const Spinner = ({ size }: { size: number }) => {
  return <Loader size={size} className="animate-spin text-muted-foreground" />
}
