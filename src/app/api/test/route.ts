import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
	const headersList = await headers()
	const apiKey = headersList.get('x-api-key')
	if (apiKey !== process.env.UPDATE_API_KEY)
		return new NextResponse('Unauthorized', { status: 401 })
	return NextResponse.json({ ja: 'nein' })
}
