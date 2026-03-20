import { SCHEMES, CENTRAL_SCHEMES, STATE_SCHEMES } from "../data/schemes.js";

const METRICS = [
  { en:"Total Queries (30d)",  hi:"कुल प्रश्न (30 दिन)",   val:"1,24,832", sub:"↑ 34% from last month",  color:"var(--navy-mid)" },
  { en:"Schemes Matched",      hi:"योजनाएं मिलीं",          val:"3,47,200", sub:"Avg 2.8 per user",        color:"var(--green)" },
  { en:"States Covered",       hi:"राज्य कवर",              val:"28+",      sub:"All UTs included",        color:"var(--saffron)" },
  { en:"Avg Response Time",    hi:"औसत समय",                val:"1.4s",     sub:"On 2G connection",        color:"#7c3aed" },
];

const TOP_SCHEMES = [
  { name:"PM-KISAN",          pct:89 },
  { name:"Ayushman Bharat",   pct:74 },
  { name:"PMAY Gramin",       pct:61 },
  { name:"MGNREGA",           pct:55 },
  { name:"PM Ujjwala",        pct:48 },
  { name:"NSP Scholarship",   pct:38 },
  { name:"PM MUDRA",          pct:32 },
];

const LANGS = [
  { name:"Hindi",   script:"हिंदी",   pct:52, color:"var(--navy-mid)" },
  { name:"English", script:"English",  pct:31, color:"#1565C0" },
  { name:"Bengali", script:"বাংলা",   pct:8,  color:"#0277BD" },
  { name:"Tamil",   script:"தமிழ்",   pct:5,  color:"#006064" },
  { name:"Other",   script:"अन्य",    pct:4,  color:"#78909C" },
];

const CLAIM_TABLE = [
  { name:"PM Awas Yojana (UP)", target:"4.2L", claimed:"1.1L", rate:26, status:"low" },
  { name:"NSP Scholarship",     target:"8.7L", claimed:"3.2L", rate:37, status:"low" },
  { name:"PM MUDRA Loan",       target:"3.1L", claimed:"1.5L", rate:48, status:"med" },
  { name:"PM Matru Vandana",    target:"6.2L", claimed:"3.8L", rate:61, status:"med" },
  { name:"PM-KISAN",            target:"9.8L", claimed:"7.9L", rate:81, status:"high" },
];

const DISTRICTS = [
  ["Lucknow","low"],["Varanasi","high"],["Agra","low"],["Kanpur","low"],
  ["Prayagraj","med"],["Gorakhpur","med"],["Meerut","low"],["Mathura","high"],
  ["Aligarh","low"],["Bareilly","med"],["Moradabad","med"],["Jhansi","low"],
  ["Saharanpur","med"],["Muzaffarnagar","high"],["Firozabad","low"],
];

const CAT_DIST = [
  { cat:"Agriculture",     count:4, color:"var(--cat-agri)" },
  { cat:"Health",          count:3, color:"var(--cat-health)" },
  { cat:"Education",       count:4, color:"var(--cat-edu)" },
  { cat:"Finance",         count:5, color:"var(--cat-finance)" },
  { cat:"Women & Child",   count:5, color:"var(--cat-women)" },
  { cat:"Housing",         count:2, color:"var(--cat-housing)" },
  { cat:"Employment",      count:3, color:"var(--cat-employ)" },
  { cat:"Skill Dev",       count:2, color:"var(--cat-skill)" },
  { cat:"Social Security", count:3, color:"var(--cat-social)" },
  { cat:"Artisan",         count:1, color:"var(--cat-artisan)" },
  { cat:"Food Security",   count:1, color:"var(--cat-agri)" },
];

