import { budgetLimitPerTraveler } from "./query";
import { resolveLocation } from "./locations";
import type {
  Itinerary,
  RiskLevel,
  SearchRequest,
  SearchSegment,
  TransportMode,
} from "./types";

interface FixtureLeg {
  mode: TransportMode;
  fromLocationId: string;
  toLocationId: string;
  from: string;
  to: string;
  operator: string;
  departure: [dayOffset: number, hour: number, minute: number];
  arrival: [dayOffset: number, hour: number, minute: number];
  price: number;
}

interface FixtureItinerary {
  id: string;
  durationMinutes: number;
  riskLevel: RiskLevel;
  legs: FixtureLeg[];
}

const ROMA_DUBAI_DIRECT_PRICE = 420;

const ROMA_DUBAI_FIXTURES: FixtureItinerary[] = [
  {
    id: "roma-dubai-1",
    durationMinutes: 28 * 60,
    riskLevel: "high",
    legs: [
      {
        mode: "bus",
        fromLocationId: "rome",
        toLocationId: "bari",
        from: "Roma Tiburtina",
        to: "Bari Centrale",
        operator: "FlixBus",
        departure: [0, 6, 30],
        arrival: [0, 13, 10],
        price: 12,
      },
      {
        mode: "ferry",
        fromLocationId: "bari",
        toLocationId: "patras",
        from: "Bari",
        to: "Patrasso",
        operator: "Grimaldi Lines",
        departure: [0, 19, 30],
        arrival: [1, 8, 0],
        price: 25,
      },
      {
        mode: "train",
        fromLocationId: "patras",
        toLocationId: "athens",
        from: "Patrasso",
        to: "Atene",
        operator: "Hellenic Train",
        departure: [1, 10, 15],
        arrival: [1, 13, 40],
        price: 20,
      },
      {
        mode: "flight",
        fromLocationId: "athens",
        toLocationId: "dubai",
        from: "Atene (ATH)",
        to: "Dubai (DXB)",
        operator: "Wizz Air",
        departure: [1, 16, 50],
        arrival: [1, 23, 30],
        price: 89,
      },
    ],
  },
  {
    id: "roma-dubai-2",
    durationMinutes: 20 * 60,
    riskLevel: "medium",
    legs: [
      {
        mode: "train",
        fromLocationId: "rome",
        toLocationId: "brindisi",
        from: "Roma Termini",
        to: "Brindisi",
        operator: "Italo",
        departure: [0, 7, 0],
        arrival: [0, 12, 30],
        price: 30,
      },
      {
        mode: "ferry",
        fromLocationId: "brindisi",
        toLocationId: "athens",
        from: "Brindisi",
        to: "Atene (Patrasso)",
        operator: "GNV",
        departure: [0, 15, 0],
        arrival: [1, 7, 0],
        price: 45,
      },
      {
        mode: "flight",
        fromLocationId: "athens",
        toLocationId: "dubai",
        from: "Atene (ATH)",
        to: "Dubai (DXB)",
        operator: "Volotea",
        departure: [1, 10, 30],
        arrival: [1, 17, 0],
        price: 100,
      },
    ],
  },
  {
    id: "roma-dubai-3",
    durationMinutes: 13 * 60,
    riskLevel: "medium",
    legs: [
      {
        mode: "flight",
        fromLocationId: "rome",
        toLocationId: "athens",
        from: "Roma (FCO)",
        to: "Atene (ATH)",
        operator: "Ryanair",
        departure: [0, 6, 0],
        arrival: [0, 9, 30],
        price: 55,
      },
      {
        mode: "flight",
        fromLocationId: "athens",
        toLocationId: "dubai",
        from: "Atene (ATH)",
        to: "Dubai (DXB)",
        operator: "easyJet",
        departure: [0, 12, 0],
        arrival: [0, 19, 0],
        price: 155,
      },
    ],
  },
];

function isoAt(
  date: string,
  [dayOffset, hour, minute]: [number, number, number],
): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(
    Date.UTC(year, month - 1, day + dayOffset, hour, minute),
  ).toISOString();
}

function toSegment(
  fixtureId: string,
  leg: FixtureLeg,
  index: number,
  request: SearchRequest,
): SearchSegment {
  return {
    id: `${fixtureId}-${index + 1}`,
    mode: leg.mode,
    fromLocationId: leg.fromLocationId,
    toLocationId: leg.toLocationId,
    from: leg.from,
    to: leg.to,
    departureAt: isoAt(request.departureDate, leg.departure),
    arrivalAt: isoAt(request.departureDate, leg.arrival),
    operator: leg.operator,
    pricePerTraveler: leg.price,
    totalPrice: leg.price * request.travelers,
    providerId: "local-demo",
  };
}

export function getCuratedItineraries(request: SearchRequest): Itinerary[] {
  const origin = resolveLocation(request.origin);
  const destination = resolveLocation(request.destination);
  if (origin?.id !== "rome" || destination?.id !== "dubai") return [];

  const budgetLimit = budgetLimitPerTraveler(request.budgetBand);
  return ROMA_DUBAI_FIXTURES.filter(
    (fixture) => fixture.durationMinutes <= request.maxDurationHours * 60,
  )
    .filter((fixture) =>
      fixture.legs.every((leg) => request.modes.includes(leg.mode)),
    )
    .map((fixture) => {
      const pricePerTraveler = fixture.legs.reduce(
        (total, leg) => total + leg.price,
        0,
      );
      const totalPrice = pricePerTraveler * request.travelers;
      const directTotalPrice = ROMA_DUBAI_DIRECT_PRICE * request.travelers;
      return {
        id: fixture.id,
        origin: origin.name,
        destination: destination.name,
        segments: fixture.legs.map((leg, index) =>
          toSegment(fixture.id, leg, index, request),
        ),
        pricePerTraveler,
        totalPrice,
        directPricePerTraveler: ROMA_DUBAI_DIRECT_PRICE,
        directTotalPrice,
        savingTotal: Math.max(0, directTotalPrice - totalPrice),
        durationMinutes: fixture.durationMinutes,
        transfers: fixture.legs.length - 1,
        riskLevel: fixture.riskLevel,
        score:
          pricePerTraveler * 0.72 +
          (fixture.durationMinutes / 60) * 2.5 +
          fixture.legs.length * 8,
        isLive: false as const,
      };
    })
    .filter((itinerary) => itinerary.pricePerTraveler <= budgetLimit)
    .sort((a, b) => a.score - b.score);
}

export function hasCuratedRoute(request: SearchRequest): boolean {
  return (
    resolveLocation(request.origin)?.id === "rome" &&
    resolveLocation(request.destination)?.id === "dubai"
  );
}
