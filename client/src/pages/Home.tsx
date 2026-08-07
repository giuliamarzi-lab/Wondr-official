/*
 * WONDR HOME PAGE — struttura HTML e classi CSS estratte direttamente dal DOM del sito Lovable
 * Font: AvertaStd (unico font, come nel sito originale)
 * Colori: --ink (quasi nero), --magenta (rosa vivace), --secondary (grigio chiaro)
 * Form: bg-card rounded-3xl shadow-elevated border border-border/60 p-5 md:p-6
 * Bottoni ore/budget NON selezionati: bg-secondary/50 text-black border-transparent
 * Bottoni ore/budget SELEZIONATI: bg-ink text-white border-ink
 * Bottoni mezzi: rounded-full bg-magenta/10 text-magenta border-magenta/30 (sempre attivi)
 */

import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { MapPin, Calendar, Users, Minus, Plus, Clock, Wallet, Search, ArrowRight, Plane, Train, Bus, Ship, Zap, Timer, PiggyBank, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  formMeansToModes,
  normalizeSearchRequest,
  resultsUrl,
  SEARCH_LOCATION_NAMES,
} from "@/search";

const CITIES = SEARCH_LOCATION_NAMES;
const DESTS = SEARCH_LOCATION_NAMES;
// Preset per ciascuna destinazione popolare: destinazione, data, viaggiatori, ore, budget, mezzi
const POPULAR_PRESETS: Record<string, { dest: string; date: string; travelers: number; hours: string; budget: string; means: string[] }> = {
  "Tokyo":      { dest: "Tokyo",      date: "2026-09-15", travelers: 2, hours: "48",  budget: ">300",   means: ["voli"] },
  "New York":   { dest: "New York",   date: "2026-08-20", travelers: 1, hours: "24",  budget: ">300",   means: ["voli"] },
  "Bangkok":    { dest: "Bangkok",    date: "2026-10-05", travelers: 2, hours: "48",  budget: "100-300", means: ["voli", "treni"] },
  "Dubai":      { dest: "Dubai",      date: "2026-07-10", travelers: 1, hours: "48",  budget: "100-300", means: ["voli", "treni", "bus", "traghetti"] },
  "Barcellona": { dest: "Barcellona", date: "2026-07-25", travelers: 2, hours: "12",  budget: "<100",   means: ["voli", "treni", "bus"] },
  "Amsterdam":  { dest: "Amsterdam",  date: "2026-08-01", travelers: 1, hours: "24",  budget: "<100",   means: ["treni", "bus"] },
};
const POPULAR = Object.keys(POPULAR_PRESETS);

const MEANS = [
  { key: "voli", labelIt: "Voli", labelEn: "Flights", Icon: Plane },
  { key: "treni", labelIt: "Treni", labelEn: "Trains", Icon: Train },
  { key: "bus", labelIt: "Bus", labelEn: "Bus", Icon: Bus },
  { key: "traghetti", labelIt: "Traghetti", labelEn: "Ferries", Icon: Ship },
];

