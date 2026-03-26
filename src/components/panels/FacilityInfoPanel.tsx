import type { Feature, Point } from 'geojson'
import type {
  GpPracticeProperties,
  HospitalProperties,
} from '../../data/types.ts'
import type { NearestHospital } from '../../lib/proximity.ts'
import { formatDistance } from '../../lib/geo.ts'

interface GpInfoProps {
  feature: Feature<Point, GpPracticeProperties>
  nearestHospitals: NearestHospital[]
}

export function GpPracticeInfoPanel({
  feature,
  nearestHospitals,
}: GpInfoProps) {
  const { name, address, pho, enrolled, acceptingPatients } = feature.properties

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-heading text-lg font-semibold text-pho-navy">{name}</h3>
        <p className="text-sm text-gray-500">{address}</p>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <dt className="text-gray-500">PHO</dt>
        <dd className="font-medium text-gray-900">{pho}</dd>

        <dt className="text-gray-500">Enrolled</dt>
        <dd className="font-medium text-gray-900">
          {enrolled?.toLocaleString() ?? 'N/A'}
        </dd>

        <dt className="text-gray-500">Accepting Patients</dt>
        <dd className="font-medium text-gray-900">
          {acceptingPatients ? 'Yes' : 'No'}
        </dd>
      </dl>

      {/* Nearest urgent/after-hours care */}
      {nearestHospitals.length > 0 && (
        <div>
          <h4 className="mb-2 font-heading text-sm font-semibold text-pho-navy">
            Nearest Urgent / After-Hours Care
          </h4>
          <ul className="space-y-2">
            {nearestHospitals.map((nh, i) => (
              <li
                key={i}
                className="rounded-md bg-gray-50 p-2 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {nh.feature.properties.name}
                  </span>
                  <span className="text-gray-500">
                    {formatDistance(nh.distanceKm)}
                  </span>
                </div>
                {nh.feature.properties.services?.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {nh.feature.properties.services.map((s: string) => (
                      <span
                        key={s}
                        className="rounded bg-pho-light px-1.5 py-0.5 text-xs text-pho-blue"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

interface HospitalInfoProps {
  feature: Feature<Point, HospitalProperties>
}

export function HospitalInfoPanel({ feature }: HospitalInfoProps) {
  const { name, dhb, services, beds, emergencyDept } = feature.properties

  return (
    <div className="space-y-3">
      <h3 className="font-heading text-lg font-semibold text-pho-navy">{name}</h3>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <dt className="text-gray-500">DHB</dt>
        <dd className="font-medium text-gray-900">{dhb}</dd>

        <dt className="text-gray-500">Beds</dt>
        <dd className="font-medium text-gray-900">{beds}</dd>

        <dt className="text-gray-500">Emergency Dept</dt>
        <dd className="font-medium text-gray-900">
          {emergencyDept ? 'Yes' : 'No'}
        </dd>
      </dl>

      {services?.length > 0 && (
        <div>
          <h4 className="mb-1 font-heading text-sm font-semibold text-pho-navy">Services</h4>
          <div className="flex flex-wrap gap-1">
            {services.map((s) => (
              <span
                key={s}
                className="rounded bg-pho-navy/10 px-1.5 py-0.5 text-xs text-pho-navy"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
