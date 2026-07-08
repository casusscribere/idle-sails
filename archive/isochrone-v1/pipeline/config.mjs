// Shared configuration for the passage pipeline.
// Grid: 1-degree global cells. Cell (col,row) center:
//   lon = lon0 + (col+0.5)*res ,  lat = lat0 + (row+0.5)*res
export const GRID = { res: 1, lon0: -180, lat0: -90, cols: 360, rows: 180 };

export const SEASONS = [
  { id: 'djf', label: 'Dec–Feb (N. winter)', idx: 0 },
  { id: 'mam', label: 'Mar–May (N. spring)', idx: 1 },
  { id: 'jja', label: 'Jun–Aug (N. summer)', idx: 2 },
  { id: 'son', label: 'Sep–Nov (N. autumn)', idx: 3 }
];

// Vessel sailing parameters. `vmaxKn` = hull-speed ceiling (knots);
// `noGo` = half-angle of the no-go zone (deg off the true wind a square-rigger
// cannot make useful VMG); `scalar` = overall class speed multiplier, tuned in
// calibration against recorded voyage durations.
export const VESSELS = [
  { id: 'frigate',  name: 'Naval frigate',       vmaxKn: 11.0, noGo: 52, scalar: 1.00 },
  { id: 'indiaman', name: 'East Indiaman',       vmaxKn: 7.5,  noGo: 66, scalar: 0.86 },
  { id: 'brig',     name: 'Merchant brig/sloop', vmaxKn: 8.5,  noGo: 63, scalar: 0.92 },
  { id: 'slaver',   name: 'Slave ship',          vmaxKn: 7.5,  noGo: 64, scalar: 0.90 }
];

// Cells force-opened as ocean so 1-degree rasterization doesn't seal narrow but
// historically vital straits. [lon,lat] points (snapped to their grid cell).
export const STRAIT_CARVES = [
  [-5.5, 36.0], [-5.5, 35.5],                 // Strait of Gibraltar
  [0.5, 50.5], [1.5, 50.5], [-0.5, 50.5],     // English Channel / Dover
  [100.5, 2.5], [101.5, 3.5], [103.0, 1.5],   // Strait of Malacca
  [105.5, -6.3], [105.5, -5.8],               // Sunda Strait (Batavia -> Indian Ocean)
  [119.5, 24.5], [120.5, 24.5],               // Taiwan Strait
  [128.5, 34.5],                              // Korea/Tsushima approach (Nagasaki)
  [12.5, 56.0], [11.5, 55.5]                  // Kattegat approaches (Gothenburg)
];

// Isochrone band edges shown in the UI (days). Contoured client-side.
export const ISO_DAYS = [7, 14, 21, 30, 45, 60, 90, 120, 150, 180, 240, 300, 365];
