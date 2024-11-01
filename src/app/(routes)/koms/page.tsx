import * as React from 'react'

import { DataTableSkeleton } from './kom-table-components/table-skeleton'
import { KomTable } from './kom-table-components/kom-table'
import { columns } from './kom-table-components/columns'
import { Kom } from '../../../../types'

const KomPage = () => {
	const data: Kom = []

	return (
		<React.Suspense
			fallback={
				<DataTableSkeleton
					columnCount={6}
					searchableColumnCount={1}
					filterableColumnCount={2}
					cellWidths={['10rem', '40rem', '12rem', '12rem', '8rem', '8rem']}
					shrinkZero
				/>
			}
		>
			<KomTable data={data} columns={columns} />
		</React.Suspense>
	)
}

export default KomPage
