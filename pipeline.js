/* HumanizeText — fully client-side port of the 4-step humanizing chain.
 *
 * Steps:
 *   1. Rewrite  input -> Chinese          (OpenAI-compatible API with your key)
 *   2. Rewrite  Chinese -> Japanese       (same)
 *   3. Google hop   Japanese -> intermediate  (clients5.google.com, no key)
 *   4. Final hop    intermediate -> target    (LibreTranslate -> Google, no key)
 *
 * Every LLM output is clamped to MAX_STEP_CHARS with a bounded retry loop
 * (MAX_REWRITE_TRIES extra attempts with an explicit length instruction),
 * then hard-truncated. No infinite loops.
 */

export const MAX_STEP_CHARS = 15000;
export const MAX_REWRITE_TRIES = 2;

const TRANSIENT = new Set([408, 429, 502, 503, 504]);

async function fetchRetry(url, opts = {}, tries = 3) {
  let lastErr;
  for (let attempt = 0; attempt <= tries; attempt++) {
    try {
      const r = await fetch(url, opts);
      if (TRANSIENT.has(r.status) && attempt < tries) {
        await new Promise(res => setTimeout(res, 1000 * 2 ** attempt));
        continue;
      }
      return r;
    } catch (e) {
      lastErr = e;
      if (attempt < tries) await new Promise(res => setTimeout(res, 1000 * 2 ** attempt));
    }
  }
  throw lastErr || new Error("network error");
}

/* ------------------------------------------------- reasoning-model cleanup */

/* Reasoning models (Qwen-3 etc.) leak <think…</think chains into content. */
export function stripThink(text) {
  let t = String(text || "");
  t = t.replace(/<think[\s\S]*?<\/think\s*>/gi, "");            // closed blocks
  t = t.replace(/<think[\s\S]*?<\/think/gi, "");                 // close tag missing '>'
  t = t.replace(/^\s*<think[\s\S]*$/i, "");                      // unclosed at start
  t = t.replace(/<\/?think\s*>?/gi, "");                         // stray tags (with/without >)
  return t.trim();
}

/* ---------------------------------------------------------------- LLM step */

