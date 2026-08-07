import { describe, expect, it } from "vitest";
import { searchItineraries } from "./engine";
import { LOCATIONS } from "./locations";
import {
  DEFAULT_SEARCH_REQUEST,
  parseSearchQuery,
  serializeSearchRequest,
} from "./query";
import type { SearchRequest } from "./types";

const search = (overrides: Partial<SearchRequest> = {}) =>
  searchItineraries({ ...DEFAULT_SEARCH_REQUEST, ...overrides });

describe("local deterministic search", () => {
  it("covers Europe and international hubs with a controlled dataset", () => {
    expect(LOCATIONS.length).toBeGreaterThanOrEqual(30);
    expect(LOCATIONS.length).toBeLessThanOrEqual(50);
    expect(LOCATIONS.map((location) => location.name)).toEqual(
      expect.arrayContaining([
        "Roma",
        "Parigi",
        "Istanbul",
        "Dubai",
        "New York",
        "Tokyo",
      ]),
    );
  });

  it("returns identical output for an identical request", () => {
    expect(search()).toEqual(search());
  });

  it("preserves the Roma-Dubai reference results", () => {
    const itineraries = search().itineraries.sort(
      (a, b) => a.totalPrice - b.totalPrice,
    );
    expect(itineraries.map((itinerary) => itinerary.totalPrice)).toEqual([
      146, 175, 210,
    ]);
    expect(itineraries.map((itinerary) => itinerary.durationMinutes)).toEqual([
      1_680, 1_200, 780,
    ]);
    expect(itineraries.map((itinerary) => itinerary.segments.length)).toEqual([
      4, 3, 2,
    ]);
    expect(itineraries[0].segments.map((segment) => segment.operator)).toEqual([
      "FlixBus",
      "Grimaldi Lines",
      "Hellenic Train",
      "Wizz Air",
    ]);
  });

  it("treats the selected budget as a per-traveler limit", () => {
    const single = search({ travelers: 1 });
    const group = search({ travelers: 3 });
    expect(group.itineraries).toHaveLength(single.itineraries.length);
    for (let index = 0; index < single.itineraries.length; index += 1) {
      expect(group.itineraries[index].pricePerTraveler).toBe(
        single.itineraries[index].pricePerTraveler,
      );
      expect(group.itineraries[index].totalPrice).toBe(
        single.itineraries[index].totalPrice * 3,
      );
    }
  });

  it("applies duration, budget and selected-mode hard constraints", () => {
    const response = search({
      origin: "Parigi",
      destination: "Amsterdam",
      maxDurationHours: 12,
      budgetBand: "<100",
      modes: ["train", "bus"],
    });
    expect(response.itineraries.length).toBeGreaterThan(0);
    for (const itinerary of response.itineraries) {
      expect(itinerary.durationMinutes).toBeLessThanOrEqual(12 * 60);
      expect(itinerary.pricePerTraveler).toBeLessThan(100);
      expect(
        itinerary.segments.every((segment) =>
          ["train", "bus"].includes(segment.mode),
        ),
      ).toBe(true);
    }
  });

  it("does not generate cycles inside an itinerary", () => {
    const response = search({
      origin: "Milano",
      destination: "Tokyo",
      budgetBand: ">300",
    });
    expect(response.itineraries.length).toBeGreaterThan(0);
    for (const itinerary of response.itineraries) {
      const visited = [
        itinerary.segments[0].fromLocationId,
        ...itinerary.segments.map((segment) => segment.toLocationId),
      ];
      expect(new Set(visited).size).toBe(visited.length);
    }
  });

  it("keeps every itinerary segment connected", () => {
    const responses = [
      search(),
      search({ origin: "Milano", destination: "Tokyo", budgetBand: ">300" }),
    ];
    for (const response of responses) {
      for (const itinerary of response.itineraries) {
        for (let index = 1; index < itinerary.segments.length; index += 1) {
          expect(itinerary.segments[index - 1].toLocationId).toBe(
            itinerary.segments[index].fromLocationId,
          );
        }
      }
    }
  });

  it("changes generated output when the route changes", () => {
    const first = search({
      origin: "Roma",
      destination: "Barcellona",
      budgetBand: "100-300",
    });
    const second = search({
      origin: "Milano",
      destination: "Tokyo",
      budgetBand: ">300",
    });
    expect(first.itineraries.length).toBeGreaterThan(0);
    expect(second.itineraries.length).toBeGreaterThan(0);
    expect(first.itineraries[0].id).not.toBe(second.itineraries[0].id);
    expect(first.itineraries[0].destination).toBe("Barcellona");
    expect(second.itineraries[0].destination).toBe("Tokyo");
  });

  it("returns no journey for an unknown or identical location", () => {
    expect(search({ origin: "Atlantide" }).itineraries).toEqual([]);
    expect(search({ origin: "Roma", destination: "Roma" }).itineraries).toEqual(
      [],
    );
  });
});

describe("search query contract", () => {
  it("round-trips every form input through the URL", () => {
    const request: SearchRequest = {
      origin: "Bologna",
      destination: "Bangkok",
      departureDate: "2026-10-05",
      travelers: 2,
      maxDurationHours: 48,
      budgetBand: ">300",
      modes: ["flight", "train"],
    };
    expect(parseSearchQuery(serializeSearchRequest(request))).toEqual(request);
  });
});
