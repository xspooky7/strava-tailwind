"use client"

import { use, useEffect, useState } from "react"
import Confetti from "react-confetti"

export function ConfettiMaker({ komCount }: { komCount: Promise<number> }) {
  const [state, setState] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  })
  useEffect((): (() => void) | void => {
    const width = window.innerWidth
    const height = window.innerHeight

    setState({
      width,
      height,
    })
  }, [])
  const count: number = use(komCount)

  return count >= 4000 ? <Confetti width={state.width} height={state.height} /> : null
}
