import { useCallback, useRef, useState, useEffect, useImperativeHandle, forwardRef, type ReactNode } from 'react'
import { Map, NavigationControl, Popup, type MapRef } from '@vis.gl/react-maplibre'
import type { MapLayerMouseEvent, RasterTileSource } from 'maplibre-gl'
import { MAP_DEFAULTS, BASEMAPS, initialStyle, type BasemapId } from '../../config/map.ts'

export interface MapContainerHandle {
  flyTo: (center: [number, number], radiusKm?: number) => void
}

interface MapContainerProps {
  basemap: BasemapId
  onClickLayer?: (e: MapLayerMouseEvent) => void
  onHoverLayer?: (e: MapLayerMouseEvent) => void
  children?: ReactNode
}

export const MapContainer = forwardRef<MapContainerHandle, MapContainerProps>(
  function MapContainer({ basemap, onClickLayer, onHoverLayer, children }, ref) {
  const mapRef = useRef<MapRef>(null)

  useImperativeHandle(ref, () => ({
    flyTo(center, radiusKm) {
      const km = radiusKm ?? 50
      // Approximate degrees offset from km (1 deg lat ≈ 111 km)
      const dLat = km / 111
      const dLng = km / (111 * Math.cos((center[1] * Math.PI) / 180))
      mapRef.current?.fitBounds(
        [center[0] - dLng, center[1] - dLat, center[0] + dLng, center[1] + dLat],
        { padding: 40, duration: 1200 },
      )
    },
  }))

  const handleLoad = useCallback(() => {
    mapRef.current?.fitBounds(
      [166.3, -47.5, 178.7, -34.3],
      { padding: 20, duration: 0 },
    )
  }, [])

  // Swap basemap tiles imperatively — avoids setStyle() which destroys all feature layers
  useEffect(() => {
    const map = mapRef.current?.getMap()
    if (!map || !map.isStyleLoaded()) return
    const source = map.getSource('basemap') as RasterTileSource | undefined
    if (!source) return
    source.setTiles([...BASEMAPS[basemap].tiles])
  }, [basemap])
  const [hoverInfo, setHoverInfo] = useState<{
    longitude: number
    latitude: number
    name: string
    rc?: string
    sa3_name?: string
    tot_pop?: number
  } | null>(null)

  const interactiveLayerIds = [
    'regions-fill',
    'gp-points',
    'gp-clusters',
    'hospital-points',
  ]

  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      onClickLayer?.(e)
    },
    [onClickLayer],
  )

  const handleMouseMove = useCallback(
    (e: MapLayerMouseEvent) => {
      const map = mapRef.current?.getMap()
      if (!map) return

      const feature = e.features?.[0]
      if (feature) {
        map.getCanvas().style.cursor = 'pointer'
        const layerId = feature.layer?.id
        if (layerId === 'regions-fill' && feature.properties?.sa3_name) {
          setHoverInfo({
            longitude: e.lngLat.lng,
            latitude: e.lngLat.lat,
            name: feature.properties.sa3_name,
            rc: feature.properties.rc,
            sa3_name: feature.properties.sa3_name,
            tot_pop: feature.properties.tot_pop,
          })
        } else if (
          (layerId === 'gp-points' || layerId === 'hospital-points') &&
          feature.properties?.name
        ) {
          setHoverInfo({
            longitude: e.lngLat.lng,
            latitude: e.lngLat.lat,
            name: feature.properties.name,
          })
        } else {
          setHoverInfo(null)
        }
      } else {
        map.getCanvas().style.cursor = ''
        setHoverInfo(null)
      }
      onHoverLayer?.(e)
    },
    [onHoverLayer],
  )

  const handleMouseLeave = useCallback(() => {
    const map = mapRef.current?.getMap()
    if (map) {
      map.getCanvas().style.cursor = ''
    }
    setHoverInfo(null)
  }, [])

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        bounds: [166.3, -47.5, 178.7, -34.3] as [number, number, number, number],
        fitBoundsOptions: { padding: 20 },
      }}
      minZoom={MAP_DEFAULTS.minZoom}
      maxZoom={MAP_DEFAULTS.maxZoom}
      mapStyle={initialStyle}
      interactiveLayerIds={interactiveLayerIds}
      onLoad={handleLoad}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ width: '100%', height: '100%' }}
    >
      <NavigationControl position="top-right" />
      {children}
      {hoverInfo && (
        <Popup
          longitude={hoverInfo.longitude}
          latitude={hoverInfo.latitude}
          closeButton={false}
          closeOnClick={false}
          anchor="bottom"
          offset={12}
          className="pointer-events-none"
        >
          <div className="font-body text-xs text-pho-navy">
            {hoverInfo.rc ? (
              <>
                <div className="font-bold">{hoverInfo.rc}</div>
                <div>{hoverInfo.sa3_name}</div>
                {hoverInfo.tot_pop != null && (
                  <div className="text-gray-600">
                    Pop: {hoverInfo.tot_pop.toLocaleString()}
                  </div>
                )}
              </>
            ) : (
              <span className="font-medium">{hoverInfo.name}</span>
            )}
          </div>
        </Popup>
      )}
    </Map>
  )
})
