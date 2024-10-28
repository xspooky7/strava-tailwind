import axios from 'axios'

export const unstarSegment = async (id: number) => {
  try {
    const acessToken = await axios({
      method: 'get',
      url: process.env.DB_TOKEN,
    })

    const update = await axios({
      method: 'put',
      url: process.env.STRAVA_API + '/segments/' + id + '/starred',
      headers: { Authorization: 'Bearer ' + acessToken.data },
    })
  } catch (e) {
    alert(
      'There was a problem unstaring the segment ' +
        id +
        '---' +
        (e as Error).message
    )
  }
}
