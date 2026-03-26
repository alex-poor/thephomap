import { Source, Layer } from '@vis.gl/react-maplibre'
import type { RegionsData } from '../../data/types.ts'
import { getChoroplethPaintExpression } from '../../lib/colors.ts'

interface RegionsLayerProps {
  data: RegionsData
  visible: boolean
}

export function RegionsLayer({ data, visible }: RegionsLayerProps) {
  const visibility = visible ? 'visible' : 'none'

  return (
    <Source id="regions" type="geojson" data={data}>
      <Layer
        id="regions-fill"
        type="fill"
        layout={{ visibility }}
        paint={{
          'fill-color': getChoroplethPaintExpression('tot_pop') as unknown as string,
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.8,
            0.5,
          ] as unknown as number,
        }}
      />
      <Layer
        id="regions-outline"
        type="line"
        layout={{ visibility }}
        paint={{
          'line-color': '#374151',
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1.5,
            0.5,
          ] as unknown as number,
        }}
      />
    </Source>
  )
}
