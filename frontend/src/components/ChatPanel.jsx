import { useState, useRef, useEffect } from "react";
import { SCHEMES } from "../data/schemes.js";

const API = import.meta.env.VITE_API_URL || "";

const GREETING = {
  hi: `🙏 नमस्ते! मैं **JanSahayak** हूँ — भारत के नागरिकों के लिए AI कल्याण नेविगेटर।\n\nबस अपनी स्थिति बताएं — जैसे:\n• _"मैं बिहार का किसान हूँ, आय ₹1.2 लाख, 3 बच्चे"_\n• _"UP की महिला हूँ, BPL कार्ड है, गैस कनेक्शन चाहिए"_\n• _"Tamil Nadu में छात्र हूँ, SC हूँ, छात्रवृत्ति चाहिए"_\n\nमैं **${SCHEMES.length} सरकारी योजनाओं** में से आपकी पात्र योजनाएं खोजूंगा। 🌾🏥🏠`,
  en: `🙏 Hello! I'm **JanSahayak** — AI Welfare Navigator for Indian citizens.\n\nJust describe your situation — like:\n• _"I'm a farmer in Bihar, income ₹1.2L, 3 children"_\n• _"Daily wage worker from UP, married, need housing"_\n• _"Student in Tamil Nadu, SC category, need scholarship"_\n\nI'll match you against **${SCHEMES.length} government welfare schemes** instantly. 🌾🏥🏠`,
};

const QUICK_REPLIES = {
  hi: [
    "बिहार का किसान हूँ, आय ₹1.2L",
    "UP मज़दूर, परिवार 4 लोग",
    "महिला हूँ, BPL कार्ड है",
    "SC छात्र, कॉलेज में पढ़ता हूँ",
    "बेरोज़गार हूँ, ट्रेनिंग चाहिए",
    "PM-KISAN के दस्तावेज़ बताओ",
  ],
  en: [
    "Farmer in Bihar, income ₹1.2L",
    "Daily worker UP, family of 4",
    "Woman with BPL card",
    "SC student in college",
    "Unemployed, need skill training",
    "Documents for PM-KISAN",
  ],
};

const VOICE_STATES = {
  idle:       { label: "Hold to speak",        labelHi: "बोलने के लिए दबाएं",   color: "#1A237E", pulse: false },
  recording:  { label: "Listening… release",   labelHi: "सुन रहा हूँ… छोड़ें", color: "#c0392b", pulse: true  },
  processing: { label: "Processing…",           labelHi: "सोच रहा हूँ…",        color: "#FF6600", pulse: false },
  speaking:   { label: "Speaking…",             labelHi: "बोल रहा हूँ…",        color: "#138808", pulse: false },
};

function toHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
}

function MsgBubble({ content, streaming }) {
  return (
    <div
      className="msg-bubble"
      dangerouslySetInnerHTML={{ __html: toHtml(content) + (streaming ? '<span class="cursor">▋</span>' : "") }}
    />
  );
}

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

function speakText(text, lang, onEnd) {
  if (!window.speechSynthesis) { onEnd?.(); return; }

  // Strip markdown so TTS doesn't read "asterisk asterisk"
  const clean = text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/•/g, "")
    .replace(/\[.*?\]\(.*?\)/g, "")
    .replace(/<[^>]+>/g, "")
    .slice(0, 800); // cap length so it doesn't drone on forever

  function doSpeak() {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(clean);

    // Pick language — fall back to en-US if no Hindi voice found
    const voices = window.speechSynthesis.getVoices();
    const hiVoice = voices.find(v =>
      v.lang === "hi-IN" ||
      v.name.toLowerCase().includes("hindi") ||
      v.name.toLowerCase().includes("india")
    );
    const enVoice = voices.find(v => v.lang === "en-US" || v.lang === "en-GB");

    if (lang === "hi" && hiVoice) {
      utt.voice = hiVoice;
      utt.lang  = "hi-IN";
    } else if (enVoice) {
      utt.voice = enVoice;
      utt.lang  = "en-US";
    } else {
      utt.lang = "en-US";
    }

    utt.rate  = 0.88;
    utt.pitch = 1.0;
    utt.volume = 1.0;

    utt.onend   = () => onEnd?.();
    utt.onerror = (e) => { console.warn("TTS error", e); onEnd?.(); };

    // Chrome bug: speechSynthesis sometimes pauses itself — kick it
    window.speechSynthesis.speak(utt);
    const resume = setInterval(() => {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      if (!window.speechSynthesis.speaking) clearInterval(resume);
    }, 5000);
  }

  // Voices may not be loaded yet on first call
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    doSpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      doSpeak();
    };
    // Fallback if onvoiceschanged never fires (Firefox)
    setTimeout(() => {
      if (window.speechSynthesis.getVoices().length > 0) doSpeak();
    }, 500);
  }
}

