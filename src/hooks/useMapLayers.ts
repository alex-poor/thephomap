import { useState, useCallback } from 'react'
import { LAYER_REGISTRY } from '../config/layers.ts'

export function useMapLayers() {
  const [visibility, setVisibility] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const layer of LAYER_REGISTRY) {
      initial[layer.id] = layer.defaultVisible
    }
    return initial
  })

  const toggleLayer = useCallback((layerId: string) => {
    setVisibility((prev) => ({ ...prev, [layerId]: !prev[layerId] }))
  }, [])

  const isVisible = useCallback(
    (layerId: string) => visibility[layerId] ?? false,
    [visibility],
  )

  return { visibility, toggleLayer, isVisible, layers: LAYER_REGISTRY }
}
