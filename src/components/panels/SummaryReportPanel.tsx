import { X } from 'lucide-react'

interface SummaryReportPanelProps {
  open: boolean
  onClose: () => void
}

export function SummaryReportPanel({ open, onClose }: SummaryReportPanelProps) {
  return (
    <div
      className={`absolute inset-0 z-30 flex transition-opacity duration-200 ${
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div
        className={`relative ml-auto h-full w-full max-w-3xl bg-white shadow-xl transition-transform duration-200 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-pho-teal/30 px-6 py-4">
            <h1 className="font-heading text-lg font-semibold text-pho-navy">
              GP Practice Access &amp; Equity Summary
            </h1>
            <button
              onClick={onClose}
              className="rounded p-1 hover:bg-pho-light"
              aria-label="Close report"
            >
              <X className="h-5 w-5 text-pho-navy" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 text-sm text-gray-700">
            <p className="mb-6 text-xs text-gray-500">
              Generated 24 March 2026 — 111 GP practices, 34 ED hospitals,
              109 after-hours clinics, 863 SA3 statistical areas
            </p>

            {/* ── Section 1: Proximity ── */}
            <Section title="1. Proximity to Urgent / After-Hours Care">
              <p className="mb-3">
                Straight-line distance from each GP practice to the nearest community
                after-hours clinic and the nearest Emergency Department.
              </p>

              <h4 className="mb-2 font-heading text-xs font-semibold text-pho-navy">
                Nearest after-hours clinic
              </h4>
              <Table
                headers={['Distance Band', 'Practices', 'Total Enrolled', '% of Enrolled']}
                alignRight={[1, 2, 3]}
                rows={[
                  ['< 15 km', '78', '534,761', '71.0%'],
                  ['15–30 km', '14', '93,519', '12.4%'],
                  ['30–50 km', '8', '46,075', '6.1%'],
                  ['50–100 km', '5', '26,866', '3.6%'],
                  ['100+ km', '2', '27,029', '3.6%'],
                ]}
              />
              <Callout>
                71% of enrolled patients are within 15 km of an after-hours clinic, but 15 practices
                (13.3% of enrolled) are more than 30 km away. Two practices in Gisborne (27,029
                patients) are 100+ km from the nearest after-hours clinic.
              </Callout>

              <h4 className="mb-2 mt-4 font-heading text-xs font-semibold text-pho-navy">
                Practices &gt; 30 km from nearest after-hours clinic
              </h4>
              <p className="mb-2 text-xs text-gray-500">
                ED distance shown for comparison.
              </p>
              <Table
                headers={['Practice', 'Enrolled', 'Nearest AH Clinic', 'AH Dist.', 'ED Dist.', 'Dep.']}
                alignRight={[1, 3, 4, 5]}
                compact
                rows={[
                  ['Three Rivers Medical Centre', '20,450', 'Whakatāne Hospital ED GP Clinic', '120.5 km', '4.0 km', '9.1'],
                  ['City Medical Centre Gisborne', '6,579', 'Whakatāne Hospital ED GP Clinic', '119.9 km', '3.3 km', '9.1'],
                  ['South Hill Family Practice', '1,800', 'Timaru After Hours Medical', '81.6 km', '0.8 km', '7.0'],
                  ['Oamaru Doctors', '3,833', 'Timaru After Hours Medical', '80.5 km', '0.3 km', '8.1'],
                  ['Lumsden Medical Centre', '2,483', 'Invercargill Urgent Doctor', '75.4 km', '55.8 km', '4.3'],
                  ['Three Rivers Health (Ashburton)', '10,550', 'WeCare Health - Rolleston', '61.0 km', '69.3 km', '4.6'],
                  ['Gore Medical Centre', '8,200', 'Invercargill Urgent Doctor', '56.4 km', '0.2 km', '6.1'],
                  ['Tuapeka Community Health', '1,163', 'Clutha Health First', '35.4 km', '61.6 km', '4.7'],
                  ['Toi Ora Health Satellite', '1,800', 'Whakatāne Hospital ED GP Clinic', '33.2 km', '27.4 km', '9.1'],
                  ['East Otago Health - Waikouaiti', '2,300', 'Dunedin Urgent Doctor', '32.7 km', '33.0 km', '4.9'],
                ]}
              />

              <h4 className="mb-2 mt-4 font-heading text-xs font-semibold text-pho-navy">
                Nearest Emergency Department (for reference)
              </h4>
              <Table
                headers={['Distance Band', 'Practices', 'Total Enrolled', '% of Enrolled']}
                alignRight={[1, 2, 3]}
                rows={[
                  ['< 15 km', '73', '492,573', '65.4%'],
                  ['15–30 km', '20', '167,033', '22.2%'],
                  ['30–50 km', '7', '33,212', '4.4%'],
                  ['50–100 km', '11', '60,729', '8.1%'],
                ]}
              />
            </Section>

            {/* ── Section 2: Deprivation ── */}
            <Section title="2. Deprivation Profile">
              <p className="mb-3">
                Practices grouped by the NZ Deprivation Index decile of their SA3 area
                (1 = least deprived, 10 = most deprived).
              </p>
              <Table
                headers={['Decile', 'Practices', 'Enrolled', 'Avg AH Dist.', 'Avg ED Dist.', 'Avg Māori %', 'Avg Pasifika %']}
                alignRight={[1, 2, 3, 4, 5, 6]}
                rows={[
                  ['1', '3', '25,300', '3.9 km', '7.8 km', '4.9%', '1.6%'],
                  ['2', '7', '62,424', '2.1 km', '10.5 km', '8.6%', '2.5%'],
                  ['3', '6', '78,100', '11.6 km', '16.3 km', '8.4%', '2.3%'],
                  ['4', '20', '124,051', '9.3 km', '23.3 km', '12.1%', '3.0%'],
                  ['5', '17', '78,774', '14.2 km', '19.1 km', '11.9%', '4.1%'],
                  ['6', '8', '55,823', '15.6 km', '21.0 km', '14.4%', '4.3%'],
                  ['7', '20', '121,485', '11.1 km', '13.2 km', '15.5%', '4.3%'],
                  ['8', '13', '75,473', '16.0 km', '8.7 km', '23.5%', '10.2%'],
                  ['9', '12', '85,131', '23.4 km', '7.9 km', '35.1%', '12.1%'],
                  ['10', '5', '46,986', '9.7 km', '11.2 km', '39.0%', '22.5%'],
                ]}
              />
              <Callout>
                Practices in the most deprived areas (decile 8–10) serve populations with 3–8× the
                Māori and Pasifika concentration compared to decile 1–2. These 30 practices serve
                207,590 enrolled patients (27.6% of total). Notably, decile 8–9 areas have <em>worse </em>
                after-hours access (16–23 km avg) than ED access (8–9 km avg), suggesting
                after-hours clinics are not located where deprivation is highest.
              </Callout>
            </Section>

            {/* ── Section 3: Flagged practices ── */}
            <Section title="3. Access-Challenged Practices">
              <p className="mb-1 text-xs text-gray-500">
                Flagged for: <strong>Remote</strong> (&gt;50 km from after-hours care),{' '}
                <strong>High deprivation</strong> (dep ≥ 8), or{' '}
                <strong>Equity concern</strong> (Māori &gt;30% or Pasifika &gt;15% with dep ≥ 7).
              </p>
              <p className="mb-3 text-xs text-gray-500">39 of 111 practices flagged.</p>

              <h4 className="mb-2 font-heading text-xs font-semibold text-pho-navy">
                Multiple flags (highest concern)
              </h4>
              <Table
                headers={['Practice', 'Enrolled', 'SA3 Area', 'Dep.', 'AH Dist.', 'Flags']}
                alignRight={[1, 3, 4]}
                compact
                rows={MULTI_FLAG_ROWS}
              />

              <h4 className="mb-2 mt-4 font-heading text-xs font-semibold text-pho-navy">
                Remote only (&gt; 50 km from after-hours care)
              </h4>
              <Table
                headers={['Practice', 'Enrolled', 'Nearest AH Clinic', 'AH Dist.', 'ED Dist.', 'Dep.']}
                alignRight={[1, 3, 4, 5]}
                compact
                rows={[
                  ['Three Rivers Medical Centre', '20,450', 'Whakatāne Hospital ED GP Clinic', '120.5 km', '4.0 km', '9.1'],
                  ['City Medical Centre Gisborne', '6,579', 'Whakatāne Hospital ED GP Clinic', '119.9 km', '3.3 km', '9.1'],
                  ['South Hill Family Practice', '1,800', 'Timaru After Hours Medical', '81.6 km', '0.8 km', '7.0'],
                  ['Oamaru Doctors', '3,833', 'Timaru After Hours Medical', '80.5 km', '0.3 km', '8.1'],
                  ['Lumsden Medical Centre', '2,483', 'Invercargill Urgent Doctor', '75.4 km', '55.8 km', '4.3'],
                  ['Three Rivers Health (Ashburton)', '10,550', 'WeCare Health - Rolleston', '61.0 km', '69.3 km', '4.6'],
                  ['Gore Medical Centre', '8,200', 'Invercargill Urgent Doctor', '56.4 km', '0.2 km', '6.1'],
                ]}
              />

              <h4 className="mb-2 mt-4 font-heading text-xs font-semibold text-pho-navy">
                High deprivation only (near after-hours care)
              </h4>
              <Table
                headers={['Practice', 'Enrolled', 'SA3 Area', 'Dep.', 'AH Dist.']}
                alignRight={[1, 3, 4]}
                compact
                rows={[
                  ['Wicksteed Medical Centre', '8,000', 'Whanganui Centre', '9.4', '2.0 km'],
                  ['South City Medical (Invercargill)', '2,900', 'Strathern', '9.0', '1.8 km'],
                  ['Invercargill Medical Centre', '12,600', 'Invercargill Centre-Avenal', '8.6', '0.3 km'],
                  ['Arena HealthCare', '4,200', 'Invercargill Centre-Avenal', '8.6', '1.0 km'],
                  ['Eltham Health Centre', '2,150', 'South Taranaki District North', '8.3', '46.0 km'],
                  ['Meridian Medical Centre', '6,300', 'Dunedin Centre', '8.3', '0.3 km'],
                  ['Dee Street Primary Care', '6,824', 'Timaru Centre', '8.3', '0.6 km'],
                  ['Victoria Clinic (M)', '6,699', 'Hamilton Centre', '8.1', '0 km'],
                  ['Little London Medical Clinic', '3,200', 'Hamilton Centre', '8.1', '0.6 km'],
                  ['Stortford Accident and Medical', '2,049', 'St Leonards', '8.0', '1.3 km'],
                  ['North Avon Medical Centre', '5,015', 'Richmond (Christchurch)', '8.0', '1.1 km'],
                ]}
              />
            </Section>

            {/* ── Methodology ── */}
            <Section title="Methodology">
              <dl className="space-y-1.5 text-xs text-gray-600">
                <MethodItem label="Data sources">
                  NZ HPI facility register (Jan 2026), PHO enrollment data, SA3 census demographics
                  with NZ Deprivation Index, Healthpoint.co.nz
                </MethodItem>
                <MethodItem label="Spatial join">
                  Each GP practice point matched to its containing SA3 statistical area using
                  point-in-polygon
                </MethodItem>
                <MethodItem label="After-hours distance">
                  Straight-line (haversine) distance to nearest community after-hours clinic (109
                  sites) — actual travel distances will be longer
                </MethodItem>
                <MethodItem label="ED distance">
                  Straight-line distance to nearest hospital Emergency Department (34 sites)
                </MethodItem>
                <MethodItem label="Deprivation">
                  NZ Deprivation Index 2018, averaged at SA3 level (1 = least, 10 = most deprived)
                </MethodItem>
                <MethodItem label="Ethnicity %">
                  Māori and Pacific peoples as % of SA3 total population (Census 2023)
                </MethodItem>
                <MethodItem label="Enrolled">
                  Enrolled Service Users (ESUs) from PHO register
                </MethodItem>
              </dl>
            </Section>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Reusable sub-components ─────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 border-b border-pho-teal/20 pb-1 font-heading text-sm font-semibold text-pho-navy">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded border-l-3 border-pho-teal bg-pho-light px-3 py-2 text-xs text-pho-navy">
      {children}
    </div>
  )
}

function MethodItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="inline font-semibold text-gray-700">{label}: </dt>
      <dd className="inline">{children}</dd>
    </div>
  )
}