export default function AnalyticsPanel({ lang }) {
  const hi = lang === "hi";

  return (
    <div className="analytics">
      {/* Metrics */}
      <div className="metrics-grid">
        {METRICS.map(m => (
          <div key={m.en} className="metric-card">
            <div className="mc-label">{hi ? m.hi : m.en}</div>
            <div className="mc-value" style={{ color: m.color }}>{m.val}</div>
            <div className="mc-sub">{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="analytics-row2">
        {/* Bar chart */}
        <div className="a-card">
          <div className="a-card-title">{hi ? "सबसे अधिक खोजी गई योजनाएं" : "Top Queried Schemes (30 Days)"}</div>
          {TOP_SCHEMES.map(s => (
            <div key={s.name} className="bar-row">
              <div className="bar-lbl">{s.name}</div>
              <div className="bar-track"><div className="bar-fill" style={{ width:`${s.pct}%` }}/></div>
              <div className="bar-num">{s.pct}K</div>
            </div>
          ))}
        </div>

        {/* Language + scheme type */}
        <div className="a-card">
          <div className="a-card-title">{hi ? "भाषा वितरण" : "Language Breakdown"}</div>
          {LANGS.map(l => (
            <div key={l.name} className="lang-row">
              <div className="lang-name">{l.name} <span className="lang-script">{l.script}</span></div>
              <div className="lang-track"><div className="lang-fill" style={{ width:`${l.pct * 1.6}px`, background: l.color }}/></div>
              <div className="lang-pct">{l.pct}%</div>
            </div>
          ))}

          <div style={{ marginTop:16, borderTop:"1px solid var(--border)", paddingTop:14 }}>
            <div className="a-card-title">{hi ? "योजना प्रकार" : "Scheme Type"}</div>
            <div style={{ display:"flex", gap:10, marginTop:8 }}>
              {[
                { label: hi ? "केंद्रीय" : "Central", count: CENTRAL_SCHEMES.length, color:"var(--navy-mid)", bg:"var(--navy-pale)" },
                { label: hi ? "राज्य"   : "State",   count: STATE_SCHEMES.length,   color:"var(--green)",    bg:"var(--green-light)" },
              ].map(t => (
                <div key={t.label} style={{ flex:1, background:t.bg, borderRadius:"var(--r-md)", padding:"10px 14px", textAlign:"center" }}>
                  <div style={{ fontSize:26, fontWeight:800, color:t.color }}>{t.count}</div>
                  <div style={{ fontSize:11, color:"var(--text-muted)" }}>{t.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category distribution */}
      <div className="a-card">
        <div className="a-card-title">{hi ? "श्रेणीवार योजनाएं" : "Schemes by Category"}</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {CAT_DIST.map(c => (
            <div key={c.cat} style={{ display:"flex", alignItems:"center", gap:6, background:"var(--bg)", borderRadius:"var(--r-sm)", padding:"6px 12px" }}>
              <span style={{ width:10, height:10, borderRadius:"50%", background:c.color, display:"inline-block", flexShrink:0 }}/>
              <span style={{ fontSize:12, fontWeight:600, color:"var(--text-mid)" }}>{c.cat}</span>
              <span style={{ fontSize:12, fontWeight:800, color:c.color }}>{c.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* District heatmap */}
      <div className="a-card">
        <div className="a-card-title">{hi ? "जिलेवार कम दावा — उत्तर प्रदेश" : "Under-claimed Districts — Uttar Pradesh"}</div>
        <div className="district-grid">
          {DISTRICTS.map(([name, level]) => (
            <div key={name} className={`district-cell dist-${level}`}>{name}</div>
          ))}
        </div>
        <div className="dist-legend" style={{ marginTop:10 }}>
          <span className="district-cell dist-low" style={{ padding:"2px 8px", fontSize:10 }}>■ {hi ? "कम दावा" : "Low Claim"}</span>
          <span className="district-cell dist-med" style={{ padding:"2px 8px", fontSize:10 }}>■ {hi ? "मध्यम" : "Medium"}</span>
          <span className="district-cell dist-high" style={{ padding:"2px 8px", fontSize:10 }}>■ {hi ? "ठीक है" : "On Track"}</span>
        </div>
      </div>

      {/* Claim rate table */}
      <div className="a-card">
        <div className="a-card-title">{hi ? "योजना दावा दर — हस्तक्षेप डैशबोर्ड" : "Scheme Claim Rates — Intervention Dashboard"}</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>{hi ? "योजना" : "Scheme"}</th>
              <th>{hi ? "लक्ष्य" : "Target"}</th>
              <th>{hi ? "दावा" : "Claimed"}</th>
              <th>{hi ? "दर" : "Rate"}</th>
              <th>{hi ? "स्थिति" : "Status"}</th>
            </tr>
          </thead>
          <tbody>
            {CLAIM_TABLE.map(r => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td>{r.target}</td>
                <td>{r.claimed}</td>
                <td><strong>{r.rate}%</strong></td>
                <td>
                  <span className={`status-badge s-${r.status}`}>
                    {r.status === "low"  ? (hi ? "हस्तक्षेप आवश्यक" : "Needs Action") :
                     r.status === "med"  ? (hi ? "मध्यम" : "Moderate") :
                                           (hi ? "अच्छा" : "On Track")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:10 }}>
          📌 {hi ? "डेटा: myscheme.gov.in | अनुमानित आंकड़े — हैकाथॉन डेमो" : "Data: myscheme.gov.in | Estimated figures for hackathon demo"}
        </div>
      </div>
    </div>
  );
}
