export interface Line {
  start: Coordinate
  end: Coordinate
  distance: number
  bearing: number
  weatherRef?: number
  windDirection?: number
}

export type Coordinate = [number, number] // Lat, Lng
export type Label =
  | "Hazardous"
  | "Circuit"
  | "Curvy"
  | "Straight"
  | "Climb"
  | "Downhill"
  | "Overlong"
  | "Contested"
  | "Uncontested"

export type WeatherResponse = {
  path: Line[]
  wind: {
    tail: number
    cross: number
    head: number
    avgTailwindSpeed: number
  }
  meteoRequests: number
}

export interface TailwindSegment {
  name: string
  city: string
  segment_id: number
  distance: number
  has_kom: boolean | null
  is_starred: boolean
  average_grade?: number
  profile_url?: string
  leader_qom?: string | null
  labels?: Label[]
  path: Line[]
  wind?: {
    tail: number
    cross: number
    head: number
    avgTailwindSpeed: number
  }
}

export interface TableSegment {
  segment_id: number
  name: string
  city: string
  labels: Label[]
  lost_at?: number[]
  gained_at?: number[]
  has_kom: boolean
  is_starred: boolean
}

/*
export interface Deprecate {
  id: number // The unique identifier of this segment
  name: string // The name of this segment
  activity_type: "Run" | "Ride" // May take one of the following values: Ride, Run
  resource_state: number
  distance: number // The segment's distance, in meters
  average_grade: number // The segment's average grade, in percents
  maximum_grade: number // The segments's maximum grade, in percents
  elevation_high: number // The segments's highest elevation, in meters
  elevation_low: number // The segments's lowest elevation, in meters
  start_latlng: Coordinate // Start coordinates of the segment
  end_latlng: Coordinate // End coordinates of the segment
  elevation_profile?: string
  elevation_profiles?: {
    // image url of the elevation profile
    dark_url: string
    light_url: string
  }
  climb_category: 0 | 1 | 2 | 3 | 4 | 5 // The category of the climb [0, 5]. Higher is harder, 0 is uncategorized in climb_category
  city: string // The segments's city
  state: string // The segments's state or geographical region
  country: string // The segment's country
  private: boolean // Whether this segment is private
  starred: boolean // Whether this segment is starred
  hazardous: boolean // Whether this segment is considered hazardous
}



export interface ApiKom {
  segment_id: number
  elapsed_time: number
  moving_time: number
  start_date: string // Date String
  start_date_local: string // Date String
  distance: number
  start_index: number
  end_index: number
  average_cadence: number
  device_watts: boolean
  average_watts: number
  average_heartrate: number
  max_heartrate: number
  achievements?: Object[]
}

export interface DetailedSegment extends Segment {
  athlete_segment_stats: {
    effort_count: number
    pr_activity_id: number // The unique identifier of the activity related to this pr effort
    pr_activity_visibility: string
    pr_date: string // The time at which the effort was started
    pr_elapsed_time: number // The effort's elapsed time
    pr_visibility: string
  }
  total_elevation_gain: number // The segment's total elevation gain in meter
  map: {
    // Polyline map
    id: string
    polyline: string
    resource_state: number
  }
  path: Line[] // Segment modeled as a sequence of lines
  athlete_count: number // The number of unique athletes who have an effort for this segment
  effort_count: number // The total number of efforts for this segment
  star_count: number // The number of stars for this segment
  created_at: string // The time at which the segment was created
  updated_at: string // The time at which the segment was last updated
  local_legend: {
    athlete_id: number
    destination: string
    effort_count: string
    effort_counts: [Object]
    effort_description: string
    profile: string
    title: string
  }
  resource_state: number
  xoms: {
    destination: [Object]
    kom: string
    overall: string
    qom: string
  }
}
*/
