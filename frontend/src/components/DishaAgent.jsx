import { useState, useRef, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "";

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chandigarh","Chhattisgarh",
  "Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu and Kashmir","Jharkhand",
  "Karnataka","Kerala","Ladakh","Madhya Pradesh","Maharashtra","Manipur","Meghalaya",
  "Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Dadra & Nagar Haveli and Daman & Diu","Lakshadweep","Puducherry",
];

const OCCUPATIONS = [
  { val:"farmer",     label:"🌾 Farmer / Kisan" },
  { val:"student",    label:"📚 Student" },
  { val:"worker",     label:"🔨 Labour / Worker" },
  { val:"business",   label:"🏪 Business / MSME" },
  { val:"unemployed", label:"🔍 Unemployed / Job-seeker" },
  { val:"women",      label:"👩 Women / Homemaker" },
  { val:"senior",     label:"👴 Senior Citizen" },
  { val:"disabled",   label:"♿ Differently Abled" },
  { val:"artisan",    label:"🎨 Artisan / Craftsman" },
];

const CATEGORIES = ["General","SC","ST","OBC","Minority","EWS","PwD"];
const EDUCATION   = ["Below 10th","10th Pass","12th Pass","Diploma","Graduate","Post-Graduate"];
const INCOME_OPTS = ["Below ₹1 Lakh","₹1L–₹2.5L","₹2.5L–₹5L","₹5L–₹10L","Above ₹10L"];

const URGENCY_CONFIG = {
  high:   { label:"High Priority", color:"#ef4444", bg:"#fef2f2", dot:"#dc2626" },
  medium: { label:"Recommended",   color:"#f59e0b", bg:"#fffbeb", dot:"#d97706" },
  low:    { label:"Explore",        color:"#3b82f6", bg:"#eff6ff", dot:"#2563eb" },
};

const CAT_COLORS = {
  "Agriculture,Rural & Environment":         "#16a34a",
  "Education & Learning":                     "#2563eb",
  "Health & Wellness":                        "#dc2626",
  "Banking,Financial Services and Insurance": "#0891b2",
  "Business & Entrepreneurship":              "#7c3aed",
  "Housing & Shelter":                        "#9333ea",
  "Skills & Employment":                      "#ea580c",
  "Women and Child":                          "#db2777",
  "Social welfare & Empowerment":             "#0369a1",
  "Science, IT & Communications":             "#0d9488",
};

// Markdown renderer
function toHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")
    .replace(/\*(.*?)\*/g,"<em>$1</em>")
    .replace(/_(.*?)_/g,"<em>$1</em>")
    .replace(/\n/g,"<br/>");
}

