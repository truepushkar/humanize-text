/* HumanizeText — fully client-side port of the 4-step humanizing chain.
 *
 * Steps:
 *   1. Rewrite  input -> Chinese          (OpenAI-compatible API with your key, or the built-in free endpoint)
 *   2. Rewrite  Chinese -> Japanese       (same)
 *   3. Google hop   Japanese -> intermediate  (clients5.google.com, no key)
 *   4. Final hop    intermediate -> target    (LibreTranslate -> Google, no key)
 *
 * Every LLM output is clamped to MAX_STEP_CHARS with a bounded retry loop
 * (MAX_REWRITE_TRIES extra attempts with an explicit length instruction),
 * then hard-truncated. No infinite loops.
 */

import { freeRewrite } from "./freeApi.js";

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
  const task = `翻译为${targetLanguage}，去掉 AI 味道，拟人化改写，只输出结果：`;

  const messages = [{ role: "system", content: "你是一个专业的文案改写专家,精通多语言本地化。" }];
  if (history) {
    messages.push({ role: "user", content: `翻译为${targetLanguage}，去掉 AI 味道，拟人化改写，只输出结果：\n${history.input}` });
    messages.push({ role: "assistant", content: history.output });
  }
  const userContent = lengthHint
    ? `${task}\n重要：${lengthHint}\n${text}`
    : `${task}\n${text}`;
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
    const hint = `上一篇输出超过了${MAX_STEP_CHARS}字符上限。必须输出少于${MAX_STEP_CHARS}个字符（最多约${MAX_STEP_CHARS - 1500}）。内容可以压缩，但不得截断语句。——必须输出少于${MAX_STEP_CHARS}个字符。`;
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

  /* FREE mode: no API key — both LLM hops go through the free Cloudflare
   * Workers AI demo chat endpoint instead of a keyed OpenAI-compatible API.
   * Steps 3 and 4 are unchanged (both keyless already). */
  const useFree = cfg?.mode === "free";

  onStep(1, "live");
  const step1 = useFree
    ? await freeRewrite(text, "中文", { temperature: cfg?.temperature ?? 1.3 })
    : await llmRewriteClamped(text, "中文", cfg, { history: null });
  steps.push({ step: 1, engine: useFree ? "Free API" : "LLM", direction: `Input → Chinese (rewrite)`, output: step1, length: step1.length });
  onStep(1, "done", steps[0]);

  onStep(2, "live");
  const step2 = useFree
    ? await freeRewrite(step1, "日语", { history: { input: text, output: step1 }, temperature: cfg?.temperature ?? 1.3 })
    : await llmRewriteClamped(step1, "日语", cfg, { history: { input: text, output: step1 } });
  steps.push({ step: 2, engine: useFree ? "Free API" : "LLM", direction: `Chinese → Japanese (rewrite)`, output: step2, length: step2.length });
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
