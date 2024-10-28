import { loadScript } from '@/lib/load-script'
import { DataTable } from './data-table'
import { columns } from './columns'
import { Segment } from '../../types'
import axios from 'axios'

export default async function Home() {
	let segs: Segment[] = []
	let statusMessage = ''
	/*const update = await axios({
		method: 'put',
		url: process.env.DB_SEGMENTS,
		data: [],
	})
	statusMessage = update.status + ''*/
	try {
		const startTime = performance.now()
		const { segments, stravaRequestCount, meteoRequestCount, overflowIds, updateStatus } =
			await loadScript()
		segs = segments
		const loadTime = Math.round(performance.now() - startTime)
		statusMessage = `Page loaded in ${loadTime} milliseconds. Requests made: ${stravaRequestCount} Strava, ${meteoRequestCount} Open Meteo.`
		// console.log(segments.length, stravaRequestCount, overflowIds, updateStatus)
	} catch (error: any) {
		statusMessage = error.message
	}

	return (
		<div className="container mx-auto py-10">
			<DataTable columns={columns} data={segs} />
			<footer className="py-6 md:px-1 md:py-0">
				<div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
					<p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
						{statusMessage}
					</p>
				</div>
			</footer>
		</div>
	)
}