function MsgBubble({ content, streaming }) {
  return (
    <div
      className="disha-bubble"
      dangerouslySetInnerHTML={{ __html: toHtml(content) + (streaming ? '<span class="disha-cursor">▋</span>' : "") }}
    />
  );
}

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2,6)}`; }

// ── Disha Avatar with pulse ────────────────────────────────────────────────
function DishaAvatar({ state = "idle", size = 48 }) {
  return (
    <div className={`disha-avatar-wrap disha-av-${state}`} style={{ width:size, height:size }}>
      <div className="disha-avatar" style={{ width:size, height:size }}>
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
          {/* Face */}
          <circle cx="24" cy="24" r="22" fill="url(#dishaGrad)" />
          <circle cx="24" cy="20" r="9" fill="#fff" opacity="0.95"/>
          <circle cx="24" cy="42" r="14" fill="#fff" opacity="0.9"/>
          {/* Eyes */}
          <circle cx="20.5" cy="19" r="1.8" fill="#1A237E"/>
          <circle cx="27.5" cy="19" r="1.8" fill="#1A237E"/>
          <circle cx="21.2" cy="18.4" r="0.6" fill="white"/>
          <circle cx="28.2" cy="18.4" r="0.6" fill="white"/>
          {/* Smile */}
          <path d="M20 22.5 Q24 26 28 22.5" stroke="#1A237E" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
          {/* Bindi */}
          <circle cx="24" cy="13.5" r="1.2" fill="#FF9933"/>
          {/* Hair */}
          <path d="M13 20 Q14 8 24 7 Q34 8 35 20" fill="#2D1B69" opacity="0.9"/>
          <defs>
            <radialGradient id="dishaGrad" cx="40%" cy="35%">
              <stop offset="0%" stopColor="#7C4DFF"/>
              <stop offset="100%" stopColor="#1A237E"/>
            </radialGradient>
          </defs>
        </svg>
      </div>
      {state === "thinking" && <div className="disha-pulse-ring" />}
      {state === "speaking" && <div className="disha-pulse-ring disha-pulse-ring-2" />}
    </div>
  );
}

// ── Agent Step Log ─────────────────────────────────────────────────────────
function AgentLog({ steps, isRunning }) {
  return (
    <div className="agent-log">
      <div className="agent-log-title">
        <span>🔄</span>
        <span>Agent Activity</span>
        {isRunning && <span className="agent-running-dot" />}
      </div>
      {steps.map((s, i) => (
        <div key={i} className={`agent-step ${s.done ? "done" : "active"}`}>
          <span className="agent-step-icon">{s.done ? "✓" : s.icon}</span>
          <span className="agent-step-msg">{s.message}</span>
          {!s.done && isRunning && <span className="agent-step-spinner" />}
        </div>
      ))}
    </div>
  );
}

// ── Scheme Result Card ─────────────────────────────────────────────────────
function SchemeCard({ scheme, index, onAsk }) {
  const [expanded, setExpanded] = useState(false);
  const urg = URGENCY_CONFIG[scheme.urgency] || URGENCY_CONFIG.medium;
  const cat = scheme.categories?.[0];
  const catColor = CAT_COLORS[cat] || "#475569";

  return (
    <div className={`scheme-result-card ${expanded ? "expanded" : ""}`} style={{ animationDelay: `${index * 0.1}s` }}>
      {/* Rank badge */}
      <div className="src-rank">#{index + 1}</div>

      {/* Header */}
      <div className="src-header" onClick={() => setExpanded(!expanded)}>
        <div className="src-title-row">
          <div>
            <div className="src-name">{scheme.name}</div>
            <div className="src-ministry">{scheme.ministry}</div>
          </div>
          <div className="src-badges">
            <span className={`src-level ${scheme.level?.toLowerCase()}`}>{scheme.level}</span>
            <span className="src-urgency" style={{ background: urg.bg, color: urg.color }}>
              <span className="src-urg-dot" style={{ background: urg.dot }} />
              {urg.label}
            </span>
          </div>
        </div>

        {/* Why relevant */}
        <div className="src-why">
          <span className="src-why-icon">💡</span>
          <em>{scheme.whyRelevant}</em>
        </div>

        {/* Key benefit */}
        <div className="src-benefit" style={{ borderLeftColor: catColor }}>
          <strong>✅ {scheme.keyBenefit}</strong>
        </div>

        {/* Tags */}
        <div className="src-tags">
          {cat && <span className="src-cat-tag" style={{ background: catColor }}>{cat}</span>}
          {scheme.tags?.slice(0, 4).map(t => (
            <span key={t} className="src-tag">{t}</span>
          ))}
          <span className="src-expand-hint">{expanded ? "▲ less" : "▼ details"}</span>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="src-details">
          <p className="src-desc">{scheme.description}</p>
          <div className="src-actions">
            <a
              href={scheme.applyUrl}
              target="_blank"
              rel="noreferrer"
              className="src-apply-btn"
            >
              🌐 Apply on myscheme.gov.in
            </a>
            <button
              className="src-ask-btn"
              onClick={() => onAsk(`Tell me more about ${scheme.name} — documents required and how to apply?`)}
            >
              💬 Ask Disha
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════
export default function DishaAgent({ lang }) {
  const [phase, setPhase]         = useState("form");   // form | searching | results | chat
  const [profile, setProfile]     = useState({
    state:"", occupation:"", age:"", gender:"", category:"",
    income:"", education:"", maritalStatus:"",
  });
  const [steps, setSteps]         = useState([]);
  const [schemes, setSchemes]     = useState([]);
  const [searchMeta, setSearchMeta] = useState({ total:0, filtered:0 });
  const [isRunning, setIsRunning] = useState(false);
  const [avatarState, setAvatarState] = useState("idle");

  // Chat state
  const [chatMsgs, setChatMsgs]   = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatStream, setChatStream] = useState("");

  const bottomRef = useRef(null);
  const chatInputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [chatMsgs, chatStream, steps]);

  function setF(k, v) { setProfile(p => ({ ...p, [k]: v })); }

  // ── Start search ──────────────────────────────────────────────
  async function startSearch() {
    if (!profile.state && !profile.occupation) return;

    setPhase("searching");
    setSteps([]);
    setIsRunning(true);
    setAvatarState("thinking");
    setChatMsgs([]);

    try {
      const res = await fetch(`${API}/api/disha/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        for (const line of decoder.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));

            if (event.type === "step") {
              setSteps(prev => {
                const next = [...prev];
                // Mark previous as done
                if (next.length > 0) next[next.length - 1] = { ...next[next.length - 1], done: true };
                next.push({ icon: event.icon, message: event.message, done: false });
                return next;
              });
            }

            if (event.type === "done") {
              setSteps(prev => prev.map(s => ({ ...s, done: true })));
              setSchemes(event.schemes || []);
              setSearchMeta({ total: event.total, filtered: event.filtered });
              setIsRunning(false);
              setAvatarState("idle");

              // Init chat with Disha greeting
              const greeting = event.schemes?.length > 0
                ? `I found **${event.schemes.length} schemes** perfectly matched for you out of ${event.filtered} eligible schemes across ${event.total.toLocaleString()} on myscheme.gov.in! 🎉\n\nI've ranked them by relevance and impact for your specific profile. Click any scheme for details, or ask me anything about them!`
                : `I searched all ${event.total?.toLocaleString()} schemes on myscheme.gov.in but couldn't find strong matches for your exact profile. Try broadening your filters — change state to "All" or try a different occupation.`;

              setChatMsgs([{ role:"assistant", content: greeting, id: uid() }]);
              setTimeout(() => setPhase("results"), 300);
            }

            if (event.type === "error") {
              setIsRunning(false);
              setAvatarState("idle");
              setChatMsgs([{ role:"assistant", content:`⚠️ ${event.message}`, id: uid() }]);
              setPhase("results");
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (err) {
      setIsRunning(false);
      setAvatarState("idle");
      alert("Search failed: " + err.message);
      setPhase("form");
    }
  }

  // ── Chat with Disha ───────────────────────────────────────────
  async function sendChat(text) {
    const msg = (text ?? chatInput).trim();
    if (!msg || chatLoading) return;
    setChatInput("");

    const userMsg = { role:"user", content: msg, id: uid() };
    const newMsgs = [...chatMsgs, userMsg];
    setChatMsgs(newMsgs);
    setChatLoading(true);
    setChatStream("");
    setAvatarState("thinking");

    try {
      const res = await fetch(`${API}/api/disha/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
          schemes,
          profile,
        }),
      });

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      let finished = false;

      while (!finished) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") { finished = true; break; }
          try {
            const p = JSON.parse(data);
            if (p.error) throw new Error(p.error);
            if (p.text) { full += p.text; setChatStream(full); }
          } catch(e) {
            if (e.message !== "Unexpected end of JSON input") throw e;
          }
        }
      }

      setChatStream("");
      setChatMsgs(prev => [...prev, { role:"assistant", content: full || "Sorry, I couldn't get a response. Please try again.", id: uid() }]);
      setAvatarState("idle");
    } catch(err) {
      setChatMsgs(prev => [...prev, { role:"assistant", content:`⚠️ ${err.message}`, id: uid() }]);
      setAvatarState("idle");
    } finally {
      setChatLoading(false);
      chatInputRef.current?.focus();
    }
  }

  const hi = lang === "hi";

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="disha-panel">

      {/* ── LEFT COLUMN ─────────────────────────────────── */}
      <div className="disha-left">

        {/* Disha identity card */}
        <div className="disha-identity">
          <div className="disha-id-glow" />
          <DishaAvatar state={avatarState} size={64} />
          <div className="disha-id-info">
            <div className="disha-name">Disha</div>
            <div className="disha-role">AI Welfare Navigator</div>
            <div className="disha-source">
              <span className="disha-dot-green" />
              myscheme.gov.in · {(4651).toLocaleString()} schemes
            </div>
          </div>
          <div className={`disha-status-badge ${avatarState}`}>
            {avatarState === "thinking" ? "Searching..." : avatarState === "speaking" ? "Responding..." : "Ready"}
          </div>
        </div>

        {/* Profile form — always visible */}
        <div className="disha-form-card">
          <div className="disha-form-title">
            <span>👤</span>
            <span>{hi ? "आपकी प्रोफाइल" : "Your Profile"}</span>
            {phase !== "form" && (
              <button className="disha-reset-btn" onClick={() => { setPhase("form"); setSchemes([]); setChatMsgs([]); }}>
                ✏️ Edit
              </button>
            )}
          </div>

          <div className="disha-form-grid">
            <div className="disha-fg">
              <label>State *</label>
              <select value={profile.state} onChange={e => setF("state", e.target.value)} disabled={phase === "searching"}>
                <option value="">— Select State —</option>
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="disha-fg">
              <label>Occupation *</label>
              <select value={profile.occupation} onChange={e => setF("occupation", e.target.value)} disabled={phase === "searching"}>
                <option value="">— Select —</option>
                {OCCUPATIONS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
              </select>
            </div>

            <div className="disha-form-row">
              <div className="disha-fg">
                <label>Age</label>
                <input type="number" min="1" max="100" placeholder="e.g. 35"
                  value={profile.age} onChange={e => setF("age", e.target.value)} disabled={phase === "searching"} />
              </div>
              <div className="disha-fg">
                <label>Gender</label>
                <select value={profile.gender} onChange={e => setF("gender", e.target.value)} disabled={phase === "searching"}>
                  <option value="">— —</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
            </div>

            <div className="disha-fg">
              <label>Category</label>
              <select value={profile.category} onChange={e => setF("category", e.target.value)} disabled={phase === "searching"}>
                <option value="">— Select —</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="disha-fg">
              <label>Annual Income</label>
              <select value={profile.income} onChange={e => setF("income", e.target.value)} disabled={phase === "searching"}>
                <option value="">— Select —</option>
                {INCOME_OPTS.map(i => <option key={i}>{i}</option>)}
              </select>
            </div>

            <div className="disha-fg">
              <label>Education</label>
              <select value={profile.education} onChange={e => setF("education", e.target.value)} disabled={phase === "searching"}>
                <option value="">— Select —</option>
                {EDUCATION.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>

          <button
            className="disha-search-btn"
            onClick={startSearch}
            disabled={phase === "searching" || (!profile.state && !profile.occupation)}
          >
            {phase === "searching" ? (
              <><span className="disha-btn-spinner" /> Disha is searching...</>
            ) : (
              <><span>🔍</span> Find My Schemes</>
            )}
          </button>

          {phase !== "form" && (
            <div className="disha-meta-bar">
              <span>🗄️ {searchMeta.total?.toLocaleString()} total schemes</span>
              <span>🎯 {searchMeta.filtered} matched</span>
              <span>⭐ 5 selected</span>
            </div>
          )}
        </div>

        {/* Agent log */}
        {steps.length > 0 && (
          <AgentLog steps={steps} isRunning={isRunning} />
        )}
      </div>

      {/* ── RIGHT COLUMN ────────────────────────────────── */}
      <div className="disha-right">

        {/* Phase: form — intro screen */}
        {phase === "form" && (
          <div className="disha-intro">
            <div className="disha-intro-glow" />
            <DishaAvatar state="idle" size={96} />
            <h2 className="disha-intro-title">
              {hi ? "नमस्ते! मैं दिशा हूँ" : "Namaste! I'm Disha"}
            </h2>
            <p className="disha-intro-sub">
              {hi
                ? "मैं myscheme.gov.in के 4,651 योजनाओं में से आपके लिए सबसे अच्छी 5 योजनाएं खोजूंगी।"
                : "I'll search all 4,651 schemes on myscheme.gov.in and find the 5 best ones for you personally."}
            </p>
            <div className="disha-intro-steps">
              {[
                { icon:"📋", text: hi ? "प्रोफाइल भरें" : "Fill your profile" },
                { icon:"🤖", text: hi ? "AI खोज करेगी" : "Disha searches live" },
                { icon:"⭐", text: hi ? "5 सर्वश्रेष्ठ योजनाएं" : "Get top 5 schemes" },
                { icon:"💬", text: hi ? "सवाल पूछें" : "Ask Disha anything" },
              ].map((s,i) => (
                <div key={i} className="disha-intro-step">
                  <span className="dis-step-icon">{s.icon}</span>
                  <span>{s.text}</span>
                </div>
              ))}
            </div>
            <div className="disha-intro-source">
              Powered by myscheme.gov.in · Gemini 2.5 Flash · Real-time AI matching
            </div>
          </div>
        )}

        {/* Phase: searching — live animation */}
        {phase === "searching" && (
          <div className="disha-searching">
            <div className="disha-search-orb">
              <div className="disha-orb-ring r1" />
              <div className="disha-orb-ring r2" />
              <div className="disha-orb-ring r3" />
              <DishaAvatar state="thinking" size={72} />
            </div>
            <div className="disha-searching-title">Disha is working...</div>
            <div className="disha-searching-sub">
              Browsing {(4651).toLocaleString()} schemes on myscheme.gov.in
            </div>
            <div className="disha-typing-dots">
              <span /><span /><span />
            </div>
          </div>
        )}

        {/* Phase: results + chat */}
        {(phase === "results" || phase === "chat") && (
          <div className="disha-results-layout">

            {/* Scheme cards */}
            {schemes.length > 0 && (
              <div className="disha-schemes-section">
                <div className="disha-section-title">
                  <span>⭐</span>
                  <span>Top {schemes.length} Schemes for You</span>
                  <span className="disha-section-sub">from {searchMeta.filtered} eligible · {searchMeta.total?.toLocaleString()} total</span>
                </div>
                <div className="disha-scheme-cards">
                  {schemes.map((s, i) => (
                    <SchemeCard
                      key={s.id || i}
                      scheme={s}
                      index={i}
                      onAsk={text => {
                        sendChat(text);
                        setPhase("results");
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Chat section */}
            <div className="disha-chat-section">
              <div className="disha-section-title">
                <DishaAvatar state={avatarState} size={28} />
                <span>Chat with Disha</span>
                {chatLoading && <span className="disha-thinking-label">thinking...</span>}
              </div>

              <div className="disha-chat-messages">
                {chatMsgs.map(m => (
                  <div key={m.id} className={`disha-msg ${m.role}`}>
                    {m.role === "assistant" && <DishaAvatar state="idle" size={28} />}
                    <MsgBubble content={m.content} streaming={false} />
                    {m.role === "user" && <div className="disha-user-av">You</div>}
                  </div>
                ))}
                {chatStream && (
                  <div className="disha-msg assistant">
                    <DishaAvatar state="speaking" size={28} />
                    <MsgBubble content={chatStream} streaming={true} />
                  </div>
                )}
                {chatLoading && !chatStream && (
                  <div className="disha-msg assistant">
                    <DishaAvatar state="thinking" size={28} />
                    <div className="disha-bubble">
                      <div className="disha-typing"><span /><span /><span /></div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick questions */}
              <div className="disha-quick-qs">
                {[
                  "What documents do I need?",
                  "How do I apply online?",
                  "Which scheme gives most money?",
                  "Are there any deadlines?",
                ].map(q => (
                  <button key={q} className="disha-q-chip" onClick={() => sendChat(q)} disabled={chatLoading}>
                    {q}
                  </button>
                ))}
              </div>

              <div className="disha-chat-input-row">
                <input
                  ref={chatInputRef}
                  className="disha-chat-input"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChat()}
                  disabled={chatLoading}
                  placeholder={hi ? "दिशा से कुछ पूछें..." : "Ask Disha about your schemes..."}
                />
                <button
                  className="disha-send-btn"
                  onClick={() => sendChat()}
                  disabled={chatLoading || !chatInput.trim()}
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}