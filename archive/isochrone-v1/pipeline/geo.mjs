// Great-circle geometry helpers (spherical earth).
export const R_EARTH = 6371000; // metres
const D2R = Math.PI / 180, R2D = 180 / Math.PI;

export function haversine(lat1, lon1, lat2, lon2) {
  const dLat = (lat2 - lat1) * D2R, dLon = (lon2 - lon1) * D2R;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * D2R) * Math.cos(lat2 * D2R) * Math.sin(dLon / 2) ** 2;
  return 2 * R_EARTH * Math.asin(Math.min(1, Math.sqrt(a)));
}

// Initial great-circle bearing from point 1 to point 2, degrees 0..360.
export function bearing(lat1, lon1, lat2, lon2) {
  const y = Math.sin((lon2 - lon1) * D2R) * Math.cos(lat2 * D2R);
  const x = Math.cos(lat1 * D2R) * Math.sin(lat2 * D2R) -
    Math.sin(lat1 * D2R) * Math.cos(lat2 * D2R) * Math.cos((lon2 - lon1) * D2R);
  return (Math.atan2(y, x) * R2D + 360) % 360;
}

// Smallest absolute difference between two bearings, 0..180.
export function angDiff(a, b) {
  let d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

// Grid index helpers bound to a GRID config.
export function makeGridIndex(G) {
  const { res, lon0, lat0, cols, rows } = G;
  return {
    lonOf: (c) => lon0 + (c + 0.5) * res,
    latOf: (r) => lat0 + (r + 0.5) * res,
    colOf: (lon) => Math.floor((((lon + 180) % 360 + 360) % 360 - 180 - lon0) / res),
    rowOf: (lat) => Math.floor((lat - lat0) / res),
    idx: (c, r) => r * cols + c,
    cols, rows
  };
}
