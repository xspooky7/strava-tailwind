import { AxiosError } from 'axios'
import { DetailedSegment } from '../../types'
import { getFromDatabase, setDatabase } from './database'
import { getDetailedSegment } from './get-detailed-segment'

/**
 * Gathers a detailed version of all currently starred segments using a database as cache to relieve API rates.
 *
 * @returns {DetailedSegment[]} Array of detailed segments.
 * @returns {number} Number of unique requests made to the Strava API.
 * @returns {number[]} ID list of segments which details couldn't be pulled (most likely due to API rates)
 * @returns {boolean} Flag if cache update succeeded.
 */

export const loadScript = async () => {
	let meteoRequestCount = 0,
		stravaRequestCount = 0,
		exceededRate = false

	// Fetching stored access token and cached segments
	const [dbSegRequest, stravaToken, dbOwnedKomsRequest] = await Promise.all([
		getFromDatabase('tailwind/segments').catch((err: AxiosError) => {
			throw new Error(
				`Error ${err.response!.status}: ${
					err.response!.statusText
				} - Couldn't retrieve segments from the database`
			)
		}),
		getFromDatabase('token/access').catch((err: AxiosError) => {
			throw new Error(
				`Error ${err.response!.status}: ${
					err.response!.statusText
				} - Couldn't retrieve acesss token from the database`
			)
		}),
		getFromDatabase('ids').catch((err: AxiosError) => {
			throw new Error(
				`Error ${err.response!.status}: ${
					err.response!.statusText
				} - Couldn't retrieve owned KOMs from the database`
			)
		}),
	])
	const dbSegments: DetailedSegment[] = dbSegRequest ? dbSegRequest : []
	const ownedKomIds: number[] = dbOwnedKomsRequest ? dbOwnedKomsRequest : []

	// Fetching starred segments
	const stravaAuth = {
		Authorization: 'Bearer ' + stravaToken,
	}
	stravaRequestCount++
	const starredSegmentsRequest = await fetch(
		process.env.STRAVA_API + '/segments/starred?page=1&per_page=200',
		{
			method: 'GET',
			headers: stravaAuth,
			next: { revalidate: 600 },
		}
	).catch((err) => {
		throw new Error(`Error 401: Couldn't retrieve starred segments from Strava`)
	})
	const starredSegments = await starredSegmentsRequest.json()

	// Checking which of the starred segments are already cached
	const cachedSegments: DetailedSegment[] = []
	let newSegments: DetailedSegment[] = []
	const newSegmentPromises: Promise<DetailedSegment>[] = []

	for (const starSeg of starredSegments) {
		const cachedSeg = dbSegments.find((dbSeg: DetailedSegment) => dbSeg.id === starSeg.id)
		if (cachedSeg) cachedSegments.push(cachedSeg)
		else newSegmentPromises.push(getDetailedSegment(starSeg.id, stravaAuth))
	}

	const settledSegmentPromises = await Promise.allSettled(newSegmentPromises)
	newSegments = settledSegmentPromises
		.filter((val) => {
			const isFullfilled = val.status === 'fulfilled'
			if (!isFullfilled) exceededRate = true
			else stravaRequestCount++
			return isFullfilled
		})
		.map((obj) => obj.value)

	// Update the database (could make this update conditional)
	const mergedSegmentsForUpdate: DetailedSegment[] = cachedSegments.concat(newSegments)
	const updateStatus = await setDatabase('tailwind/segments', mergedSegmentsForUpdate)

	const mergedSegmentsWeather: DetailedSegment[] = []
	for (const segment of mergedSegmentsForUpdate) {
		const isOwnedKom = ownedKomIds.includes(segment.id)
		const weatherResponse = await fetch(process.env.WEATHER_API_URL!, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
			},
			body: JSON.stringify(segment.path),
			next: { revalidate: 1800 },
		})
		const { meteoRequests, ...weatherData } = await weatherResponse.json()
		meteoRequestCount += meteoRequests
		mergedSegmentsWeather.push({ ...segment, ...weatherData, isOwnedKom })
	}

	return {
		segments: mergedSegmentsWeather,
		stravaRequestCount,
		meteoRequestCount,
		exceededRate,
		updateStatus: updateStatus === 200,
	}
}
