import axios, { AxiosError } from 'axios'
import { getPath } from './get-path'
import { Segment } from '../../types'
import { getClassification } from './classification'
import { getFromDatabase, setDatabase } from './database'

/**
 * Gathers a detailed version of all currently starred segments using a database as cache to relieve API rates.
 *
 * @returns {Segment[]} Array of detailed segments.
 * @returns {number} Number of unique requests made to the Strava API.
 * @returns {number[]} ID list of segments which details couldn't be pulled (most likely due to API rates)
 * @returns {boolean} Flag if cache update succeeded.
 */

export const loadScript = async () => {
	let meteoRequestCount = 0,
		stravaRequestCount = 0

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
	const dbSegments: Segment[] = dbSegRequest ? dbSegRequest : []
	const ownedKomIds: number[] = dbOwnedKomsRequest ? dbOwnedKomsRequest : []

	// Fetching starred segments
	const stravaAuth = {
		Authorization: 'Bearer ' + stravaToken,
	}
	stravaRequestCount++
	const starredSegments = await axios({
		method: 'get',
		url: process.env.STRAVA_API + '/segments/starred?page=1&per_page=200',
		headers: stravaAuth,
	}).catch((err: AxiosError) => {
		throw new Error(
			`Error ${err.response!.status}: ${
				err.response!.statusText
			} - Couldn't retrieve starred segments from Strava`
		)
	})

	// Checking which of the starred segments are already cached
	const cachedSegments: Segment[] = []
	const overflowIds: number[] = []
	const newSegmentPromises: Promise<Segment | null>[] = []

	for (const starSeg of starredSegments.data) {
		const cachedSeg = dbSegments.find((dbSeg: Segment) => dbSeg.id === starSeg.id)
		if (cachedSeg) cachedSegments.push(cachedSeg)
		else {
			// Wrap getDetailedSegment in a promise that handles errors and returns null if it fails
			const segmentPromise = getDetailedSegment(starSeg.id, stravaAuth)
				.then((segment) => {
					stravaRequestCount++
					return segment
				})
				.catch((err) => {
					// Log the ID that failed
					overflowIds.push(starSeg.id)
					return null
				})

			newSegmentPromises.push(segmentPromise)
		}
	}

	const newSegments = (await Promise.all(newSegmentPromises)).filter(
		(segment): segment is Segment => segment !== null // Filter out any failed (null) segments
	)

	// Update the database (could make this update conditional)
	const mergedSegmentsForUpdate: Segment[] = cachedSegments.concat(newSegments)
	const updateStatus = setDatabase('tailwind/segments', mergedSegmentsForUpdate)

	const mergedSegmentsWeather: Segment[] = []
	//process.env.WEATHER_API_URL!
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
		overflowIds,
		updateStatus,
	}
}

/**
 *  Fetches the details for a newly added segment. Surpresses rate exceeding error.
 * @param {number} id - The segment id.
 * @param {object} auth - The auth header for Strava.
 * @returns {Segment} - A detailed segment with the decoded polyline path and a classification
 */

const getDetailedSegment = async (id: number, auth: object) => {
	const segmentRequest = await axios({
		method: 'get',
		url: `${process.env.STRAVA_API}/segments/${id}`,
		headers: auth,
	})
	const detailedSegment: Segment = {
		...segmentRequest.data,
		path: getPath(segmentRequest.data.map.polyline),
	}
	return {
		...detailedSegment,
		classification: getClassification(detailedSegment),
	}
}
