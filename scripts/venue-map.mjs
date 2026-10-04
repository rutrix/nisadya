// This script draws the two venue base maps from OpenStreetMap data, in the site colours.
// Usage: node scripts/venue-map.mjs              download the map data
//        node scripts/venue-map.mjs --osm FILE   use a saved Overpass JSON response
// It writes public/venue-map-desktop.svg, public/venue-map-mobile.svg and src/data/venue-map.json.
// The site puts the places of the venue_places setting over the map with the bounds in that JSON.
// Map data © OpenStreetMap contributors (ODbL). The site shows the credit over the map.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const VENUE_WAY = 1552337057; // the DoMS building. If the venue building changes, change this and re-run.

// Centre and scale (metres per SVG unit) of each file. The desktop file loses up to 216 units
// on its left between 1080 and 1280px, so nothing important sits there.
const MAPS = {
  desktop: { w: 992, h: 494, lat: 10.759152, lon: 78.815094, m: 1.5 },
  mobile: { w: 688, h: 516, lat: 10.75936, lon: 78.816649, m: 1.6 },
};
const GROUND = '#ececec', CAMPUS = '#e0e0e0', GREEN = '#d5d5d5', WATER = '#c8daf0', BUILDING = '#c2c2c2';
const ROADS = [
  // [highway values, stroke width]
  [['service', 'living_street'], 3],
  [['residential', 'unclassified', 'tertiary', 'tertiary_link'], 6],
  [['secondary', 'secondary_link', 'primary', 'primary_link', 'trunk', 'trunk_link'], 12],
];

const css = await readFile(path.join(root, 'src/app/globals.css'), 'utf8');
const VENUE = css.match(/--venue-panel:\s*([^;]+);/)[1].trim();

for (const m of Object.values(MAPS)) {
  const dLat = (m.h * m.m) / 2 / 110574;
  const dLon = (m.w * m.m) / 2 / (111320 * Math.cos((m.lat * Math.PI) / 180));
  Object.assign(m, { north: m.lat + dLat, south: m.lat - dLat, east: m.lon + dLon, west: m.lon - dLon });
}

const osmArg = process.argv.indexOf('--osm');
const osm = osmArg > 0 ? JSON.parse(await readFile(process.argv[osmArg + 1], 'utf8')) : await download();

async function download() {
  const all = Object.values(MAPS);
  const bbox = [Math.min(...all.map((m) => m.south)), Math.min(...all.map((m) => m.west)), Math.max(...all.map((m) => m.north)), Math.max(...all.map((m) => m.east))].join(',');
  const q = `[out:json][timeout:90];(${['building', 'highway', 'landuse', 'leisure', 'natural', 'amenity']
    .map((k) => `way["${k}"](${bbox});relation["${k}"](${bbox});`)
    .join('')});out geom;`;
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: new URLSearchParams({ data: q }),
    headers: { 'User-Agent': 'nisadya-venue-map/1.0' },
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) throw new Error(`Overpass: HTTP ${res.status}`);
  return res.json();
}

// Douglas-Peucker on projected points, tolerance in SVG units
function simplify(pts, tol = 0.8) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts.at(-1)];
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  let max = 0, at = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs((b[0] - a[0]) * (a[1] - pts[i][1]) - (a[0] - pts[i][0]) * (b[1] - a[1])) / len;
    if (d > max) [max, at] = [d, i];
  }
  return max <= tol ? [a, b] : [...simplify(pts.slice(0, at + 1), tol).slice(0, -1), ...simplify(pts.slice(at), tol)];
}

function draw(m) {
  const xy = (p) => [((p.lon - m.west) / (m.east - m.west)) * m.w, ((m.north - p.lat) / (m.north - m.south)) * m.h];
  const near = (g) => g.some((p) => p.lat > m.south - 0.001 && p.lat < m.north + 0.001 && p.lon > m.west - 0.001 && p.lon < m.east + 0.001);
  // One subpath in relative integer steps: "M10 20l3-4 5 6"
  const sub = (g, close) => {
    // A closed ring repeats its first point at the end. Drop it, or simplify() sees a zero-length baseline.
    const pts = simplify((close ? g.slice(0, -1) : g).map(xy)).map(([x, y]) => [Math.round(x), Math.round(y)]);
    let d = `M${pts[0][0]} ${pts[0][1]}`, steps = [];
    for (let i = 1; i < pts.length; i++) {
      const [dx, dy] = [pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]];
      if (dx || dy) steps.push(`${dx} ${dy}`);
    }
    if (!steps.length) return '';
    return (d + 'l' + steps.join(' ') + (close ? 'z' : '')).replace(/ -/g, '-');
  };
  // Each closed member ring is its own subpath, drawn even-odd. The script skips a ring that spans several ways.
  const rings = (el) =>
    el.type === 'way' ? [el.geometry] : (el.members ?? []).filter((mb) => mb.type === 'way' && mb.geometry).map((mb) => mb.geometry);
  const closed = (g) => g.length > 3 && g[0].lat === g.at(-1).lat && g[0].lon === g.at(-1).lon;
  const areas = (test) =>
    osm.elements
      .filter((el) => el.id !== VENUE_WAY && test(el.tags ?? {}))
      .flatMap(rings)
      .filter((g) => closed(g) && near(g))
      .map((g) => sub(g, true))
      .join('');
  const lines = (values) =>
    osm.elements
      .filter((el) => el.type === 'way' && values.includes(el.tags?.highway) && el.tags?.area !== 'yes' && near(el.geometry))
      .map((el) => sub(el.geometry, false))
      .join('');

  const green = (t) => ['pitch', 'park', 'playground', 'garden'].includes(t.leisure) || t.natural === 'wood' || t.landuse === 'forest' || t.landuse === 'grass';
  const venue = osm.elements.find((el) => el.id === VENUE_WAY);
  if (!venue) throw new Error(`The venue way ${VENUE_WAY} is not in the map data`);
  const roads = ROADS.map(([values, width]) => `<path stroke-width="${width}" d="${lines(values)}"/>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${m.w} ${m.h}" width="${m.w}" height="${m.h}">
<!-- Map data © OpenStreetMap contributors, ODbL: https://www.openstreetmap.org/copyright -->
<rect width="${m.w}" height="${m.h}" fill="${GROUND}"/>
<path fill="${CAMPUS}" fill-rule="evenodd" d="${areas((t) => t.amenity === 'university')}"/>
<path fill="${GREEN}" fill-rule="evenodd" d="${areas(green)}"/>
<path fill="${WATER}" fill-rule="evenodd" d="${areas((t) => t.natural === 'water')}"/>
<g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round">${roads}</g>
<path fill="${BUILDING}" fill-rule="evenodd" d="${areas((t) => t.building)}"/>
<path fill="${VENUE}" stroke="#000" stroke-width="2" stroke-linejoin="round" d="${sub(venue.geometry, true)}"/>
</svg>
`;
}

const out = { osmBase: osm.osm3s?.timestamp_osm_base ?? '' };
for (const [name, m] of Object.entries(MAPS)) {
  const svg = draw(m);
  const file = `venue-map-${name}.svg`;
  await writeFile(path.join(root, 'public', file), svg);
  out[name] = { src: `/${file}`, w: m.w, h: m.h, north: m.north, south: m.south, east: m.east, west: m.west };
  console.log(`${file}: ${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB`);
}
await writeFile(path.join(root, 'src/data/venue-map.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`src/data/venue-map.json: map data from ${out.osmBase || 'a saved file'}`);
