# Example 2 — Casual human blog voice (already human; should stay human)

Model: Groq `openai/gpt-oss-120b` · temperature 1.3 · 2026-09-27
"old" = pre-edit Chinese instruction prompt, "new" = human-style prompt now in `pipeline.js`.

## Input (ZeroGPT: 68.3%, mixed signals)

Urban gardens are popping up on rooftops all over the city, and honestly, they are doing more for the neighborhood than most city council initiatives. A friend of mine turned the gravel roof of her apartment block into a tomato and basil patch three years ago. Now the whole building shares the harvest, the kids up there learned where food actually comes from, and the top-floor apartments stay measurably cooler in summer. It cost the residents almost nothing. The city just needed to stay out of the way.

## Old prompt — ZeroGPT final: 0% "Human written"

**Step 1 — LLM rewrite → Chinese**

小花园像春雨后的竹笋一样，一个接一个地在城市屋顶上冒了出来。说实话，这些小绿洲给街区带来的好处，比市政府的那些大计划要直接得多、实在得多。

三年前，我把朋友一栋楼的光秃屋顶改成了一个小小的番茄罗勒园。现在整栋楼的居民分享收成，孩子们在实践中了解了食物从哪里来。屋顶附近的房间凉爽得多，即使夏天也是如此，舒服了不少。

居民几乎不用花什么钱。只要政府不乱插手，效果自然会显现出来。

**Step 2 — LLM rewrite → Japanese**

小さな庭園が、春の雨の後に竹が伸びるように、次々と街の屋上に生まれました。正直なところ、これらの小さな緑のオアシスが近所にもたらす恩恵は、市の大きな計画よりもはるかに即効性があり、具体的です。

三年前、私は友人の建物を砂利の屋上から小さなトマトとバジルの庭に変えました。今では建物全体の住人が収穫を分け合い、子どもたちは食べ物が実際にどこから来るのかを実践的に学んでいます。屋根近くの部屋は夏でもずっと涼しく、はるかに快適でした。

住民の費用はほとんど、あるいはまったくかかりません。政府が不必要に干渉しなければ、その効果は自然に感じられるでしょう。

**Step 3 — Google hop → Finnish**

Pienet puutarhat syntyivät yksi toisensa jälkeen kaupungin katoilla, kuin keväällä sateen jälkeen itää bambu. Rehellisesti sanottuna hyödyt, joita nämä pienet vihreät keitaat tuovat naapurustolle, ovat paljon välittömiä ja konkreettisempia kuin kaupungin suuremmat suunnitelmat.

Kolme vuotta sitten muutin ystäväni rakennuksen sorakaton pieneksi tomaatti-basilikapuutarhaksi. Nyt asukkaat koko rakennuksessa jakavat sadon, ja lapset oppivat käytännönläheisesti, mistä heidän ruokansa tulee. Huoneet lähellä kattoa olivat paljon viileämpiä, jopa kesällä, ja olivat paljon mukavampia.

Asukkailla on vähän tai ei ollenkaan kuluja. Jos hallitus ei puutu tarpeettomasti, vaikutukset näkyvät luonnollisesti.

**Step 4 — LibreTranslate hop → English (final output)**

Small gardens were born one after the other on the city roofs, as in the spring of the rain after east bamboo. To be honest, the benefits these little green oasis bring to the neighbourhood are much more immediate and concrete than the larger plans of the city.

Three years ago, I turned my friend's building into a gravel roof into a small tomato basil garden. Now the inhabitants of the entire building share the crop, and the children learn practically where their food comes from. Rooms near the roof were much cooler, even in summer, and were much nicer.

The population has little or no expense. If the government does not intervene unnecessarily, the effects will naturally be felt.

## New prompt — ZeroGPT final: 0% "Human written"

**Step 1 — LLM rewrite → Chinese**

最近，城市屋顶上的小菜园多了起来。说实话，我觉得这比市里的那些大工程实在多了。三年前，我一个朋友把自己公寓楼的水泥屋顶改成了番茄罗勒小园子。现在同住一栋楼的人都能吃上自己种的菜，连楼上的小孩都知道菜是怎么种出来的。而且顶层夏天会凉快一些。成本几乎为零，城市也不用管太多，居民就是出了点力。

**Step 2 — LLM rewrite → Japanese**

最近、街の屋上に小さな菜園が増えている。正直、市のいろいろな大型プロジェクトより、こっちのほうが具体的だと思う。三年前、友人が自分のアパートのコンクリートの屋上をトマトとバジルの小さな菜園に変えた。今では同じ家に住むみんなが自分で育てた野菜を食べられるし、上の階の子どもたちさえ、自分の食べ物がどうやってできるか知っている。さらに、最上階の部屋は夏には涼しくなる。費用はほぼゼロで、市はあまり口を出さなくていい。住民のの手間はほんの少し。

**Step 3 — Google hop → Finnish**

Viime aikoina pienet vihannespuutarhat ovat lisääntyneet kaupungin katoilla. Itse asiassa tämä on mielestäni konkreettisempi kuin kaupungin erilaiset suuret hankkeet. Kolme vuotta sitten eräs ystäväni muutti asuntonsa betonikaton tomaatti-basilikapuutarhaksi. Nyt kaikki samassa talossa asuvat voivat syödä itse kasvattamiaan vihanneksia, ja jopa yläkerran lapset tietävät, miten heidän ruokansa valmistetaan. Lisäksi ylimmän kerroksen huoneet viilenevät kesällä. Kustannukset ovat lähes nolla, eikä kaupungin tarvitse liikaa puuttua asiaan, vain vähän asukkaiden työtä.

**Step 4 — LibreTranslate hop → English (final output)**

Recently, small vegetable gardens have increased on city roofs. In fact, I think this is more concrete than the different major projects in the city. Three years ago, a friend of mine turned his apartment into a concrete roof tomato basil garden. Now everyone living in the same house can eat the vegetables they grow themselves, and even the children upstairs know how to cook their food. In addition, the rooms on the top floor will cool down in the summer. The cost is almost zero, and the city does not have to intervene too much, with little of the work of the residents.

## Quality notes

- Input is human writing; both prompts keep the final at 0% AI — no regression here.
- Old hallucinated a bamboo-rain metaphor and garbled "friend's roof" into "turned my friend's building into a gravel roof" (fundamentally nonsense phrasing that survived into the final).
- New keeps facts aligned (friend, concrete roof, cooler top floor, near-zero cost) and stays conversational.
