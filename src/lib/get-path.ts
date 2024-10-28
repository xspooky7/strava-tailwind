import { getPreciseDistance, getGreatCircleBearing } from 'geolib'
import { Coordinate, Line } from '../../types'

/**
 * Takes a polyline and transforms it into an array of lines
 *
 * @param {string} polyline - The polyline of a segment.
 * @returns {Line []} Array of line forming a path.
 */

export const getPath = (polyline: string) => {
  const path: Line[] = []
  const poly = require('@mapbox/polyline')
  const coordPairs: Coordinate[] = poly.decode(polyline)

  for (let i = 1; i < coordPairs.length; i++) {
    path.push({
      start: coordPairs[i - 1],
      end: coordPairs[i],
      distance: getPreciseDistance(coordPairs[i - 1], coordPairs[i]),
      bearing: getGreatCircleBearing(coordPairs[i - 1], coordPairs[i]),
    })
  }
  return path
}
