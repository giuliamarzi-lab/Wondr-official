import { localDemoProvider } from "./demoProvider";
import { LOCATION_BY_ID, resolveLocation, terminalName } from "./locations";
import { budgetLimitPerTraveler, normalizeSearchRequest } from "./query";
import type {
  BaseConnection,
  Itinerary,
  RiskLevel,
  SearchProvider,
  SearchRequest,
  SearchResponse,
  SearchSegment,
  TransportMode,
} from "./types";

interface SearchState {
  locationId: string;
  currentTime: number;
  startedAt: number | null;
  pricePerTraveler: number;
  segments: SearchSegment[];
  visited: Set<string>;
  priority: number;
}

const SERVICE_SLOTS: Record<TransportMode, number[]> = {
  flight: [6 * 60, 10 * 60 + 30, 16 * 60 + 30, 21 * 60],
  train: [6 * 60, 9 * 60, 13 * 60, 18 * 60],
  bus: [5 * 60 + 30, 12 * 60 + 30, 20 * 60 + 30],
  ferry: [18 * 60 + 30, 22 * 60],
};

function hashString(value: string): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

function startOfUtcDay(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function nextDeparture(
  connection: BaseConnection,
  earliestDeparture: number,
  departureDate: string,
): number {
  const baseDay = startOfUtcDay(departureDate);
  const routeOffset = hashString(`${connection.id}:${departureDate}`) % 41;

  for (let dayOffset = 0; dayOffset < 5; dayOffset += 1) {
    for (const slot of SERVICE_SLOTS[connection.mode]) {
      const candidate =
        baseDay + dayOffset * 86_400_000 + (slot + routeOffset) * 60_000;
      if (candidate >= earliestDeparture) return candidate;
    }
  }

  return earliestDeparture + 6 * 60 * 60_000;
}

function datedPrice(connection: BaseConnection, departureDate: string): number {
  const factor =
    0.82 + (hashString(`${connection.id}:${departureDate}:price`) % 39) / 100;
  return Math.max(1, Math.round(connection.basePrice * factor));
}

function connectionBuffer(
  previous: TransportMode | undefined,
  next: TransportMode,
): number {
  if (!previous) return 0;
  if (previous === "flight" || next === "flight")
    return previous === next ? 105 : 135;
  if (previous === "ferry" || next === "ferry") return 90;
  return previous === next ? 35 : 50;
}

function materializeSegment(
  connection: BaseConnection,
  earliestDeparture: number,
  request: SearchRequest,
): SearchSegment | undefined {
  const from = LOCATION_BY_ID.get(connection.fromLocationId);
  const to = LOCATION_BY_ID.get(connection.toLocationId);
  if (!from || !to) return undefined;

  const departureAt = nextDeparture(
    connection,
    earliestDeparture,
    request.departureDate,
  );
  const arrivalAt = departureAt + connection.durationMinutes * 60_000;
  const pricePerTraveler = datedPrice(connection, request.departureDate);

  return {
    id: `${connection.id}:${departureAt}`,
    mode: connection.mode,
    fromLocationId: from.id,
    toLocationId: to.id,
    from: terminalName(from, connection.mode),
    to: terminalName(to, connection.mode),
    departureAt: new Date(departureAt).toISOString(),
    arrivalAt: new Date(arrivalAt).toISOString(),
    operator: connection.operator,
    pricePerTraveler,
    totalPrice: pricePerTraveler * request.travelers,
    providerId: localDemoProvider.id,
  };
}

function riskFor(segments: SearchSegment[]): RiskLevel {
  let riskPoints = 0;
  for (let index = 1; index < segments.length; index += 1) {
    const previous = segments[index - 1];
    const current = segments[index];
    const layoverMinutes =
      (Date.parse(current.departureAt) - Date.parse(previous.arrivalAt)) /
      60_000;
    const requiredBuffer = connectionBuffer(previous.mode, current.mode);
    if (previous.mode !== current.mode) riskPoints += 1;
    if (layoverMinutes < requiredBuffer + 30) riskPoints += 2;
    if (
      (previous.mode === "flight" || current.mode === "flight") &&
      layoverMinutes < 180
    ) {
      riskPoints += 1;
    }
  }
  if (riskPoints >= 5) return "high";
  if (riskPoints >= 2) return "medium";
  return "low";
}

function riskWeight(risk: RiskLevel): number {
  if (risk === "high") return 2;
  if (risk === "medium") return 1;
  return 0;
}

function directFlightPrice(
  request: SearchRequest,
  originId: string,
  destinationId: string,
  provider: SearchProvider,
): number | undefined {
  const direct = provider
    .getConnections(originId, destinationId, ["flight"])
    .find(
      (connection) =>
        connection.mode === "flight" &&
        connection.toLocationId === destinationId,
    );
  return direct ? datedPrice(direct, request.departureDate) : undefined;
}

function toItinerary(
  state: SearchState,
  request: SearchRequest,
  directPricePerTraveler: number | undefined,
): Itinerary {
  const firstDeparture = Date.parse(state.segments[0].departureAt);
  const finalArrival = Date.parse(
    state.segments[state.segments.length - 1].arrivalAt,
  );
  const durationMinutes = Math.round((finalArrival - firstDeparture) / 60_000);
  const riskLevel = riskFor(state.segments);
  const benchmark =
    directPricePerTraveler ?? Math.round(state.pricePerTraveler * 1.35);
  const directTotalPrice = benchmark * request.travelers;
  const totalPrice = state.pricePerTraveler * request.travelers;
  const routeKey = state.segments
    .map(
      (segment) =>
        `${segment.mode}:${segment.fromLocationId}-${segment.toLocationId}`,
    )
    .join("|");

  return {
    id: `it-${hashString(`${request.departureDate}:${routeKey}`).toString(36)}`,
    origin: request.origin,
    destination: request.destination,
    segments: state.segments,
    pricePerTraveler: state.pricePerTraveler,
    totalPrice,
    directPricePerTraveler: benchmark,
    directTotalPrice,
    savingTotal: Math.max(0, directTotalPrice - totalPrice),
    durationMinutes,
    transfers: state.segments.length - 1,
    riskLevel,
    score:
      state.pricePerTraveler * 0.72 +
      (durationMinutes / 60) * 2.5 +
      (state.segments.length - 1) * 10 +
      riskWeight(riskLevel) * 15,
    isLive: false,
  };
}

function modeSignature(itinerary: Itinerary): string {
  return Array.from(new Set(itinerary.segments.map((segment) => segment.mode)))
    .sort()
    .join("+");
}

function selectDiversified(itineraries: Itinerary[], limit = 3): Itinerary[] {
  const sorted = [...itineraries].sort(
    (a, b) => a.score - b.score || a.totalPrice - b.totalPrice,
  );
  const selected: Itinerary[] = [];
  const signatures = new Set<string>();

  for (const itinerary of sorted) {
    const signature = modeSignature(itinerary);
    if (signatures.has(signature)) continue;
    selected.push(itinerary);
    signatures.add(signature);
    if (selected.length === limit) return selected;
  }

  for (const itinerary of sorted) {
    if (selected.some((candidate) => candidate.id === itinerary.id)) continue;
    selected.push(itinerary);
    if (selected.length === limit) break;
  }

  return selected;
}

function statePriority(
  pricePerTraveler: number,
  durationMinutes: number,
  legs: number,
): number {
  return (
    pricePerTraveler * 0.72 +
    (durationMinutes / 60) * 2.5 +
    Math.max(0, legs - 1) * 10
  );
}

export function searchItineraries(
  input: SearchRequest,
  provider: SearchProvider = localDemoProvider,
): SearchResponse {
  const request = normalizeSearchRequest(input);
  const origin = resolveLocation(request.origin);
  const destination = resolveLocation(request.destination);

  const emptyResponse = (): SearchResponse => ({
    request,
    itineraries: [],
    providerId: provider.id,
    datasetVersion: provider.datasetVersion,
    isLive: false,
  });

  if (!origin || !destination || origin.id === destination.id)
    return emptyResponse();

  const curated = provider.getCuratedItineraries(request);
  if (provider.hasCuratedRoute(request)) {
    return {
      ...emptyResponse(),
      itineraries: selectDiversified(curated),
    };
  }

  const budgetLimit = budgetLimitPerTraveler(request.budgetBand);
  const maxDurationMinutes = request.maxDurationHours * 60;
  const searchStart = startOfUtcDay(request.departureDate) + 4 * 60 * 60_000;
  const queue: SearchState[] = [
    {
      locationId: origin.id,
      currentTime: searchStart,
      startedAt: null,
      pricePerTraveler: 0,
      segments: [],
      visited: new Set([origin.id]),
      priority: 0,
    },
  ];
  const completed: SearchState[] = [];
  let expansions = 0;

  while (queue.length > 0 && expansions < 4_000 && completed.length < 160) {
    queue.sort((a, b) => a.priority - b.priority);
    const state = queue.shift()!;

    if (state.locationId === destination.id && state.segments.length > 0) {
      completed.push(state);
      continue;
    }
    if (state.segments.length >= 4) continue;

    const previousMode = state.segments.at(-1)?.mode;
    const connections = provider.getConnections(
      state.locationId,
      destination.id,
      request.modes,
    );

    for (const candidate of connections) {
      expansions += 1;
      if (state.visited.has(candidate.toLocationId)) continue;

      const earliestDeparture =
        state.currentTime +
        connectionBuffer(previousMode, candidate.mode) * 60_000;
      const segment = materializeSegment(candidate, earliestDeparture, request);
      if (!segment) continue;

      const startedAt = state.startedAt ?? Date.parse(segment.departureAt);
      const arrivalAt = Date.parse(segment.arrivalAt);
      const durationMinutes = Math.round((arrivalAt - startedAt) / 60_000);
      const pricePerTraveler =
        state.pricePerTraveler + segment.pricePerTraveler;
      if (
        durationMinutes > maxDurationMinutes ||
        pricePerTraveler > budgetLimit
      )
        continue;

      const segments = [...state.segments, segment];
      const nextState: SearchState = {
        locationId: candidate.toLocationId,
        currentTime: arrivalAt,
        startedAt,
        pricePerTraveler,
        segments,
        visited: new Set([
          ...Array.from(state.visited),
          candidate.toLocationId,
        ]),
        priority: statePriority(
          pricePerTraveler,
          durationMinutes,
          segments.length,
        ),
      };
      if (candidate.toLocationId === destination.id) completed.push(nextState);
      else queue.push(nextState);
    }
  }

  const directPrice = directFlightPrice(
    request,
    origin.id,
    destination.id,
    provider,
  );
  const deduplicated = new Map<string, Itinerary>();
  for (const state of completed) {
    const itinerary = toItinerary(state, request, directPrice);
    const signature = itinerary.segments
      .map(
        (segment) =>
          `${segment.mode}:${segment.fromLocationId}-${segment.toLocationId}`,
      )
      .join("|");
    const existing = deduplicated.get(signature);
    if (!existing || itinerary.score < existing.score)
      deduplicated.set(signature, itinerary);
  }

  return {
    request,
    itineraries: selectDiversified(Array.from(deduplicated.values())),
    providerId: provider.id,
    datasetVersion: provider.datasetVersion,
    isLive: false,
  };
}
