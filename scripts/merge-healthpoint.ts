import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const dataDir = resolve(import.meta.dirname!, "../public/data");

interface Feature {
  type: "Feature";
  properties: Record<string, string>;
  geometry: { type: "Point"; coordinates: [number, number] };
}

interface FeatureCollection {
  type: "FeatureCollection";
  features: Feature[];
}

interface HealthpointEntry {
  name: string;
  url: string;
  hours: string | null;
  phone: string | null;
  lat: number;
  lng: number;
}

// Haversine distance in metres
function distanceM(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const MATCH_THRESHOLD_M = 200;

const hospitals: FeatureCollection = JSON.parse(
  readFileSync(resolve(dataDir, "hospitals.json"), "utf-8")
);
const healthpoint: HealthpointEntry[] = JSON.parse(
  readFileSync(resolve(dataDir, "healthpoint-gps.json"), "utf-8")
);

const matched = new Set<number>();
let added = 0;

for (const hp of healthpoint) {
  // Find closest existing hospital feature
  let bestIdx = -1;
  let bestDist = Infinity;

  for (let i = 0; i < hospitals.features.length; i++) {
    const [lng, lat] = hospitals.features[i].geometry.coordinates;
    const d = distanceM(hp.lat, hp.lng, lat, lng);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }

  if (bestDist < MATCH_THRESHOLD_M) {
    matched.add(bestIdx);
    const existing = hospitals.features[bestIdx];
    console.log(
      `MATCH (${Math.round(bestDist)}m): "${hp.name}" <-> "${existing.properties.name}"`
    );
    // Enrich existing entry with healthpoint data
    if (hp.phone) existing.properties.phone = hp.phone;
    if (hp.hours) existing.properties.hours = hp.hours;
    existing.properties.url = hp.url;
  } else {
    // New entry
    hospitals.features.push({
      type: "Feature",
      properties: {
        name: hp.name,
        type: "Community After Hours Clinic",
        phone: hp.phone ?? "",
        hours: hp.hours ?? "",
        url: hp.url,
      },
      geometry: {
        type: "Point",
        coordinates: [hp.lng, hp.lat],
      },
    });
    added++;
  }
}

console.log(`\nMatched: ${matched.size}`);
console.log(`Added: ${added}`);
console.log(`Total features: ${hospitals.features.length}`);

const outPath = resolve(dataDir, "hospitals.json");
writeFileSync(outPath, JSON.stringify(hospitals, null, 2), "utf-8");
console.log(`Written to ${outPath}`);
