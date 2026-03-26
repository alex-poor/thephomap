import { CHOROPLETH_COLORS, CHOROPLETH_STOPS } from '../../lib/colors.ts'
import { thresholdsFromRadius } from '../../lib/proximity.ts'

interface LegendProps {
  radiusKm: number
}

export function Legend({ radiusKm }: LegendProps) {
  const thresholds = thresholdsFromRadius(radiusKm)

  return (
    <div className="space-y-3">
      <h2 className="font-heading text-sm font-semibold text-pho-navy">Legend</h2>

      {/* Region choropleth */}
      <div>
        <span className="text-xs font-medium text-gray-500">
          SA3 Population
        </span>
        <div className="mt-1 flex">
          {CHOROPLETH_COLORS.map((color, i) => (
            <div key={i} className="flex-1">
              <div
                className="h-3 w-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-[10px] text-gray-400">
                {CHOROPLETH_STOPS[i] >= 1000
                  ? `${(CHOROPLETH_STOPS[i] / 1000).toFixed(0)}k`
                  : CHOROPLETH_STOPS[i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* GP proximity */}
      <div>
        <span className="text-xs font-medium text-gray-500">
          GP Proximity to Hospital
        </span>
        <div className="mt-1 space-y-1">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: '#2dbdb6' }}
            />
            <span className="text-xs text-gray-600">
              &lt; {Math.round(thresholds.close)} km
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: '#f59e0b' }}
            />
            <span className="text-xs text-gray-600">
              {Math.round(thresholds.close)}–{Math.round(thresholds.medium)} km
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: '#ef4444' }}
            />
            <span className="text-xs text-gray-600">
              &gt; {Math.round(thresholds.medium)} km
            </span>
          </div>
        </div>
      </div>

      {/* Facilities */}
      <div>
        <span className="text-xs font-medium text-gray-500">Facilities</span>
        <div className="mt-1 space-y-1">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: '#2dbdb6' }}
            />
            <span className="text-xs text-gray-600">GP Practice</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: '#213368' }}
            />
            <span className="text-xs text-gray-600">Urgent/after-hours care</span>
          </div>
        </div>
      </div>

      {/* Proximity ring */}
      <div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-6 rounded border-2 border-dashed border-pho-blue bg-pho-blue/10"
          />
          <span className="text-xs text-gray-600">Proximity radius</span>
        </div>
      </div>
    </div>
  )
}
