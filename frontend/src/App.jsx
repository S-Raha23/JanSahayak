import { useState } from "react";
import ChatPanel from "./components/ChatPanel.jsx";
import SchemeMatcher from "./components/SchemeMatcher.jsx";
import WhatsAppPanel from "./components/WhatsAppPanel.jsx";
import AnalyticsPanel from "./components/AnalyticsPanel.jsx";
import DishaAgent from "./components/DishaAgent.jsx";

const TABS = [
  { id: "chat",      icon: "💬", en: "AI Chat",      hi: "AI चैट" },
  { id: "disha",     icon: "🤖", en: "Disha Agent",  hi: "दिशा Agent" },
  { id: "matcher",   icon: "🔍", en: "Scheme Finder", hi: "योजना खोजें" },
  { id: "wa",        icon: "📱", en: "WhatsApp",       hi: "WhatsApp" },
  { id: "analytics", icon: "📊", en: "Analytics",      hi: "विश्लेषण" },
];

export default function App() {
  const [tab, setTab]   = useState("chat");
  const [lang, setLang] = useState("hi");

  return (
    <div className="app">
      <header className="header">
        <div className="header-logo">🇮🇳</div>
        <div className="header-brand">
          <div className="header-title">JanSahayak</div>
          <div className="header-sub">जन सहायक — AI Welfare Navigator</div>
        </div>
        <div className="header-right">
          <button className="lang-toggle" onClick={() => setLang(l => l === "hi" ? "en" : "hi")}>
            {lang === "hi" ? "हिं → EN" : "EN → हिं"}
          </button>
          <span className="hackathon-badge">Hackathon MVP</span>
        </div>
      </header>

      <nav className="tab-nav">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn${tab === t.id ? " active" : ""}${t.id === "disha" ? " disha-tab" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <span className="tab-icon">{t.icon}</span>
            <span>{lang === "hi" ? t.hi : t.en}</span>
          </button>
        ))}
      </nav>

      <div className="tab-content">
        {tab === "chat"      && <ChatPanel      lang={lang} />}
        {tab === "disha"     && <DishaAgent     lang={lang} />}
        {tab === "matcher"   && <SchemeMatcher  lang={lang} />}
        {tab === "wa"        && <WhatsAppPanel  lang={lang} />}
        {tab === "analytics" && <AnalyticsPanel lang={lang} />}
      </div>
    </div>
  );
}
