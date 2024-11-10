### Strava Tailwind

1. On page load

- [x] loading flag
- [x] get tokens (firebase db)
- [x] get starred segments (strava api)
- [x] get cached segments
- [x] handle request errors
- [x] calculations (2, 3)
- [x] cache new starred segments

2. For new segments

- [x] fetch detailed segment from strava
- [x] transform polyline into array of coords ([polyline package](https://www.npmjs.com/package/@mapbox/polyline))
- [x] map coord array into array of lines
  - [x] start, end, distance, bearing [geolib (for distance/bearing calculation)](https://www.npmjs.com/package/geolib?activeTab=readme)

3. For each segment

- [x] pick x amount of coords evenly distributed from the array and fetch weather data ([open-meteo](https://open-meteo.com/en/docs))
- [x] compare bearing to the respective wind direction
  - add wind direction as data point
- [x] calculate tail/cross/headwind percentage

4. Interface

- ~~[x] loading animation~~
- [x] shadcn table ui (name, tailwind percentage, city, distance, avg. grade, elevation) [Shadcn](https://ui.shadcn.com/docs/components/data-table)
- [x] initially sort segments decending in tailwind percentage, further sorting via shadcn api
- [x] interactions: ref to strava segment page
- [ ] interactions: unstar post request + delete row
- [x] display amount of open-meteo requests and time used on calcs

5. Potential improvements

- [ ] Make database update conditional
- [ ] Toggle forcast
- [ ] Find circuits and prioritize them on low wind
- [x] Besides "circuits" classify "Hazardous", "climb", "downhill", "straight", "curvy" and "overlong" segments
- [x] Add komIsOwned indicator as crown icon
- [x] cache weather data in browser for 30min
- [x] Calculate average windspeed and add to tailwind column
- [ ] make sortable by kom status
- [ ] fix image config

#### Bugs

- ~~Does way more requests than expected~~
- ~~Terrain column not rendering properly~~
- Sorting by terrain crashes the app
