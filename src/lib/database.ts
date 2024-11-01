import axios from 'axios'

export const getFromDatabase = async (path: string): Promise<any> => {
	const request = await axios({
		method: 'get',
		url: process.env.DATABASE_URL + path + '.json',
	})
	return request.data
}

export const setDatabase = async (path: string, payload: any): Promise<number> => {
	const post = await axios({
		method: 'put',
		url: process.env.DATABASE_URL + path + '.json',
		data: JSON.stringify(payload),
	})
	return post.status
}
