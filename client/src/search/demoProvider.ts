import { getCuratedItineraries, hasCuratedRoute } from "./fixtures";
import { LOCATION_BY_ID, LOCATIONS } from "./locations";
import type {
  BaseConnection,
  Location,
  SearchProvider,
  TransportMode,
} from "./types";

interface GroundLink {
  from: string;
  to: string;
  modes: Extract<TransportMode, "train" | "bus">[];
}

interface FerryLink {
  from: string;
  to: string;
  durationMinutes: number;
  basePrice: number;
}

const ground = (
  from: string,
  to: string,
  modes: GroundLink["modes"] = ["train", "bus"],
): GroundLink => ({ from, to, modes });

const GROUND_LINKS: GroundLink[] = [
  ground("rome", "florence"),
  ground("rome", "naples"),
  ground("rome", "bologna"),
  ground("rome", "milan"),
  ground("rome", "bari"),
  ground("florence", "bologna"),
  ground("florence", "milan"),
  ground("bologna", "milan"),
  ground("bologna", "venice"),
  ground("milan", "turin"),
  ground("milan", "venice"),
  ground("milan", "zurich"),
  ground("milan", "munich"),
  ground("naples", "bari"),
  ground("naples", "brindisi"),
  ground("bari", "brindisi"),
  ground("barcelona", "madrid"),
  ground("barcelona", "paris"),
  ground("madrid", "lisbon"),
  ground("madrid", "paris", ["bus"]),
  ground("paris", "london"),
  ground("paris", "brussels"),
  ground("paris", "zurich"),
  ground("paris", "frankfurt"),
  ground("london", "brussels"),
  ground("london", "amsterdam"),
  ground("brussels", "amsterdam"),
  ground("brussels", "frankfurt"),
  ground("amsterdam", "frankfurt"),
  ground("amsterdam", "berlin"),
  ground("zurich", "frankfurt"),
  ground("zurich", "munich"),
  ground("zurich", "vienna"),
  ground("munich", "frankfurt"),
  ground("munich", "berlin"),
  ground("munich", "prague"),
  ground("munich", "vienna"),
  ground("frankfurt", "berlin"),
  ground("frankfurt", "prague"),
  ground("berlin", "prague"),
  ground("berlin", "warsaw"),
  ground("berlin", "copenhagen"),
  ground("prague", "vienna"),
  ground("prague", "warsaw"),
  ground("vienna", "budapest"),
  ground("vienna", "zagreb"),
  ground("vienna", "ljubljana"),
  ground("budapest", "zagreb"),
  ground("budapest", "belgrade"),
  ground("copenhagen", "stockholm"),
  ground("copenhagen", "oslo"),
  ground("stockholm", "oslo"),
  ground("venice", "ljubljana"),
  ground("ljubljana", "zagreb"),
  ground("ljubljana", "split"),
  ground("zagreb", "split"),
  ground("zagreb", "belgrade"),
  ground("belgrade", "thessaloniki", ["bus"]),
  ground("athens", "patras"),
  ground("athens", "thessaloniki"),
  ground("thessaloniki", "istanbul", ["train", "bus"]),
];

const FERRY_LINKS: FerryLink[] = [
  { from: "naples", to: "palermo", durationMinutes: 630, basePrice: 38 },
  { from: "bari", to: "patras", durationMinutes: 750, basePrice: 25 },
  { from: "brindisi", to: "patras", durationMinutes: 960, basePrice: 45 },
  { from: "venice", to: "split", durationMinutes: 660, basePrice: 52 },
  { from: "barcelona", to: "rome", durationMinutes: 1_200, basePrice: 58 },
  { from: "copenhagen", to: "oslo", durationMinutes: 1_020, basePrice: 64 },
];

const toRadians = (value: number) => (value * Math.PI) / 180;

