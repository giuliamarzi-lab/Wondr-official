import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "it" | "en";

const translations = {
  it: {
    // Navbar
    nav_how: "Come funziona",
    nav_destinations: "Destinazioni",
    nav_tips: "Trip Tips",
    nav_cta: "Inizia gratis",

    // Hero
    hero_badge: "800+ partner · zero costi nascosti",
    hero_h1_line1: "No trip is",
    hero_h1_line2: "too expensive.",
    hero_sub: "Wondr trova il percorso più economico al mondo combinando voli, treni, bus e traghetti. Anche se vuoi viaggiare 30 ore.",

    // Form
    form_departure: "Partenza",
    form_destination: "Destinazione",
    form_date: "Data",
    form_travelers: "Viaggiatori",
    form_hours_label: "Ore massime di viaggio",
    form_hours_12: "Fino a 12h",
    form_hours_24: "Fino a 24h",
    form_hours_48: "48h+",
    form_budget_label: "Budget massimo per singolo viaggiatore",
    form_means_label: "Mezzi inclusi",
    form_means_flights: "Voli",
    form_means_trains: "Treni",
    form_means_bus: "Bus",
    form_means_ferries: "Traghetti",
    form_cta: "Cerca il tuo viaggio",
    form_searching: "Ricerca in corso...",
    form_popular: "Popolari:",

    // Why section
    why_label: "Perché Wondr",
    why_title: "Il modo più smart di andare ovunque.",
    why_1_title: "Percorsi multimodali",
    why_1_desc: "Voli, treni, bus e traghetti combinati in un unico viaggio.",
    why_2_title: "Tu scegli il tempo",
    why_2_desc: "Da 12h a 48h+. Scegli quanto vuoi viaggiare.",
    why_3_title: "Budget sotto controllo",
    why_3_desc: "Filtra per fasce di prezzo. Solo opzioni che puoi permetterti.",
    why_4_title: "Prenota dove vuoi",
    why_4_desc: "Ti portiamo dai partner ufficiali. Nessuna commissione.",

    // How it works
    how_label: "Come funziona",
    how_title: "Dal sogno al biglietto in 3 step.",
    how_1_title: "Inserisci la ricerca",
    how_1_desc: "Dimmi da dove parti, dove vuoi andare, e quanto tempo hai.",
    how_2_title: "Wondr costruisce il percorso",
    how_2_desc: "Combiniamo voli, treni, bus e traghetti per trovare il minimo.",
    how_3_title: "Scegli e prenota",
    how_3_desc: "Ti portiamo dai partner ufficiali. Prenoti dove preferisci.",

    // Partners
    partners_label: "Partner",
    partners_title: "800+ compagnie. Un'unica ricerca.",
    partners_coverage: "Copertura globale",

    // Case study
    case_label: "Caso reale",
    case_title: "Roma → Dubai a €146.",
    case_subtitle: "Non è uno scherzo.",
    case_desc: "Un volo diretto costa €420. Wondr lo costruisce con 4 tappe in 28 ore.",
    case_saving: "Risparmi €274.",
    case_cta: "Vedi il percorso completo",
    case_legs: "4 tappe · 28h",
    case_total: "Totale",

    // CTA section
    cta_title: "Dove vuoi andare oggi?",
    cta_sub: "800+ compagnie partner. Zero costi nascosti. Solo risparmio.",
    cta_btn: "Cerca il tuo viaggio",

    // Footer
    footer_tagline: "Il modo più intelligente di viaggiare. Combiniamo voli, treni, bus e traghetti per trovarti il percorso più economico al mondo.",
    footer_product: "Prodotto",
    footer_company: "Azienda",
    footer_about: "Chi siamo",
    footer_partners: "Partner",
    footer_privacy: "Privacy",
    footer_copy: "© 2026 Wondr. Tutti i diritti riservati.",
    footer_disclaimer: "Wondr è un aggregatore. I biglietti sono venduti dai partner.",

    // Results page
    results_back: "← Torna alla home",
    results_modify: "Modifica ricerca",
    results_traveler: "viaggiatore",
    results_travelers: "viaggiatori",
    results_found: "percorsi trovati",
    results_from: "a partire da",
    results_sort_label: "Ordina per",
    results_sort_price: "Prezzo",
    results_sort_duration: "Durata",
    results_filter_label: "Mezzo incluso",
    results_filter_all: "Tutti",
    results_filter_flight: "Volo",
    results_filter_train: "Treno",
    results_filter_bus: "Bus",
    results_filter_ferry: "Traghetto",
    results_disclaimer: "I prezzi mostrati sono indicativi e possono variare al momento dell'acquisto. Wondr è un aggregatore e non vende biglietti.",
    results_saving: "Risparmi",
    results_vs: "vs volo diretto",
    results_total: "totale",
    results_tickets: "biglietti",
    results_book: "Prenota",
    results_hours: "h totali",
    results_legs: "tappe",
    results_show: "Mostra dettaglio tappe",
    results_hide: "Nascondi dettaglio tappe",
    results_leg_total: "I prezzi sono indicativi e possono variare al momento dell'acquisto sui siti dei partner. Wondr è un aggregatore e non vende biglietti.",

    // How it works page
    hiw_badge: "Come funziona",
    hiw_h1_line1: "Un solo posto.",
    hiw_h1_line2: "Ogni mezzo possibile.",
    hiw_sub: "Wondr è un aggregatore di trasporto multimodale. Combiniamo voli, treni, bus e traghetti per trovare il percorso più economico tra due punti — anche se questo significa attraversare mezzo Mediterraneo in 28 ore.",
    hiw_process_label: "Il processo",
    hiw_process_title: "Dal sogno al biglietto in 3 step.",
    hiw_model_label: "Il modello",
    hiw_model_title: "Aggregatore, non venditore.",
    hiw_model_desc: "Wondr non vende biglietti. Siamo un motore di ricerca multimodale: troviamo il percorso ottimale e ti portiamo direttamente sui siti dei partner per prenotare. Nessuna commissione nascosta, nessun markup.",
    hiw_model_1: "Zero commissioni",
    hiw_model_1_desc: "Paghi esattamente il prezzo del partner, niente di più.",
    hiw_model_2: "800+ partner",
    hiw_model_2_desc: "Voli, treni, bus e traghetti da tutto il mondo.",
    hiw_model_3: "Prezzi in tempo reale",
    hiw_model_3_desc: "I prezzi vengono aggiornati ogni volta che cerchi.",
    hiw_faq_label: "FAQ",
    hiw_faq_title: "Domande frequenti.",
    hiw_faq_1_q: "Wondr vende biglietti?",
    hiw_faq_1_a: "No. Wondr è un aggregatore: troviamo il percorso più economico e ti reindirizziamo ai siti ufficiali dei partner (Ryanair, FlixBus, Trenitalia, ecc.) per completare l'acquisto.",
    hiw_faq_2_q: "I prezzi sono garantiti?",
    hiw_faq_2_a: "I prezzi mostrati sono indicativi e possono variare al momento dell'acquisto. I prezzi dei trasporti cambiano in tempo reale.",
    hiw_faq_3_q: "Quante compagnie coprite?",
    hiw_faq_3_a: "Oltre 800 compagnie tra voli low-cost, treni regionali e internazionali, bus e traghetti in Europa e nel mondo.",
    hiw_faq_4_q: "Posso usare Wondr per qualsiasi destinazione?",
    hiw_faq_4_a: "Sì. Wondr funziona per qualsiasi coppia di città nel mondo, purché esista almeno un percorso multimodale raggiungibile.",
    hiw_cta_title: "Pronto a risparmiare?",
    hiw_cta_sub: "Inserisci la tua ricerca e scopri quanto puoi risparmiare sul tuo prossimo viaggio.",
    hiw_cta_btn: "Inizia la ricerca",
    hiw_sticky_cta: "Inizia la ricerca",
  },
  en: {
    // Navbar
    nav_how: "How it works",
    nav_destinations: "Destinations",
    nav_tips: "Trip Tips",
    nav_cta: "Start free",

    // Hero
    hero_badge: "800+ partners · zero hidden fees",
    hero_h1_line1: "No trip is",
    hero_h1_line2: "too expensive.",
    hero_sub: "Wondr finds the cheapest route in the world by combining flights, trains, buses and ferries. Even if you want to travel 30 hours.",

    // Form
    form_departure: "Departure",
    form_destination: "Destination",
    form_date: "Date",
    form_travelers: "Travelers",
    form_hours_label: "Maximum travel hours",
    form_hours_12: "Up to 12h",
    form_hours_24: "Up to 24h",
    form_hours_48: "48h+",
    form_budget_label: "Maximum budget per traveler",
    form_means_label: "Included transport",
    form_means_flights: "Flights",
    form_means_trains: "Trains",
    form_means_bus: "Bus",
    form_means_ferries: "Ferries",
    form_cta: "Search your trip",
    form_searching: "Searching...",
    form_popular: "Popular:",

    // Why section
    why_label: "Why Wondr",
    why_title: "The smartest way to go anywhere.",
    why_1_title: "Multimodal routes",
    why_1_desc: "Flights, trains, buses and ferries combined in a single journey.",
    why_2_title: "You choose the time",
    why_2_desc: "From 12h to 48h+. Choose how long you want to travel.",
    why_3_title: "Budget under control",
    why_3_desc: "Filter by price range. Only options you can afford.",
    why_4_title: "Book where you want",
    why_4_desc: "We take you to official partner sites. No commission.",

    // How it works
    how_label: "How it works",
    how_title: "From dream to ticket in 3 steps.",
    how_1_title: "Enter your search",
    how_1_desc: "Tell us where you're leaving from, where you want to go, and how much time you have.",
    how_2_title: "Wondr builds the route",
    how_2_desc: "We combine flights, trains, buses and ferries to find the minimum.",
    how_3_title: "Choose and book",
    how_3_desc: "We take you to official partner sites. Book where you prefer.",

    // Partners
    partners_label: "Partners",
    partners_title: "800+ companies. One search.",
    partners_coverage: "Global coverage",

    // Case study
    case_label: "Real case",
    case_title: "Rome → Dubai for €146.",
    case_subtitle: "Not a joke.",
    case_desc: "A direct flight costs €420. Wondr builds it with 4 legs in 28 hours.",
    case_saving: "You save €274.",
    case_cta: "See the full route",
    case_legs: "4 legs · 28h",
    case_total: "Total",

    // CTA section
    cta_title: "Where do you want to go today?",
    cta_sub: "800+ partner companies. Zero hidden fees. Only savings.",
    cta_btn: "Search your trip",

    // Footer
    footer_tagline: "The smartest way to travel. We combine flights, trains, buses and ferries to find you the cheapest route in the world.",
    footer_product: "Product",
    footer_company: "Company",
    footer_about: "About us",
    footer_partners: "Partners",
    footer_privacy: "Privacy",
    footer_copy: "© 2026 Wondr. All rights reserved.",
    footer_disclaimer: "Wondr is an aggregator. Tickets are sold by partners.",

    // Results page
    results_back: "← Back to home",
    results_modify: "Modify search",
    results_traveler: "traveler",
    results_travelers: "travelers",
    results_found: "routes found",
    results_from: "from",
    results_sort_label: "Sort by",
    results_sort_price: "Price",
    results_sort_duration: "Duration",
    results_filter_label: "Transport",
    results_filter_all: "All",
    results_filter_flight: "Flight",
    results_filter_train: "Train",
    results_filter_bus: "Bus",
    results_filter_ferry: "Ferry",
    results_disclaimer: "Prices shown are indicative and may vary at the time of purchase. Wondr is an aggregator and does not sell tickets.",
    results_saving: "Save",
    results_vs: "vs direct flight",
    results_total: "total",
    results_tickets: "tickets",
    results_book: "Book",
    results_hours: "h total",
    results_legs: "legs",
    results_show: "Show leg details",
    results_hide: "Hide leg details",
    results_leg_total: "Prices are indicative and may vary at the time of purchase on partner sites. Wondr is an aggregator and does not sell tickets.",

    // How it works page
    hiw_badge: "How it works",
    hiw_h1_line1: "One place.",
    hiw_h1_line2: "Every transport possible.",
    hiw_sub: "Wondr is a multimodal transport aggregator. We combine flights, trains, buses and ferries to find the cheapest route between two points — even if that means crossing half the Mediterranean in 28 hours.",
    hiw_process_label: "The process",
    hiw_process_title: "From dream to ticket in 3 steps.",
    hiw_model_label: "The model",
    hiw_model_title: "Aggregator, not seller.",
    hiw_model_desc: "Wondr doesn't sell tickets. We are a multimodal search engine: we find the optimal route and take you directly to partner sites to book. No hidden commissions, no markup.",
    hiw_model_1: "Zero commissions",
    hiw_model_1_desc: "You pay exactly the partner's price, nothing more.",
    hiw_model_2: "800+ partners",
    hiw_model_2_desc: "Flights, trains, buses and ferries from around the world.",
    hiw_model_3: "Real-time prices",
    hiw_model_3_desc: "Prices are updated every time you search.",
    hiw_faq_label: "FAQ",
    hiw_faq_title: "Frequently asked questions.",
    hiw_faq_1_q: "Does Wondr sell tickets?",
    hiw_faq_1_a: "No. Wondr is an aggregator: we find the cheapest route and redirect you to official partner sites (Ryanair, FlixBus, Trenitalia, etc.) to complete the purchase.",
    hiw_faq_2_q: "Are prices guaranteed?",
    hiw_faq_2_a: "Prices shown are indicative and may vary at the time of purchase. Transport prices change in real time.",
    hiw_faq_3_q: "How many companies do you cover?",
    hiw_faq_3_a: "Over 800 companies including low-cost flights, regional and international trains, buses and ferries across Europe and worldwide.",
    hiw_faq_4_q: "Can I use Wondr for any destination?",
    hiw_faq_4_a: "Yes. Wondr works for any pair of cities in the world, as long as at least one multimodal route exists.",
    hiw_cta_title: "Ready to save?",
    hiw_cta_sub: "Enter your search and discover how much you can save on your next trip.",
    hiw_cta_btn: "Start searching",
    hiw_sticky_cta: "Start searching",
  },
} as const;

export type TranslationKey = keyof typeof translations.it;

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("it");
  const t = (key: TranslationKey): string => translations[lang][key] as string;
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
