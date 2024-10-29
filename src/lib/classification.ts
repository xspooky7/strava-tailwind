import { getPreciseDistance } from 'geolib'
import { THRESHHOLD } from '../../constants'
import { Line, Segment } from '../../types'

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
	let aggregateDistance = path[0].distance
	let maxBearingChange = 0,
		weightedBearingChange = 0

	for (let i = 1; i < path.length; i++) {
		const previousPath = path[i - 1]
		const currentPath = path[i]

		const bearingChange = Math.abs(currentPath.bearing - previousPath.bearing)
		const adjustedChange = bearingChange > 180 ? 360 - bearingChange : bearingChange

		weightedBearingChange += adjustedChange

		aggregateDistance += currentPath.distance
		maxBearingChange = Math.max(maxBearingChange, adjustedChange)
	}
	//const averageBearingChange = weightedBearingChange / aggregateDistance
	const curveAmount = pathCurveAmount(segment.path)
	if (curveAmount >= 3 && curveAmount / aggregateDistance > THRESHHOLD.CURVY / 1000) {
		classification.push('Curvy')
	} else if (maxBearingChange < THRESHHOLD.STRAIGHT) {
		classification.push('Straight')
	}
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

const pathCurveAmount = (path: Line[], angleThreshold = 60): number => {
	const maxCurveLength = 50 // m
	let curveAmount = 0
	let currentCurveDist = 0
	let avgWeightedBearing = 0

	const smoothedPath = path //smoothBearings(path)
	for (let i = 0; i < smoothedPath.length - 1; i++) {
		const initialBearing = smoothedPath[i].bearing
		let j = i + 1
		while (j < smoothedPath.length - 1 && currentCurveDist < maxCurveLength) {
			const bearingChange = Math.abs(initialBearing - smoothedPath[j].bearing)
			avgWeightedBearing +=
				(bearingChange > 180 ? 360 - bearingChange : bearingChange) *
				smoothedPath[j].distance
			currentCurveDist += smoothedPath[j].distance
			j++
		}
		avgWeightedBearing = avgWeightedBearing / currentCurveDist
		if (avgWeightedBearing > angleThreshold) {
			i = j - 1
			curveAmount++
		}
		currentCurveDist = 0
		avgWeightedBearing = 0
	}
	return curveAmount
}

/*const smoothBearings = (path: Line[], windowSize: number = 2): Line[] => {
	if (path.length < 2) return path

	const calculateWeightedAverageBearing = (index: number): number => {
		const halfWindow = Math.floor(windowSize / 2)
		let weightedSum = 0
		let totalWeight = 0

		for (let i = -halfWindow; i <= halfWindow; i++) {
			const neighborIndex = index + i

			if (neighborIndex >= 0 && neighborIndex < path.length) {
				const { bearing, distance } = path[neighborIndex]

				weightedSum += bearing * distance
				totalWeight += distance
			}
		}

		return totalWeight ? weightedSum / totalWeight : path[index].bearing
	}

	const smoothedPath = path.map((line, index) => ({
		...line,
		bearing: calculateWeightedAverageBearing(index),
	}))

	return smoothedPath
}*/
