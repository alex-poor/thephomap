import { useState, useCallback } from 'react'
import type { Feature, Point, Polygon, MultiPolygon } from 'geojson'
import type {
  RegionProperties,
  GpPracticeProperties,
  HospitalProperties,
} from '../data/types.ts'

export type SelectedFeature =
  | { type: 'region'; feature: Feature<Polygon | MultiPolygon, RegionProperties> }
  | { type: 'gp-practice'; feature: Feature<Point, GpPracticeProperties> }
  | { type: 'hospital'; feature: Feature<Point, HospitalProperties> }

export function useFeatureSelection() {
  const [selected, setSelected] = useState<SelectedFeature | null>(null)

  const selectRegion = useCallback(
    (feature: Feature<Polygon | MultiPolygon, RegionProperties>) => {
      setSelected({ type: 'region', feature })
    },
    [],
  )

  const selectGpPractice = useCallback(
    (feature: Feature<Point, GpPracticeProperties>) => {
      setSelected({ type: 'gp-practice', feature })
    },
    [],
  )

  const selectHospital = useCallback(
    (feature: Feature<Point, HospitalProperties>) => {
      setSelected({ type: 'hospital', feature })
    },
    [],
  )

  const clearSelection = useCallback(() => setSelected(null), [])

  return { selected, selectRegion, selectGpPractice, selectHospital, clearSelection }
}
