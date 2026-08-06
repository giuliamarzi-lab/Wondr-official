import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import Results from "./pages/Results";
import HowItWorks from "./pages/HowItWorks";
import { useState, useEffect } from "react";

const WondrLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 166.93 130.43" style={{ width: "160px", height: "auto" }}>
    <defs>
      <style>{`.cls-1{fill:#fff}.cls-2{fill:#d83f8d}.cls-3{fill:url(#Sfumatura_senza_nome_3)}.cls-4{fill:url(#Sfumatura_senza_nome_23-3)}.cls-5{fill:url(#Sfumatura_senza_nome_23-2)}.cls-6{fill:url(#Sfumatura_senza_nome_23)}`}</style>
      <linearGradient id="Sfumatura_senza_nome_23" x1="140.68" y1="29.47" x2="107.26" y2="29.47" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ef3f8d"/>
        <stop offset="1" stopColor="#fe54d2"/>
      </linearGradient>
      <linearGradient id="Sfumatura_senza_nome_23-2" x1="111.49" y1="55.28" x2="78.07" y2="55.28" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ef3f8d"/>
        <stop offset="1" stopColor="#fe54d2"/>
      </linearGradient>
      <linearGradient id="Sfumatura_senza_nome_23-3" x1="82.29" y1="29.47" x2="48.87" y2="29.47" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ef3f8d"/>
        <stop offset="1" stopColor="#fe54d2"/>
      </linearGradient>
      <linearGradient id="Sfumatura_senza_nome_3" x1="0" y1="55.27" x2="53.07" y2="55.27" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#9b59b6"/>
        <stop offset="1" stopColor="#ef3f8d"/>
      </linearGradient>
    </defs>
    <g>
      <g>
        <polygon className="cls-6" points="107.26 0 124.05 58.94 140.68 0 107.26 0"/>
        <polygon className="cls-5" points="78.07 25.81 94.86 84.75 111.49 25.81 78.07 25.81"/>
        <polygon className="cls-4" points="48.87 0 65.66 58.94 82.29 0 48.87 0"/>
        <polygon className="cls-3" points="0 25.81 26.54 84.75 53.07 25.81 0 25.81"/>
        <polygon className="cls-1" points="19.35 0 36.14 58.94 52.93 0 19.35 0"/>
        <polygon className="cls-1" points="114.1 25.81 130.89 84.75 147.68 25.81 114.1 25.81"/>
      </g>
      <g>
        <path className="cls-2" d="m16.7,126.87c-.26.4-.59.68-.98.86-.39.17-.81.26-1.28.26-.4,0-.76-.07-1.08-.2-.32-.14-.6-.33-.84-.57-.23-.24-.41-.53-.54-.87-.12-.33-.19-.71-.19-1.11s.06-.75.19-1.08c.13-.33.31-.62.54-.86.23-.24.51-.44.82-.58.32-.14.67-.21,1.05-.21s.75.07,1.06.21.56.32.77.55c.21.23.36.49.47.78.11.29.16.59.16.89v.47h-4.38c0,.14.03.33.08.55.06.22.16.44.31.65s.35.39.6.54c.25.15.58.23.98.23.35,0,.68-.08,1-.25.32-.17.57-.39.74-.68l.5.42Zm-.52-2.07c0-.23-.05-.45-.14-.65-.09-.2-.22-.38-.38-.54-.16-.15-.35-.28-.58-.37-.22-.09-.46-.14-.71-.14-.37,0-.68.08-.92.23-.24.15-.44.32-.58.52-.14.2-.24.39-.3.57-.06.18-.09.31-.09.38h3.7Z"/>
        <path className="cls-2" d="m22.43,125.66c0,.26,0,.49,0,.69,0,.2,0,.39.02.56,0,.17.02.33.03.49s.03.3.05.45h-.63c-.05-.26-.07-.54-.07-.85h-.02c-.2.34-.44.59-.73.74-.29.16-.66.24-1.1.24-.23,0-.45-.03-.67-.08-.22-.06-.41-.15-.59-.27-.17-.12-.31-.28-.42-.48-.11-.2-.16-.43-.16-.71,0-.4.1-.71.3-.95.2-.23.45-.41.75-.52s.61-.19.95-.23c.33-.03.63-.05.89-.05h.79v-.32c0-.45-.14-.78-.42-.97-.28-.2-.63-.29-1.05-.29-.6,0-1.13.2-1.59.59l-.4-.46c.25-.24.56-.42.93-.55.37-.12.72-.19,1.06-.19.63,0,1.14.15,1.51.45.38.3.56.78.56,1.44v1.28Zm-1.35-.43c-.29,0-.56.02-.83.06-.27.04-.51.1-.72.19s-.39.21-.51.36c-.13.15-.19.34-.19.56,0,.16.04.3.11.42.07.12.16.23.28.3.11.08.24.14.38.18.14.04.28.06.42.06.36,0,.66-.05.89-.16.23-.11.42-.24.56-.41.14-.17.24-.36.29-.58.05-.21.08-.43.08-.65v-.35h-.74Z"/>
        <path className="cls-2" d="m143.69,125.25c0-.4.07-.77.2-1.1s.32-.62.56-.87c.24-.24.53-.43.87-.57.34-.14.71-.2,1.11-.2s.77.07,1.1.2c.33.14.62.33.87.57.24.24.43.53.57.87.14.33.2.7.2,1.1s-.07.77-.2,1.1c-.14.33-.33.62-.57.87-.24.24-.53.43-.87.57-.33.14-.7.2-1.1.2s-.77-.07-1.11-.2c-.34-.14-.63-.33-.87-.57-.24-.24-.43-.53-.56-.87s-.2-.7-.2-1.1Zm.68,0c0,.29.05.57.14.83.09.26.23.49.41.68.18.19.4.34.65.46.26.11.54.17.86.17s.6-.06.86-.17.47-.26.65-.46.32-.42.41-.68c.09-.26.14-.54.14-.83s-.05-.57-.14-.83c-.09-.26-.23-.49-.41-.68s-.4-.34-.65-.46c-.26-.11-.54-.17-.86-.17s-.6.06-.86.17c-.26.11-.47.26-.65.46-.18.19-.32.42-.41.68-.09.26-.14.54-.14.83Z"/>
      </g>
    </g>
  </svg>
);

