/* Free default rewrite endpoint — your Cloudflare Worker proxy to
 * Cloudflare Workers AI (@cf/meta/llama-3.1-8b-instruct-fp8).
 * OpenAI-compatible JSON, CORS-open (Access-Control-Allow-Origin: *),
 * no API key needed. Rate limits apply; quality is below a paid LLM —
 * the UI nudges users toward their own API key for better rewrites.
 */

const FREE_ENDPOINT = "https://llama.pushkarsingh4343.workers.dev/v1/chat/completions";
const FREE_MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8";
const TRANSIENT = new Set([429, 502, 503, 504]);
const sleep = ms => new Promise(res => setTimeout(res, ms));

async function freeCall(messages, { temperature = 1.3, max_tokens = 16384 } = {}, tries = 2) {
  let lastErr;
  for (let attempt = 0; attempt <= tries; attempt++) {
    try {
      const r = await fetch(FREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: FREE_MODEL,
          messages,
          stream: false,
          max_tokens,
          temperature,
        }),
      });
      if (TRANSIENT.has(r.status) && attempt < tries) {
        await sleep(1200 * 2 ** attempt);
        continue;
      }
      if (r.status === 429) throw new Error("Free API rate limit hit — wait a moment and retry, or use your own API key in Settings.");
      if (r.status === 401 || r.status === 403) throw new Error("Free API rejected the request. Try again later or use your own API key in Settings.");
      if (!r.ok) throw new Error(`Free API HTTP ${r.status}: ${r.statusText}`);

      const d = await r.json();
      if (d.choices?.[0]?.finish_reason === "length") {
        throw new Error("Free API output hit the token limit and was truncated — try shorter text, or use your own API key in Settings.");
      }
      const text = (d.choices?.[0]?.message?.content || "").trim();
      if (!text) throw new Error("Free API returned an empty response — try again, or use your own API key in Settings.");
      return text;
    } catch (e) {
      lastErr = e;
      if (attempt < tries) await sleep(1200 * 2 ** attempt);
    }
  }
  /* Browser cross-origin failure: fetch throws TypeError("Failed to fetch")
   * when the endpoint sends no CORS headers. Distinct, actionable message
   * so the UI can auto-fall back to the keyed path. */
  if (lastErr instanceof TypeError) {
    const err = new Error("The free API cannot be reached right now (network or cross-origin restriction).");
    err.code = "FREE_API_UNAVAILABLE";
    throw err;
  }
  throw lastErr || new Error("Free API unreachable");
}

/* Same rewrite task as the keyed LLM path, but routed through the free endpoint.
 * temperature follows the user's Settings value (default 1.3, the tested sweet spot). */
export async function freeRewrite(text, targetLanguage, { history = null, lengthHint = "", temperature = 1.3 } = {}) {
  const task = `翻译为${targetLanguage}，去掉 AI 味道，拟人化改写，只输出结果：`;
  const messages = [{ role: "system", content: "你是一个专业的文案改写专家,精通多语言本地化。" }];
  if (history) {
    messages.push({ role: "user", content: `${task}\n${history.input}` });
    messages.push({ role: "assistant", content: history.output });
  }
  messages.push({
    role: "user",
    content: lengthHint ? `${task}\n重要：${lengthHint}\n${text}` : `${task}\n${text}`,
  });
  return freeCall(messages, { temperature });
}
