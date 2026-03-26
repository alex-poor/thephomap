export interface LayerConfig {
  id: string
  label: string
  description: string
  dataUrl: string
  defaultVisible: boolean
  group: 'boundaries' | 'facilities' | 'environmental'
}

export const LAYER_REGISTRY: LayerConfig[] = [
  {
    id: 'regions',
    label: 'SA3 Areas',
    description: 'NZ SA3 statistical areas with demographic data',
    dataUrl: '/data/sa3_regions.geojson',
    defaultVisible: true,
    group: 'boundaries',
  },
  {
    id: 'gp-practices',
    label: 'GP Practices',
    description: 'General practice locations',
    dataUrl: '/data/gp-practices.json',
    defaultVisible: true,
    group: 'facilities',
  },
  {
    id: 'hospitals',
    label: 'Hospitals',
    description: 'Hospital service locations',
    dataUrl: '/data/hospitals.json',
    defaultVisible: true,
    group: 'facilities',
  },
]
