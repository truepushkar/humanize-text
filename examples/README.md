# Examples — full chain outputs and detector scores

Three contrasting inputs were run through the complete 4-step chain with the
same model and temperature, once with the previous rewrite prompt ("old") and
once with the current human-style prompt ("new" — the one shipped in
`pipeline.js`). Every sample was checked on ZeroGPT's public detector
(zerogpt.com), twice per sample, with identical results.

| File | What it is |
|---|---|
| [example-1.md](example-1.md) | Corporate remote-work fluff (max AI fingerprints) — all 4 steps, old vs new |
| [example-2.md](example-2.md) | Casual human blog voice — all 4 steps, old vs new |
| [example-3.md](example-3.md) | AI-formatted recipe — all 4 steps, old vs new |
| [input-texts.json](input-texts.json) | The three raw input texts |
| [raw-chain-outputs.json](raw-chain-outputs.json) | Every intermediate step (ZH/JA/FI/EN) for both prompts, machine-readable |
| [zerogpt-scores.json](zerogpt-scores.json) | ZeroGPT verdicts + test metadata and caveats |
| [RESULTS.md](RESULTS.md) | Full analysis: scores, quality axes, methodology |

## Detector scores (ZeroGPT, final English output)

| Input | Input score | Old prompt | New prompt |
|---|---|---|---|
| Remote-work fluff | 100% AI | 42.3% | **0% (Human)** |
| Rooftop-garden blog | 68.3% | 0% | **0%** |
| Masala chai recipe | 100% AI | 100% (mixed) | **56.1% (Likely Human)** |

Test conditions: Groq `openai/gpt-oss-120b`, temperature 1.3, identical
settings for both prompts; chain = EN→ZH→JA (LLM rewrites) → FI (Google) →
EN (LibreTranslate/Google fallback).
