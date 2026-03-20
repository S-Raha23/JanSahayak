import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SCHEMES } from "./data/schemes.js";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "20mb" }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// ── Build scheme context for the system prompt ─────────────────────────────
const SCHEME_CONTEXT = SCHEMES.map(s =>
  `[${s.id}] ${s.name} (${s.fullName})
  Type: ${s.type} | Category: ${s.category} | Ministry: ${s.ministry}
  Benefit: ${s.benefit}
  States: ${s.states.join(", ")}
  Tags: ${s.tags.join(", ")}
  Apply: ${s.applyUrl}
  Documents: ${s.documents.join(", ")}`
).join("\n\n");

// ── System prompt ──────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are JanSahayak, an AI welfare guide for Indian citizens.

SCHEMES DATABASE (${SCHEMES.length} schemes):
${SCHEME_CONTEXT}

## RULES — READ CAREFULLY:

**BREVITY IS MANDATORY.**
- Max 3 schemes per response unless user asks for more
- Each scheme: 2–3 lines max. Name + benefit + apply link. That's it.
- No long explanations. No paragraphs. No fluff.
- If user asks for documents: numbered list only, no extra text
- Never repeat information already given

**FORMAT** (strict):
**Scheme Name** — ✅ benefit in one line
📋 Docs: doc1, doc2, doc3
🔗 apply-url

**LANGUAGE:**
- Hindi input → Hindi output (Devanagari, simple words)
- English input → English output
- Hinglish → Hindi

**BEHAVIOUR:**
- If profile is incomplete, ask ONE question only (state OR occupation, not both)
- Only recommend schemes from the database — never invent schemes
- End with one short follow-up question max
- If user just says hi/hello → ask their state and occupation in one line`;

// ── /api/chat — streaming endpoint ─────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const lastMsg = messages[messages.length - 1];
    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(lastMsg.content);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("Chat error:", err);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// ── /api/voice — audio transcription + reply ───────────────────────────────
app.post("/api/voice", async (req, res) => {
  const { audio, mimeType, history = [], lang = "hi" } = req.body;
  if (!audio) return res.status(400).json({ error: "audio required" });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Step 1: Transcribe
    const transcribeResult = await model.generateContent([
      {
        inlineData: { mimeType: mimeType || "audio/webm", data: audio },
      },
      {
        text: lang === "hi"
          ? "यह एक भारतीय नागरिक की आवाज़ है जो सरकारी योजनाओं के बारे में पूछ रहा है। इसे हिंदी में transcribe करें। केवल transcription दें, कोई अन्य टेक्स्ट नहीं।"
          : "Transcribe this Indian citizen's voice query about government welfare schemes. Return only the transcription, nothing else.",
      },
    ]);

    const transcript = transcribeResult.response.text().trim();

    // Step 2: Generate reply using chat model with history
    const chatModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const chatHistory = history.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const chat = chatModel.startChat({ history: chatHistory });
    const replyResult = await chat.sendMessage(transcript);
    const reply = replyResult.response.text();

    res.json({ transcript, reply });
  } catch (err) {
    console.error("Voice error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── /api/match — scheme matching from structured form ──────────────────────
app.post("/api/match", async (req, res) => {
  const { state, occupation, income, gender, category, age } = req.body;

  const filtered = SCHEMES.filter(s => {
    // State filter
    if (!s.states.includes("all") && state) {
      if (!s.states.some(st => st.toLowerCase() === state.toLowerCase())) return false;
    }

    // Occupation
    if (occupation && s.eligibility.occupation?.length > 0) {
      const occMap = {
        farmer: ["farmer"],
        daily_worker: ["rural", "unorganised_sector"],
        student: ["student", "unemployed"],
        business: ["small_business", "entrepreneur", "artisan"],
        unemployed: ["unemployed", "unorganised_sector"],
        artisan: ["artisan", "craftsman"],
        street_vendor: ["street_vendor", "small_business"],
      };
      const allowed = occMap[occupation] || [occupation];
      const matches = s.eligibility.occupation.some(o => allowed.includes(o)) ||
        s.tags.some(t => allowed.some(a => t.toLowerCase().includes(a)));
      if (!matches) return false;
    }

    // Gender
    if (gender && s.eligibility.gender?.length > 0) {
      if (!s.eligibility.gender.includes(gender.toLowerCase())) return false;
    }

    // Category
    if (category && s.eligibility.categories?.length > 0) {
      if (!s.eligibility.categories.includes(category)) return false;
    }

    // Income
    if (income && s.eligibility.maxIncome) {
      if (income > s.eligibility.maxIncome) return false;
    }

    // Age
    if (age && s.eligibility.age) {
      if (s.eligibility.age.min && age < s.eligibility.age.min) return false;
      if (s.eligibility.age.max && age > s.eligibility.age.max) return false;
    }

    return true;
  });

  res.json({ results: filtered, total: filtered.length });
});

// ── /api/schemes — get all schemes ─────────────────────────────────────────
app.get("/api/schemes", (_req, res) => {
  res.json({ schemes: SCHEMES, total: SCHEMES.length });
});

// ── Health check ───────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    schemes: SCHEMES.length,
    gemini: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 JanSahayak backend running on http://localhost:${PORT}`);
  console.log(`📊 Loaded ${SCHEMES.length} welfare schemes`);
  console.log(`🤖 Gemini API: ${process.env.GEMINI_API_KEY ? "✅ configured" : "❌ missing GEMINI_API_KEY"}\n`);
});

