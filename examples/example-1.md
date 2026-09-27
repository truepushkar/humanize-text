# Example 1 — Corporate remote-work fluff (maximum AI fingerprints)

Model: Groq `openai/gpt-oss-120b` · temperature 1.3 · 2026-09-27
"old" = pre-edit Chinese instruction prompt, "new" = human-style prompt now in `pipeline.js`.

## Input (ZeroGPT: 100% AI)

Remote work has fundamentally transformed the modern workplace landscape. Furthermore, it is important to note that organizations across various industries are increasingly leveraging flexible arrangements in order to foster enhanced productivity. In today's fast-paced world, the ability to collaborate seamlessly across time zones plays a crucial role in driving innovation. Moreover, companies that embrace robust remote-first strategies are able to delve into global talent pools, unlocking significant competitive advantages.

## Old prompt — ZeroGPT final: 42.3% "Likely Human"

**Step 1 — LLM rewrite → Chinese**

远程办公已经彻底改变了现代职场的面貌。我们看到，各行各业的企业正越来越倾向于采用灵活的工作安排，以提升整体效率。在这个节奏飞快的时代，跨时区的无缝协作已成为推动创新的关键因素。而那些把远程工作放在首位的公司，则能够深入全球人才库，获取显著的竞争优势。

**Step 2 — LLM rewrite → Japanese**

リモートワークはすでに現代の職場の姿を大きく変えました。私たちは、さまざまな業界の企業が柔軟な働き方をどんどん取り入れているのを見ています。このテンポの速い時代において、異なるタイムゾーンをまたぐシームレスな協力は、イノベーションを推進する鍵となっています。そして、リモートワークを最優先する会社は、世界的な人材プールに深く入り込み、大きな競争上の優位性を獲得することができるのです。

**Step 3 — Google hop → Finnish**

Etätyö on jo muuttanut nykyaikaisen työpaikan perusteellisesti. Näemme eri toimialoilla yritysten omaksuvan joustavan työskentelyn yleisen tehokkuuden lisäämiseksi. Tällä nopeatempoisella aikakaudella saumaton yhteistyö eri aikavyöhykkeillä on innovaation avain. Ja yritykset, jotka asettavat etätyön etusijalle, voivat päästä syvemmälle globaaliin kykyyn ja saada selkeää kilpailuetua.

**Step 4 — LibreTranslate hop → English (final output)**

Remote work has already radically changed the modern job. We see companies in different sectors adopting flexible work to increase overall efficiency. In this fast-paced age, seamless cooperation in different time zones is the key to innovation. And companies that give priority to telework can gain deeper global ability and have a clear competitive advantage.

## New prompt — ZeroGPT final: **0% "Human written"**

**Step 1 — LLM rewrite → Chinese**

远程工作已经彻底改变了我们上班的方式。现在各行各业的公司都在尝试弹性安排，想借此提升效率。跨时区一起合作——说实话，这对创新挺有帮助的。那些把远程放在第一位的企业，能把目光投向全球人才库，抢到不少竞争优势。

**Step 2 — LLM rewrite → Japanese**

在宅勤務はもう、私たちの働き方を根っから変えてしまった。今はどの業界でも、フレキシブルな勤務体系を試す会社が増えている。時差を越えて一緒に仕事をする——正直、これはイノベーションにけっこう効いてくる。リモートを第一に置く企業は、世界中の人材に目を向けられるから、かなりの競争優位をさらっていける。

**Step 3 — Google hop → Finnish**

On totta, että etätyö on muuttanut perinpohjaisesti tapaamme työskennellä. Yhä useammat yritykset eri toimialoilla ottavat nyt käyttöön joustavia aikatauluja. Rehellisesti sanottuna ympäristöllä, jossa ihmiset voivat tehdä yhteistyötä aikaerojen yli, on suuri vaikutus innovaatioiden edistämiseen. Etätyötä etusijalle asettavat yritykset voivat saada valtavan kilpailuedun keskittymällä kykyihin ympäri maailmaa.

**Step 4 — LibreTranslate hop → English (final output)**

It is true that teleworking has radically changed our way of working. More and more companies in different sectors are now introducing flexible timetables. To be honest, an environment in which people can cooperate over time differences has a major impact on the promotion of innovation. Companies that give priority to telework can gain a huge competitive advantage by focusing on talent around the world.

## Quality notes

- Old: every point kept but the register stays corporate; 42.3% AI.
- New: same four points, conversational register survives the whole chain ("To be honest", dash insert), 0% AI.
