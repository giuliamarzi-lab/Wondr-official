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
import wondrLogo from "./assets/wondr-logo.svg";

const WondrLogo = () => (
  <img
    src={wondrLogo}
    alt="Wondr"
    style={{
      width: "160px",
      height: "auto",
      display: "block",
    }}
  />
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
