"use server"

import pb from "@/lib/pocketbase"
import { SessionData } from "@/app/auth/types"
import { fetchStarredSegments } from "./get-starred-segments"
import { processSegmentData } from "./process-new-segments"
import { unstable_cache as next_unstable_cache } from "next/cache"
import { fetchWeatherDataForSegments } from "./get-weather-data"

/**
 * Retrieves and processes tailwind data for all starred Strava segments
 *
 * @param session - User session data containing authentication information
 * @returns Array of TailwindTableSegment objects with calculated wind metrics or
 *          {data: []} on error
 *
 * This function coordinates the entire tailwind data processing pipeline:
 * 1. Authenticates the user and establishes database connection
 * 2. Fetches starred segments from Strava API
 * 3. Processes segment data, identifying new vs. existing segments
 * 4. Calculates tailwind metrics using current weather conditions
 *
 * Results are cached for 2 minutes.
 */

export async function getTailwindSegments(session: SessionData) {
  return await next_unstable_cache(
    async () => {
      try {
        if (!session.isLoggedIn || !session.userId || session.pbAuth == null) throw new Error("Couldn't authenticate!")
        pb.authStore.save(session.pbAuth)

        console.log("Page revalidate")
        let meteoRequestCount = 0,
          stravaRequestCount = 0,
          exceededRate = false

        // Step 1: Fetch starred segments from Strava
        const {
          stravaStarredList,
          dbKomEffortRecords,
          token,
          requestCount: step1RequestCount,
        } = await fetchStarredSegments()
        stravaRequestCount += step1RequestCount

        // Early return if no starred segments
        if (!stravaStarredList.length) return []

        // Step 2: Process segment data and identify new segments
        const {
          newSegments,
          tailwindSegments,
          requestCount: step2RequestCount,
          exceededRateLimit,
        } = await processSegmentData(stravaStarredList, dbKomEffortRecords, token)

        stravaRequestCount += step2RequestCount
        exceededRate = exceededRateLimit

        // Step 3: Fetch weather data and calculate tailwind
        const { starredSegmentsWithWeather, requestCount: step3RequestCount } = await fetchWeatherDataForSegments(
          tailwindSegments,
          newSegments
        )

        meteoRequestCount += step3RequestCount

        console.log(
          `Tailwind data processing complete. Strava requests: ${stravaRequestCount}, Meteo requests: ${meteoRequestCount}`
        ) // TODO
        return starredSegmentsWithWeather
      } catch (_err) {
        return { data: [] }
      }
    },
    [],
    {
      revalidate: 120,
      tags: ["tailwind-table"],
    }
  )()
}
