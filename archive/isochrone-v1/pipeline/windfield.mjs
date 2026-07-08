// Parametric seasonal wind + surface-current climatology.
// The regime structure (trade belts, ITCZ migration, monsoon reversal,
// westerlies, major currents) and typical wind forces (~Beaufort 4-6) follow
// the pilot-chart / CLIWOC-documented picture of the 1750-1854 sailing world.
// Directions are meteorological: wdir = direction the wind blows FROM (deg).
// Currents: cdir = direction the current sets TOWARD (deg), cspd m/s.

// Seasonal mean latitude of the ITCZ / doldrum belt at a given longitude.
function itczLat(lon, s) {
  let base = [-5, 2, 8, 3][s];                    // DJF, MAM, JJA, SON (Atlantic/Pacific)
  if (lon > 40 && lon < 120) {                    // Asian monsoon domain pulls it hard N in summer
    base += (s === 2 ? 14 : s === 0 ? -3 : 4);
  }
  return base;
}

export function windAt(lat, lon, s) {
  // --- Monsoon domain (Indian Ocean, Bay of Bengal, South China Sea) ---
  if (lon > 40 && lon < 125 && lat > -12 && lat < 32) {
    if (s === 2) return { wdir: 225, wspd: 10.0 }; // SW monsoon (Jun-Aug), strong
    if (s === 0) return { wdir: 40,  wspd: 8.0 };  // NE monsoon (Dec-Feb)
    // transition seasons: light, fall through to trades below
  }

  const dl = lat - itczLat(lon, s);
  const absLat = Math.abs(lat);
  // winter hemisphere blows a little harder
  const nWinter = (s === 0 ? 1 : 0), sWinter = (s === 2 ? 1 : 0);

  // --- Doldrums / ITCZ ---
  if (Math.abs(dl) < 4) return { wdir: 90, wspd: 2.2 };

  // --- Trade winds ---
  if (absLat <= 30 && Math.abs(dl) <= 30) {
    if (dl > 0) return { wdir: 60,  wspd: (6.5 + 1.5 * nWinter) };   // NE trades
    return { wdir: 135, wspd: (6.5 + 1.5 * sWinter) };               // SE trades
  }

  // --- Mid-latitude westerlies ---
  if (absLat >= 30 && absLat <= 62) {
    if (lat > 0) return { wdir: 285, wspd: (8.0 + 2.0 * nWinter) };  // N. westerlies
    return { wdir: 300, wspd: (10.5 + 2.0 * sWinter) };              // Roaring Forties
  }

  // --- Polar easterlies ---
  return { wdir: 90, wspd: 6.0 };
}

export function currentAt(lat, lon, s) {
  const box = (la0, la1, lo0, lo1) => lat >= la0 && lat <= la1 && lon >= lo0 && lon <= lo1;
  // Western boundary & drift currents (approximate, seasonally steady).
  if (box(25, 45, -82, -40)) return { cdir: 45,  cspd: 0.8 };   // Gulf Stream
  if (box(45, 60, -40, 5))   return { cdir: 70,  cspd: 0.3 };   // North Atlantic Drift
  if (box(18, 42, 120, 160)) return { cdir: 55,  cspd: 0.6 };   // Kuroshio
  if (box(-40, -25, 15, 35)) return { cdir: 225, cspd: 0.6 };   // Agulhas
  if (box(-35, -15, -50, -35)) return { cdir: 200, cspd: 0.3 }; // Brazil Current
  if (box(-35, -18, 5, 18))  return { cdir: 340, cspd: 0.3 };   // Benguela
  if (box(15, 35, -25, -9))  return { cdir: 205, cspd: 0.3 };   // Canary
  if (box(-15, -35, -85, -70)) return { cdir: 340, cspd: 0.3 }; // Humboldt
  if (box(-60, -40, -180, 180)) return { cdir: 90, cspd: 0.4 }; // West Wind Drift
  if (Math.abs(lat) < 8) return { cdir: 270, cspd: 0.35 };      // Equatorial (westward)
  return { cdir: 0, cspd: 0 };
}
