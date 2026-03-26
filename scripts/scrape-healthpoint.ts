import { parse } from "node-html-parser";
import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL =
  "https://www.healthpoint.co.nz/gps-accident-urgent-medical-care/";

interface Practice {
  name: string;
  url: string;
  hours: string | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
}

async function fetchPage(offset: number): Promise<string> {
  const params = new URLSearchParams();
  params.append("options", "openLate");
  params.append("options", "openWeekends");
  if (offset > 0) {
    params.set("services", String(offset));
  }
  const url = `${BASE_URL}?${params}`;
  console.log(`Fetching ${url}`);
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`);
  return resp.text();
}

function parsePractices(html: string): Practice[] {
  const root = parse(html);
  const practices: Practice[] = [];

  // Practice names are in h4 > a with hrefs under /gps-accident-urgent-medical-care/
  const links = root.querySelectorAll(
    'h4 a[href*="/gps-accident-urgent-medical-care/"]'
  );

  for (const link of links) {
    const name = link.textContent.trim();
    const href = link.getAttribute("href") ?? "";
    const url = `https://www.healthpoint.co.nz${href}`;

    // Walk up to the card container to find sibling info
    const card = link.closest("li") ?? link.parentNode?.parentNode;

    let hours: string | null = null;
    let phone: string | null = null;

    if (card) {
      const p = card.querySelector("p");
      if (p) hours = p.textContent.trim();

      const tel = card.querySelector('a[href^="tel:"]');
      if (tel) phone = tel.textContent.trim().replace(/^Call:\s*/, "");
    }

    practices.push({ name, url, hours, phone, lat: null, lng: null });
  }

  return practices;
}

async function fetchCoordinates(
  practiceUrl: string
): Promise<{ lat: number; lng: number } | null> {
  const resp = await fetch(practiceUrl);
  if (!resp.ok) {
    console.warn(`  WARN: HTTP ${resp.status} for ${practiceUrl}`);
    return null;
  }
  const html = await resp.text();
  // Match Google Maps place link: /@lat,lng,zoomz
  const match = html.match(
    /maps\/place\/[^"]*\/@(-?\d+\.?\d*),(-?\d+\.?\d*),/
  );
  if (match) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }
  return null;
}

function hasNextPage(html: string): boolean {
  const root = parse(html);
  // Look for a "Next page" link
  const allLinks = root.querySelectorAll("a");
  return allLinks.some((a) => /next\s*page/i.test(a.textContent));
}

async function main() {
  const all: Practice[] = [];
  const seen = new Set<string>();
  let offset = 0;

  while (true) {
    const html = await fetchPage(offset);
    const practices = parsePractices(html);

    if (practices.length === 0) {
      console.log(`No practices found at offset ${offset}, stopping.`);
      break;
    }

    // Deduplicate — if all practices on this page were already seen, we've looped
    const newPractices = practices.filter((p) => !seen.has(p.url));
    if (newPractices.length === 0) {
      console.log(`All duplicates at offset ${offset}, stopping.`);
      break;
    }

    for (const p of newPractices) {
      seen.add(p.url);
      all.push(p);
    }
    console.log(`  Found ${newPractices.length} new practices (total: ${all.length})`);

    if (!hasNextPage(html)) break;

    offset += 40;
    // Be polite
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`\nTotal: ${all.length} practices. Fetching coordinates...`);

  let matched = 0;
  for (let i = 0; i < all.length; i++) {
    const p = all[i];
    const coords = await fetchCoordinates(p.url);
    if (coords) {
      p.lat = coords.lat;
      p.lng = coords.lng;
      matched++;
    }
    process.stdout.write(
      `\r  ${i + 1}/${all.length} (${matched} with coords)`
    );
    await new Promise((r) => setTimeout(r, 500));
  }
  console.log(`\n\nCoordinates found: ${matched}/${all.length}`);

  const outPath = resolve(import.meta.dirname!, "../public/data/healthpoint-gps.json");
  writeFileSync(outPath, JSON.stringify(all, null, 2), "utf-8");
  console.log(`Written to ${outPath}`);
}

main().catch(console.error);