export async function llmRewrite(text, targetLanguage, cfg, { history = null, lengthHint = "" } = {}) {
  const base = cfg.base_url.replace(/\/+$/, "");
  const url = base.endsWith("/chat/completions") ? base : base + "/chat/completions";
  const task = `Translate the text below into ${targetLanguage} and completely rewrite it as a real human being would write it. You are not translating a document — you are a person sitting down and writing this from scratch in your own voice, in ${targetLanguage}, after reading the original.

How a real person writes (follow ALL of these):
- Keep every piece of information. Nothing from the original may be dropped. If the original has five points, your rewrite must land all five. Never invent a fact, number, name, date or quote that is not in the original.
- Write it the way you'd actually say it to someone. Simple direct words beat fancy ones. Short punchy sentences next to longer wandering ones. Sentence lengths must vary — never uniform.
- Vary how sentences connect. Not every sentence gets a connector, not every paragraph starts with one. Real people sometimes just put two ideas next to each other.
- Use plain, natural ${targetLanguage} phrasing and idioms a native speaker would reach for. Avoid stock AI words like "delve", "landscape", "foster", "leverage", "seamless", "robust", "showcasing", "testament" and openers like "in today's world", "it is important to note", "in conclusion" — and their equivalents in ${targetLanguage}. Prefer "is/has" over inflated verbs like "serves as", "features", "boasts".
- Sound like a specific person with an opinion, not a balanced report. Where the original takes a stance, lean into it casually. Small human touches are fine: a parenthesis, a rhetorical question, "honestly", "still", "that said" — used once or twice, not sprinkled.
- Kill the strongest structural AI tells (from Wikipedia's "Signs of AI writing", maintained by WikiProject AI Cleanup):
  * No "not X but Y" constructions — including "not just / not only / not merely X, but Y", "it's not X, it's Y", the reversed "X rather than Y", the split form ("This does not mean X. It means Y."), or a clipped negative tail (", no guessing").
  * No one-line closers: a standalone sentence that just restates the paragraph before it, "That is the real win.", "Read that again.", "Let that sink in.", a stack of fragments ("No aesthetic prior. No nostalgia."), or words spaced with periods (every. single. day.).
  * No forced triads — never group ideas into threes to sound complete. Merge, develop the strongest, or vary the structure; keep three only when the meaning genuinely needs three.
  * No staged run-ups ("Let's dive in", "Here's what you need to know", "Now let's look at", "Without further ado", "Quick note") and no staged candor ("Honestly? It depends.") — remove the run-up, not just its tone.
  * No "arguing with no one" ("This isn't mainly about", "I'm not saying", "To be clear", "Don't get me wrong", "A tempting approach would be", "You might think... but") — remove the defense; if it holds a real claim, state the claim.
  * If the source uses a vague connection ("associated with", "connected to", "linked to"), either name the specific relationship the source gives or keep the vague wording — never invent a role.
  * No decorative formatting (bold on every item, title-case headings, emoji headings, horizontal rules between sections).
- Output ONLY the rewritten text in ${targetLanguage}. No preamble, no explanation, no alternatives, nothing else.`;

  const messages = [{ role: "system", content: "You are a seasoned writer and localization editor. You rewrite text so it reads like a specific real person wrote it — natural, direct, with a voice. You follow the user's instructions exactly and output only the rewritten text." }];
  if (history) {
    messages.push({ role: "user", content: task + "\n\n" + history.input });
    messages.push({ role: "assistant", content: history.output });
  }
  const userContent = lengthHint
    ? `${task}\n\nIMPORTANT: ${lengthHint}\n\n${text}`
    : `${task}\n\n${text}`;
  messages.push({ role: "user", content: userContent });

  const r = await fetchRetry(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${cfg.api_key}` },
    body: JSON.stringify({ model: cfg.model, messages, temperature: cfg.temperature }),
  });
  if (r.status === 401 || r.status === 403) throw new Error("Unauthorized — check the API key in Settings.");
  if (!r.ok) {
    let detail = "";
    try { detail = (await r.json())?.error?.message || ""; } catch {}
    throw new Error(`LLM HTTP ${r.status}: ${detail || r.statusText}`);
  }
  const d = await r.json();
  return stripThink(d.choices?.[0]?.message?.content || "").trim();
}

export async function llmRewriteClamped(text, targetLanguage, cfg, opts = {}) {
  let result = await llmRewrite(text, targetLanguage, cfg, opts);
  let tries = 0;
  while (result.length > MAX_STEP_CHARS && tries < MAX_REWRITE_TRIES) {
    tries++;
    const hint = `The previous output exceeded ${MAX_STEP_CHARS} characters. You MUST output fewer than ${MAX_STEP_CHARS} characters (aim for about ${MAX_STEP_CHARS - 1500}). You may compress, but do not cut information or truncate sentences mid-way. Output fewer than ${MAX_STEP_CHARS} characters.`;
    console.warn(`[pipeline] output ${result.length} > ${MAX_STEP_CHARS}, retrying with length cap (${tries}/${MAX_REWRITE_TRIES})`);
    result = await llmRewrite(text, targetLanguage, cfg, { ...opts, lengthHint: hint });
  }
  if (result.length > MAX_STEP_CHARS) {
    console.warn(`[pipeline] still ${result.length} chars after ${MAX_REWRITE_TRIES} retries — hard truncating`);
    result = result.slice(0, MAX_STEP_CHARS);
  }
  return result;
}

/* -------------------------------------------------------------- google hop */

export async function googleHop(text, source, target) {
  // Chrome-internal translate endpoint; returns CORS-open JSON.
  const url = `https://clients5.google.com/translate_a/single?client=gtx&sl=${encodeURIComponent(source)}&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`;
  const r = await fetchRetry(url);
  if (!r.ok) throw new Error(`Google hop HTTP ${r.status}`);
  const data = await r.json();
  out: {
    if (!Array.isArray(data?.[0])) throw new Error("Google hop: unexpected response");
  }
  return data[0].map(seg => seg?.[0] || "").join("");
}

/* ------------------------------------------------------- libretranslate */

function _splitSentences(text, maxLen) {
  const parts = text.split(/(?<=[.!?。！？])\s+/);
  const chunks = [];
  let cur = "";
  for (const p of parts) {
    if ((cur + " " + p).length > maxLen && cur) { chunks.push(cur); cur = p; }
    else cur = cur ? cur + " " + p : p;
  }
  if (cur) chunks.push(cur);
  return chunks.length ? chunks : [text];
}

/* LibreTranslate community instances. translate.disroot.org first — known org,
 * most stable — then community mirrors swept from LeakIX (all verified 200 +
 * CORS `*` + real en→fi translation in Sept 2026). libretranslate.com itself
 * is paid-key-only and only last, when a key is configured. */
const LT_INSTANCES = [
  "https://translate.disroot.org",
  "https://translate.cybertys.biz",
  "https://translate.expertys.tech",
  "https://translate.france-digital-industrie.fr",
  "https://translate.iayache.com",
  "https://translate.staikov.xyz",
  "https://translate.therman.eu",
  "https://translator.artaker.com",
  "https://tlumacz.foxior.pl",
  "https://test.translate.votre-pmi.fr",
];

function _ltKey() {
  try { return (JSON.parse(localStorage.getItem("humanizetext.settings.v1") || "{}").lt_api_key || "").trim(); }
  catch { return ""; }
}

export async function libreHop(text, source, target) {
  const key = _ltKey();
  const chunks = text.length > 1400 ? _splitSentences(text, 1400) : [text];
  const out = [];
  for (const chunk of chunks) {
    let done = null;
    const endpoints = key ? ["https://libretranslate.com", ...LT_INSTANCES] : LT_INSTANCES;
    for (const base of endpoints) {
      try {
        const r = await fetchRetry(base + "/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: chunk, source, target, format: "text", ...(key ? { api_key: key } : {}) }),
        }, 1);
        if (!r.ok) continue;
        const d = await r.json();
        if (d?.translatedText) { done = d.translatedText; break; }
      } catch { /* next instance */ }
    }
    if (done === null) return null;
    out.push(done);
  }
  return out.join(" ");
}

