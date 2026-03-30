import { useState, useRef, useCallback } from 'react'
import { Search } from 'lucide-react'
import type { Feature, Point } from 'geojson'
import type {
  GpPracticeProperties,
  HospitalProperties,
} from '../../data/types.ts'

interface SearchResult {
  type: 'gp' | 'hospital'
  name: string
  feature: Feature<Point, GpPracticeProperties | HospitalProperties>
}

interface SearchFilterProps {
  gpPractices: Feature<Point, GpPracticeProperties>[]
  hospitals: Feature<Point, HospitalProperties>[]
  onSelect: (result: SearchResult) => void
}

export function SearchFilter({
  gpPractices,
  hospitals,
  onSelect,
}: SearchFilterProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const listRef = useRef<HTMLUListElement>(null)

  const results: SearchResult[] =
    query.length < 2
      ? []
      : [
          ...gpPractices
            .filter((f) =>
              f.properties.name.toLowerCase().includes(query.toLowerCase()),
            )
            .slice(0, 5)
            .map(
              (f): SearchResult => ({
                type: 'gp',
                name: f.properties.name,
                feature: f,
              }),
            ),
          ...hospitals
            .filter((f) =>
              f.properties.name.toLowerCase().includes(query.toLowerCase()),
            )
            .slice(0, 5)
            .map(
              (f): SearchResult => ({
                type: 'hospital',
                name: f.properties.name,
                feature: f,
              }),
            ),
        ]

  const pick = useCallback(
    (r: SearchResult) => {
      onSelect(r)
      setQuery('')
      setActiveIndex(-1)
    },
    [onSelect],
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      pick(results[activeIndex])
    } else if (e.key === 'Escape') {
      setQuery('')
      setActiveIndex(-1)
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search facilities..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActiveIndex(-1)
          }}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={results.length > 0}
          aria-activedescendant={
            activeIndex >= 0 ? `search-result-${activeIndex}` : undefined
          }
          className="w-full rounded-md border border-gray-200 py-1.5 pl-8 pr-3 text-sm focus:border-pho-hibiscus focus:outline-none focus:ring-1 focus:ring-pho-hibiscus"
        />
      </div>

      {results.length > 0 && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg"
        >
          {results.map((r, i) => (
            <li
              key={i}
              id={`search-result-${i}`}
              role="option"
              aria-selected={i === activeIndex}
            >
              <button
                onClick={() => pick(r)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                  i === activeIndex ? 'bg-pho-dusk' : ''
                }`}
              >
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    r.type === 'gp' ? 'bg-pho-hibiscus' : 'bg-pho-onyx'
                  }`}
                />
                <span className="text-gray-700">{r.name}</span>
                <span className="ml-auto text-xs text-gray-400">
                  {r.type === 'gp' ? 'GP' : 'Hospital'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
