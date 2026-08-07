/**
 * Wondr Results Page
 * Prompt spec: 3 risultati mock Roma→Dubai, filtri laterali, card espandibili,
 * badge risparmio, disclaimer prezzi, link prenota → omio.com
 * Font: AvertaStd (Bold titoli, Regular corpo, Light secondario)
 */
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { ArrowLeft, SlidersHorizontal, ChevronDown, ChevronUp, ExternalLink, Clock, MapPin, Plane, Train, Bus, Ship, X, Search, Users, CalendarDays } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  formMeansToModes,
  modesToFormMeans,
  normalizeSearchRequest,
  parseSearchQuery,
  resultsUrl,
  searchItineraries,
} from "@/search";
import type { Itinerary, TransportMode } from "@/search";

const MODE_PRESENTATION: Record<TransportMode, {
  Icon: LucideIcon;
  filterKey: string;
  it: string;
  en: string;
}> = {
  flight: { Icon: Plane, filterKey: "volo", it: "Volo", en: "Flight" },
  train: { Icon: Train, filterKey: "treno", it: "Treno", en: "Train" },
  bus: { Icon: Bus, filterKey: "bus", it: "Bus", en: "Bus" },
  ferry: { Icon: Ship, filterKey: "traghetto", it: "Traghetto", en: "Ferry" },
};

const timeLabel = (value: string) => {
  const date = new Date(value);
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
};

const toResultCards = (itineraries: Itinerary[], lang: "it" | "en") =>
  [...itineraries].sort((a, b) => a.totalPrice - b.totalPrice).map((itinerary, index) => ({
    id: index + 1,
    from: itinerary.origin,
    to: itinerary.destination,
    price: itinerary.pricePerTraveler,
    totalPrice: itinerary.totalPrice,
    directPrice: itinerary.directPricePerTraveler,
    saving: itinerary.directPricePerTraveler - itinerary.pricePerTraveler,
    duration: `${Math.ceil(itinerary.durationMinutes / 60)}`,
    legs: itinerary.segments.length,
    means: itinerary.segments.map(segment => MODE_PRESENTATION[segment.mode].filterKey),
    detail: itinerary.segments.map(segment => {
      const presentation = MODE_PRESENTATION[segment.mode];
      return {
        Icon: presentation.Icon,
        from: segment.from,
        to: segment.to,
        carrier: `${lang === "it" ? presentation.it : presentation.en}, ${segment.operator}`,
        time: `${timeLabel(segment.departureAt)}, ${timeLabel(segment.arrivalAt)}`,
        price: segment.pricePerTraveler,
      };
    }),
  }));

const MEANS_FORM = [
  { key: "voli", Icon: Plane },
  { key: "treni", Icon: Train },
  { key: "bus", Icon: Bus },
  { key: "traghetti", Icon: Ship },
];

