import type { FeatureCollection, Polygon, MultiPolygon, Point } from 'geojson'

export interface RegionProperties {
  sa3_code: string
  sa3_name: string
  rc: string
  tot_pop: number
  mao_pop: number
  pac_pop: number
  nz_dep: number | null
  [key: string]: unknown
}

export interface GpPracticeProperties {
  name: string
  address: string
  pho: string
  enrolled: number
  acceptingPatients: boolean
  [key: string]: unknown
}

export interface HospitalProperties {
  name: string
  dhb: string
  services: string[]
  beds: number
  emergencyDept: boolean
  [key: string]: unknown
}

export type RegionsData = FeatureCollection<Polygon | MultiPolygon, RegionProperties>
export type GpPracticesData = FeatureCollection<Point, GpPracticeProperties>
export type HospitalsData = FeatureCollection<Point, HospitalProperties>
