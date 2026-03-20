import { useState } from "react";
import { SCHEMES } from "../data/schemes.js";

const API = import.meta.env.VITE_API_URL || "";

const STATES_LIST = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir",
];

const OCCUPATIONS = [
  { val:"farmer",       en:"Farmer / किसान" },
  { val:"daily_worker", en:"Daily Wage Worker / मज़दूर" },
  { val:"student",      en:"Student / छात्र" },
  { val:"business",     en:"Small Business / व्यापारी" },
  { val:"unemployed",   en:"Unemployed / बेरोज़गार" },
  { val:"artisan",      en:"Artisan / Craftsman" },
  { val:"street_vendor",en:"Street Vendor / रेहड़ी वाले" },
];

const INCOMES = [
  { val:50000,   en:"Below ₹50,000" },
  { val:100000,  en:"₹50K – ₹1 Lakh" },
  { val:200000,  en:"₹1L – ₹2 Lakh" },
  { val:500000,  en:"₹2L – ₹5 Lakh" },
  { val:1000000, en:"₹5L – ₹10 Lakh" },
  { val:9999999, en:"Above ₹10 Lakh" },
];

const CATEGORIES = ["SC","ST","OBC","General","Minority","EWS"];

const CAT_COLORS = {
  Agriculture: "var(--cat-agri)",
  Health: "var(--cat-health)",
  Education: "var(--cat-edu)",
  Housing: "var(--cat-housing)",
  Employment: "var(--cat-employ)",
  Finance: "var(--cat-finance)",
  "Women & Child": "var(--cat-women)",
  "Skill Dev": "var(--cat-skill)",
  "Social Security": "var(--cat-social)",
  Artisan: "var(--cat-artisan)",
  "Food Security": "var(--cat-agri)",
};

