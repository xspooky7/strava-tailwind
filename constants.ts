export const WEATHER_QUERY_INTERVAL = 3000 // m maximum distance in between weather api requests. (Should never be lower than 2000 tbh)

export const THRESHHOLD = {
	CIRCUIT: 50, // m distance between start and end coordinate
	CLIMB: 7, // % positive average grade
	DOWNHILL: -7, // % negative average grade
	OVERLONG: 10000, // m segment length
	CURVY: 1.25, // amount of curves / 1000
	STRAIGHT: 60, // degree max bearing change
	UNCONTESTET: 0.01, // efforts per day since creation (˜35/year)
	CONTESTET: 3500, // efforts total
}
