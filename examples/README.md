# Examples — full chain outputs and detector scores

Three contrasting inputs were run through the complete 4-step chain with the
same model and temperature, across prompt versions:

- **"old"** — the original one-line Chinese instruction (翻译为…去掉AI味道，拟人化改写)
- **"v1"** — the first human-style prompt
- **"v2"** — v1 + structural AI-tell checklist from
  [blader/humanizer](https://github.com/blader/humanizer) (Wikipedia's "Signs
  of AI writing"). **This is the prompt currently shipped in `pipeline.js`.**

Every sample was checked on ZeroGPT's public detector (zerogpt.com), twice per
sample, with identical results.

| File | What it is |
|---|---|
| [example-1.md](example-1.md) | Corporate remote-work fluff (max AI fingerprints) — all 4 steps |
| [example-2.md](example-2.md) | Casual human blog voice — all 4 steps |
| [example-3.md](example-3.md) | AI-formatted recipe — all 4 steps |
| [input-texts.json](input-texts.json) | The three raw input texts |
| [raw-chain-outputs.json](raw-chain-outputs.json) | Every intermediate step, old + v1 prompts |
| [raw-chain-outputs-v2.json](raw-chain-outputs-v2.json) | Every intermediate step, v1 + v2 prompts |
| [zerogpt-scores.json](zerogpt-scores.json) | Round 1 scores (old vs v1) |
| [zerogpt-scores-v2.json](zerogpt-scores-v2.json) | Round 2 scores (v1 vs v2) |
| [RESULTS.md](RESULTS.md) | Round 1 analysis |
| [RESULTS-v2.md](RESULTS-v2.md) | Round 2 analysis |
| `t{n}_{v}_{zh,ja,fi,en}.txt` | Individual intermediate-stage text files |

## Detector scores (ZeroGPT, final English output, AI%)

| Input | Input score | Old prompt | v1 prompt | v2 prompt (current) |
|---|---|---|---|---|
| Remote-work fluff | 100% AI | 42.3% | **0% (Human)** | 0–58.3% (Likely Human) |
| Rooftop-garden blog | 68.3% | 0% | **0% (Human)** | **0% (Human)** |
| Masala chai recipe | 100% AI | 100% (mixed) | 0–63% (Likely Human) | **56.2% (Likely Human)** |

Across 12 detector runs of rewritten output, none scored 100% AI; both robotic
raw inputs scored 100% every time.

Test conditions: Groq `openai/gpt-oss-120b`, temperature 1.3, identical
settings for all prompts; chain = EN→ZH→JA (LLM rewrites) → FI (Google) →
EN (LibreTranslate/Google fallback).

## Pangram

The same samples were submitted to [pangram.com](https://www.pangram.com) —
its free check requires account creation before showing any score, so no
Pangram table is included. All intermediate texts are ready to paste manually
from the files above if you have a Pangram account.
