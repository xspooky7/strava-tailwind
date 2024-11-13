import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const asError = (thrown: unknown): Error => {
  if (thrown instanceof Error) return thrown
  try {
    return new Error(JSON.stringify(thrown))
  } catch {
    return new Error(String(thrown))
  }
}
