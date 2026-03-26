import type { StyleSpecification } from 'maplibre-gl'

export const BASEMAPS = {
  light: {
    label: 'Light',
    tiles: [
      'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
      'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
      'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
    ],
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  },
  osm: {
    label: 'OpenStreetMap',
    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
    attribution: '&copy; OpenStreetMap contributors',
  },
} as const

export type BasemapId = keyof typeof BASEMAPS

export const DEFAULT_BASEMAP: BasemapId = 'light'

/** Initial style — only the default basemap raster. Feature layers are added declaratively by React. */
export const initialStyle: StyleSpecification = {
  version: 8,
  sources: {
    basemap: {
      type: 'raster',
      tiles: [...BASEMAPS[DEFAULT_BASEMAP].tiles],
      tileSize: 256,
      attribution: BASEMAPS[DEFAULT_BASEMAP].attribution,
    },
  },
  layers: [{ id: 'basemap', type: 'raster', source: 'basemap' }],
}

export const MAP_DEFAULTS = {
  center: [173.27, -41.02] as [number, number],
  zoom: 6,
  minZoom: 4,
  maxZoom: 18,
  maxBounds: [
    [160, -48],
    [180, -34],
  ] as [[number, number], [number, number]],
}