// ════════════════════════════════════════════════════════════════════════════
// DISHA AI AGENT — 4651 schemes from myscheme.gov.in
// ════════════════════════════════════════════════════════════════════════════
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const FULL_SCHEMES = JSON.parse(
  readFileSync(join(__dir, "data/schemes_full.json"), "utf-8")
);
console.log(`🌐 Disha: Loaded ${FULL_SCHEMES.length} full schemes from myscheme.gov.in`);

const OCC_TAGS = {
  farmer:     ["farmer","agriculture","kisan","crop","rural","horticulture","fishermen","animal husbandry","agri"],
  student:    ["student","scholarship","education","school","college","higher education","fellowship","stipend","post-matric","pre-matric"],
  worker:     ["labour","worker","construction worker","building worker","employment","wages","labourer"],
  business:   ["entrepreneurship","business","msme","loan","entrepreneur","startup","industry","self-employed"],
  unemployed: ["employment","training","skill","youth","unemployed","apprenticeship"],
  women:      ["women","woman","girl","widow","maternal","self help group","shg"],
  senior:     ["senior citizen","pension","old age","elderly","old-age"],
  disabled:   ["disability","pwd","persons with disability","divyangjan","handicapped"],
  artisan:    ["artisan","craftsman","weaver","potter","carpenter","toolkit","handicraft"],
};

function preFilter(profile) {
  const { state, occupation, age, gender, category, keywords = [] } = profile;
  const occSynonyms = occupation ? (OCC_TAGS[occupation.toLowerCase()] || [occupation.toLowerCase()]) : [];

  return FULL_SCHEMES.filter(s => {
    const f = s.fields;
    const tags = (f.tags || []).map(t => t.toLowerCase());
    const desc = (f.briefDescription || "").toLowerCase();
    const name = (f.schemeName || "").toLowerCase();
    const stateList = (f.beneficiaryState || []).map(st => st.toLowerCase());
    const cats = (f.schemeCategory || []).map(c => c.toLowerCase());

    // State filter
    if (state && !stateList.includes("all")) {
      if (!stateList.some(st => st.includes(state.toLowerCase()) || state.toLowerCase().includes(st))) return false;
    }

    // Gender filter — don't show women-only schemes to males
    if (gender === "male") {
      const womenOnly = tags.some(t => ["women","woman","girl child","widow","maternal","women empowerment"].includes(t));
      if (womenOnly) return false;
    }

    // Age filter
    if (age) {
      const n = parseInt(age);
      if (n < 18 && tags.some(t => t.includes("senior") || t.includes("pension"))) return false;
      if (n > 60 && tags.some(t => t === "youth")) return false;
    }

    // Category filter boost — if SC/ST/OBC, include schemes with those tags
    if (category && ["sc","st","obc","minority","pwd"].includes(category.toLowerCase())) {
      const catMap = { sc:"scheduled caste", st:"scheduled tribe", obc:"other backward", minority:"minority", pwd:"disability" };
      const catTag = catMap[category.toLowerCase()] || category.toLowerCase();
      if (tags.some(t => t.includes(catTag)) || desc.includes(catTag)) return true;
    }

    // Occupation match — required if occupation given
    if (occSynonyms.length > 0) {
      return occSynonyms.some(syn =>
        tags.some(t => t.includes(syn)) || desc.includes(syn) || name.includes(syn) || cats.some(c => c.includes(syn))
      );
    }

    return true;
  });
}

