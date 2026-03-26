import { useState, useCallback, useMemo, useRef } from 'react'
import { Info, BarChart3 } from 'lucide-react'
import type { MapLayerMouseEvent } from 'maplibre-gl'
import type { Feature, Point, Polygon, MultiPolygon } from 'geojson'

import { MapContainer, type MapContainerHandle } from './components/Map/MapContainer.tsx'
import {
  RegionsLayer,
  GpPracticesLayer,
  HospitalsLayer,
  ProximityRingLayer,
  SelectionLayer,
} from './components/layers/index.ts'
import { Sidebar } from './components/panels/Sidebar.tsx'
import { RegionInfoPanel } from './components/panels/RegionInfoPanel.tsx'
import {
  GpPracticeInfoPanel,
  HospitalInfoPanel,
} from './components/panels/FacilityInfoPanel.tsx'
import { LayerToggle } from './components/controls/LayerToggle.tsx'
import { Legend } from './components/controls/Legend.tsx'
import { BasemapSwitcher } from './components/controls/BasemapSwitcher.tsx'
import { SearchFilter } from './components/controls/SearchFilter.tsx'
import { SummaryReportPanel } from './components/panels/SummaryReportPanel.tsx'

import { useDataLoader } from './hooks/useDataLoader.ts'
import { useMapLayers } from './hooks/useMapLayers.ts'
import {
  useFeatureSelection,
  type SelectedFeature,
} from './hooks/useFeatureSelection.ts'

import { findNearestHospitals, DEFAULT_RADIUS_KM } from './lib/proximity.ts'

import type {
  RegionsData,
  GpPracticesData,
  HospitalsData,
  GpPracticeProperties,
  HospitalProperties,
  RegionProperties,
} from './data/types.ts'
import { type BasemapId, DEFAULT_BASEMAP } from './config/map.ts'

