import { NextResponse } from "next/server"
import { fetchWeatherApi } from "openmeteo"
import { Coordinate, Line, WeatherResponse } from "../../../../types"
import { WEATHER_QUERY_INTERVAL } from "../../../../constants"

/**
 * Takes a polyline and transforms it into an array of lines
 *
 * @param {Line []} path - The segment.
 * @returns {WeatherResponse} - An object holding respective weather data for the segment
 */

export async function POST(req: Request) {
  const path: Line[] = await req.json()
  let meteoRequests = 0
  const aggregateDistance: number = path.reduce((prev, curr) => prev + curr.distance, 0)
  const meteoRequestPromises = []

  const ranges = createRanges(aggregateDistance, Math.ceil(aggregateDistance / WEATHER_QUERY_INTERVAL))

  let range = 0,
    d = 0
  let queryFlag = false
  for (let i = 0; i < path.length; i++) {
    d += path[i].distance
    if (!queryFlag && d >= (ranges[range][0] + ranges[range][1]) / 2) {
      meteoRequestPromises.push(meteoRequest(path[i].end))
      meteoRequests++
      queryFlag = true
    }
    if (d >= ranges[range][1]) {
      range = Math.min(ranges.length - 1, range + 1)
      queryFlag = false
    }
    path[i].weatherRef = range
  }

  const weatherData = await Promise.all(meteoRequestPromises)

  let tailAbs = 0,
    crossAbs = 0,
    headAbs = 0,
    aggregateWindspeed = 0

  for (let i = 0; i < path.length; i++) {
    const line: Line = path[i]
    const angleDifference = Math.abs(line.bearing - weatherData[line.weatherRef!].current.windDirection10m)

    if (angleDifference <= 45) {
      tailAbs += line.distance
      aggregateWindspeed += line.distance * weatherData[line.weatherRef!].current.windSpeed10m
    } else if (angleDifference <= 135) crossAbs += line.distance
    else headAbs += line.distance

    line.windDirection = angleDifference
  }

  const tail = (tailAbs / aggregateDistance) * 100
  const cross = (crossAbs / aggregateDistance) * 100
  const head = (headAbs / aggregateDistance) * 100
  const avgTailwindSpeed = aggregateWindspeed / tailAbs
  //console.log('***WEATHER***')
  //console.log(`Tailwind: ${tail}% - Crosswind: ${cross}% - Headwind: ${head}%`)

  const response: WeatherResponse = {
    path,
    wind: {
      tail,
      cross,
      head,
      avgTailwindSpeed,
    },
    meteoRequests,
  }
  return NextResponse.json(response)
}

/**
 * Takes a coordinate pair and queries open-meteo for weather data
 *
 * @param {Coordinate} coord - Coordinates for the API.
 * @returns {Object} - Weather data by open-meteo.
 */

const meteoRequest = async (coord: Coordinate) => {
  const params = {
    latitude: coord[0],
    longitude: coord[1],
    current: ["temperature_2m", "weather_code", "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m"],
    timezone: "Europe/Berlin",
    forecast_days: 1,
  }
  const url = "https://api.open-meteo.com/v1/forecast"
  const responses = await fetchWeatherApi(url, params)
  const response = responses[0]

  const utcOffsetSeconds = response.utcOffsetSeconds()
  const timezone = response.timezone()
  const timezoneAbbreviation = response.timezoneAbbreviation()
  const latitude = response.latitude()
  const longitude = response.longitude()

  const current = response.current()!

  // Note: The order of weather variables in the URL query and the indices below need to match!
  return {
    current: {
      time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
      temperature2m: current.variables(0)!.value(),
      weatherCode: current.variables(1)!.value(),
      windSpeed10m: current.variables(2)!.value(),
      windDirection10m: current.variables(3)!.value(),
      windGusts10m: current.variables(4)!.value(),
    },
  }
}

/**
 * Takes an inital range x and creates n sub ranges
 *
 * @param {number} x - The intial range.
 * @param {number} n - Amount of sub ranges.
 * @returns {[number, number][]} - An array of sub ranges
 */

const createRanges = (x: number, n: number): [number, number][] => {
  const interval = x / n
  const ranges: [number, number][] = []

  for (let i = 0; i < n; i++) {
    const start = i * interval
    const end = (i + 1) * interval
    ranges.push([start, end])
  }

  return ranges
}