/* ---------------------------------------------------------------- removed engines
 *
 * MyMemory        — removed: anonymous quota (~5,000 chars/day) dies on a single
 *                   real-length text ("MYMEMORY WARNING" garbage mid-output).
 * NiuTrans        — removed earlier: requires a registered API key.
 * Lingva          — removed: every public instance is dead for programmatic use
 *                   (Cloudflare 403 / HTTP 500 on all language pairs).
 * LibreTranslate.com official — excluded by default: paid key required; community
 *                   mirrors are used instead (free, CORS-open, keyless).
 */

export async function finalHop(text, source, target) {
  // Chain: LibreTranslate -> Google (clients5).
  try {
    const viaLibre = await libreHop(text, source, target);
    if (viaLibre) return { text: viaLibre, engine: "LibreTranslate" };
  } catch { /* fall through */ }
  return { text: await googleHop(text, source, target), engine: "Google" };
}

/* ------------------------------------------------------------ full chain */

export async function runPipeline(text, cfg, { intermediate = "fi", target = "en" } = {}, onStep = () => {}) {
  const steps = [];
  const t0 = performance.now();

  onStep(1, "live");
  const step1 = await llmRewriteClamped(text, "中文", cfg, { history: null });
  steps.push({ step: 1, engine: "LLM", direction: `Input → Chinese (rewrite)`, output: step1, length: step1.length });
  onStep(1, "done", steps[0]);

  onStep(2, "live");
  const step2 = await llmRewriteClamped(step1, "日语", cfg, { history: { input: text, output: step1 } });
  steps.push({ step: 2, engine: "LLM", direction: `Chinese → Japanese (rewrite)`, output: step2, length: step2.length });
  onStep(2, "done", steps[1]);

  onStep(3, "live");
  let step3;
  try {
    step3 = { engine: "Google", output: await googleHop(step2, "ja", intermediate) };
  } catch (e) {
    console.warn("[pipeline] Google hop failed — LibreTranslate, then Google-mirror for hop 1", e);
    const libre = await libreHop(step2, "ja", intermediate).catch(() => null);
    if (libre) step3 = { engine: "LibreTranslate", output: libre };
    else step3 = { engine: "Google", output: await googleHop(step2, "en", intermediate) };
  }
  steps.push({ step: 3, engine: step3.engine, direction: `Japanese → ${intermediate.toUpperCase()} (hop 1)`, output: step3.output, length: step3.output.length });
  onStep(3, "done", steps[2]);

  onStep(4, "live");
  const step4 = await finalHop(step3.output, intermediate, target);
  steps.push({ step: 4, engine: step4.engine, direction: `${intermediate.toUpperCase()} → ${target.toUpperCase()} (hop 2)`, output: step4.text, length: step4.text.length });
  onStep(4, "done", steps[3]);

  return {
    steps,
    result: step4.text,
    elapsedMs: Math.round(performance.now() - t0),
  };
}
