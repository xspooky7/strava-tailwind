import { getFromDatabase, setDatabase } from '@/lib/database'
import axios from 'axios'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
	/*const headersList = await headers()
	const apiKey = headersList.get('x-api-key')
	if (apiKey !== process.env.UPDATE_API_KEY)
		return new NextResponse('Unauthorized', { status: 401 })*/

	let DEBUG_LOG = ''
	const date = new Date()
	const currentHour = (date.getUTCHours() + 2) % 24 //CEST
	const currentMinute = date.getUTCMinutes()

	if (currentHour < 6 && currentMinute < 50) {
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

		DEBUG_LOG += 'Fetching Kom Pages'
		for (let page = 1; page <= max_pages; page++) {
			DEBUG_LOG += 'Fetching Kom Page ' + page + ' - AUTH: ' + stravaToken
			apiPromises.push(fetchKomPage(page, stravaToken))
		}
		try {
			apiResults = await Promise.all(apiPromises)
		} catch (error) {
			return new NextResponse("Couldn't (completely) retrieve Strava Koms", { status: 400 })
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
				lostKomIds.forEach((id: number) => {
					const index = snapshot.findIndex((segment: any) => segment.id === id)
					DEBUG_LOG += 'Lost: ' + snapshot[index].id
					if (snapshot[index].lost) {
						snapshot[index].lost.push(now)
					} else snapshot[index].lost = [now]
				})
			}
			if (gainedKomIds.length) {
				gainedKomIds.forEach((id: number) => {
					const apiIndex = apiData.findIndex((segment: any) => segment.id === id)
					const snapIndex = snapshot.findIndex((segment: any) => segment.id === id)
					DEBUG_LOG += 'Gained: ' + apiData[apiIndex].id
					if (snapIndex > -1) {
						if (snapshot[snapIndex].gained) {
							snapshot[snapIndex].gained.push(now)
						} else snapshot[snapIndex].gained = [now]
					} else snapshot.push({ ...apiData[apiIndex], gained: [now] })
				})
			}

			DEBUG_LOG +=
				'Pushing Database Updates: <br>    IDs: ' +
				apiIds.length +
				'<br>    Date: ' +
				new Date(now).toDateString()

			updatePromises.push(
				setDatabase('snapshot', snapshot),
				setDatabase('ids', apiIds),
				setDatabase('history/' + new Date(now).toDateString(), apiIds.length),
				setDatabase('komAmount', apiIds.length)
			)
		}
		updatePromises.push(setDatabase('snapdate', now))
		try {
			Promise.all(updatePromises)
		} catch (error) {
			return new NextResponse("Couldn't successfully push updates", { status: 400 })
		}
		return new NextResponse(DEBUG_LOG, { status: 200 })
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
const fetchKomPage = async (page: number, token: string) => {
	const response = await axios({
		method: 'GET',
		url: `${process.env.STRAVA_KOM_URL}?page=${page}&per_page=200`,
		headers: { Authorization: 'Bearer ' + token },
	})

	const segments = response.data ? response.data : []
	const idArray = segments.map((entry: any) => {
		idArray.push(entry.segment.id)
	})

	return [response.data, idArray]
}