export default function SchemeMatcher({ lang }) {
  const [form, setForm]     = useState({ state:"", occupation:"", income:"", gender:"", category:"", age:"" });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const hi = lang === "hi";

  function setF(k, v) { setForm(p => ({ ...p, [k]: v })); }

  async function runMatch() {
    setLoading(true);
    try {
      const payload = {
        state: form.state,
        occupation: form.occupation,
        income: form.income ? parseInt(form.income) : null,
        gender: form.gender,
        category: form.category,
        age: form.age ? parseInt(form.age) : null,
      };
      const res = await fetch(`${API}/api/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data.results);
      } else {
        // Fallback: client-side matching using frontend schemes
        setResults(clientMatch(payload));
      }
    } catch {
      setResults(clientMatch({
        state: form.state,
        occupation: form.occupation,
        income: form.income ? parseInt(form.income) : null,
        gender: form.gender,
        category: form.category,
      }));
    } finally {
      setLoading(false);
      setExpanded(null);
    }
  }

  function clientMatch({ state, occupation, income, gender, category }) {
    return SCHEMES.filter(s => {
      if (state && !s.states.includes("all")) {
        if (!s.states.some(st => st.toLowerCase() === state.toLowerCase())) return false;
      }
      if (occupation) {
        const oTags = {
          farmer: ["farmer","kisan","agriculture"],
          daily_worker: ["labour","rural","employment","wages","mazdoor"],
          student: ["student","scholarship","education"],
          business: ["business","loan","entrepreneur","vendor","mudra","msme"],
          unemployed: ["unemployed","skill","training","employment"],
          artisan: ["artisan","craftsman","carpenter","potter","tailor","weaver"],
          street_vendor: ["vendor","hawker","urban","loan"],
        }[occupation] || [];
        if (oTags.length > 0 && !oTags.some(ot => s.tags.some(st => st.toLowerCase().includes(ot)))) return false;
      }
      if (gender === "male" && s.tags.some(t => t === "women") && !s.tags.includes("farmer")) return false;
      if (category && ["SC","ST","OBC","Minority"].includes(category)) {
        if (s.tags.some(t => ["SC","ST","OBC","minority","BPL"].includes(t))) return true;
      }
      return true;
    });
  }

  const L = {
    title:    hi ? "पात्रता जाँचें" : "Check Eligibility",
    state:    hi ? "राज्य" : "State",
    occ:      hi ? "व्यवसाय" : "Occupation",
    income:   hi ? "वार्षिक आय" : "Annual Income",
    gender:   hi ? "लिंग" : "Gender",
    category: hi ? "श्रेणी" : "Category",
    age:      hi ? "आयु" : "Age",
    find:     hi ? "योजनाएं खोजें ➤" : "Find Schemes ➤",
    found:    hi ? "पात्र योजनाएं" : "Eligible Schemes",
    hint:     hi ? "अपनी जानकारी भरकर योजनाएं खोजें।" : "Fill your profile to discover matching schemes.",
    docs:     hi ? "ज़रूरी दस्तावेज़" : "Required Documents",
    online:   hi ? "ऑनलाइन आवेदन" : "Apply Online",
    offline:  hi ? "ऑफलाइन" : "Offline Centre",
    noMatch:  hi ? "कोई मिलान नहीं — कम फ़िल्टर के साथ पुनः प्रयास करें।" : "No matches — try with fewer filters.",
    select:   hi ? "चुनें" : "Select",
  };

  return (
    <div className="matcher-panel">
      {/* Form */}
      <div className="matcher-form">
        <h2 className="panel-title">🔍 {L.title}</h2>
        <div className="form-grid">
          <div className="fg">
            <label>{L.state}</label>
            <select value={form.state} onChange={e => setF("state", e.target.value)}>
              <option value="">— {L.select} —</option>
              {STATES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="fg">
            <label>{L.occ}</label>
            <select value={form.occupation} onChange={e => setF("occupation", e.target.value)}>
              <option value="">— {L.select} —</option>
              {OCCUPATIONS.map(o => <option key={o.val} value={o.val}>{o.en}</option>)}
            </select>
          </div>
          <div className="fg">
            <label>{L.income}</label>
            <select value={form.income} onChange={e => setF("income", e.target.value)}>
              <option value="">— {L.select} —</option>
              {INCOMES.map(i => <option key={i.val} value={i.val}>{i.en}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="fg">
              <label>{L.gender}</label>
              <select value={form.gender} onChange={e => setF("gender", e.target.value)}>
                <option value="">— {L.select} —</option>
                <option value="female">{hi ? "महिला" : "Female"}</option>
                <option value="male">{hi ? "पुरुष" : "Male"}</option>
              </select>
            </div>
            <div className="fg">
              <label>{L.age}</label>
              <input
                type="number"
                min="1" max="100"
                placeholder="e.g. 35"
                value={form.age}
                onChange={e => setF("age", e.target.value)}
              />
            </div>
          </div>
          <div className="fg">
            <label>{L.category}</label>
            <select value={form.category} onChange={e => setF("category", e.target.value)}>
              <option value="">— {L.select} —</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <button className="match-btn" onClick={runMatch} disabled={loading}>
          {loading ? (hi ? "खोज रहे हैं..." : "Searching...") : L.find}
        </button>

        <div className="scheme-count">
          {hi
            ? `📊 ${SCHEMES.length} योजनाओं में मिलान | स्रोत: myscheme.gov.in`
            : `📊 Matching across ${SCHEMES.length} schemes | Source: myscheme.gov.in`}
        </div>
      </div>

      {/* Results */}
      <div className="matcher-results">
        <div className="results-count-bar">
          <h2 className="panel-title" style={{ margin: 0 }}>
            {L.found}
            {results !== null && (
              <span className="pill" style={{ marginLeft: 8 }}>{results.length}</span>
            )}
          </h2>
        </div>

        {results === null ? (
          <p className="hint-text">🔍 {L.hint}</p>
        ) : results.length === 0 ? (
          <p className="hint-text">😕 {L.noMatch}</p>
        ) : (
          results.map(s => (
            <div
              key={s.id}
              className={`result-card${expanded === s.id ? " open" : ""}`}
              onClick={() => setExpanded(expanded === s.id ? null : s.id)}
            >
              <div className="rc-top">
                <div>
                  <div className="rc-name">{s.name}</div>
                  {s.fullName && s.fullName !== s.name && (
                    <div className="rc-fullname">{s.fullName}</div>
                  )}
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
                  <span className={`si-badge ${s.type}`}>{s.type === "central" ? "Central" : "State"}</span>
                  <span style={{ fontSize:10, color:"var(--text-muted)" }}>
                    {expanded === s.id ? (hi ? "बंद करें ▴" : "Collapse ▴") : (hi ? "विस्तार ▾" : "Details ▾")}
                  </span>
                </div>
              </div>

              <div className="rc-benefit">✅ {s.benefit}</div>

              <div className="rc-tags">
                <span
                  className="tag"
                  style={{ background: CAT_COLORS[s.category] || "var(--navy-pale)", color: "white" }}
                >
                  {s.category}
                </span>
                {s.tags.slice(0, 4).map(t => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>

              {expanded === s.id && s.documents && (
                <div className="rc-details">
                  <div className="rc-details-title">📋 {L.docs}</div>
                  <ul>
                    {s.documents.map(d => <li key={d}>{d}</li>)}
                  </ul>
                  <div className="rc-apply">
                    {s.applyUrl && (
                      <a href={s.applyUrl} target="_blank" rel="noreferrer" className="apply-online" onClick={e => e.stopPropagation()}>
                        🌐 {L.online}
                      </a>
                    )}
                    {s.applyOffline && (
                      <span className="rc-apply apply-offline" onClick={e => e.stopPropagation()}>
                        🏢 {s.applyOffline}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
