import axios from "axios"
import { getPath } from "./get-path"
import { getLabel } from "./get-label"

/**
 * Fetches the details for a newly added segment. Surpresses rate exceeding error.
 * @param {number} id - The segment id.
 * @param {object} auth - The auth header for Strava.
 * @returns {DetailedSegment} - A detailed segment with the decoded polyline path and a label
 */

export const getDetailedSegment = async (id: number, auth: object): Promise<any> => {
  const segmentRequest = await axios({
    method: "get",
    url: `${process.env.STRAVA_API}/segments/${id}`,
    headers: auth,
  })
  const detailedSegment: any = {
    ...segmentRequest.data,
    path: getPath(segmentRequest.data.map.polyline),
  }
  return {
    ...detailedSegment,
    labels: getLabel(detailedSegment),
  }
}
