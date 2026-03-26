import { LAYER_REGISTRY } from '../../config/layers.ts'
import { Layers } from 'lucide-react'

interface LayerToggleProps {
  visibility: Record<string, boolean>
  onToggle: (layerId: string) => void
}

export function LayerToggle({ visibility, onToggle }: LayerToggleProps) {
  const groups = new Map<string, typeof LAYER_REGISTRY>()
  for (const layer of LAYER_REGISTRY) {
    const list = groups.get(layer.group) ?? []
    list.push(layer)
    groups.set(layer.group, list)
  }

  return (
    <div>
      <h2 className="mb-2 flex items-center gap-1.5 font-heading text-sm font-semibold text-pho-navy">
        <Layers className="h-4 w-4" />
        Layers
      </h2>
      {[...groups.entries()].map(([group, layers]) => (
        <div key={group} className="mb-2">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
            {group}
          </span>
          <div className="mt-1 space-y-1">
            {layers.map((layer) => (
              <label
                key={layer.id}
                className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-pho-light"
              >
                <input
                  type="checkbox"
                  checked={visibility[layer.id] ?? false}
                  onChange={() => onToggle(layer.id)}
                  className="accent-pho-teal"
                />
                <span className="text-sm text-gray-700">{layer.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
