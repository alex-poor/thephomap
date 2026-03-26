import type { Feature, Point } from 'geojson'
import type { HospitalProperties } from '../data/types.ts'
import { haversineDistance } from './geo.ts'

export interface ProximityThresholds {
  close: number  // km — green
  medium: number // km — amber
  // > medium = red
}

export function thresholdsFromRadius(radiusKm: number): ProximityThresholds {
  return {
    close: radiusKm * 0.3,   // green: within 30% of radius
    medium: radiusKm,         // amber: 30%–100% of radius; red: beyond
  }
}

export const DEFAULT_RADIUS_KM = 50

export interface NearestHospital {
  feature: Feature<Point, HospitalProperties>
  distanceKm: number
}

export function findNearestHospitals(
  fromCoords: [number, number],
  hospitals: Feature<Point, HospitalProperties>[],
  limit = 5,
): NearestHospital[] {
  return hospitals
    .map((feature) => ({
      feature,
      distanceKm: haversineDistance(
        fromCoords,
        feature.geometry.coordinates as [number, number],
      ),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)
}

export function getDistanceToNearestHospital(
  coords: [number, number],
  hospitals: Feature<Point, HospitalProperties>[],
): number {
  if (hospitals.length === 0) return Infinity
  let min = Infinity
  for (const h of hospitals) {
    const d = haversineDistance(
      coords,
      h.geometry.coordinates as [number, number],
    )
    if (d < min) min = d
  }
  return min
}

export function proximityColor(
  distanceKm: number,
  thresholds: ProximityThresholds = thresholdsFromRadius(DEFAULT_RADIUS_KM),
): string {
  if (distanceKm <= thresholds.close) return '#2dbdb6'  // teal (close)
  if (distanceKm <= thresholds.medium) return '#f59e0b'  // amber (medium)
  return '#ef4444'                                        // red (far)
}
