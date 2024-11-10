export const getFromDatabase = async (path: string, settings?: Object): Promise<any> => {
  const response = await fetch(`${process.env.DATABASE_URL}${path}.json`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    ...settings,
  })

  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.statusText}`)
  }

  return await response.json()
}

export const setDatabase = async (path: string, payload: any): Promise<number> => {
  const response = await fetch(`${process.env.DATABASE_URL}${path}.json`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  return response.status
}

export const getStravaToken = async (): Promise<string> => {
  const response = await fetch(`${process.env.ACCESS_TOKEN_URL}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Error occured while fetching Strava access token")
  }

  return response.json()
}