function Table({
  headers,
  rows,
  alignRight = [],
  compact = false,
}: {
  headers: string[]
  rows: string[][]
  alignRight?: number[]
  compact?: boolean
}) {
  const cellPad = compact ? 'px-2 py-1' : 'px-3 py-1.5'
  return (
    <div className="overflow-x-auto rounded border border-gray-200">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-pho-navy text-left text-white">
            {headers.map((h, i) => (
              <th
                key={i}
                className={`${cellPad} font-medium ${alignRight.includes(i) ? 'text-right' : ''}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={`${cellPad} ${alignRight.includes(ci) ? 'text-right' : ''} ${ci === 0 ? 'font-medium text-gray-900' : 'text-gray-600'}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Data ─────────────────────────────────────────────────────────────── */

const MULTI_FLAG_ROWS: string[][] = [
  ['Three Rivers Medical Centre', '20,450', 'Gisborne Centre', '9.1', '120.5 km', 'Remote AH, High dep, Equity (Māori 54%, Pasifika 7%)'],
  ['City Medical Centre Gisborne', '6,579', 'Gisborne Centre', '9.1', '119.9 km', 'Remote AH, High dep, Equity (Māori 54%, Pasifika 7%)'],
  ['Taitoko Health', '4,900', 'Levin West', '9.7', '40.2 km', 'High dep, Equity (Māori 33%, Pasifika 11%)'],
  ['Toi Ora Health Satellite', '1,800', 'Ōpōtiki', '9.1', '27.4 km', 'High dep, Equity (Māori 69%, Pasifika 5%)'],
  ['Ngaruawahia Medical Centre', '6,207', 'Ngāruawāhia-Horotiu', '8.1', '11.8 km', 'High dep, Equity (Māori 53%, Pasifika 6%)'],
  ['Clendon Medical Centre', '8,000', 'Clendon Park', '10.0', '1.9 km', 'High dep, Equity (Māori 29%, Pasifika 55%)'],
  ['Ruatahi Medical Centre', '4,684', 'Rotorua Centre', '10.0', '0.4 km', 'High dep, Equity (Māori 59%, Pasifika 8%)'],
  ['The Doctors Middlemore', '12,600', 'Māngere East', '9.8', '0.3 km', 'High dep, Equity (Māori 16%, Pasifika 67%)'],
  ['Totara Health - Flaxmere', '16,802', 'Flaxmere', '9.7', '5.5 km', 'High dep, Equity (Māori 58%, Pasifika 26%)'],
  ['Doctors @ 42', '4,264', 'Huntly', '9.1', '0.8 km', 'High dep, Equity (Māori 48%, Pasifika 10%)'],
  ['Kensington Health', '7,288', 'Kensington', '9.0', '2.2 km', 'High dep, Equity (Māori 30%, Pasifika 5%)'],
  ['South City Health (Hamilton)', '7,500', 'Frankton', '9.0', '2.1 km', 'High dep, Equity (Māori 36%, Pasifika 9%)'],
  ['Hunters Corner Medical Centre', '3,550', 'Papatoetoe', '8.9', '2.9 km', 'High dep, Equity (Māori 13%, Pasifika 35%)'],
  ['Counties Medical - Papakura', '6,000', 'Papakura', '8.5', '0 km', 'High dep, Equity (Māori 30%, Pasifika 25%)'],
  ['Glenview Medical Centre', '11,186', 'Melville', '8.4', '2.8 km', 'High dep, Equity (Māori 31%, Pasifika 9%)'],
]
