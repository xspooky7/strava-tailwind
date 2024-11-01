import axios from 'axios'
import { DetailedSegment } from '../../types'
import { getPath } from './get-path'
import { getLabel } from './get-label'

/**
 * Fetches the details for a newly added segment. Surpresses rate exceeding error.
 * @param {number} id - The segment id.
 * @param {object} auth - The auth header for Strava.
 * @returns {DetailedSegment} - A detailed segment with the decoded polyline path and a label
 */

export const getDetailedSegment = async (id: number, auth: object): Promise<DetailedSegment> => {
	const segmentRequest = await axios({
		method: 'get',
		url: `${process.env.STRAVA_API}/segments/${id}`,
		headers: auth,
	})
	const detailedSegment: DetailedSegment = {
		...segmentRequest.data,
		path: getPath(segmentRequest.data.map.polyline),
	}
	return {
		...detailedSegment,
		labels: getLabel(detailedSegment),
	}
}
