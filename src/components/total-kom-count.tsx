"use client"

import { use } from "react"
import { KomTimeseriesRecord } from "../../pocketbase-types"

export function TotalKomCount({ timeSeriesPromise }: { timeSeriesPromise: Promise<KomTimeseriesRecord> }) {
  const timeSeries: KomTimeseriesRecord = use(timeSeriesPromise)
  return <span>{timeSeries.amount}</span>
}
