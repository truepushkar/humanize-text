# Humanize Text

A fully client-side, zero-backend **AI-text humanizer**. Paste machine-generated
text, and a four-step chain rewrites it until the tell-tale AI fingerprints are
scrambled — right in your browser. No server, no backend, no install: it's four
static files you can host anywhere. Bring your own API key; fully mobile-friendly.

**Built by [Pushkar Singh (truepushkar)](https://github.com/truepushkar) ·
Repository: <https://github.com/truepushkar/humanize-text>**

## Why single-pass paraphrasers fail, and why languages-then-translation works

Most "AI humanizers" are single-pass paraphrasers: they ask an LLM to "make this
sound human" and return the result. That approach has a structural flaw — the
output is still a *paraphrase of AI text*, produced inside the same token
distribution that produced the fingerprints in the first place. Stylometric
detectors don't score "did a human push the button"; they score distributional
regularities (burstiness, lexical diversity, syntactic templating), and a
one-shot rewrite preserves most of them.

Humanize Text attacks the distribution directly by treating the text as an
object to be *transformed repeatedly through languages*, not paraphrased once.
Each pass is a *lossy projection*: Chinese forces the syntax to collapse
(articles gone, clause order rebuilt), Japanese re-frames polarity and
subjecthood, Finnish drags the text through a Uralic structure with almost no
shared Latinate vocabulary. Whatever robotic regularity survives one pass gets
scrambled by the next. The final hop back to English (or 9 other targets) is the
only place the text is "reassembled" — and by then it no longer sits in the
original model's output distribution.

The two LLM passes are not translations. The rewrite prompt (see
[`pipeline.js`](pipeline.js), `llmRewrite`) instructs the model to write like a
specific person: keep every point but break the symmetry between them, vary
sentence length, prefer plain verbs, drop AI-formula vocabulary ("delve",
"landscape", "moreover", "plays a crucial role"…), allow small human hedges,
no markdown, ±15% of the original length.

## Does it measure up? ZeroGPT A/B results

Three contrasting inputs were run through the identical 4-step chain with the
same model and temperature (Groq `openai/gpt-oss-120b`, temp 1.3), once with the
old one-line paraphrase prompt and once with the current human-style prompt,
then the final English output was scored on **ZeroGPT** (public checker, run
twice per sample for reliability). Full step-by-step outputs:
[`examples/`](examples/).

| Input style | Input score | Old prompt | Human-style prompt |
|---|---|---|---|
| Corporate AI fluff | 100% AI | 42.3% | **0% — Human** |
| Casual blog | 68.3% mixed | 0% | **0% — Human** |
| AI-formatted recipe | 100% AI | 100% (mixed) | **56.1% — Likely Human** |

Judged on the five axes that matter for human-likeness — information
completeness (all facts preserved), language fluency, style adaptability,
readability, and creativity/impact — the human-style prompt improved or held on
every sample; the gains are largest exactly where the input is most robotic.

> **Caveat, stated plainly.** AI detectors are probabilistic and biased (non-
> English text confuses them — ZeroGPT in our tests returned meaningless "0%"
> labels on the Chinese intermediate stage). A low score on one checker is
> evidence, not proof, and this tool exists for style transformation, not for
> deceiving people about authorship. Follow your institution's AI-use and
> disclosure policies.

## How it works (implementation)

Four passes, two hands. Each pass scrambles whatever AI fingerprints survived
the previous one:

1. **Rewrite** — input → Chinese (your own API key)
2. **Rewrite** — Chinese → Japanese (same)
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

1. Paste AI text and press **Humanize**.
2. Open **Settings**: pick a provider preset (DeepSeek, OpenRouter, OpenAI,
   Groq, …) or any OpenAI-compatible base URL, paste your key — it stays in
   your browser's `localStorage` and is sent only to the endpoint you
   configure.

## Where things live

| Concern | Where |
|---|---|
| `pipeline.js` | 4-step chain logic + human-style rewrite prompt |
| Workbench UI, history, diff, step trace | `index.html` |
| Settings (provider presets, model browser, key) | `settings.html` |
| Settings + run history | your browser's `localStorage` |
| API key | your browser only — sent solely to the base URL you configure |
| A/B test evidence, full chain outputs, ZeroGPT scores | [`examples/`](examples/) |

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
- **Mobile-friendly** — responsive workbench and settings pages for phones and
  small screens.
- **Zero telemetry** — nothing leaves your browser except your configured LLM
  endpoint and the keyless public translation endpoints.

## Notes & limitations

- Serve over `http://` or `https://` — ES modules don't load from `file://`.
- Free LibreTranslate mirrors and Google's keyless endpoint are rate-limited
  per IP; failures fall through the fallback chain automatically.
- Intermediate steps intentionally distort wording; quantity units and rare
  nouns are the details most likely to drift (see `examples/example-3.md`).
- Detector evasion is not guaranteed and not stable across detectors or model
  updates; treat every score as a snapshot, not a promise.
- Detector scores are probabilistic — no guarantee rewritten text will read as
  human. Follow your institution's AI-use and disclosure policies.

## License

Released under the [MIT License](LICENSE).

---
Made by [Pushkar Singh](https://github.com/truepushkar) ·
humanize-text · 2026
