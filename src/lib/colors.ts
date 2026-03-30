export const CHOROPLETH_COLORS = [
  '#fad1d4',
  '#f2a0a3',
  '#ed696e',
  '#c23d41',
  '#3c3c3b',
] as const

export const CHOROPLETH_STOPS = [0, 2000, 5000, 10000, 50000] as const

export function getChoroplethPaintExpression(
  property: string,
): ['interpolate', ...unknown[]] {
  return [
    'interpolate',
    ['linear'],
    ['get', property],
    CHOROPLETH_STOPS[0], CHOROPLETH_COLORS[0],
    CHOROPLETH_STOPS[1], CHOROPLETH_COLORS[1],
    CHOROPLETH_STOPS[2], CHOROPLETH_COLORS[2],
    CHOROPLETH_STOPS[3], CHOROPLETH_COLORS[3],
    CHOROPLETH_STOPS[4], CHOROPLETH_COLORS[4],
  ]
}
