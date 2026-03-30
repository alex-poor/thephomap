import { useMemo } from 'react'
import { Source, Layer } from '@vis.gl/react-maplibre'
import type { Feature, Point } from 'geojson'
import type { GpPracticesData, HospitalProperties } from '../../data/types.ts'
import {
  getDistanceToNearestHospital,
  proximityColor,
  thresholdsFromRadius,
} from '../../lib/proximity.ts'

interface GpPracticesLayerProps {
  data: GpPracticesData
  hospitals: Feature<Point, HospitalProperties>[]
  visible: boolean
  radiusKm: number
}

export function GpPracticesLayer({
  data,
  hospitals,
  visible,
  radiusKm,
}: GpPracticesLayerProps) {
  const coloredData = useMemo(() => {
    if (hospitals.length === 0) return data

    const thresholds = thresholdsFromRadius(radiusKm)
    return {
      ...data,
      features: data.features.map((f) => {
        const dist = getDistanceToNearestHospital(
          f.geometry.coordinates as [number, number],
          hospitals,
        )
        return {
          ...f,
          properties: {
            ...f.properties,
            _nearestHospitalKm: dist,
            _proximityColor: proximityColor(dist, thresholds),
          },
        }
      }),
    }
  }, [data, hospitals, radiusKm])

  if (!visible) return null

  return (
    <Source
      id="gp-practices"
      type="geojson"
      data={coloredData}
      cluster
      clusterMaxZoom={12}
      clusterRadius={50}
    >
      {/* Cluster circles */}
      <Layer
        id="gp-clusters"
        type="circle"
        filter={['has', 'point_count']}
        paint={{
          'circle-color': '#ed696e',
          'circle-opacity': 0.7,
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            15,
            10,
            20,
            50,
            25,
          ] as unknown as number,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        }}
      />

      {/* Cluster count labels */}
      <Layer
        id="gp-cluster-count"
        type="symbol"
        filter={['has', 'point_count']}
        layout={{
          'text-field': '{point_count_abbreviated}',
          'text-size': 12,
        }}
        paint={{
          'text-color': '#ffffff',
        }}
      />

      {/* Individual GP practice points — colored by proximity */}
      <Layer
        id="gp-points"
        type="circle"
        filter={['!', ['has', 'point_count']]}
        paint={{
          'circle-color': ['get', '_proximityColor'] as unknown as string,
          'circle-radius': 9,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9,
        }}
      />
    </Source>
  )
}
