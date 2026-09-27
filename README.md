# Rehumanizer

A fully client-side, zero-backend **AI-text humanizer**. Paste machine-generated
text, and a four-step chain rewrites it until the tell-tale AI fingerprints are
scrambled — right in your browser. No server, no backend, no install: it's three
static files you can host anywhere.

**Built by [Pushkar Singh (truepushkar)](https://github.com/truepushkar) ·
Repository: <https://github.com/truepushkar/humanize-text>**

## How it works

Four passes, two hands. Each pass scrambles whatever AI fingerprints survived
the previous one:

1. **LLM rewrite** — input → Chinese (any OpenAI-compatible endpoint, your key)
2. **LLM rewrite** — Chinese → Japanese (same)
3. **Google Translate hop** — Japanese → intermediate (keyless)
4. **LibreTranslate hop** — intermediate → target, with a Google fallback (keyless)

LLM outputs are clamped to 15,000 chars per step: on overflow the model is
re-prompted with an explicit length requirement (max 2 retries), then
hard-truncated. Reasoning-model `<think` leakage is stripped from every LLM
response.

## Quick start

```bash
# any static file server works
python -m http.server 8080
# open http://localhost:8080
```

or host the folder as-is on GitHub Pages / Cloudflare Pages / Netlify (free).

1. Open **Settings**, pick a provider preset (DeepSeek, OpenRouter, OpenAI,
   Groq, …) or enter any OpenAI-compatible base URL.
2. Paste your API key — it stays in your browser's `localStorage` and is sent
   only to the endpoint you configure.
3. Back on the Workbench, paste AI text, press **Humanize**, and watch the
   four-step chain light up.

## Where things live

| Concern | Where |
|---|---|
| 4-step chain logic | `pipeline.js` |
| Workbench UI, history, diff, step trace | `index.html` |
| Settings (provider presets, model browser, key) | `settings.html` |
| Settings + run history | your browser's `localStorage` |
| API key | your browser only — sent solely to the base URL you configure |

## Features

- **Workbench UI** — live chain visualization, per-step trace with expandable
  intermediate output, input→output diff view, copy / download / re-run.
- **Provider presets + model browser** — fetches the `/models` list from your
  endpoint so you can pick a model from a dropdown instead of typing its ID.
- **History & stats** — past runs (up to 60) stored locally with full step
  traces; reopen or delete any of them.
- **Multi-language output** — intermediate hop is Finnish by default (deepest
  restructuring); German and Korean optional; 10 output languages.
- **Resilient chain** — transient-error retry with exponential backoff,
  LibreTranslate community-mirror fallback, sentence-chunked translation,
  dark/light/auto theme.
- **Zero telemetry** — nothing leaves your browser except your configured LLM
  endpoint and the keyless public translation endpoints.

## Notes & limitations

- Serve over `http://` or `https://` — ES modules don't load from `file://`.
- Free LibreTranslate mirrors and Google's keyless endpoint are rate-limited
  per IP; failures fall through the fallback chain automatically.
- Detector scores are probabilistic — no guarantee rewritten text will read as
  human. Follow your institution's AI-use and disclosure policies.

## License

Released under the [MIT License](LICENSE).

---
Made by [Pushkar Singh](https://github.com/truepushkar) ·
humanize-text · 2026