// /api/disha/search — SSE streaming
app.post("/api/disha/search", async (req, res) => {
  const { profile } = req.body;
  if (!profile) return res.status(400).json({ error: "profile required" });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = (type, payload) => res.write(`data: ${JSON.stringify({ type, ...payload })}\n\n`);

  try {
    send("step", { step:1, message:"Connecting to myscheme.gov.in portal...", icon:"🌐" });
    await new Promise(r => setTimeout(r, 700));

    send("step", { step:2, message:`Scanning ${FULL_SCHEMES.length.toLocaleString()} schemes in database...`, icon:"📂" });
    await new Promise(r => setTimeout(r, 600));

    send("step", { step:3, message:"Applying your eligibility profile to filters...", icon:"🔍" });
    const filtered = preFilter(profile);
    await new Promise(r => setTimeout(r, 500));

    send("step", { step:4, message:`${filtered.length} eligible schemes found. Running AI ranking...`, icon:"⚡" });
    await new Promise(r => setTimeout(r, 400));

    send("step", { step:5, message:"Disha is selecting your top 5 personalised schemes...", icon:"🤖" });

    if (filtered.length === 0) {
      send("done", { schemes:[], total:FULL_SCHEMES.length, filtered:0 });
      return res.end();
    }

    const candidates = filtered.slice(0, 80).map((s, i) => ({
      idx: i,
      name: s.fields.schemeName,
      short: s.fields.schemeShortTitle,
      ministry: s.fields.nodalMinistryName,
      categories: s.fields.schemeCategory,
      states: s.fields.beneficiaryState,
      tags: s.fields.tags,
      description: s.fields.briefDescription,
      slug: s.fields.slug,
      level: s.fields.level,
    }));

    const profileDesc = Object.entries(profile)
      .filter(([,v]) => v && v !== "" && !(Array.isArray(v) && v.length === 0))
      .map(([k,v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
      .join("\n");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are Disha, India's welfare scheme expert AI. Pick the 5 BEST schemes for this citizen:

PROFILE:
${profileDesc}

CANDIDATE SCHEMES (${candidates.length} total):
${candidates.map(s => `[${s.idx}] ${s.name} | ${s.tags?.slice(0,5).join(", ")} | ${(s.description||"").slice(0,120)}`).join("\n")}

Return ONLY a JSON array of exactly 5 items. No markdown fences, no explanation:
[{"idx":0,"whyRelevant":"personal reason","keyBenefit":"main benefit","urgency":"high|medium|low"}]`;

    const result = await model.generateContent(prompt);
    let txt = result.response.text().trim().replace(/^```json\s*/i,"").replace(/```\s*$/i,"").trim();

    let picks;
    try { picks = JSON.parse(txt); }
    catch { picks = candidates.slice(0,5).map((s,i) => ({ idx:i, whyRelevant:"Matches your profile.", keyBenefit:(s.description||"").slice(0,100), urgency:"medium" })); }

    const finalSchemes = picks.slice(0,5).map(pick => {
      const s = candidates[pick.idx] || candidates[0];
      return {
        id: s.slug, name: s.name, shortTitle: s.short,
        ministry: s.ministry, level: s.level,
        categories: s.categories, tags: s.tags,
        description: s.description, slug: s.slug,
        applyUrl: `https://www.myscheme.gov.in/schemes/${s.slug}`,
        whyRelevant: pick.whyRelevant,
        keyBenefit: pick.keyBenefit,
        urgency: pick.urgency || "medium",
      };
    });

    send("step", { step:6, message:"Your personalised results are ready!", icon:"✅" });
    send("done", { schemes:finalSchemes, total:FULL_SCHEMES.length, filtered:filtered.length });

  } catch(err) {
    console.error("Disha error:", err);
    send("error", { message: err.message });
  }
  res.end();
});

// /api/disha/chat — follow-up chat about found schemes (streaming)
app.post("/api/disha/chat", async (req, res) => {
  const { messages, schemes, profile } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const schemeCtx = (schemes||[]).map(s =>
      `**${s.name}**\nBenefit: ${s.keyBenefit}\nDescription: ${s.description}\nApply Online: ${s.applyUrl}\nMinistry: ${s.ministry}`
    ).join("\n\n---\n\n");

    const sys = `You are Disha, a warm and expert welfare guide from myscheme.gov.in.

The user was shown these 5 personalised schemes:
${schemeCtx}

User profile: ${JSON.stringify(profile||{})}

Rules:
- Answer questions about these schemes with specific, actionable details
- Mention required documents when relevant
- Always include the official myscheme.gov.in URL when applying
- Match the user's language (respond in Hindi if they write in Hindi)
- Use **bold** for scheme names and important info
- Use bullet points for document lists
- Be warm, encouraging, empowering`;

    const model = genAI.getGenerativeModel({ model:"gemini-2.5-flash", systemInstruction: sys });
    const history = (messages||[]).slice(0,-1).map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const lastMsg = messages[messages.length-1];
    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(lastMsg.content);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
    res.write("data: [DONE]\n\n");
  } catch(err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
  }
  res.end();
});