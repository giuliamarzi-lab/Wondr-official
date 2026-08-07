import type { BudgetBand, SearchRequest, TransportMode } from "./types";

export const DEFAULT_SEARCH_REQUEST: SearchRequest = {
  origin: "Roma",
  destination: "Dubai",
  departureDate: "2026-07-10",
  travelers: 1,
  maxDurationHours: 48,
  budgetBand: "100-300",
  modes: ["flight", "train", "bus", "ferry"],
};

const FORM_MODE_TO_MODE: Record<string, TransportMode> = {
  voli: "flight",
  treni: "train",
  bus: "bus",
  traghetti: "ferry",
  flight: "flight",
  train: "train",
  ferry: "ferry",
};

const MODE_TO_FORM_MODE: Record<TransportMode, string> = {
  flight: "voli",
  train: "treni",
  bus: "bus",
  ferry: "traghetti",
};

const VALID_BUDGET_BANDS = new Set<BudgetBand>(["<100", "100-300", ">300"]);
const VALID_HOURS = new Set([12, 24, 48]);

const uniqueModes = (modes: TransportMode[]) =>
  Array.from(new Set(modes)).filter((mode) =>
    ["flight", "train", "bus", "ferry"].includes(mode),
  );

export function formMeansToModes(means: string[]): TransportMode[] {
  const modes = uniqueModes(
    means
      .map((mean) => FORM_MODE_TO_MODE[mean])
      .filter((mode): mode is TransportMode => Boolean(mode)),
  );
  return modes.length > 0 ? modes : [...DEFAULT_SEARCH_REQUEST.modes];
}

export function modesToFormMeans(modes: TransportMode[]): string[] {
  return modes.map((mode) => MODE_TO_FORM_MODE[mode]);
}

export function budgetLimitPerTraveler(budgetBand: BudgetBand): number {
  if (budgetBand === "<100") return 99;
  if (budgetBand === "100-300") return 300;
  return Number.POSITIVE_INFINITY;
}

export function normalizeSearchRequest(
  input: Partial<SearchRequest>,
): SearchRequest {
  const parsedHours = Number(input.maxDurationHours);
  const parsedTravelers = Math.round(Number(input.travelers));
  const budgetBand =
    input.budgetBand && VALID_BUDGET_BANDS.has(input.budgetBand)
      ? input.budgetBand
      : DEFAULT_SEARCH_REQUEST.budgetBand;
  const modes = input.modes ? uniqueModes(input.modes) : [];

  return {
    origin: input.origin?.trim() || DEFAULT_SEARCH_REQUEST.origin,
    destination:
      input.destination?.trim() || DEFAULT_SEARCH_REQUEST.destination,
    departureDate: /^\d{4}-\d{2}-\d{2}$/.test(input.departureDate ?? "")
      ? input.departureDate!
      : DEFAULT_SEARCH_REQUEST.departureDate,
    travelers: Number.isFinite(parsedTravelers)
      ? Math.min(9, Math.max(1, parsedTravelers))
      : DEFAULT_SEARCH_REQUEST.travelers,
    maxDurationHours: VALID_HOURS.has(parsedHours)
      ? (parsedHours as SearchRequest["maxDurationHours"])
      : DEFAULT_SEARCH_REQUEST.maxDurationHours,
    budgetBand,
    modes: modes.length > 0 ? modes : [...DEFAULT_SEARCH_REQUEST.modes],
  };
}

export function parseSearchQuery(search: string): SearchRequest {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  return normalizeSearchRequest({
    origin: params.get("from") ?? undefined,
    destination: params.get("to") ?? undefined,
    departureDate: params.get("date") ?? undefined,
    travelers: params.has("travelers")
      ? Number(params.get("travelers"))
      : undefined,
    maxDurationHours: params.has("hours")
      ? (Number(params.get("hours")) as SearchRequest["maxDurationHours"])
      : undefined,
    budgetBand: (params.get("budget") as BudgetBand | null) ?? undefined,
    modes: params.has("means")
      ? formMeansToModes((params.get("means") ?? "").split(","))
      : undefined,
  });
}

export function serializeSearchRequest(request: SearchRequest): string {
  const normalized = normalizeSearchRequest(request);
  const params = new URLSearchParams({
    from: normalized.origin,
    to: normalized.destination,
    date: normalized.departureDate,
    travelers: String(normalized.travelers),
    hours: String(normalized.maxDurationHours),
    budget: normalized.budgetBand,
    means: modesToFormMeans(normalized.modes).join(","),
  });
  return params.toString();
}

export function resultsUrl(request: SearchRequest): string {
  return `/results?${serializeSearchRequest(request)}`;
}
