/* Free default rewrite endpoint — Cloudflare Workers AI demo
 * (llm-chat-app-template.templates.workers.dev). No API key needed.
 *
 * Protocol: POST { messages: [{role, content}, ...] } -> SSE stream of
 *   data: {"response":"...","p":"random-padding", "usage":{...}}
 * "p" is a random padding string the client must strip from "response"
 * (same handling as the official template frontend).
 */

const FREE_ENDPOINT = "https://llm-chat-app-template.templates.workers.dev/api/chat";
const TRANSIENT = new Set([429, 502, 503, 504]);
const sleep = ms => new Promise(res => setTimeout(res, ms));

async function freeCall(messages, tries = 2) {
  let lastErr;
  for (let attempt = 0; attempt <= tries; attempt++) {
    try {
      const r = await fetch(FREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "*/*",
        },
        body: JSON.stringify({ messages }),
      });
      if (TRANSIENT.has(r.status) && attempt < tries) {
        await sleep(1200 * 2 ** attempt);
        continue;
      }
      if (r.status === 401 || r.status === 403) {
        throw new Error("Free API rejected the request — it may be rate-limiting you. Try again later or use your own API key in Settings.");
      }
      if (!r.ok) throw new Error(`Free API HTTP ${r.status}: ${r.statusText}`);

      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let buf = "", full = "";
      outer:
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 1);
          if (!line.startsWith("data:")) continue;
          const d = line.slice(5).trim();
          if (d === "[DONE]") break outer;
          try {
            const chunk = JSON.parse(d);
            let piece = chunk.response || "";
            const p = chunk.p || "";
            if (p && piece.includes(p)) piece = piece.replace(p, "");
            full += piece;
          } catch { /* skip malformed chunk */ }
        }
      }
      const text = full.trim();
      if (!text) throw new Error("Free API returned an empty response — try again, or use your own API key in Settings.");
      return text;
    } catch (e) {
      lastErr = e;
      if (attempt < tries) await sleep(1200 * 2 ** attempt);
    }
  }
  /* Browser cross-origin failure: fetch throws TypeError("Failed to fetch")
   * when the endpoint sends no CORS headers. Give it a distinct, actionable
   * message so the UI can fall back and tell the user what to do. */
  if (lastErr instanceof TypeError) {
    const err = new Error("The free API cannot be reached from the browser (cross-origin restriction on the demo endpoint).");
    err.code = "FREE_API_UNAVAILABLE";
    throw err;
  }
  throw lastErr || new Error("Free API unreachable");
}

/* Same rewrite task as the keyed LLM path, but routed through the free endpoint. */
export async function freeRewrite(text, targetLanguage, { history = null, lengthHint = "" } = {}) {
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
  return freeCall(messages);
}