export default function App() {
  const mapRef = useRef<MapContainerHandle>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [basemap, setBasemap] = useState<BasemapId>(DEFAULT_BASEMAP)
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM)
  const [reportOpen, setReportOpen] = useState(false)

  const { visibility, toggleLayer } = useMapLayers()
  const { selected, selectRegion, selectGpPractice, selectHospital, clearSelection } =
    useFeatureSelection()

  const regions = useDataLoader<RegionsData>('/data/sa3_regions.geojson')
  const gpPractices = useDataLoader<GpPracticesData>('/data/gp-practices.json')
  const hospitalData = useDataLoader<HospitalsData>('/data/hospitals.json')

  const hospitalFeatures = useMemo(
    () => hospitalData.data?.features ?? [],
    [hospitalData.data],
  )

  const gpFeatures = useMemo(
    () => gpPractices.data?.features ?? [],
    [gpPractices.data],
  )

  const nearestHospitals = useMemo(() => {
    if (selected?.type !== 'gp-practice') return []
    const coords = selected.feature.geometry.coordinates as [number, number]
    return findNearestHospitals(coords, hospitalFeatures)
  }, [selected, hospitalFeatures])

  const selectedGpCenter = useMemo((): [number, number] | null => {
    if (selected?.type !== 'gp-practice') return null
    return selected.feature.geometry.coordinates as [number, number]
  }, [selected])

  const selectedFacilityCenter = useMemo((): [number, number] | null => {
    if (selected?.type === 'gp-practice' || selected?.type === 'hospital') {
      return selected.feature.geometry.coordinates as [number, number]
    }
    return null
  }, [selected])

  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0]
      if (!feature) {
        clearSelection()
        return
      }

      const layerId = feature.layer?.id
      if (layerId === 'regions-fill') {
        selectRegion(
          feature as unknown as Feature<Polygon | MultiPolygon, RegionProperties>,
        )
      } else if (layerId === 'gp-points') {
        const f = feature as unknown as Feature<Point, GpPracticeProperties>
        selectGpPractice(f)
        mapRef.current?.flyTo(f.geometry.coordinates as [number, number], radiusKm)
      } else if (layerId === 'hospital-points') {
        const f = feature as unknown as Feature<Point, HospitalProperties>
        selectHospital(f)
        mapRef.current?.flyTo(f.geometry.coordinates as [number, number], radiusKm)
      } else {
        clearSelection()
      }
    },
    [selectRegion, selectGpPractice, selectHospital, clearSelection, radiusKm],
  )

  const handleSearchSelect = useCallback(
    (result: {
      type: 'gp' | 'hospital'
      feature: Feature<Point, GpPracticeProperties | HospitalProperties>
    }) => {
      const coords = result.feature.geometry.coordinates as [number, number]
      if (result.type === 'gp') {
        selectGpPractice(
          result.feature as Feature<Point, GpPracticeProperties>,
        )
      } else {
        selectHospital(
          result.feature as Feature<Point, HospitalProperties>,
        )
      }
      mapRef.current?.flyTo(coords, radiusKm)
    },
    [selectGpPractice, selectHospital, radiusKm],
  )

  return (
    <div className="relative h-full w-full">
      <MapContainer ref={mapRef} basemap={basemap} onClickLayer={handleMapClick}>
        {regions.data && (
          <RegionsLayer
            data={regions.data}
            visible={visibility['regions'] ?? true}
          />
        )}
        {gpPractices.data && (
          <GpPracticesLayer
            data={gpPractices.data}
            hospitals={hospitalFeatures}
            visible={visibility['gp-practices'] ?? false}
            radiusKm={radiusKm}
          />
        )}
        {hospitalData.data && (
          <HospitalsLayer
            data={hospitalData.data}
            visible={visibility['hospitals'] ?? false}
          />
        )}
        <ProximityRingLayer center={selectedGpCenter} radiusKm={radiusKm} />
        <SelectionLayer center={selectedFacilityCenter} />
      </MapContainer>

      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)}>
        <SearchFilter
          gpPractices={gpFeatures}
          hospitals={hospitalFeatures}
          onSelect={handleSearchSelect}
        />

        <LayerToggle visibility={visibility} onToggle={toggleLayer} />

        {/* Proximity radius — always visible so coloring updates globally */}
        <div>
          <label className="flex items-center justify-between text-sm text-gray-600">
            <span className="flex items-center gap-1">
              Proximity Radius
              <span className="group relative">
                <Info className="h-3.5 w-3.5 cursor-help text-gray-400" />
                <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 w-52 -translate-x-1/2 rounded bg-gray-800 px-2.5 py-1.5 text-xs leading-relaxed text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  Click a GP practice on the map, then adjust this slider to show the travel radius. Practices within range are highlighted.
                </span>
              </span>
            </span>
            <span className="font-medium">{radiusKm} km</span>
          </label>
          <input
            type="range"
            min={10}
            max={150}
            step={5}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="mt-1 w-full accent-pho-teal"
          />
        </div>

        <Legend radiusKm={radiusKm} />

        {selected && (
          <div className="rounded-lg border border-pho-teal/20 bg-pho-light p-3">
            <SelectionPanel
              selected={selected}
              nearestHospitals={nearestHospitals}
            />
          </div>
        )}

        <div className="mt-auto space-y-3 border-t border-gray-200 pt-3">
          <button
            onClick={() => setReportOpen(true)}
            className="flex w-full items-center gap-2 rounded-lg border border-pho-teal/30 bg-pho-light px-3 py-2 text-sm font-medium text-pho-navy transition-colors hover:bg-pho-teal/20"
          >
            <BarChart3 className="h-4 w-4" />
            Access &amp; Equity Summary
          </button>
          <BasemapSwitcher current={basemap} onChange={setBasemap} />
        </div>
      </Sidebar>

      <SummaryReportPanel open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  )
}

function SelectionPanel({
  selected,
  nearestHospitals,
}: {
  selected: SelectedFeature
  nearestHospitals: ReturnType<typeof findNearestHospitals>
}) {
  switch (selected.type) {
    case 'region':
      return <RegionInfoPanel feature={selected.feature} />
    case 'gp-practice':
      return (
        <GpPracticeInfoPanel
          feature={selected.feature}
          nearestHospitals={nearestHospitals}
        />
      )
    case 'hospital':
      return <HospitalInfoPanel feature={selected.feature} />
  }
}
