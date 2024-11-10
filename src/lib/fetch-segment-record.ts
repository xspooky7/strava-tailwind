import axios from "axios"
import { getPath } from "./get-path"
import { getLabel } from "./get-label"
import { sanatizeSegment } from "@/app/api/update/sanatize"
import { SegmentRecord } from "../../pocketbase-types"

/**
 * Fetches the details for a newly added segment. Surpresses rate exceeding error.
 * @param {number} id - The segment id.
 * @param {string} token - The auth header for Strava.
 * @returns {SegmentRecord} - A detailed segment with the decoded polyline path and a label
 */

export const fetchNewSegmentRecord = async (id: number, token: string): Promise<SegmentRecord> => {
  const segmentRequest = await axios({
    method: "get",
    url: `${process.env.STRAVA_API}/segments/${id}`,
    headers: {
      Authorization: "Bearer " + token,
    },
  })
  const detailedSegment: any = {
    ...segmentRequest.data,
    path: getPath(segmentRequest.data.map.polyline),
  }
  return sanatizeSegment({ ...detailedSegment, labels: getLabel(detailedSegment) })
}
