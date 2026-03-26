import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import turfDistance from "@turf/distance";
import { point } from "@turf/helpers";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import type { Feature, Point, MultiPolygon, Polygon } from "geojson";

const dataDir = resolve(import.meta.dirname!, "../public/data");

// ── Load data ──────────────────────────────────────────────────────────

const gpData = JSON.parse(readFileSync(resolve(dataDir, "gp-practices.json"), "utf-8"));
const hospitalData = JSON.parse(readFileSync(resolve(dataDir, "hospitals.json"), "utf-8"));
const sa3Data = JSON.parse(readFileSync(resolve(dataDir, "sa3_regions.geojson"), "utf-8"));

interface GpProps {
  name: string;
  address: string;
  pho: string;
  enrolled: number;
  acceptingPatients: boolean;
  dhb: string;
}

interface HospitalProps {
  name: string;
  type: string;
  phone?: string;
  hours?: string;
  url?: string;
}

interface Sa3Props {
  sa3_code: string;
  sa3_name: string;
  rc: string;
  tot_pop: number;
  mao_pop: number;
  pac_pop: number;
  nz_dep: number | null;
}

type GpFeature = Feature<Point, GpProps>;
type HospitalFeature = Feature<Point, HospitalProps>;
type Sa3Feature = Feature<Polygon | MultiPolygon, Sa3Props>;

const gpPractices: GpFeature[] = gpData.features;
const hospitals: HospitalFeature[] = hospitalData.features;
const sa3Regions: Sa3Feature[] = sa3Data.features;

const edHospitals = hospitals.filter((h) => h.properties.type === "DHB ED Department");
const afterHoursClinics = hospitals.filter((h) => h.properties.type === "Community After Hours Clinic");

console.log(`Loaded: ${gpPractices.length} GP practices, ${edHospitals.length} ED hospitals, ${afterHoursClinics.length} after-hours clinics, ${sa3Regions.length} SA3 regions\n`);

// ── Spatial join: GP → SA3 region ──────────────────────────────────────

interface GpEnriched {
  name: string;
  address: string;
  pho: string;
  dhb: string;
  enrolled: number;
  acceptingPatients: boolean;
  coords: [number, number];
  sa3_name: string | null;
  sa3_region: string | null;
  nz_dep: number | null;
  tot_pop: number | null;
  mao_pop: number | null;
  pac_pop: number | null;
  nearestEdName: string;
  nearestEdKm: number;
  nearestAhName: string;
  nearestAhKm: number;
}

function findSa3ForPoint(coords: [number, number]): Sa3Feature | null {
  const pt = point(coords);
  for (const region of sa3Regions) {
    if (!region.geometry) continue;
    if (booleanPointInPolygon(pt, region)) {
      return region;
    }
  }
  return null;
}

function distanceKm(a: [number, number], b: [number, number]): number {
  return turfDistance(point(a), point(b), { units: "kilometers" });
}

const enriched: GpEnriched[] = gpPractices.map((gp) => {
  const coords = gp.geometry.coordinates as [number, number];
  const sa3 = findSa3ForPoint(coords);

  // Find nearest ED
  let nearestEdName = "N/A";
  let nearestEdKm = Infinity;
  for (const ed of edHospitals) {
    const d = distanceKm(coords, ed.geometry.coordinates as [number, number]);
    if (d < nearestEdKm) {
      nearestEdKm = d;
      nearestEdName = ed.properties.name;
    }
  }

  // Find nearest after-hours clinic
  let nearestAhName = "N/A";
  let nearestAhKm = Infinity;
  for (const ah of afterHoursClinics) {
    const d = distanceKm(coords, ah.geometry.coordinates as [number, number]);
    if (d < nearestAhKm) {
      nearestAhKm = d;
      nearestAhName = ah.properties.name;
    }
  }

  return {
    name: gp.properties.name,
    address: gp.properties.address,
    pho: gp.properties.pho,
    dhb: gp.properties.dhb,
    enrolled: gp.properties.enrolled,
    acceptingPatients: gp.properties.acceptingPatients,
    coords,
    sa3_name: sa3?.properties.sa3_name ?? null,
    sa3_region: sa3?.properties.rc ?? null,
    nz_dep: sa3?.properties.nz_dep ?? null,
    tot_pop: sa3?.properties.tot_pop ?? null,
    mao_pop: sa3?.properties.mao_pop ?? null,
    pac_pop: sa3?.properties.pac_pop ?? null,
    nearestEdName,
    nearestEdKm: Math.round(nearestEdKm * 10) / 10,
    nearestAhName,
    nearestAhKm: Math.round(nearestAhKm * 10) / 10,
  };
});