export function haversineKm(from: Location, to: Location): number {
  const earthRadiusKm = 6_371;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const operatorFor = (mode: TransportMode) =>
  ({
    flight: "Wondr Demo Air",
    train: "Wondr Demo Rail",
    bus: "Wondr Demo Bus",
    ferry: "Wondr Demo Ferry",
  })[mode];

function durationFor(mode: TransportMode, distanceKm: number): number {
  if (mode === "flight") return Math.round(115 + (distanceKm / 760) * 60);
  if (mode === "train") return Math.round(20 + (distanceKm / 135) * 60);
  if (mode === "bus") return Math.round(25 + (distanceKm / 74) * 60);
  return Math.round(90 + (distanceKm / 34) * 60);
}

function priceFor(mode: TransportMode, distanceKm: number): number {
  if (mode === "flight") {
    const rate = distanceKm > 3_000 ? 0.045 : 0.065;
    return Math.max(28, Math.round(24 + distanceKm * rate));
  }
  if (mode === "train") return Math.max(9, Math.round(7 + distanceKm * 0.075));
  if (mode === "bus") return Math.max(6, Math.round(4 + distanceKm * 0.038));
  return Math.max(18, Math.round(10 + distanceKm * 0.065));
}

function connection(
  from: Location,
  to: Location,
  mode: TransportMode,
  overrides: Partial<
    Pick<BaseConnection, "durationMinutes" | "basePrice">
  > = {},
): BaseConnection {
  const distanceKm = Math.round(haversineKm(from, to));
  return {
    id: `${mode}:${from.id}:${to.id}`,
    mode,
    fromLocationId: from.id,
    toLocationId: to.id,
    distanceKm,
    durationMinutes: overrides.durationMinutes ?? durationFor(mode, distanceKm),
    basePrice: overrides.basePrice ?? priceFor(mode, distanceKm),
    operator: operatorFor(mode),
  };
}

function pairDirection<T extends { from: string; to: string }>(
  link: T,
  fromLocationId: string,
): { from: string; to: string } | undefined {
  if (link.from === fromLocationId) return { from: link.from, to: link.to };
  if (link.to === fromLocationId) return { from: link.to, to: link.from };
  return undefined;
}

function flightConnections(
  from: Location,
  destination: Location,
): BaseConnection[] {
  if (!from.modes.includes("flight")) return [];

  const directDistance = Math.max(1, haversineKm(from, destination));
  const candidates = LOCATIONS.filter((location) => location.id !== from.id)
    .filter((location) => location.modes.includes("flight"))
    .filter(
      (location) => location.id === destination.id || location.hubRank >= 2,
    )
    .map((location) => {
      const firstLeg = haversineKm(from, location);
      const secondLeg = haversineKm(location, destination);
      const detour = (firstLeg + secondLeg) / directDistance;
      return {
        location,
        score:
          location.id === destination.id
            ? -1
            : detour + (3 - location.hubRank) * 0.08,
      };
    })
    .filter(
      (candidate) =>
        candidate.location.id === destination.id || candidate.score <= 1.75,
    )
    .sort((a, b) => a.score - b.score)
    .slice(0, 7);

  return candidates.map((candidate) =>
    connection(from, candidate.location, "flight"),
  );
}

export const localDemoProvider: SearchProvider = {
  id: "local-demo",
  datasetVersion: "2026.08.1",

  hasCuratedRoute,
  getCuratedItineraries,

  getConnections(fromLocationId, destinationLocationId, modes) {
    const from = LOCATION_BY_ID.get(fromLocationId);
    const destination = LOCATION_BY_ID.get(destinationLocationId);
    if (!from || !destination) return [];

    const connections: BaseConnection[] = [];

    for (const link of GROUND_LINKS) {
      const direction = pairDirection(link, from.id);
      if (!direction) continue;
      const to = LOCATION_BY_ID.get(direction.to);
      if (!to) continue;
      for (const mode of link.modes) {
        if (modes.includes(mode)) connections.push(connection(from, to, mode));
      }
    }

    if (modes.includes("ferry")) {
      for (const link of FERRY_LINKS) {
        const direction = pairDirection(link, from.id);
        if (!direction) continue;
        const to = LOCATION_BY_ID.get(direction.to);
        if (!to) continue;
        connections.push(connection(from, to, "ferry", link));
      }
    }

    if (modes.includes("flight")) {
      connections.push(...flightConnections(from, destination));
    }

    return connections
      .filter(
        (candidate, index, all) =>
          all.findIndex((other) => other.id === candidate.id) === index,
      )
      .sort((a, b) => a.basePrice - b.basePrice);
  },
};
