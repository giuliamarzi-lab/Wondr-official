export type TransportMode = "flight" | "train" | "bus" | "ferry";

export type BudgetBand = "<100" | "100-300" | ">300";

export type RiskLevel = "low" | "medium" | "high";

export interface SearchRequest {
  origin: string;
  destination: string;
  departureDate: string;
  travelers: number;
  maxDurationHours: 12 | 24 | 48;
  budgetBand: BudgetBand;
  modes: TransportMode[];
}

export interface Location {
  id: string;
  name: string;
  aliases: string[];
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  airportCode?: string;
  hubRank: 0 | 1 | 2 | 3;
  modes: TransportMode[];
  terminals?: Partial<Record<TransportMode, string>>;
}

export interface SearchSegment {
  id: string;
  mode: TransportMode;
  fromLocationId: string;
  toLocationId: string;
  from: string;
  to: string;
  departureAt: string;
  arrivalAt: string;
  operator: string;
  pricePerTraveler: number;
  totalPrice: number;
  providerId: string;
}

export interface Itinerary {
  id: string;
  origin: string;
  destination: string;
  segments: SearchSegment[];
  pricePerTraveler: number;
  totalPrice: number;
  directPricePerTraveler: number;
  directTotalPrice: number;
  savingTotal: number;
  durationMinutes: number;
  transfers: number;
  riskLevel: RiskLevel;
  score: number;
  isLive: false;
}

export interface SearchResponse {
  request: SearchRequest;
  itineraries: Itinerary[];
  providerId: string;
  datasetVersion: string;
  isLive: false;
}

export interface BaseConnection {
  id: string;
  mode: TransportMode;
  fromLocationId: string;
  toLocationId: string;
  distanceKm: number;
  durationMinutes: number;
  basePrice: number;
  operator: string;
}

export interface SearchProvider {
  readonly id: string;
  readonly datasetVersion: string;
  getConnections(
    fromLocationId: string,
    destinationLocationId: string,
    modes: TransportMode[],
  ): BaseConnection[];
  hasCuratedRoute(request: SearchRequest): boolean;
  getCuratedItineraries(request: SearchRequest): Itinerary[];
}
