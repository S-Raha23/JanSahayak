import { useState, useRef, useEffect } from "react";

const FLOW = [
  { from:"bot",      text:"🙏 नमस्ते! JanSahayak में आपका स्वागत है।\n\nमैं आपको सरकारी योजनाएं खोजने में मदद करूंगा।\n\nआपका राज्य कौन सा है?" },
  { from:"bot_auto", text:"📌 किसी भी राज्य का नाम लिखें\n_(e.g. Uttar Pradesh, Bihar, Maharashtra)_" },
  { from:"user",     text:"उत्तर प्रदेश" },
  { from:"bot",      text:"✅ उत्तर प्रदेश\n\nआपका व्यवसाय?\n1️⃣ किसान\n2️⃣ दिहाड़ी मज़दूर\n3️⃣ छात्र\n4️⃣ छोटा व्यापारी\n5️⃣ बेरोज़गार" },
  { from:"user",     text:"1" },
  { from:"bot",      text:"✅ किसान\n\nवार्षिक आय?\n1️⃣ ₹1 लाख से कम\n2️⃣ ₹1–₹2.5 लाख\n3️⃣ ₹2.5–₹5 लाख" },
  { from:"user",     text:"2" },
  { from:"bot",      text:"🔍 AI मिलान हो रहा है...\n\n✅ आपके लिए 6 योजनाएं मिलीं:\n\n1️⃣ *PM-KISAN* — ₹6,000/वर्ष सीधे खाते में\n2️⃣ *MGNREGA* — 100 दिन रोज़गार गारंटी\n3️⃣ *Kisan Credit Card* — 4% ब्याज पर ऋण\n4️⃣ *PMFBY* — फसल बीमा योजना\n5️⃣ *Ayushman Bharat* — ₹5 लाख स्वास्थ्य बीमा\n6️⃣ *PM-KUSUM* — सोलर पंप 90% सब्सिडी\n\nकिस योजना के दस्तावेज़ जानें? नंबर भेजें 👆" },
  { from:"user",     text:"1" },
  { from:"bot",      text:"📋 *PM-KISAN दस्तावेज़:*\n\n• आधार कार्ड\n• ज़मीन के कागज़ (खसरा/खतौनी)\n• बैंक पासबुक (IFSC सहित)\n• मोबाइल नंबर (आधार से लिंक)\n\n✅ *ऑनलाइन:* pmkisan.gov.in\n🏢 *ऑफलाइन:* CSC केंद्र या पटवारी\n\n_डेटा स्रोत: myscheme.gov.in_\n\nऔर मदद? 'हाँ' लिखें।" },
  { from:"user",     text:"हाँ" },
  { from:"bot",      text:"बताइए — किस योजना के बारे में और जानकारी चाहते हैं?\n\n1️⃣ Ayushman Bharat\n2️⃣ Kisan Credit Card\n3️⃣ PMFBY फसल बीमा\n4️⃣ MGNREGA Job Card\n\nया 'सभी' लिखें पूरी सूची के लिए।" },
];

const STEPS_INFO = [
  { n:1, hi:"पहला संदेश भेजें",     en:"Send first message",      sub:'"मुझे योजनाएं जाननी हैं"' },
  { n:2, hi:"Bot प्रोफाइल बनाता है", en:"Bot builds your profile",  sub:"State · Occupation · Income" },
  { n:3, hi:"Gemini AI से मिलान",   en:"Gemini AI matches schemes", sub:"40 schemes · real-time" },
  { n:4, hi:"दस्तावेज़ + आवेदन",    en:"Documents + apply steps",   sub:"myscheme.gov.in verified" },
];