export default function Home() {
  const { t, lang } = useLanguage();
  const [, navigate] = useLocation();

  const [departure, setDeparture] = useState("Roma");
  const [destination, setDestination] = useState("Dubai");
  const [date, setDate] = useState("2026-07-10");
  const [travelers, setTravelers] = useState(1);
  const [hours, setHours] = useState("48");
  const [budget, setBudget] = useState("100-300");
  const [means, setMeans] = useState<string[]>(["voli", "treni", "bus", "traghetti"]);
  const [searching, setSearching] = useState(false);

  const toggleMean = (key: string) => {
    setMeans(prev =>
      prev.includes(key) ? (prev.length > 1 ? prev.filter(m => m !== key) : prev) : [...prev, key]
    );
  };

  const applyPopularPreset = (dest: string) => {
    const p = POPULAR_PRESETS[dest];
    if (!p) return;
    setDestination(p.dest);
    setDate(p.date);
    setTravelers(p.travelers);
    setHours(p.hours);
    setBudget(p.budget);
    setMeans(p.means);
    // Scroll al form
    document.getElementById("search-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    const target = resultsUrl(normalizeSearchRequest({
      origin: departure,
      destination,
      departureDate: date,
      travelers,
      maxDurationHours: Number(hours) as 12 | 24 | 48,
      budgetBand: budget as "<100" | "100-300" | ">300",
      modes: formMeansToModes(means),
    }));
    setTimeout(() => {
      setSearching(false);
      navigate(target);
    }, 1400);
  };

  // Scroll reveal
  const revealRefs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    revealRefs.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const addReveal = (i: number) => (el: HTMLElement | null) => { revealRefs.current[i] = el; };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      {/* Spacer per navbar fixed: non serve perché l'hero ha paddingTop: 7rem */}

      {/* ── HERO ── */}
      <section
        id="search"
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #12172a 0%, #1a1a2e 55%, #2a1040 100%)", paddingTop: "7rem", paddingBottom: "5rem" }}
      >
        {/* Dot pattern — quasi impercettibile, stile tavoletta grafica */}
        <div className="absolute inset-0 pointer-events-none dot-pattern" style={{ opacity: 0.08 }} />

        {/* Glow blobs */}
        <div className="absolute -top-32 right-0 w-[480px] h-[480px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(236,0,155,0.22) 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 left-1/3 w-[360px] h-[360px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(120,40,200,0.14) 0%, transparent 65%)" }} />

        {/* Pittogramma decorativo */}
        <div className="absolute top-8 right-12 opacity-10 pointer-events-none select-none hidden lg:block">
          <img src="/manus-storage/Pittograma_c4a1b2d3.svg" alt="" className="w-48 h-48" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full text-sm"
            style={{ border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.75)" }}
          >
            <span className="w-2 h-2 rounded-full bg-magenta inline-block" />
            {lang === "it" ? "800+ partner · zero costi nascosti" : "800+ partners · zero hidden fees"}
          </div>

          {/* Headline */}
          <h1
            className="mb-6 leading-[1.05]"
            style={{ fontWeight: 800, fontSize: "clamp(2.6rem, 6vw, 5.5rem)", color: "white", letterSpacing: "-0.02em" }}
          >
            Cheapest trip,<br />
            <span className="text-magenta">priceless memories.</span>
          </h1>

          {/* Subheadline */}
          <p className="mb-10 max-w-md" style={{ fontWeight: 300, fontSize: "1rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>
            {lang === "it"
              ? "Se pensi di non potertelo permettere, è perché non hai ancora provato Wondr."
              : "If you think you can't afford it, it's because you haven't tried Wondr yet."}
          </p>

          {/* ── FORM CARD — struttura esatta dal DOM Lovable ── */}
          <form
            id="search-form"
            onSubmit={handleSearch}
            className="relative bg-card rounded-3xl border p-5 md:p-6"
            style={{ borderColor: "rgba(0,0,0,0.08)", boxShadow: "0 20px 60px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.12)" }}
          >
            {/* Riga 1: 4 colonne */}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {/* Partenza */}
              <div className="relative">
                <label className="group relative flex items-center gap-3 px-4 py-3 rounded-2xl bg-secondary/60 hover:bg-secondary transition-colors cursor-pointer">
                  <span className="text-magenta">
                    <MapPin size={18} aria-hidden="true" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                      {lang === "it" ? "Partenza" : "Departure"}
                    </div>
                    <div className="text-sm font-medium text-foreground truncate">
                      <select
                        value={departure}
                        onChange={e => setDeparture(e.target.value)}
                        className="bg-transparent w-full outline-none appearance-none cursor-pointer font-medium"
                      >
                        {CITIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </label>
              </div>

              {/* Destinazione */}
              <div className="relative">
                <label className="group relative flex items-center gap-3 px-4 py-3 rounded-2xl bg-secondary/60 hover:bg-secondary transition-colors cursor-pointer">
                  <span className="text-magenta">
                    <MapPin size={18} aria-hidden="true" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                      {lang === "it" ? "Destinazione" : "Destination"}
                    </div>
                    <div className="text-sm font-medium text-foreground truncate">
                      <select
                        value={destination}
                        onChange={e => setDestination(e.target.value)}
                        className="bg-transparent w-full outline-none appearance-none cursor-pointer font-medium"
                      >
                        {DESTS.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </label>
              </div>

              {/* Data */}
              <label className="group relative flex items-center gap-3 px-4 py-3 rounded-2xl bg-secondary/60 hover:bg-secondary transition-colors cursor-pointer">
                <span className="text-magenta">
                  <Calendar size={18} aria-hidden="true" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                    {lang === "it" ? "Data" : "Date"}
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    <input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="bg-transparent w-full outline-none cursor-pointer font-medium"
                    />
                  </div>
                </div>
              </label>

              {/* Viaggiatori */}
              <label className="group relative flex items-center gap-3 px-4 py-3 rounded-2xl bg-secondary/60 hover:bg-secondary transition-colors">
                <span className="text-magenta">
                  <Users size={18} aria-hidden="true" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                    {lang === "it" ? "Viaggiatori" : "Travelers"}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <button
                      type="button"
                      onClick={() => setTravelers(v => Math.max(1, v - 1))}
                      className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-magenta hover:text-magenta transition-colors"
                      aria-label={lang === "it" ? "Diminuisci" : "Decrease"}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-medium text-foreground w-4 text-center">{travelers}</span>
                    <button
                      type="button"
                      onClick={() => setTravelers(v => Math.min(9, v + 1))}
                      className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-magenta hover:text-magenta transition-colors"
                      aria-label={lang === "it" ? "Aumenta" : "Increase"}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </label>
            </div>

            {/* Riga 2: Ore massime + Budget — struttura esatta dal DOM */}
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {/* Ore massime */}
              <div className="flex flex-col gap-2 px-1">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
                  <Clock size={13} aria-hidden="true" />
                  {lang === "it" ? "Ore massime di viaggio" : "Max travel hours"}
                </span>
                <div className="flex gap-2">
                  {[
                    { val: "12", label: lang === "it" ? "Fino a 12h" : "Up to 12h" },
                    { val: "24", label: lang === "it" ? "Fino a 24h" : "Up to 24h" },
                    { val: "48", label: "48h+" },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setHours(opt.val)}
                      className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium border transition-all${
                        hours === opt.val
                          ? " bg-ink text-white border-ink"
                          : " bg-secondary/50 text-black border-transparent hover:border-border"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget massimo */}
              <div className="flex flex-col gap-2 px-1">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
                  <Wallet size={13} aria-hidden="true" />
                  {lang === "it" ? "Budget massimo per singolo viaggiatore" : "Max budget per traveler"}
                </span>
                <div className="flex gap-2">
                  {[
                    { val: "<100", label: "< €100" },
                    { val: "100-300", label: "€100-300" },
                    { val: ">300", label: "> €300" },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setBudget(opt.val)}
                      className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium border transition-all${
                        budget === opt.val
                          ? " bg-ink text-white border-ink"
                          : " bg-secondary/50 text-black border-transparent hover:border-border"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Riga 3: Mezzi inclusi — struttura esatta dal DOM */}
            <div className="mt-4 flex flex-wrap items-center gap-2 px-1">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mr-1">
                {lang === "it" ? "Mezzi inclusi" : "Included means"}
              </span>
              {MEANS.map(m => {
                const isActive = means.includes(m.key);
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => toggleMean(m.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all${
                      isActive
                        ? " bg-magenta/10 text-magenta border-magenta/30"
                        : " bg-transparent text-muted-foreground border-border"
                    }`}
                  >
                    <m.Icon size={12} />
                    {lang === "it" ? m.labelIt : m.labelEn}
                  </button>
                );
              })}
            </div>

            {/* Submit — struttura esatta dal DOM */}
            <button
              type="submit"
              disabled={searching}
              className="mt-5 w-full md:w-auto md:ml-auto md:flex group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-magenta text-white font-semibold shadow-magenta hover:shadow-elevated hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70"
            >
              <Search size={18} aria-hidden="true" />
              {searching
                ? (lang === "it" ? "Ricerca in corso…" : "Searching…")
                : (lang === "it" ? "Cerca il tuo viaggio" : "Search your trip")}
              {!searching && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />}
            </button>
          </form>

          {/* Destinazioni popolari */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-sm text-white/50 mr-1">{lang === "it" ? "Popolari:" : "Popular:"}</span>
            {POPULAR.map(dest => (
              <button
                key={dest}
                type="button"
                onClick={() => applyPopularPreset(dest)}
                className="px-3 py-1 rounded-full text-xs font-medium border transition-all hover:border-white/50 hover:text-white hover:scale-105"
                style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.65)", background: "rgba(255,255,255,0.05)" }}
              >
                {dest}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── PERCHÉ WONDR ── */}
      <section className="py-20 bg-background" ref={addReveal(0)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-xs uppercase tracking-widest font-semibold text-magenta mb-3">
              {lang === "it" ? "Perché Wondr" : "Why Wondr"}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              {lang === "it" ? "Il modo più smart\ndi andare ovunque." : "The smartest way\nto go anywhere."}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: <Zap size={22} className="text-magenta" />,
                titleIt: "Percorsi multimodali", titleEn: "Multimodal routes",
                descIt: "Voli, treni, bus e traghetti combinati in un unico viaggio.",
                descEn: "Flights, trains, buses and ferries combined in one trip.",
              },
              {
                icon: <Timer size={22} className="text-magenta" />,
                titleIt: "Tu scegli il tempo", titleEn: "You choose the time",
                descIt: "Da 12h a 48h+. Scegli quanto vuoi viaggiare.",
                descEn: "From 12h to 48h+. Choose how long you want to travel.",
              },
              {
                icon: <PiggyBank size={22} className="text-magenta" />,
                titleIt: "Budget sotto controllo", titleEn: "Budget under control",
                descIt: "Filtra per fasce di prezzo. Solo opzioni che puoi permetterti.",
                descEn: "Filter by price range. Only options you can afford.",
              },
              {
                icon: <ExternalLink size={22} className="text-magenta" />,
                titleIt: "Prenoti dove vuoi", titleEn: "Book where you want",
                descIt: "Ti portiamo dai partner ufficiali. Nessuna commissione.",
                descEn: "We take you to official partners. No commission.",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="reveal bg-card rounded-2xl p-6 border border-border hover:border-magenta/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                ref={addReveal(i + 1)}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="mb-4 w-10 h-10 rounded-xl bg-magenta/10 flex items-center justify-center">
                  {card.icon}
                </div>
                <h3 className="font-bold text-base text-foreground mb-2">
                  {lang === "it" ? card.titleIt : card.titleEn}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {lang === "it" ? card.descIt : card.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COME FUNZIONA ── */}
      <section className="py-20 bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest font-semibold text-magenta mb-3">
              {lang === "it" ? "Come funziona" : "How it works"}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {lang === "it" ? "Dal sogno al biglietto in 3 step." : "From dream to ticket in 3 steps."}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                n: "01", titleIt: "Inserisci la ricerca", titleEn: "Enter your search",
                descIt: "Dimmi da dove parti, dove vuoi andare, e quanto tempo hai.",
                descEn: "Tell us where you're leaving from, where you want to go, and how much time you have.",
              },
              {
                n: "02", titleIt: "Wondr costruisce il percorso", titleEn: "Wondr builds the route",
                descIt: "Combiniamo voli, treni, bus e traghetti per trovare il minimo.",
                descEn: "We combine flights, trains, buses and ferries to find the minimum.",
              },
              {
                n: "03", titleIt: "Scegli e prenota", titleEn: "Choose and book",
                descIt: "Ti portiamo dai partner ufficiali. Prenoti dove preferisci.",
                descEn: "We take you to official partners. Book where you prefer.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="reveal bg-card rounded-2xl p-8 border border-border relative overflow-hidden hover:border-magenta/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                ref={addReveal(i + 6)}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="text-5xl font-bold text-magenta mb-4 leading-none">{step.n}</div>
                <div className="absolute top-6 right-6 w-1 h-8 bg-magenta/20 rounded-full" />
                <h3 className="font-bold text-lg text-foreground mb-3">
                  {lang === "it" ? step.titleIt : step.titleEn}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {lang === "it" ? step.descIt : step.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNER ── */}
      <section id="partners" className="py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold text-magenta mb-3">
                {lang === "it" ? "Partner" : "Partners"}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                {lang === "it" ? "800+ compagnie.\nUn'unica ricerca." : "800+ companies.\nOne search."}
              </h2>
            </div>
            <span className="text-sm text-muted-foreground flex items-center gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              {lang === "it" ? "Copertura globale" : "Global coverage"}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Plane size={24} className="text-magenta" />, titleIt: "Voli", titleEn: "Flights", desc: "Ryanair, easyJet, Wizz Air, Volotea…" },
              { icon: <Train size={24} className="text-magenta" />, titleIt: "Treni", titleEn: "Trains", desc: "Trenitalia, Italo, DB, SNCF…" },
              { icon: <Bus size={24} className="text-magenta" />, titleIt: "Bus", titleEn: "Bus", desc: "FlixBus, BlaBlaCar, Eurolines…" },
              { icon: <Ship size={24} className="text-magenta" />, titleIt: "Traghetti", titleEn: "Ferries", desc: "GNV, Grimaldi, Moby…" },
            ].map((p, i) => (
              <div
                key={i}
                className="reveal rounded-2xl p-6 border border-border/60 hover:border-magenta/40 hover:scale-[1.03] transition-all duration-200"
                ref={addReveal(i + 10)}
                style={{ background: "var(--ink)", transitionDelay: `${i * 80}ms` }}
              >
                <div className="mb-3">{p.icon}</div>
                <h3 className="font-bold text-white text-base mb-1">{lang === "it" ? p.titleIt : p.titleEn}</h3>
                <p className="text-xs text-white/50">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CASO REALE ── */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-3xl p-8 md:p-12 grid md:grid-cols-2 gap-10 items-center"
            style={{ background: "var(--ink)" }}
          >
            {/* Left */}
            <div>
              <div className="inline-flex items-center mb-4 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase" style={{ background: "rgba(236,0,155,0.15)", border: "1px solid rgba(236,0,155,0.3)", color: "var(--magenta)" }}>
                {lang === "it" ? "Caso reale" : "Real case"}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                {lang === "it" ? (
                  <>Roma → Dubai a <span className="text-magenta">€146.</span><br />Non è uno scherzo.</>
                ) : (
                  <>Rome → Dubai for <span className="text-magenta">€146.</span><br />Not a joke.</>
                )}
              </h2>
              <p className="text-white/60 text-sm mb-6 leading-relaxed">
                {lang === "it"
                  ? "Un volo diretto costa €420. Wondr lo costruisce con 4 tappe in 28 ore."
                  : "A direct flight costs €420. Wondr builds it with 4 stops in 28 hours."}
                {" "}<strong className="text-white">{lang === "it" ? "Risparmi €274." : "You save €274."}</strong>
              </p>
              <a
                href="/results"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-magenta text-white font-semibold text-sm shadow-magenta hover:scale-[1.02] active:scale-95 transition-all"
              >
                {lang === "it" ? "Vedi il percorso completo" : "See the full route"}
                <ArrowRight size={16} />
              </a>
            </div>

            {/* Right — tappe */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex justify-between text-xs text-white/40 uppercase tracking-wider mb-4">
                <span>4 {lang === "it" ? "tappe" : "stops"} · 28h</span>
                <span>€420</span>
              </div>
              {[
                { Icon: Bus, from: "Roma", to: "Bari", carrier: "FlixBus", price: "€12" },
                { Icon: Ship, from: "Bari", to: "Patrasso", carrier: "Grimaldi", price: "€25" },
                { Icon: Train, from: "Patrasso", to: "Atene", carrier: "Hellenic Train", price: "€20" },
                { Icon: Plane, from: "Atene", to: "Dubai", carrier: "Wizz Air", price: "€89" },
              ].map((leg, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-white/10 last:border-0">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <leg.Icon size={14} className="text-white/80" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{leg.from} → {leg.to}</div>
                    <div className="text-xs text-white/40">{leg.carrier}</div>
                  </div>
                  <span className="text-sm font-bold text-white">{leg.price}</span>
                </div>
              ))}
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/20">
                <span className="text-sm text-white/60">{lang === "it" ? "Totale" : "Total"}</span>
                <span className="text-xl font-bold text-magenta">€146</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINALE ── */}
      <section className="py-24 bg-background text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {lang === "it" ? "Dove vuoi andare oggi?" : "Where do you want to go today?"}
          </h2>
          <p className="text-muted-foreground mb-10 text-base">
            {lang === "it"
              ? "800+ compagnie partner. Zero costi nascosti. Solo risparmio."
              : "800+ partner companies. Zero hidden costs. Only savings."}
          </p>
          <a
            href="/#search"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-magenta text-white font-semibold text-base shadow-magenta hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Search size={18} />
            {lang === "it" ? "Cerca il tuo viaggio" : "Search your trip"}
            <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden px-4 pb-4 pt-2" style={{ background: "linear-gradient(to top, rgba(247,247,249,1) 60%, transparent)" }}>
        <a
          href="/#search-form"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-magenta text-white font-semibold text-sm shadow-magenta"
        >
          <Search size={16} />
          {lang === "it" ? "Cerca il tuo viaggio" : "Search your trip"}
        </a>
      </div>

      <Footer />
    </div>
  );
}
