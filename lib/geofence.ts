const EARTH_RADIUS_M = 6_371_000;

/** Haversine great-circle distance in metres between two GPS coordinates. */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lng2 - lng1);
  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Returns true when the user is within the given radius (metres). */
export function isInZone(
  userLat: number,
  userLng: number,
  locLat: number,
  locLng: number,
  radiusMeters: number
): boolean {
  return haversineDistance(userLat, userLng, locLat, locLng) <= radiusMeters;
}

/** Find the closest location the user is currently inside, if any. */
export function findActiveLocation<T extends { lat: number; lng: number; radius: number }>(
  userLat: number,
  userLng: number,
  locations: T[]
): (T & { distanceMeters: number }) | null {
  let best: (T & { distanceMeters: number }) | null = null;
  for (const loc of locations) {
    const d = haversineDistance(userLat, userLng, loc.lat, loc.lng);
    if (d <= loc.radius && (!best || d < best.distanceMeters)) {
      best = { ...loc, distanceMeters: d };
    }
  }
  return best;
}