// ── TABLE 1: Practice demographics (population served) ─────────────────

console.log("═".repeat(120));
console.log("TABLE 1: GP PRACTICES — POPULATION & DEMOGRAPHICS OF SURROUNDING AREA (SA3)");
console.log("═".repeat(120));
console.log(
  [
    "Practice".padEnd(40),
    "DHB".padEnd(25),
    "Enrolled".padStart(8),
    "SA3 Area".padEnd(25),
    "Dep".padStart(4),
    "Pop".padStart(8),
    "Māori%".padStart(7),
    "Pasifika%".padStart(9),
  ].join(" ")
);
console.log("─".repeat(120));

const sorted = [...enriched].sort((a, b) => (b.nz_dep ?? 0) - (a.nz_dep ?? 0));

for (const gp of sorted) {
  const maoPct = gp.tot_pop && gp.mao_pop ? ((gp.mao_pop / gp.tot_pop) * 100).toFixed(1) : "-";
  const pacPct = gp.tot_pop && gp.pac_pop ? ((gp.pac_pop / gp.tot_pop) * 100).toFixed(1) : "-";

  console.log(
    [
      gp.name.slice(0, 40).padEnd(40),
      gp.dhb.replace(" District Health Board", "").slice(0, 25).padEnd(25),
      String(gp.enrolled).padStart(8),
      (gp.sa3_name ?? "—").slice(0, 25).padEnd(25),
      gp.nz_dep != null ? gp.nz_dep.toFixed(1).padStart(4) : "  —",
      gp.tot_pop != null ? String(gp.tot_pop).padStart(8) : "       —",
      String(maoPct).padStart(7),
      String(pacPct).padStart(9),
    ].join(" ")
  );
}

// ── TABLE 2: Proximity to ED hospitals (binned) ────────────────────────

const bins = [
  { label: "< 15 km", max: 15 },
  { label: "15–30 km", max: 30 },
  { label: "30–50 km", max: 50 },
  { label: "50–100 km", max: 100 },
  { label: "100+ km", max: Infinity },
];

console.log("\n" + "═".repeat(80));
console.log("TABLE 2: GP PRACTICES — PROXIMITY TO NEAREST ED HOSPITAL");
console.log("═".repeat(80));
console.log(
  ["Distance Band".padEnd(15), "Count".padStart(6), "Enrolled".padStart(10), "Practices"].join("  ")
);
console.log("─".repeat(80));

for (const bin of bins) {
  const prevMax = bins[bins.indexOf(bin) - 1]?.max ?? 0;
  const inBin = enriched.filter((gp) => gp.nearestEdKm > prevMax && gp.nearestEdKm <= bin.max);
  const totalEnrolled = inBin.reduce((sum, gp) => sum + gp.enrolled, 0);
  const names = inBin
    .sort((a, b) => a.nearestEdKm - b.nearestEdKm)
    .map((gp) => `${gp.name} (${gp.nearestEdKm}km)`)
    .join(", ");

  console.log(
    [
      bin.label.padEnd(15),
      String(inBin.length).padStart(6),
      String(totalEnrolled).padStart(10),
      names.length > 0 ? names.slice(0, 200) : "—",
    ].join("  ")
  );
}

// ── TABLE 3: Most remote / access-challenged practices ─────────────────

console.log("\n" + "═".repeat(130));
console.log("TABLE 3: MOST REMOTE & ACCESS-CHALLENGED PRACTICES");
console.log("(Criteria: >50km from ED, OR deprivation ≥8, OR both high Māori/Pasifika % and dep ≥7)");
console.log("═".repeat(130));

interface AccessFlag {
  gp: GpEnriched;
  flags: string[];
}

const flagged: AccessFlag[] = [];

for (const gp of enriched) {
  const flags: string[] = [];
  if (gp.nearestEdKm > 50) flags.push(`Remote (${gp.nearestEdKm}km to ED)`);
  if (gp.nz_dep != null && gp.nz_dep >= 8) flags.push(`High deprivation (${gp.nz_dep})`);

  const maoPct = gp.tot_pop && gp.mao_pop ? (gp.mao_pop / gp.tot_pop) * 100 : 0;
  const pacPct = gp.tot_pop && gp.pac_pop ? (gp.pac_pop / gp.tot_pop) * 100 : 0;
  if ((maoPct > 30 || pacPct > 15) && gp.nz_dep != null && gp.nz_dep >= 7)
    flags.push(`Equity concern (Māori ${maoPct.toFixed(0)}%, Pasifika ${pacPct.toFixed(0)}%)`);

  if (!gp.acceptingPatients) flags.push("Not accepting patients");

  if (flags.length > 0) flagged.push({ gp, flags });
}

