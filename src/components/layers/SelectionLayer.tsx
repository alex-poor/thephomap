import { Source, Layer } from '@vis.gl/react-maplibre'
import type { Feature, Point } from 'geojson'

interface SelectionLayerProps {
  /** The coordinates of the selected facility, or null if nothing selected */
  center: [number, number] | null
}

export function SelectionLayer({ center }: SelectionLayerProps) {
  if (!center) return null

  const point: Feature<Point> = {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: center },
    properties: {},
  }

  return (
    <Source
      id="selection-highlight"
      type="geojson"
      data={point}
    >
      {/* Outer pulsing ring */}
      <Layer
        id="selection-ring-outer"
        type="circle"
        paint={{
          'circle-radius': 20,
          'circle-color': 'transparent',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#3c3c3b',
          'circle-stroke-opacity': 0.4,
        }}
      />
      {/* Inner highlight ring */}
      <Layer
        id="selection-ring-inner"
        type="circle"
        paint={{
          'circle-radius': 13,
          'circle-color': 'transparent',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#3c3c3b',
          'circle-stroke-opacity': 0.9,
        }}
      />
    </Source>
  )
}
