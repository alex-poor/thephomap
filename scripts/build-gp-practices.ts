import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const dataDir = resolve(import.meta.dirname!, "../public/data");

function parsePipeCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n").map((l) => l.trim());
  const headers = lines[0].split("|").map(unquote);
  return lines.slice(1).map((line) => {
    const values = line.split("|").map(unquote);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? "";
    });
    return row;
  });
}

function unquote(s: string): string {
  s = s.trim();
  if (s.startsWith('"') && s.endsWith('"')) {
    return s.slice(1, -1);
  }
  return s;
}

function parseDate(dateStr: string): Date {
  // DD/MM/YYYY
  const [d, m, y] = dateStr.split("/").map(Number);
  return new Date(y, m - 1, d);
}

// Read files
const phoRows = parsePipeCSV(
  readFileSync(resolve(dataDir, "thepho.csv"), "utf-8")
);
const facilityRows = parsePipeCSV(
  readFileSync(resolve(dataDir, "Facilities20260116.csv"), "utf-8")
);

// Index facilities by HPI Organisation Id
const facilityByOrg = new Map<string, Record<string, string>[]>();
for (const row of facilityRows) {
  const orgId = row["HPI Organisation Id"];
  if (!orgId) continue;
  let arr = facilityByOrg.get(orgId);
  if (!arr) {
    arr = [];
    facilityByOrg.set(orgId, arr);
  }
  arr.push(row);
}

// Build features
const features: Record<string, unknown>[] = [];
const unmatched: string[] = [];

for (const pho of phoRows) {
  const orgId = pho["HPI_Org"];
  const candidates = facilityByOrg.get(orgId);

  if (!candidates || candidates.length === 0) {
    unmatched.push(orgId);
    continue;
  }

  // Pick best facility: prefer gpenrol, then most recent OpeningDate
  const gpenrol = candidates.filter((c) => c["Fac Type"] === "gpenrol");
  let match: Record<string, string>;

  if (gpenrol.length === 1) {
    match = gpenrol[0];
  } else if (gpenrol.length > 1) {
    match = gpenrol.sort(
      (a, b) =>
        parseDate(b["OpeningDate"]).getTime() -
        parseDate(a["OpeningDate"]).getTime()
    )[0];
  } else {
    // No gpenrol — pick any (most recent)
    match = candidates.sort(
      (a, b) =>
        parseDate(b["OpeningDate"]).getTime() -
        parseDate(a["OpeningDate"]).getTime()
    )[0];
  }

  const x = parseFloat(match["NZGD2K X"]);
  const y = parseFloat(match["NZGD2K Y"]);

  if (isNaN(x) || isNaN(y)) {
    unmatched.push(orgId);
    continue;
  }

  features.push({
    type: "Feature",
    properties: {
      name: match["Name"],
      address: match["Address"],
      pho: pho["PHO"],
      enrolled: parseInt(pho["ESUs"], 10),
      acceptingPatients: true,
      dhb: match["DHB Name"],
    },
    geometry: {
      type: "Point",
      coordinates: [x, y],
    },
  });
}

const geojson = {
  type: "FeatureCollection",
  features,
};

const outPath = resolve(dataDir, "gp-practices.json");
writeFileSync(outPath, JSON.stringify(geojson, null, 2), "utf-8");

console.log(`Matched: ${features.length}`);
console.log(`Unmatched: ${unmatched.length}`);
if (unmatched.length > 0) {
  console.log(`Unmatched HPI_Org values: ${unmatched.join(", ")}`);
}
console.log(`Written to ${outPath}`);
