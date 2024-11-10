/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	EffortDetails = "effort_details",
	KomEfforts = "kom_efforts",
	KomTimeseries = "kom_timeseries",
	Segments = "segments",
	Users = "users",
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

export type EffortDetailsRecord = {
	average_cadence?: number
	average_heartrate?: number
	average_watts?: number
	effort_id?: number
	elapsed_time?: number
	max_heartrate?: number
	start_date?: string
}

export type KomEffortsRecord<Tgained_at = unknown, Tlost_at = unknown> = {
	effort_detail?: RecordIdString
	gained_at?: null | Tgained_at
	has_kom?: boolean
	is_starred?: boolean
	lost_at?: null | Tlost_at
	segment: RecordIdString
	segment_id: number
	user: RecordIdString
}

export type KomTimeseriesRecord = {
	amount?: number
	date?: IsoDateString
	user?: RecordIdString
}

export enum SegmentsActivityTypeOptions {
	"Run" = "Run",
	"Ride" = "Ride",
}

export enum SegmentsLabelsOptions {
	"Hazardous" = "Hazardous",
	"Circuit" = "Circuit",
	"Curvy" = "Curvy",
	"Straight" = "Straight",
	"Climb" = "Climb",
	"Downhill" = "Downhill",
	"Overlong" = "Overlong",
	"Contested" = "Contested",
	"Uncontested" = "Uncontested",
}
export type SegmentsRecord<Tend_latlng = unknown, Tpath = unknown, Tstart_latlng = unknown> = {
	activity_type: SegmentsActivityTypeOptions
	athlete_count?: number
	average_grade?: number
	city: string
	climb_category?: number
	country: string
	created_at?: string
	distance: number
	effort_count?: number
	end_latlng: null | Tend_latlng
	hazardous?: boolean
	labels?: SegmentsLabelsOptions[]
	leader_kom?: string
	leader_overall?: string
	leader_qom?: string
	local_legend_athlete_id?: number
	maximum_grade?: number
	name: string
	path?: null | Tpath
	polyline: string
	profile_url_dark?: string
	profile_url_light?: string
	segment_id: number
	star_count?: number
	start_latlng: null | Tstart_latlng
	state: string
	total_elevation_gain?: number
}

export type UsersRecord = {
	athlete_id: number
	name: string
	pfp_url?: string
}

// Response types include system fields and match responses from the PocketBase API
export type EffortDetailsResponse<Texpand = unknown> = Required<EffortDetailsRecord> & BaseSystemFields<Texpand>
export type KomEffortsResponse<Tgained_at = unknown, Tlost_at = unknown, Texpand = unknown> = Required<KomEffortsRecord<Tgained_at, Tlost_at>> & BaseSystemFields<Texpand>
export type KomTimeseriesResponse<Texpand = unknown> = Required<KomTimeseriesRecord> & BaseSystemFields<Texpand>
export type SegmentsResponse<Tend_latlng = unknown, Tpath = unknown, Tstart_latlng = unknown, Texpand = unknown> = Required<SegmentsRecord<Tend_latlng, Tpath, Tstart_latlng>> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	effort_details: EffortDetailsRecord
	kom_efforts: KomEffortsRecord
	kom_timeseries: KomTimeseriesRecord
	segments: SegmentsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	effort_details: EffortDetailsResponse
	kom_efforts: KomEffortsResponse
	kom_timeseries: KomTimeseriesResponse
	segments: SegmentsResponse
	users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: 'effort_details'): RecordService<EffortDetailsResponse>
	collection(idOrName: 'kom_efforts'): RecordService<KomEffortsResponse>
	collection(idOrName: 'kom_timeseries'): RecordService<KomTimeseriesResponse>
	collection(idOrName: 'segments'): RecordService<SegmentsResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
