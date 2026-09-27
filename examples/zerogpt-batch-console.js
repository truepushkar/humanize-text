/* ZeroGPT batch via the site's own session-backed proxy endpoint.
 * Must run INSIDE the zerogpt.com page context (browser console), because the
 * backend requires the site's session cookies. Paste this whole script into the
 * console while on https://www.zerogpt.com/, then call __zgBatch().
 */

window.__zgDetect = async (input_text) => {
  const r = await fetch("https://api.zerogpt.com/api/detect/detectText", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input_text }),
    credentials: "include",
  });
  if (!r.ok) return { error: "HTTP " + r.status };
  const d = await r.json();
  const d2 = d.data || {};
  return {
    aiPercent: d2.fakePercentage ?? null,
    humanPercent: d2.isHuman ?? null,
    feedback: d2.feedback || "",
    words: d2.textWords ?? null,
    aiWords: d2.aiWords ?? null,
  };
};

window.__zgBatch = async (items) => {
  // items: [{key, text}]
  const out = [];
  for (const { key, text } of items) {
    const r = await window.__zgDetect(text);
    console.log(key, JSON.stringify(r));
    out.push({ key, ...r });
    await new Promise(res => setTimeout(res, 1500));
  }
  window.__zgOut = out;
  return out;
};
console.log("Paste the batch items array into __zgBatch([{key,text},...]) — it's already loaded after this script runs.");
