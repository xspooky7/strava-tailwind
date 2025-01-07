"use client"

import { use } from "react"

export function TotalKomCount({ komCount }: { komCount: Promise<number> }) {
  const count: number = use(komCount)
  return <span>{count}</span>
}
