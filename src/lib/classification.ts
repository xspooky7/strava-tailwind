import { getPreciseDistance } from 'geolib'
import { THRESHHOLD } from '../../constants'
import { Segment } from '../../types'

/**
 * Classifies a segment according to predefinded metrics
 *
 * @param {Segment} segment
 * @returns {string[]} A maximum of 2 classifications for the given segment
 */

export const getClassification = (segment: Segment) => {
	const classification: string[] = []
	if (segment.hazardous) classification.push('Hazardous')
	if (getPreciseDistance(segment.start_latlng, segment.end_latlng) <= THRESHHOLD.CIRCUIT)
		classification.push('Circuit')
	const { path } = segment
	let totalWeightedBearingChange = 0
	let totalDistance = 0

	for (let i = 1; i < path.length; i++) {
		const previousSegment = path[i - 1]
		const currentSegment = path[i]

		// Calculate the absolute difference in bearings
		const bearingDifference = Math.abs(currentSegment.bearing - previousSegment.bearing)
		const adjustedDifference =
			bearingDifference > 180 ? 360 - bearingDifference : bearingDifference

		// Weight the bearing difference by the segment's distance
		totalWeightedBearingChange += adjustedDifference * currentSegment.distance
		totalDistance += currentSegment.distance
	}
	const averageBearingChange = totalWeightedBearingChange / totalDistance
	if (averageBearingChange > THRESHHOLD.CURVY) classification.push('Curvy')
	else if (averageBearingChange < THRESHHOLD.STRAIGHT) classification.push('Straight')
	const date = new Date(segment.created_at)
	const now = new Date()
	const diffInMs = now.getTime() - date.getTime()
	const daysSinceCreation = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
	if (segment.effort_count / daysSinceCreation <= THRESHHOLD.UNCONTESTET)
		classification.push('Uncontestet')
	else if (segment.effort_count >= THRESHHOLD.CONTESTET) classification.push('Contestet')
	if (segment.average_grade > THRESHHOLD.CLIMB) classification.push('Climb')
	else if (segment.average_grade < THRESHHOLD.DOWNHILL) classification.push('Downhill')
	if (segment.distance > THRESHHOLD.OVERLONG) classification.push('Overlong')
	return classification
}