flagged.sort((a, b) => b.flags.length - a.flags.length || b.gp.nearestEdKm - a.gp.nearestEdKm);

console.log(
  [
    "Practice".padEnd(40),
    "Enrolled".padStart(8),
    "SA3 Area".padEnd(22),
    "Dep".padStart(4),
    "ED Dist".padStart(8),
    "Nearest ED".padEnd(30),
    "Flags",
  ].join(" ")
);
console.log("─".repeat(130));

for (const { gp, flags } of flagged) {
  console.log(
    [
      gp.name.slice(0, 40).padEnd(40),
      String(gp.enrolled).padStart(8),
      (gp.sa3_name ?? "—").slice(0, 22).padEnd(22),
      gp.nz_dep != null ? gp.nz_dep.toFixed(1).padStart(4) : "  —",
      `${gp.nearestEdKm}km`.padStart(8),
      gp.nearestEdName.replace(" Emergency Department", " ED").slice(0, 30).padEnd(30),
      flags.join("; "),
    ].join(" ")
  );
}

console.log(`\nTotal flagged: ${flagged.length} of ${enriched.length} practices`);

// ── TABLE 4: Summary by deprivation decile ─────────────────────────────

console.log("\n" + "═".repeat(70));
console.log("TABLE 4: PRACTICES BY DEPRIVATION DECILE");
console.log("═".repeat(70));
console.log(
  ["Decile".padEnd(8), "Practices".padStart(10), "Enrolled".padStart(10), "Avg ED Dist".padStart(12), "Avg Māori%".padStart(11)].join(
    "  "
  )
);
console.log("─".repeat(70));

for (let d = 1; d <= 10; d++) {
  const inDecile = enriched.filter((gp) => gp.nz_dep != null && Math.round(gp.nz_dep) === d);
  if (inDecile.length === 0) continue;
  const totalEnrolled = inDecile.reduce((sum, gp) => sum + gp.enrolled, 0);
  const avgEdDist = inDecile.reduce((sum, gp) => sum + gp.nearestEdKm, 0) / inDecile.length;
  const avgMao =
    inDecile.reduce((sum, gp) => sum + (gp.tot_pop && gp.mao_pop ? (gp.mao_pop / gp.tot_pop) * 100 : 0), 0) / inDecile.length;

  console.log(
    [
      String(d).padEnd(8),
      String(inDecile.length).padStart(10),
      String(totalEnrolled).padStart(10),
      `${avgEdDist.toFixed(1)}km`.padStart(12),
      `${avgMao.toFixed(1)}%`.padStart(11),
    ].join("  ")
  );
}

const unmatched = enriched.filter((gp) => gp.nz_dep == null);
if (unmatched.length > 0) {
  console.log(`\n${unmatched.length} practice(s) could not be matched to an SA3 region:`);
  for (const gp of unmatched) {
    console.log(`  - ${gp.name} (${gp.address})`);
  }
}

// ── Write CSV for further use ──────────────────────────────────────────

const csvHeader = [
  "name", "address", "pho", "dhb", "enrolled", "accepting_patients",
  "sa3_name", "region", "nz_dep", "sa3_pop", "sa3_maori_pct", "sa3_pasifika_pct",
  "nearest_ed", "nearest_ed_km", "nearest_afterhours", "nearest_afterhours_km",
].join(",");

const csvRows = enriched.map((gp) => {
  const maoPct = gp.tot_pop && gp.mao_pop ? ((gp.mao_pop / gp.tot_pop) * 100).toFixed(1) : "";
  const pacPct = gp.tot_pop && gp.pac_pop ? ((gp.pac_pop / gp.tot_pop) * 100).toFixed(1) : "";
  return [
    `"${gp.name}"`,
    `"${gp.address}"`,
    `"${gp.pho}"`,
    `"${gp.dhb}"`,
    gp.enrolled,
    gp.acceptingPatients,
    `"${gp.sa3_name ?? ""}"`,
    `"${gp.sa3_region ?? ""}"`,
    gp.nz_dep ?? "",
    gp.tot_pop ?? "",
    maoPct,
    pacPct,
    `"${gp.nearestEdName}"`,
    gp.nearestEdKm,
    `"${gp.nearestAhName}"`,
    gp.nearestAhKm,
  ].join(",");
});

const csvPath = resolve(dataDir, "gp-summary.csv");
writeFileSync(csvPath, [csvHeader, ...csvRows].join("\n") + "\n");
console.log(`\n✓ CSV written to ${csvPath}`);
