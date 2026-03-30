import { Source, Layer } from '@vis.gl/react-maplibre'
import type { HospitalsData } from '../../data/types.ts'

interface HospitalsLayerProps {
  data: HospitalsData
  visible: boolean
}

export function HospitalsLayer({ data, visible }: HospitalsLayerProps) {
  if (!visible) return null

  return (
    <Source id="hospitals" type="geojson" data={data}>
      <Layer
        id="hospital-points"
        type="circle"
        paint={{
          'circle-color': '#3c3c3b',
          'circle-radius': 12,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        }}
      />
    </Source>
  )
}
