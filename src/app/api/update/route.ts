import { getFromDatabase, setDatabase } from '@/lib/database'
import axios from 'axios'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { ApiKom, DetailedSegment, Kom } from '../../../../types'
import { getDetailedSegment } from '@/lib/get-detailed-segment'

export async function GET(req: Request) {
	try {
		/*const headersList = await headers()
	const apiKey = headersList.get('x-api-key')
	if (apiKey !== process.env.UPDATE_API_KEY)
		return new NextResponse('Unauthorized', { status: 401 })*/

		let DEBUG_LOG = '',
			exceededRate = false,
			stravaRequestCount = 0
		const date = new Date()
		const currentHour = (date.getUTCHours() + 1) % 24 //CEST
		const currentMinute = date.getUTCMinutes()

		if (currentHour < 7) {
			return new NextResponse('Night', { status: 201 })
		} else {
			DEBUG_LOG += 'INIT - ' + currentHour + ':' + currentMinute + ' CEST'
			const now = date.getTime()

			const [stravaToken, databaseIdReq] = await Promise.all([
				getFromDatabase('token/access'),
				getFromDatabase('ids'),
			])

			if (!stravaToken)
				return new NextResponse("Couldn't retrieve Strava Access Token", { status: 400 })

			const databaseIds = databaseIdReq ? databaseIdReq : []

			const apiPromises = []
			let apiResults = []
			DEBUG_LOG += 'DatabaseID count: ' + databaseIds.length

			const p = databaseIds.length / 200
			const max_pages = Number.isInteger(p) ? p + 1 : Math.ceil(p)

			DEBUG_LOG += 'Fetching Kom Pages' + ' - AUTH: ' + stravaToken
			for (let page = 1; page <= max_pages; page++) {
				DEBUG_LOG += 'Page ' + page
				stravaRequestCount++
				apiPromises.push(fetchKomPage(page, stravaToken))
			}
			try {
				apiResults = await Promise.all(apiPromises)
			} catch (error) {
				if (error instanceof Error) {
					return new NextResponse(error.message, {
						status: 400,
					})
				} else {
					return new NextResponse('d', {
						status: 400,
					})
				}
			}

			const [apiData, apiIds] = apiResults.reduce((a, b) => [
				a[0].concat(b[0]),
				a[1].concat(b[1]),
			])

			const updatePromises = []

			if (!checkIdsEqual(databaseIds, apiIds)) {
				let snapshot
				try {
					snapshot = await getFromDatabase('snapshot')
				} catch (error) {
					return new NextResponse("Couldn't retrieve Segments from Database ", {
						status: 400,
					})
				}
				const [lostKomIds, gainedKomIds] = calcKomDifference(databaseIds, apiIds)

				if (lostKomIds.length) {
					lostKomIds.forEach((lostId: number) => {
						const index = snapshot.findIndex((segment: any) => segment.id === lostId)
						DEBUG_LOG += 'Lost: ' + snapshot[index].id
						if (snapshot[index].lost) {
							snapshot[index].lost.push(now)
						} else snapshot[index].lost = [now]
					})
				}
				if (gainedKomIds.length) {
					const detailedSegmentPromises: Promise<DetailedSegment>[] = gainedKomIds.map(
						(gainedId: number) => {
							return getDetailedSegment(gainedId, {
								Authorization: 'Bearer ' + stravaToken,
							})
						}
					)

					const settledSegmentPromises = await Promise.allSettled(detailedSegmentPromises)
					const detailedSegments = settledSegmentPromises
						.filter((val) => {
							const isFullfilled = val.status === 'fulfilled'
							if (!isFullfilled) exceededRate = true
							else stravaRequestCount++
							return isFullfilled
						})
						.map((obj) => obj.value)

					gainedKomIds.forEach((gainedId: number) => {
						const apiIndex = apiData.findIndex(
							(segment: ApiKom) => segment.id === gainedId
						)
						const snapIndex = snapshot.findIndex(
							(segment: Kom) => segment.id === gainedId
						)
						const detailedSegment = detailedSegments.find((seg) => seg.id === gainedId)

						DEBUG_LOG += 'Gained: ' + apiData[apiIndex].id
						if (detailedSegment) {
							if (snapIndex > -1) {
								if (snapshot[snapIndex].gained) {
									snapshot[snapIndex].gained.push(now)
								} else snapshot[snapIndex].gained = [now]
							} else
								snapshot.push({
									...apiData[apiIndex],
									...detailedSegment,
									gained: [now],
								})
						}
					})
				}

				const updatedSnapshotIds = snapshot.map((kom: Kom) => kom.id)
				DEBUG_LOG +=
					'Pushing Database Updates: <br>    IDs: ' +
					updatedSnapshotIds.length +
					'<br>    Date: ' +
					new Date(now).toDateString()

				const komAmount = apiIds.length
				updatePromises.push(
					setDatabase('snapshot', snapshot),
					setDatabase('ids', updatedSnapshotIds),
					setDatabase('history/' + new Date(now).toDateString(), komAmount),
					setDatabase('komAmount', komAmount)
				)
			}
			updatePromises.push(setDatabase('snapdate', now))
			DEBUG_LOG += 'Requests: ' + stravaRequestCount + ' - Rate exceeded: ' + exceededRate
			try {
				Promise.all(updatePromises)
			} catch (error) {
				return new NextResponse("Couldn't successfully push updates", { status: 400 })
			}
			return new NextResponse(DEBUG_LOG, { status: 200 })
		}
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

// HELPER FUNCTIONS
const checkIdsEqual = (idArr1: number[], idArr2: number[]) => {
	return idArr1.sort().join('') === idArr2.sort().join('')
}

const calcKomDifference = (past: number[], present: number[]) => {
	return [past.filter((x) => !present.includes(x)), present.filter((y) => !past.includes(y))]
}

//STRAVA API FUNCTION
const fetchKomPage = async (page: number, token: string): Promise<[ApiKom[], number[]]> => {
	const response = await axios({
		method: 'GET',
		url: `${process.env.STRAVA_KOM_URL}?page=${page}&per_page=200`,
		headers: { Authorization: 'Bearer ' + token },
	})

	const segments = response.data ? response.data : []
	const idArray: number[] = []
	const formattedResponse: ApiKom[] = segments.map((entry: any) => {
		idArray.push(entry.segment.id)
		return {
			id: entry.segment.id,
			elapsed_time: entry.elapsed_time,
			moving_time: entry.moving_time,
			start_date: entry.start_date,
			start_date_local: entry.start_date_local,
			distance: entry.distance,
			start_index: entry.start_index,
			end_index: entry.end_index,
			average_cadence: entry.average_cadence,
			device_watts: entry.device_watts,
			average_watts: entry.average_watts,
			average_heartrate: entry.average_heartrate,
			max_heartrate: entry.max_heartrate,
			achievements: entry.achievements,
		}
	})

	return [formattedResponse, idArray]
}

/* const token = await getFromDatabase('token/access')
			const apiPromises = []
			let apiResults = []
			for (let page = 1; page <= 20; page++) {
				apiPromises.push(fetchKomPage(page, token))
			}
			try {
				apiResults = await Promise.all(apiPromises)
			} catch (error) {
				if (error instanceof Error) {
					return new NextResponse(error.message, {
						status: 400,
					})
				} else {
					return new NextResponse('d', {
						status: 400,
					})
				}
			}
			const [apiData, apiIds] = apiResults.reduce((a, b) => [
				a[0].concat(b[0]),
				a[1].concat(b[1]),
			])

			const status = await setDatabase('snapshot2', apiData)*/
