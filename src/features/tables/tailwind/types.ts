import { TailwindTableSegment } from "@/lib/types/types"

type StatusStep = "fetch" | "update" | "process" | "weather" | "complete" | "error"
export interface StatusState {
  step: StatusStep
  data?: {
    segments?: TailwindTableSegment[]
  }
  error?: string
}
export interface Process {
  id: StatusStep
  name: string
  description: string
}