export default function ChatPanel({ lang }) {
  const [msgs, setMsgs]         = useState([{ role: "assistant", content: GREETING[lang], id: "greet" }]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [stream, setStream]     = useState("");
  const [error, setError]       = useState("");
  const [voiceState, setVoiceState] = useState("idle");
  const [transcript, setTranscript] = useState("");

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const recRef     = useRef(null);
  const chunksRef  = useRef([]);
  const streamRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, stream]);
  useEffect(() => {
    setMsgs([{ role: "assistant", content: GREETING[lang], id: "greet" }]);
    setStream(""); setError("");
    window.speechSynthesis?.cancel();
  }, [lang]);

  async function send(text) {
    const txt = (text ?? input).trim();
    if (!txt || loading) return;
    setInput(""); setError("");
    window.speechSynthesis?.cancel();

    const userMsg = { role: "user", content: txt, id: uid() };
    const next = [...msgs, userMsg];
    setMsgs(next);
    setLoading(true);
    setStream("");

    try {
      const apiMsgs = next
        .filter(m => m.id !== "greet")
        .slice(-12)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMsgs }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status} — is backend running?`);

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const p = JSON.parse(data);
            if (p.error) throw new Error(p.error);
            if (p.text)  { full += p.text; setStream(full); }
          } catch (e) {
            if (e.message !== "Unexpected end of JSON input") throw e;
          }
        }
      }
      setStream("");
      setMsgs(prev => [...prev, { role: "assistant", content: full, id: uid() }]);
    } catch (err) {
      setError(err.message);
      setStream("");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  async function startVoice(e) {
    e.preventDefault();
    if (voiceState !== "idle") return;
    window.speechSynthesis?.cancel();
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = mediaStream;
      chunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const rec = new MediaRecorder(mediaStream, { mimeType: mime });
      recRef.current = rec;
      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.start(100);
      setVoiceState("recording");
      setTranscript("");
    } catch {
      setError("Microphone access denied.");
    }
  }

  function stopVoice(e) {
    e.preventDefault();
    if (voiceState !== "recording" || !recRef.current) return;

    recRef.current.onstop = async () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      const mime = recRef.current.mimeType || "audio/webm";
      const blob = new Blob(chunksRef.current, { type: mime });
      if (blob.size < 800) {
        setVoiceState("idle");
        setError("Recording too short — hold the mic button and speak clearly.");
        return;
      }
      setVoiceState("processing");
      try {
        const base64 = await new Promise((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(r.result.split(",")[1]);
          r.onerror = rej;
          r.readAsDataURL(blob);
        });
        const history = msgs.filter(m => m.id !== "greet").slice(-6).map(m => ({ role: m.role, content: m.content }));
        const res = await fetch(`${API}/api/voice`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audio: base64, mimeType: mime, history, lang }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setTranscript(data.transcript);
        setMsgs(prev => [
          ...prev,
          { role: "user",      content: `🎙️ "${data.transcript}"`, id: uid() },
          { role: "assistant", content: data.reply,                 id: uid() },
        ]);
        setVoiceState("speaking");
        speakText(data.reply, lang, () => setVoiceState("idle"));
      } catch (err) {
        setError(`Voice error: ${err.message}`);
        setVoiceState("idle");
      }
    };
    recRef.current.stop();
  }

  const vs = VOICE_STATES[voiceState];

  return (
    <div className="chat-panel">
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">{lang === "hi" ? "योजना डेटाबेस" : "Scheme Database"}</div>
          <div className="sidebar-count">{SCHEMES.length}</div>
          <div className="sidebar-label">{lang === "hi" ? "सरकारी योजनाएं" : "Govt Schemes"}</div>
        </div>
        <div className="sidebar-source"><span>📌</span> Source: myscheme.gov.in</div>
        <div className="scheme-list">
          {SCHEMES.map(s => (
            <div
              key={s.id}
              className="scheme-item"
              onClick={() => send(lang === "hi" ? `${s.name} के बारे में विस्तार से बताओ` : `Tell me about ${s.name}`)}
            >
              <div className="si-name">{s.short || s.name}</div>
              <div className="si-cat">{s.category}</div>
              <span className={`si-badge ${s.type}`}>{s.type === "central" ? "Central" : "State"}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Chat Main ────────────────────────────────────── */}
      <div className="chat-main">
        {error && (
          <div className="error-bar">
            <span>⚠️</span> {error}
            {error.includes("backend") && <span> — Run <code>cd backend && npm run dev</code></span>}
            <button onClick={() => setError("")}>✕</button>
          </div>
        )}

        <div className="messages">
          {msgs.map(m => (
            <div key={m.id} className={`msg ${m.role}`}>
              <div className="msg-av">{m.role === "assistant" ? "JS" : "You"}</div>
              <MsgBubble content={m.content} streaming={false} />
            </div>
          ))}

          {stream ? (
            <div className="msg assistant">
              <div className="msg-av">JS</div>
              <MsgBubble content={stream} streaming={true} />
            </div>
          ) : null}

          {loading && !stream ? (
            <div className="msg assistant">
              <div className="msg-av">JS</div>
              <div className="msg-bubble">
                <div className="typing-bubble"><span /><span /><span /></div>
              </div>
            </div>
          ) : null}

          <div ref={bottomRef} />
        </div>

        {/* Quick chips */}
        <div className="quick-chips">
          {QUICK_REPLIES[lang].map(q => (
            <button key={q} className="chip" onClick={() => send(q)} disabled={loading}>{q}</button>
          ))}
        </div>

        {/* Input */}
        <div className="input-row">
          <input
            ref={inputRef}
            className="chat-input"
            value={input}
            disabled={loading}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder={lang === "hi" ? "अपनी स्थिति बताएं... (राज्य, आय, व्यवसाय)" : "Describe your situation... (state, income, occupation)"}
          />
          <button className="send-btn" onClick={() => send()} disabled={loading || !input.trim()}>➤</button>
        </div>

        <div className="disclaimer">
          <span>ℹ️</span> {lang === "hi"
            ? "डेटा स्रोत: myscheme.gov.in | पात्रता की पुष्टि myscheme.gov.in या नज़दीकी CSC केंद्र पर करें।"
            : "Data: myscheme.gov.in | Verify eligibility at myscheme.gov.in or nearest CSC centre."}
        </div>
      </div>

      {/* ── Voice FAB ────────────────────────────────────── */}
      <div className="voice-fab-wrap">
        {transcript && voiceState === "idle" && (
          <div className="voice-transcript">&ldquo;{transcript}&rdquo;</div>
        )}
        <div className="voice-label" style={{ color: vs.color }}>
          {lang === "hi" ? vs.labelHi : vs.label}
        </div>
        <button
          className={`voice-fab ${voiceState}`}
          style={{ background: vs.color }}
          onMouseDown={startVoice}
          onMouseUp={stopVoice}
          onTouchStart={startVoice}
          onTouchEnd={stopVoice}
          disabled={voiceState === "processing"}
          title={lang === "hi" ? "दबाकर बोलें" : "Hold to speak"}
        >
          {voiceState === "recording"  ? <span className="voice-ring" style={{ borderColor: vs.color }} /> : null}
          {voiceState === "processing" ? <span className="voice-spinner" /> : null}
          {voiceState === "speaking"   ? <span aria-label="speaking">🔊</span> : null}
          {voiceState === "idle"       ? <span aria-label="mic">🎙️</span> : null}
        </button>
      </div>
    </div>
  );
}
