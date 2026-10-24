export type LocationKind = 'country' | 'city';
export type GuessResult = 'correct' | 'very-close' | 'close' | 'far' | 'very-far';

export interface GeographyLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  geometryId?: string;
}

export interface GeographyPack {
  id: string;
  title: string;
  kind: LocationKind;
  locations: GeographyLocation[];
}

export interface Round {
  packId: string;
  targetId: string;
  guesses: string[];
  startedAt: number;
  completedAt?: number;
}

export interface GuessFeedback {
  location: GeographyLocation;
  result: GuessResult;
  distanceKm: number;
  repeated: boolean;
  round: Round;
}

const radians = (degrees: number) => (degrees * Math.PI) / 180;

/** Great-circle distance; appropriate for city-point packs. */
export function distanceKm(a: GeographyLocation, b: GeographyLocation): number {
  const lat = radians(b.latitude - a.latitude);
  const lon = radians(b.longitude - a.longitude);
  const h = Math.sin(lat / 2) ** 2 +
    Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude)) *
    Math.sin(lon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}

export type DistanceResolver = (a: GeographyLocation, b: GeographyLocation) => number;

export function proximity(distance: number): GuessResult {
  if (distance === 0) return 'correct';
  if (distance < 250) return 'very-close';
  if (distance < 750) return 'close';
  if (distance < 1500) return 'far';
  return 'very-far';
}

export function startRound(pack: GeographyPack, random: () => number = Math.random, now = Date.now()): Round {
  if (pack.locations.length === 0) throw new Error('Map pack cannot be empty');
  const index = Math.min(pack.locations.length - 1, Math.max(0, Math.floor(random() * pack.locations.length)));
  return { packId: pack.id, targetId: pack.locations[index]!.id, guesses: [], startedAt: now };
}

export function guess(
  pack: GeographyPack,
  round: Round,
  locationId: string,
  resolveDistance: DistanceResolver = distanceKm,
  now = Date.now(),
): GuessFeedback {
  if (pack.id !== round.packId) throw new Error('Round belongs to another map pack');
  const location = pack.locations.find((item) => item.id === locationId);
  const target = pack.locations.find((item) => item.id === round.targetId);
  if (!location || !target) throw new Error('Unknown location');
  const repeated = round.guesses.includes(locationId);
  if (round.completedAt !== undefined && !repeated) throw new Error('Round already completed');
  const distance = locationId === target.id ? 0 : resolveDistance(location, target);
  const updated: Round = repeated ? round : {
    ...round,
    guesses: [...round.guesses, locationId],
    completedAt: locationId === target.id ? now : undefined,
  };
  // Adjacent countries may have zero border distance; only matching IDs win.
  return { location, result: locationId === target.id ? 'correct' : proximity(Math.max(distance, 0.001)), distanceKm: distance, repeated, round: updated };
}
