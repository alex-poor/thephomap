import { useMemo } from 'react'
import { Source, Layer } from '@vis.gl/react-maplibre'
import turfCircle from '@turf/circle'
import { point } from '@turf/helpers'

interface ProximityRingLayerProps {
  center: [number, number] | null
  radiusKm: number
}

export function ProximityRingLayer({ center, radiusKm }: ProximityRingLayerProps) {
  const ringGeoJson = useMemo(() => {
    if (!center) return null
    return turfCircle(point(center), radiusKm, {
      steps: 64,
      units: 'kilometers',
    })
  }, [center, radiusKm])

  if (!ringGeoJson) return null

  return (
    <Source id="proximity-ring" type="geojson" data={ringGeoJson}>
      <Layer
        id="proximity-ring-fill"
        type="fill"
        paint={{
          'fill-color': '#c23d41',
          'fill-opacity': 0.1,
        }}
      />
      <Layer
        id="proximity-ring-outline"
        type="line"
        paint={{
          'line-color': '#c23d41',
          'line-width': 2,
          'line-dasharray': [3, 2] as [number, number],
        }}
      />
    </Source>
  )
}
