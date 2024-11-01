import { loadScript } from '@/lib/load-script'
import { DataTable } from './data-table'
import { columns } from './columns'
import { DetailedSegment } from '../../../../types'
import axios from 'axios'
import { setDatabase } from '@/lib/database'

export default async function Home() {
	let segs: DetailedSegment[] = []
	let statusMessage = 'Under Maintenance'
	//const update = await setDatabase('tailwind/segments', [])
	//statusMessage = update + ''
	try {
		const startTime = performance.now()
		const { segments, stravaRequestCount, meteoRequestCount, exceededRate, updateStatus } =
			await loadScript()
		segs = segments
		const loadTime = Math.round(performance.now() - startTime)
		statusMessage = `Page loaded in ${loadTime} milliseconds. Requests made: ${stravaRequestCount} Strava${
			exceededRate ? ' (rate exceeded)' : ''
		}, ${meteoRequestCount} Open Meteo. Update successfull ${updateStatus}.`
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
