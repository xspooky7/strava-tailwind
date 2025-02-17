/**
 * This file was @generated using pocketbase-typegen
 */

import type PocketBase from "pocketbase"
import type { RecordService } from "pocketbase"
import { Coordinate, Label, Line, Status } from "./types"

export enum Collections {
  EffortDetails = "effort_details",
  KomEfforts = "kom_efforts",
  Segments = "segments",
  Users = "users",
  KomTimeseries = "kom_timeseries",
  UserTokens = "user_tokens",
  Opponents = "opponents",
  ContactForm = "contact_form",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
  id: RecordIdString
  created: IsoDateString
  updated: IsoDateString
  collectionId: string
  collectionName: Collections
  expand?: T
}

export type AuthSystemFields<T = never> = {
  email: string
  emailVisibility: boolean
  username: string
  verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type EffortDetailRecord = {
  average_cadence?: number
  average_heartrate?: number
  average_watts?: number
  average_speed?: number
  elapsed_time?: number
  max_heartrate?: number
  start_date?: string
  segment_effort_id: string
}

export type UserTokenRecord = {
  id?: string
  user: RecordIdString
  access_token: string
  refresh_token: string
  expires_at: IsoDateString
}

export type OpponentsRecord = {
  id?: RecordIdString
  athlete_id: number
  name: string
  avatar: string
}

export type ContactFormRecord = {
  id?: RecordIdString
  username: string
  email: string
  text: string
}

export type KomEffortRecord = {
  id?: RecordIdString
  pr_effort?: RecordIdString
  user: RecordIdString
  segment: RecordIdString
  segment_id: number
  gained_at?: number[]
  lost_at?: number[]
  has_kom: boolean
  is_starred: boolean
}

export type KomTimeseriesRecord = {
  id?: RecordIdString
  user: RecordIdString
  segment_id?: number
  status: Status
  opponent_name?: string
  opponent_id?: number
  kom_effort?: RecordIdString
  opponent_effort?: RecordIdString
  user_effort?: RecordIdString
  opponent_pfp_url?: string
  opponent?: RecordIdString
  created?: string
}

export type SegmentRecord = {
  id?: string
  activity_type: "Run" | "Ride"
  athlete_count?: number
  average_grade: number
  city: string
  climb_category: 0 | 1 | 2 | 3 | 4 | 5 // The category of the climb [0, 5]. Higher is harder, 0 is uncategorized in climb_category
  country: string
  created_at?: string
  distance: number
  effort_count?: number
  end: Coordinate
  hazardous?: boolean
  labels?: Label[]
  leader_kom?: string
  leader_overall?: string
  leader_qom?: string
  local_legend_athlete_id?: number
  maximum_grade?: number
  name: string
  path?: Line[]
  polyline: string
  profile_url_dark?: string
  profile_url_light?: string
  segment_id: number
  star_count?: number
  start: Coordinate
  state: string
  total_elevation_gain?: number
}

export type UserRecord = {
  athlete_id: number
  kom_count: number
  name: string
  pfp_url?: string
}

// Response types include system fields and match responses from the PocketBase API
export type EffortDetailResponse<Texpand = unknown> = Required<EffortDetailRecord> & BaseSystemFields<Texpand>
export type KomEffortResponse<Texpand = unknown> = Required<KomEffortRecord> & BaseSystemFields<Texpand>
export type SegmentResponse<Texpand = unknown> = Required<SegmentRecord> & BaseSystemFields<Texpand>
export type UserResponse<Texpand = unknown> = Required<UserRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
  effort_details: EffortDetailRecord
  kom_efforts: KomEffortRecord
  segments: SegmentRecord
  users: UserRecord
  kom_timeseries: KomTimeseriesRecord
}

export type CollectionResponses = {
  effort_details: EffortDetailResponse
  kom_efforts: KomEffortResponse
  segments: SegmentResponse
  users: UserResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
  collection(idOrName: "effort_details"): RecordService<EffortDetailResponse>
  collection(idOrName: "kom_efforts"): RecordService<KomEffortResponse>
  collection(idOrName: "segments"): RecordService<SegmentResponse>
  collection(idOrName: "users"): RecordService<UserResponse>
}