export default function WhatsAppPanel({ lang }) {
  const [msgs, setMsgs]   = useState([]);
  const [input, setInput] = useState("");
  const [step, setStep]   = useState(0);
  const [busy, setBusy]   = useState(false);
  const bottomRef = useRef(null);

  const hi = lang === "hi";

  useEffect(() => {
    setTimeout(() => setMsgs([FLOW[0]]), 400);
    setTimeout(() => setMsgs([FLOW[0], FLOW[1]]), 1300);
    setStep(2);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  function sendWA() {
    const txt = input.trim();
    if (!txt || busy) return;
    setInput("");
    setMsgs(m => [...m, { from:"user", text:txt }]);
    setBusy(true);

    let s = step;
    while (s < FLOW.length && FLOW[s].from === "user") s++;

    if (s < FLOW.length) {
      setTimeout(() => {
        setMsgs(m => [...m, FLOW[s]]);
        s++;
        if (s < FLOW.length && (FLOW[s].from === "bot" || FLOW[s].from === "bot_auto")) {
          setTimeout(() => {
            setMsgs(m => [...m, FLOW[s]]);
            setStep(s + 1);
            setBusy(false);
          }, 900);
        } else {
          setStep(s);
          setBusy(false);
        }
      }, 800);
    } else {
      setTimeout(() => {
        setMsgs(m => [...m, {
          from:"bot",
          text: hi
            ? "🙏 धन्यवाद! myscheme.gov.in या नज़दीकी CSC केंद्र पर आवेदन करें।\n\nJanSahayak — AI Welfare Navigator 🇮🇳"
            : "🙏 Thank you! Apply at myscheme.gov.in or your nearest CSC centre.\n\nJanSahayak — AI Welfare Navigator 🇮🇳",
        }]);
        setBusy(false);
      }, 800);
    }
  }

  const now = new Date();
  const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`;

  return (
    <div className="wa-panel">
      {/* Phone mockup */}
      <div className="wa-phone-wrap">
        <div className="wa-phone">
          <div className="wa-status-bar"><span>{time}</span><span>●●● WiFi</span></div>
          <div className="wa-topbar">
            <div style={{fontSize:18,cursor:"pointer",color:"white"}}>‹</div>
            <div className="wa-av">JS</div>
            <div className="wa-contact-info">
              <div className="wa-name">JanSahayak</div>
              <div className="wa-status-text">online · myscheme.gov.in</div>
            </div>
            <div style={{marginLeft:"auto",color:"white",fontSize:18}}>⋮</div>
          </div>

          <div className="wa-body">
            <div className="wa-msgs-wrap">
              {msgs.map((m, i) => (
                <div key={i} className={`wa-msg ${m.from === "user" ? "out" : "in"}`}>
                  <div className="wa-bubble">{m.text}</div>
                  <div className="wa-time">{time}{m.from === "user" ? " ✓✓" : ""}</div>
                </div>
              ))}
              {busy && (
                <div className="wa-msg in">
                  <div className="wa-typing-bubble"><span/><span/><span/></div>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>

            <div className="wa-inputbar">
              <span style={{fontSize:18}}>😊</span>
              <input
                className="wa-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendWA()}
                placeholder={hi ? "संदेश टाइप करें..." : "Type a message..."}
              />
              <button className="wa-send-btn" onClick={sendWA}>➤</button>
            </div>
          </div>
        </div>
      </div>

      {/* Info panel */}
      <div className="wa-info">
        <div className="wa-info-title">
          {hi ? "WhatsApp — बिना ऐप के, 2G पर भी" : "WhatsApp — Zero Install, Works on 2G"}
        </div>
        <div className="wa-info-desc">
          {hi
            ? "किसी भी WhatsApp फोन पर काम करता है। कोई ऐप डाउनलोड नहीं। 2G कनेक्शन पर भी काम करता है।"
            : "Works on any phone with WhatsApp. No app download required. Functional even on 2G connections in rural areas."}
        </div>

        <div className="wa-steps">
          {STEPS_INFO.map(s => (
            <div key={s.n} className="wa-step">
              <div className="wa-step-num">{s.n}</div>
              <div>
                <div className="wa-step-title">{hi ? s.hi : s.en}</div>
                <div className="wa-step-sub">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="wa-tech-stack">
          <div className="wa-stack-title">Tech Stack</div>
          <div className="wa-stack-tags">
            {["Gemini 1.5 Flash","Amazon Lex v2","AWS Lambda","API Gateway","Amazon Translate","Node.js"].map(t => (
              <span key={t} className="wa-stack-tag">{t}</span>
            ))}
          </div>
        </div>

        <div style={{marginTop:16, background:"var(--navy-pale)", borderRadius:"var(--r-md)", padding:14}}>
          <div style={{fontSize:11,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:6}}>
            {hi ? "WhatsApp नंबर (डेमो)" : "WhatsApp Number (Demo)"}
          </div>
          <div style={{fontSize:20,fontWeight:800,color:"var(--navy-mid)"}}>+91 98765 43210</div>
          <div style={{fontSize:11,color:"var(--text-muted)",marginTop:4}}>
            {hi ? "\"नमस्ते\" भेजकर शुरू करें" : 'Send "Namaste" to get started'}
          </div>
        </div>
      </div>
    </div>
  );
}
