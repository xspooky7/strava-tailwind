import { SegmentRecord } from "../../../../pocketbase-types"

export const sanatizeSegment = (obj: any): SegmentRecord => {
  const getValue = (value: any, fallback: any = null) => value || fallback

  return {
    activity_type: getValue(obj.activity_type),
    athlete_count: getValue(obj.athlete_count),
    average_grade: getValue(obj.average_grade),
    city: obj.city ? obj.city : "-",
    climb_category: getValue(obj.climb_category) == null ? 0 : getValue(obj.climb_category),
    country: obj.country ? obj.country : "-",
    created_at: getValue(obj.created_at),
    distance: getValue(obj.distance),
    effort_count: getValue(obj.effort_count),
    end_latlng: getValue(obj.end_latlng),
    hazardous: getValue(obj.hazardous, false),
    labels: getValue(obj.labels),
    leader_kom: getValue(obj.xoms?.kom),
    leader_overall: getValue(obj.xoms?.overall),
    leader_qom: getValue(obj.xoms?.qom),
    local_legend_athlete_id: getValue(obj.local_legend?.athlete_id),
    maximum_grade: getValue(obj.maximum_grade),
    name: obj.name ? obj.name : "-",
    path: getValue(obj.path),
    polyline: getValue(obj.map?.polyline),
    profile_url_dark: getValue(obj.elevation_profiles?.dark_url),
    profile_url_light: getValue(obj.elevation_profiles?.light_url),
    segment_id: getValue(obj.id),
    star_count: getValue(obj.star_count),
    start_latlng: getValue(obj.start_latlng),
    state: obj.state ? obj.state : "-",
    total_elevation_gain: getValue(obj.total_elevation_gain),
  }
}
