// Square-rigger sailing polar: boat speed (m/s) as a function of the true wind
// angle (TWA, deg off the wind, 0 = straight into wind) and wind speed (m/s).
const KN = 0.514444;

// Efficiency vs TWA control points. Square-riggers are slow on the wind, fastest
// on a broad reach (~115 deg), and run well but not best dead downwind.
const PTS = [
  [0, 0.05], [45, 0.22], [70, 0.62], [90, 0.85],
  [115, 1.00], [140, 0.97], [165, 0.86], [180, 0.76]
];

function interp(twa) {
  const a = Math.max(0, Math.min(180, twa));
  for (let i = 0; i < PTS.length - 1; i++) {
    const [x0, y0] = PTS[i], [x1, y1] = PTS[i + 1];
    if (a <= x1) return y0 + (y1 - y0) * (a - x0) / (x1 - x0);
  }
  return PTS[PTS.length - 1][1];
}

export function boatSpeed(vessel, twaDeg, twsMS) {
  const vmax = vessel.vmaxKn * KN;
  // Below the no-go half-angle a square-rigger loses most VMG (must beat/tack).
  let eff = interp(twaDeg);
  if (twaDeg < vessel.noGo) eff *= 0.45 + 0.55 * (twaDeg / vessel.noGo);
  // Speed grows with wind toward the hull-speed ceiling (vmax at ~10 m/s wind).
  const vWind = Math.min(vmax, (vmax / 10) * twsMS);
  return vWind * eff * vessel.scalar;
}
