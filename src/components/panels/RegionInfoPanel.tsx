import type { Feature, Polygon, MultiPolygon } from 'geojson'
import type { RegionProperties } from '../../data/types.ts'

interface RegionInfoPanelProps {
  feature: Feature<Polygon | MultiPolygon, RegionProperties>
}

export function RegionInfoPanel({ feature }: RegionInfoPanelProps) {
  const { rc, sa3_name, nz_dep, tot_pop, mao_pop, pac_pop } = feature.properties

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-heading text-lg font-semibold text-pho-onyx">{rc}</h3>
        <p className="text-sm text-gray-600">{sa3_name}</p>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <dt className="text-gray-500">Decile</dt>
        <dd className="font-medium text-gray-900">{nz_dep ?? 'N/A'}</dd>

        <dt className="text-gray-500">Total</dt>
        <dd className="font-medium text-gray-900">
          {tot_pop?.toLocaleString() ?? 'N/A'}
        </dd>

        <dt className="text-gray-500">Maori</dt>
        <dd className="font-medium text-gray-900">
          {mao_pop?.toLocaleString() ?? 'N/A'}
        </dd>

        <dt className="text-gray-500">Pacific</dt>
        <dd className="font-medium text-gray-900">
          {pac_pop?.toLocaleString() ?? 'N/A'}
        </dd>
      </dl>
    </div>
  )
}
