import { getFromDatabase, setDatabase } from '@/lib/database'
import { getDetailedSegment } from '@/lib/get-detailed-segment'
import { NextResponse } from 'next/server'
import { DetailedSegment } from '../../../../types'
import { ids } from './dat'

export async function GET(req: Request) {
	try {
		let exceededRate = false,
			stravaRequestCount = 0
		let dbIds = await getFromDatabase('ids3').catch((err) => [])
		dbIds = Array.isArray(dbIds) ? dbIds : []
		const stravaToken = await getFromDatabase('token/access')
		let snap = await getFromDatabase('snapshot3').catch((err) => [])
		snap = Array.isArray(snap) ? snap : []
		const remaining: number[] = ids.filter((x: number) => !dbIds.includes(x))

		const detailedSegmentPromises: Promise<DetailedSegment>[] = remaining
			.slice(0, Math.min(100, remaining.length - 1))
			.map((gainedId: number) => {
				return getDetailedSegment(gainedId, {
					Authorization: 'Bearer ' + stravaToken,
				})
			})

		const settledSegmentPromises = await Promise.allSettled(detailedSegmentPromises)
		const detailedSegments = settledSegmentPromises
			.filter((val) => {
				const isFullfilled = val.status === 'fulfilled'
				if (!isFullfilled) exceededRate = true
				else stravaRequestCount++
				return isFullfilled
			})
			.map((obj) => obj.value)

		const haveIds = detailedSegments.map((m) => m.id).concat(dbIds)
		const mergedSegments: DetailedSegment[] = snap.concat(detailedSegments)
		const idstatus = await setDatabase('ids3', haveIds)
		const segsstatus = await setDatabase('snapshot3', mergedSegments)
		return new NextResponse(
			`req:${stravaRequestCount} - added:${haveIds.length} (${exceededRate}) - db:${idstatus}/${segsstatus}`,
			{ status: 200 }
		)
	} catch (error) {
		if (error instanceof Error) {
			return new NextResponse(error.message, {
				status: 400,
			})
		} else {
			return new NextResponse('idk', {
				status: 400,
			})
		}
	}
}