function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [lang, setLang] = useState<"it" | "en">("it");

  useEffect(() => {
    const saved = sessionStorage.getItem("wondr_unlocked");
    if (saved === "true") setUnlocked(true);
  }, []);

  const t = {
    it: {
      sub: "No trip is too expensive.",
      desc: "Wondr è in fase di sviluppo.\nInserisci la password per accedere all'anteprima.",
      placeholder: "Password",
      btn: "Accedi all'anteprima →",
      error: "Password errata. Riprova.",
      copy: "© 2026 Wondr. Accesso riservato.",
    },
    en: {
      sub: "No trip is too expensive.",
      desc: "Wondr is under development.\nEnter the password to access the preview.",
      placeholder: "Password",
      btn: "Access preview →",
      error: "Wrong password. Please try again.",
      copy: "© 2026 Wondr. Restricted access.",
    },
  }[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === "wondrguest") {
      sessionStorage.setItem("wondr_unlocked", "true");
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setInput("");
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d0d1a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'AvertaStd', system-ui, sans-serif",
      padding: "24px",
    }}>
      <div style={{
        position: "fixed", inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(236,0,155,0.15) 1.5px, transparent 1.5px)",
        backgroundSize: "28px 28px", pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", inset: 0,
        background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(236,0,155,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Language toggle */}
      <div style={{ position: "fixed", top: "20px", right: "24px", zIndex: 10, display: "flex", gap: "4px" }}>
        {(["it", "en"] as const).map((l) => (
          <button key={l} onClick={() => setLang(l)} style={{
            padding: "6px 14px", borderRadius: "100px", fontSize: "12px", fontWeight: 600,
            cursor: "pointer", fontFamily: "'AvertaStd', system-ui, sans-serif",
            background: lang === l ? "#ec009b" : "rgba(255,255,255,0.08)",
            color: "#fff", border: lang === l ? "none" : "1px solid rgba(255,255,255,0.15)",
            transition: "all 0.2s",
          }}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: "400px", width: "100%" }}>
        <div style={{ marginBottom: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <WondrLogo />
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", fontStyle: "italic", margin: 0 }}>
            {t.sub}
          </p>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px", padding: "36px 32px",
        }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", marginBottom: "28px", lineHeight: 1.7, whiteSpace: "pre-line" }}>
            {t.desc}
          </p>
          <form onSubmit={handleSubmit}>
            <div style={{ animation: shake ? "shake 0.5s ease" : "none" }}>
              <input
                type="password" value={input}
                onChange={(e) => { setInput(e.target.value); setError(false); }}
                placeholder={t.placeholder} autoFocus
                style={{
                  width: "100%", padding: "14px 18px",
                  background: "rgba(255,255,255,0.06)",
                  border: error ? "1.5px solid #ef4444" : "1.5px solid rgba(255,255,255,0.12)",
                  borderRadius: "12px", color: "#ffffff", fontSize: "15px",
                  outline: "none", marginBottom: "12px", boxSizing: "border-box",
                  fontFamily: "'AvertaStd', system-ui, sans-serif", transition: "border-color 0.2s",
                }}
              />
              {error && (
                <p style={{ color: "#ef4444", fontSize: "12px", marginBottom: "12px", textAlign: "left" }}>
                  {t.error}
                </p>
              )}
            </div>
            <button type="submit" style={{
              width: "100%", padding: "14px",
              background: "#ec009b", border: "none", borderRadius: "12px",
              color: "#ffffff", fontSize: "15px", fontWeight: 600, cursor: "pointer",
              fontFamily: "'AvertaStd', system-ui, sans-serif", transition: "background 0.2s, transform 0.1s",
            }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#c4007f")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#ec009b")}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {t.btn}
            </button>
          </form>
        </div>

        <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px", marginTop: "24px" }}>
          {t.copy}
        </p>
      </div>

      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/results" component={Results} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <PasswordGate>
              <Router />
            </PasswordGate>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