export default function Results() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const { t, lang } = useLanguage();
  const request = useMemo(() => parseSearchQuery(search), [search]);
  const response = useMemo(() => searchItineraries(request), [request]);
  const results = useMemo(
    () => toResultCards(response.itineraries, lang),
    [response.itineraries, lang],
  );
  const [expanded, setExpanded] = useState<number | null>(1);
  const [sortBy, setSortBy] = useState<"prezzo" | "durata">("prezzo");
  const ALL_MEANS = ["volo", "treno", "bus", "traghetto"];
  const [filterMeans, setFilterMeans] = useState<string[]>(["tutti"]);

  // Drawer stato
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editFrom, setEditFrom] = useState(request.origin);
  const [editTo, setEditTo] = useState(request.destination);
  const [editDate, setEditDate] = useState(request.departureDate);
  const [editTravelers, setEditTravelers] = useState(request.travelers);
  const [editHours, setEditHours] = useState(String(request.maxDurationHours));
  const [editBudget, setEditBudget] = useState(request.budgetBand);
  const [editMeans, setEditMeans] = useState<string[]>(modesToFormMeans(request.modes));

  useEffect(() => {
    setEditFrom(request.origin);
    setEditTo(request.destination);
    setEditDate(request.departureDate);
    setEditTravelers(request.travelers);
    setEditHours(String(request.maxDurationHours));
    setEditBudget(request.budgetBand);
    setEditMeans(modesToFormMeans(request.modes));
    setFilterMeans(["tutti"]);
    setExpanded(1);
  }, [request]);

  const toggleEditMean = (key: string) => {
    setEditMeans(prev =>
      prev.includes(key)
        ? (prev.length > 1 ? prev.filter(k => k !== key) : prev)
        : [...prev, key]
    );
  };

  const handleUpdateSearch = () => {
    const nextRequest = normalizeSearchRequest({
      origin: editFrom,
      destination: editTo,
      departureDate: editDate,
      travelers: editTravelers,
      maxDurationHours: Number(editHours) as 12 | 24 | 48,
      budgetBand: editBudget,
      modes: formMeansToModes(editMeans),
    });
    setDrawerOpen(false);
    navigate(resultsUrl(nextRequest));
  };

  const toggleMeanFilter = (val: string) => {
    if (val === "tutti") {
      setFilterMeans(["tutti"]);
      return;
    }
    setFilterMeans(prev => {
      const withoutTutti = prev.filter(v => v !== "tutti");
      const next = withoutTutti.includes(val)
        ? withoutTutti.filter(v => v !== val)
        : [...withoutTutti, val];
      if (next.length === ALL_MEANS.length) return ["tutti"];
      if (next.length === 0) return ["tutti"];
      return next;
    });
  };

  const filtered = results
    .filter(r => filterMeans.includes("tutti") || r.means.some(m => filterMeans.includes(m)))
    .sort((a, b) => sortBy === "prezzo" ? a.price - b.price : parseInt(a.duration) - parseInt(b.duration));

  const budgetSummary = request.budgetBand === "<100"
    ? "< €100"
    : request.budgetBand === "100-300" ? "€100-300" : "> €300";
  const travelerLabel = lang === "it"
    ? (request.travelers === 1 ? "viaggiatore" : "viaggiatori")
    : (request.travelers === 1 ? "traveler" : "travelers");

  const HOURS_OPTIONS = [
    { val: "12", label: lang === "it" ? "Fino a 12h" : "Up to 12h" },
    { val: "24", label: lang === "it" ? "Fino a 24h" : "Up to 24h" },
    { val: "48", label: "48h+" },
  ];
  const BUDGET_OPTIONS = [
    { val: "<100", label: "< €100" },
    { val: "100-300", label: "€100-300" },
    { val: ">300", label: "> €300" },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F7F7F9" }}>
      <Navbar />

      {/* ── HEADER DARK ── */}
      <section className="pt-16" style={{ background: "#12172a" }}>
        <div className="container py-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm mb-6 transition-colors"
            style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'AvertaStd', sans-serif", background: "transparent", border: "none" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "white"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"}
          >
            <ArrowLeft size={16} /> {t("results_back").replace("← ", "")}
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-white mb-1" style={{ fontFamily: "'AvertaStd', sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", letterSpacing: "-0.03em" }}>
                {request.origin} <span style={{ color: "#ec009b" }}>→</span> {request.destination}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'AvertaStd', sans-serif", fontSize: "0.9rem" }}>
                {request.travelers} {travelerLabel}, {lang === "it" ? "fino a" : "up to"} {request.maxDurationHours}h, {budgetSummary}
              </p>
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all"
              style={{ border: "1.5px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)", background: "transparent", fontFamily: "'AvertaStd', sans-serif" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "white"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"; }}
              onClick={() => setDrawerOpen(true)}
            >
              <SlidersHorizontal size={15} /> {t("results_modify")}
            </button>
          </div>

          {/* ── DRAWER MODIFICA RICERCA ── */}
          <div
            style={{
              maxHeight: drawerOpen ? "600px" : "0px",
              overflow: "hidden",
              transition: "max-height 0.35s cubic-bezier(0.23,1,0.32,1)",
            }}
          >
            <div className="mt-6 rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}>
              <div className="flex items-center justify-between mb-5">
                <p style={{ color: "white", fontFamily: "'AvertaStd', sans-serif", fontWeight: 700, fontSize: "1rem" }}>
                  {lang === "it" ? "Modifica la tua ricerca" : "Edit your search"}
                </p>
                <button
                  onClick={() => setDrawerOpen(false)}
                  style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "white"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Row 1: Partenza, Destinazione, Data, Viaggiatori */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.12)" }}>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'AvertaStd', sans-serif", fontWeight: 600, fontSize: "0.65rem" }}>
                    {lang === "it" ? "Partenza" : "From"}
                  </p>
                  <div className="flex items-center gap-2">
                    <MapPin size={13} style={{ color: "#ec009b", flexShrink: 0 }} />
                    <input
                      value={editFrom}
                      onChange={e => setEditFrom(e.target.value)}
                      className="bg-transparent border-none outline-none w-full text-sm text-white"
                      style={{ fontFamily: "'AvertaStd', sans-serif", fontWeight: 600 }}
                    />
                  </div>
                </div>
                <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.12)" }}>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'AvertaStd', sans-serif", fontWeight: 600, fontSize: "0.65rem" }}>
                    {lang === "it" ? "Destinazione" : "To"}
                  </p>
                  <div className="flex items-center gap-2">
                    <MapPin size={13} style={{ color: "#ec009b", flexShrink: 0 }} />
                    <input
                      value={editTo}
                      onChange={e => setEditTo(e.target.value)}
                      className="bg-transparent border-none outline-none w-full text-sm text-white"
                      style={{ fontFamily: "'AvertaStd', sans-serif", fontWeight: 600 }}
                    />
                  </div>
                </div>
                <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.12)" }}>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'AvertaStd', sans-serif", fontWeight: 600, fontSize: "0.65rem" }}>
                    {lang === "it" ? "Data" : "Date"}
                  </p>
                  <div className="flex items-center gap-2">
                    <CalendarDays size={13} style={{ color: "#ec009b", flexShrink: 0 }} />
                    <input
                      type="date"
                      value={editDate}
                      onChange={e => setEditDate(e.target.value)}
                      className="bg-transparent border-none outline-none w-full text-sm text-white"
                      style={{ fontFamily: "'AvertaStd', sans-serif", fontWeight: 600, colorScheme: "dark" }}
                    />
                  </div>
                </div>
                <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.12)" }}>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'AvertaStd', sans-serif", fontWeight: 600, fontSize: "0.65rem" }}>
                    {lang === "it" ? "Viaggiatori" : "Travelers"}
                  </p>
                  <div className="flex items-center gap-2">
                    <Users size={13} style={{ color: "#ec009b", flexShrink: 0 }} />
                    <button onClick={() => setEditTravelers(Math.max(1, editTravelers - 1))} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "1rem", lineHeight: 1 }}>−</button>
                    <span className="text-sm text-white" style={{ fontFamily: "'AvertaStd', sans-serif", fontWeight: 700, minWidth: "1.2rem", textAlign: "center" }}>{editTravelers}</span>
                    <button onClick={() => setEditTravelers(editTravelers + 1)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "1rem", lineHeight: 1 }}>+</button>
                  </div>
                </div>
              </div>

              {/* Row 2: Ore massime */}
              <div className="mb-4">
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'AvertaStd', sans-serif", fontWeight: 600, fontSize: "0.65rem" }}>
                  {lang === "it" ? "Ore massime di viaggio" : "Max travel hours"}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {HOURS_OPTIONS.map(h => (
                    <button key={h.val} onClick={() => setEditHours(h.val)}
                      className="px-4 py-2 rounded-full text-sm transition-all"
                      style={{
                        fontFamily: "'AvertaStd', sans-serif",
                        fontWeight: editHours === h.val ? 700 : 400,
                        background: editHours === h.val ? "#12172a" : "rgba(255,255,255,0.08)",
                        color: editHours === h.val ? "white" : "rgba(255,255,255,0.6)",
                        border: editHours === h.val ? "1.5px solid rgba(255,255,255,0.3)" : "1.5px solid rgba(255,255,255,0.1)",
                      }}
                    >{h.label}</button>
                  ))}
                </div>
              </div>

              {/* Row 3: Budget */}
              <div className="mb-4">
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'AvertaStd', sans-serif", fontWeight: 600, fontSize: "0.65rem" }}>
                  {lang === "it" ? "Budget massimo per singolo viaggiatore" : "Max budget per traveler"}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {BUDGET_OPTIONS.map(b => (
                    <button key={b.val} onClick={() => setEditBudget(b.val)}
                      className="px-4 py-2 rounded-full text-sm transition-all"
                      style={{
                        fontFamily: "'AvertaStd', sans-serif",
                        fontWeight: editBudget === b.val ? 700 : 400,
                        background: editBudget === b.val ? "#12172a" : "rgba(255,255,255,0.08)",
                        color: editBudget === b.val ? "white" : "rgba(255,255,255,0.6)",
                        border: editBudget === b.val ? "1.5px solid rgba(255,255,255,0.3)" : "1.5px solid rgba(255,255,255,0.1)",
                      }}
                    >{b.label}</button>
                  ))}
                </div>
              </div>

              {/* Row 4: Mezzi inclusi */}
              <div className="mb-5">
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'AvertaStd', sans-serif", fontWeight: 600, fontSize: "0.65rem" }}>
                  {lang === "it" ? "Mezzi inclusi" : "Included means"}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {MEANS_FORM.map(m => {
                    const isActive = editMeans.includes(m.key);
                    const labels: Record<string, { it: string; en: string }> = {
                      voli: { it: "Voli", en: "Flights" },
                      treni: { it: "Treni", en: "Trains" },
                      bus: { it: "Bus", en: "Bus" },
                      traghetti: { it: "Traghetti", en: "Ferries" },
                    };
                    return (
                      <button key={m.key} onClick={() => toggleEditMean(m.key)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all"
                        style={{
                          fontFamily: "'AvertaStd', sans-serif",
                          fontWeight: isActive ? 600 : 400,
                          background: isActive ? "rgba(236,0,155,0.15)" : "rgba(255,255,255,0.06)",
                          color: isActive ? "#ec009b" : "rgba(255,255,255,0.5)",
                          border: isActive ? "1.5px solid rgba(236,0,155,0.4)" : "1.5px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <m.Icon size={12} />
                        {lang === "it" ? labels[m.key].it : labels[m.key].en}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CTA aggiorna */}
              <button
                onClick={handleUpdateSearch}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: "#ec009b", fontFamily: "'AvertaStd', sans-serif", fontWeight: 700, border: "none", boxShadow: "0 4px 20px rgba(236,0,155,0.35)" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#d4008a"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#ec009b"}
              >
                <Search size={15} />
                {lang === "it" ? "Aggiorna ricerca" : "Update search"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <div className="container py-8 flex-1">
        <div className="flex flex-col md:flex-row gap-6">

          {/* ── SIDEBAR FILTRI ── */}
          <aside className="w-full md:w-56 shrink-0">
            <div className="rounded-2xl p-5 sticky top-20" style={{ background: "#ffffff", border: "1.5px solid #f0f0f4" }}>
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#888", fontFamily: "'AvertaStd', sans-serif", fontWeight: 600 }}>{t("results_sort_label")}</p>
              {(["prezzo", "durata"] as const).map(s => (
                <button key={s} onClick={() => setSortBy(s)}
                  className="w-full text-left px-4 py-2.5 rounded-xl mb-2 text-sm transition-all"
                  style={{
                    background: sortBy === s ? "#ec009b" : "transparent",
                    color: sortBy === s ? "white" : "#2D2D2D",
                    fontFamily: "'AvertaStd', sans-serif",
                    fontWeight: sortBy === s ? 600 : 400,
                    border: sortBy === s ? "none" : "1.5px solid #f0f0f4",
                  }}
                >
                  {s === "prezzo" ? t("results_sort_price") : t("results_sort_duration")}
                </button>
              ))}

              <p className="text-xs uppercase tracking-widest mt-5 mb-3" style={{ color: "#888", fontFamily: "'AvertaStd', sans-serif", fontWeight: 600 }}>{t("results_filter_label")}</p>
              {[
                { val: "tutti", label: t("results_filter_all"), Icon: null },
                { val: "volo", label: t("results_filter_flight"), Icon: Plane },
                { val: "treno", label: t("results_filter_train"), Icon: Train },
                { val: "bus", label: t("results_filter_bus"), Icon: Bus },
                { val: "traghetto", label: t("results_filter_ferry"), Icon: Ship },
              ].map(m => {
                const isActive = filterMeans.includes(m.val);
                return (
                  <button key={m.val} onClick={() => toggleMeanFilter(m.val)}
                    className="w-full text-left px-4 py-2.5 rounded-xl mb-2 text-sm transition-all inline-flex items-center gap-2"
                    style={{
                      background: "white",
                      color: isActive ? "#ec009b" : "#2D2D2D",
                      fontFamily: "'AvertaStd', sans-serif",
                      fontWeight: isActive ? 600 : 400,
                      border: isActive ? "1.5px solid #ec009b" : "1.5px solid #f0f0f4",
                    }}
                  >
                    {m.Icon && <m.Icon size={13} style={{ color: isActive ? "#ec009b" : "#aaa" }} />}
                    {m.label}
                  </button>
                );
              })}

              <p className="text-xs mt-5 leading-relaxed" style={{ color: "#bbb", fontFamily: "'AvertaStd', sans-serif" }}>
                {t("results_disclaimer")}
              </p>
            </div>
          </aside>

          {/* ── RESULTS LIST ── */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p style={{ fontFamily: "'AvertaStd', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#2D2D2D" }}>
                {filtered.length} {t("results_found")}
              </p>
              <p className="text-sm" style={{ color: "#888", fontFamily: "'AvertaStd', sans-serif" }}>
                {t("results_from")} <strong style={{ color: "#ec009b" }}>{filtered.length > 0 ? `€${Math.min(...filtered.map(r => r.price))}` : "—"}</strong> {lang === "it" ? "a persona" : "per traveler"}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {filtered.map(r => (
                <div key={r.id} className="result-card overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
                  <div className="p-5 md:p-6">
                    {/* Top row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        {/* Badge risparmio */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "#fce4ec", color: "#ec009b", fontFamily: "'AvertaStd', sans-serif" }}>
                            {t("results_saving")} €{r.saving}
                          </span>
                          <span className="text-xs" style={{ color: "#bbb", fontFamily: "'AvertaStd', sans-serif" }}>
                            {t("results_vs")} €{r.directPrice}
                          </span>
                        </div>

                        <h3 style={{ fontFamily: "'AvertaStd', sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "#2D2D2D" }}>
                          {r.from} → {r.to}
                        </h3>

                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          <span className="flex items-center gap-1 text-sm" style={{ color: "#888", fontFamily: "'AvertaStd', sans-serif" }}>
                            <Clock size={13} /> {r.duration} {t("results_hours")}
                          </span>
                          <span className="flex items-center gap-1 text-sm" style={{ color: "#888", fontFamily: "'AvertaStd', sans-serif" }}>
                            <MapPin size={13} /> {r.legs} {r.legs === 1 ? (lang === "it" ? "tappa" : "leg") : t("results_legs")}
                          </span>
                          <div className="flex gap-1">
                            {r.detail.map((d, i) => (
                              <span key={i} className="inline-flex items-center justify-center w-5 h-5 rounded-full" style={{ background: "#fce4ec" }}>
                                <d.Icon size={11} style={{ color: "#ec009b" }} />
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <div style={{ fontFamily: "'AvertaStd', sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#ec009b", lineHeight: 1 }}>€{r.price}</div>
                          <div className="text-xs mt-0.5" style={{ color: "#bbb", fontFamily: "'AvertaStd', sans-serif" }}>{lang === "it" ? "a persona" : "per traveler"} · €{r.totalPrice} {lang === "it" ? "totali" : "total"}</div>
                        </div>
                        <a
                          href="https://www.omio.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white no-underline transition-all"
                          style={{ background: "#2D2D2D", fontFamily: "'AvertaStd', sans-serif", boxShadow: "0 2px 10px rgba(0,0,0,0.12)" }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#12172a"}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#2D2D2D"}
                        >
                          {t("results_book")} <ExternalLink size={13} />
                        </a>
                      </div>
                    </div>

                    {/* Expand toggle */}
                    <button
                      onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                      className="flex items-center gap-1.5 text-sm transition-colors"
                      style={{ color: expanded === r.id ? "#ec009b" : "#888", fontFamily: "'AvertaStd', sans-serif", fontWeight: 500, background: "transparent", border: "none" }}
                    >
                      {expanded === r.id ? (
                        <><ChevronUp size={15} /> {t("results_hide")}</>
                      ) : (
                        <><ChevronDown size={15} /> {t("results_show")}</>
                      )}
                    </button>
                  </div>

                  {/* Expanded detail */}
                  {expanded === r.id && (
                    <div className="px-5 md:px-6 pb-5 pt-0" style={{ borderTop: "1px solid #f0f0f4" }}>
                      <div className="flex flex-col gap-0 mt-4">
                        {r.detail.map((leg, i) => (
                          <div key={i} className="flex items-center gap-4 py-3" style={{ borderBottom: i < r.detail.length - 1 ? "1px solid #f8f8f8" : "none" }}>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#fce4ec" }}>
                              <leg.Icon size={16} style={{ color: "#ec009b" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold" style={{ color: "#2D2D2D", fontFamily: "'AvertaStd', sans-serif" }}>
                                {leg.from} → {leg.to}
                              </div>
                              <div className="text-xs" style={{ color: "#aaa", fontFamily: "'AvertaStd', sans-serif" }}>
                                {leg.carrier}, {leg.time}
                              </div>
                            </div>
                            <div className="text-sm font-semibold shrink-0" style={{ color: "#2D2D2D", fontFamily: "'AvertaStd', sans-serif" }}>
                              €{leg.price}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs mt-4 leading-relaxed" style={{ color: "#bbb", fontFamily: "'AvertaStd', sans-serif" }}>
                        {t("results_leg_total")}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* Sticky mobile CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-4" style={{ background: "rgba(247,247,249,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid #e8e8ec" }}>
        <button
          onClick={() => setDrawerOpen(true)}
          className="btn-magenta w-full"
          style={{ padding: "0.875rem", borderRadius: "0.875rem" }}
        >
          {lang === "it" ? "Modifica ricerca" : "Edit search"}
        </button>
      </div>

      <Footer />
    </div>
  );
}
