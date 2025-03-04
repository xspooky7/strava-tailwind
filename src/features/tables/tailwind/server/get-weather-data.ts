import { SegmentRecord } from "@/lib/types/pocketbase-types"
import { Line, TailwindTableSegment } from "@/lib/types/types"
import { processNewSegments } from "./update-database-segments"
import { calculateTailwind } from "./calculate-tailwind"

/*
 * Gets weather data for all segments and calculates tailwind metrics
 */
export async function fetchWeatherDataForSegments(
  tailwindSegments: (TailwindTableSegment & { path: Line[] })[],
  newSegments: SegmentRecord[]
) {
  // Process new segments and fetch weather data concurrently
  const [_, segmentsWithWeather]: [
    void,
    {
      results: TailwindTableSegment[]
      requestCount: number
    }
  ] = await Promise.all([processNewSegments(newSegments), calculateTailwind(tailwindSegments)])

  return {
    starredSegmentsWithWeather: segmentsWithWeather.results,
    requestCount: segmentsWithWeather.requestCount,
  }
}
