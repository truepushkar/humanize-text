# Example 3 — AI-formatted recipe (numbered steps, formal connectors)

Model: Groq `openai/gpt-oss-120b` · temperature 1.3 · 2026-09-27
"old" = pre-edit Chinese instruction prompt, "new" = human-style prompt now in `pipeline.js`.

## Input (ZeroGPT: 100% AI)

To prepare the perfect cup of Indian masala chai, begin by gathering the following ingredients: two cups of whole milk, one cup of water, two teaspoons of loose black tea leaves, one inch of fresh ginger (grated), two green cardamom pods (crushed), one small cinnamon stick, and sugar to taste. First, combine the water and spices in a saucepan and bring the mixture to a rolling boil. Subsequently, add the tea leaves and allow them to steep for approximately two minutes. Next, introduce the milk and sugar, and simmer the concoction for an additional three to four minutes. Finally, strain the beverage into cups and serve hot. This meticulous process ensures a robust and aromatic result.

## Old prompt — ZeroGPT final: 100% "mixed signals" (flagged AI)

**Step 1 — LLM rewrite → Chinese**

先把材料备齐：全脂牛奶两杯，清水一杯，散装红茶叶两茶匙，新鲜姜一寸（擦成泥），绿豆蔻两颗（拍碎），小肉桂棒一根，糖随口味自行调。

1. 把水和姜、豆蔻、肉桂一起倒进锅里，用中火烧开，等滚沸时，香气已经开始在锅里跳舞。
2. 然后撒入红茶叶，轻轻搅拌，让茶叶在沸水里浸泡约两分钟，茶色渐浓。
3. 接着倒入牛奶，加入适量糖，改小火慢慢炖三到四分钟，让奶香与茶香充分融合。
4. 最后用过滤网把茶渣滤掉，倒进杯子，趁热享用。

这样冲出来的印度马萨拉奶茶，味道浓郁、香气四溢，保准让人回味无穷。

**Step 2 — LLM rewrite → Japanese**

まずは材料を揃えます。全脂牛乳 2 カップ、清水 1 カップ、散らした紅茶葉 大さじ2（小さじ2）、生姜 1 寸（すりおろし）、緑豆蔻 2 個（軽く砕く）、小さなシナモンスティック 1 本、そして好みで砂糖を用意してください。

1. 鍋に水、すりおろした生姜、砕いた豆蔻、シナモンスティックを入れ、中火で沸騰させます。沸騰すると同時に、香りが鍋の中で踊り出すのが感じられます。
2. 次に紅茶葉を加えて軽くかき混ぜ、約2分間沸騰させて茶色が濃くなるのを待ちます。
3. そこへ牛乳を注ぎ、好みで砂糖を加えて弱火にし、3〜4分間ゆっくりと煮込みます。牛乳のまろやかさと紅茶の香りがしっかりと融合します。
4. 最後にざるで茶葉やスパイスをこし、カップに注いで熱いうちに召し上がれ。

こうして仕上がるインド風マサラミルクティーは、濃厚で香り高く、飲んだ瞬間にやみつきになること間違いなしです。

**Step 3 — Google hop → Finnish**

Kerää ensin materiaalit. Valmista 2 kupillista täysrasvaista maitoa, 1 kuppi raikasta vettä, 2 ruokalusikallista (2 teelusikallista) ripottelevia mustaa teelehteä, 1 tuuman inkivääriä (raastettuna), 2 mungpapua (kevyesti murskattu), 1 pieni kanelitanko ja sokeria maun mukaan.

1. Laita vesi, raastettu inkivääri, murskattu tofu ja kanelitanko kattilaan ja kiehauta keskilämmöllä. Voit tuntea aromin tanssivan kattilassa sen kiehuessa.
2. Lisää seuraavaksi mustan teen lehdet, sekoita varovasti ja keitä noin 2 minuuttia, kunnes tee muuttuu tummanruskeaksi.
3. Kaada maito, lisää sokeria maun mukaan, alenna lämpöä ja keitä hiljalleen 3–4 minuuttia. Maidon täyteläisyys ja mustan teen aromi yhdistyvät täydellisesti.
4. Siivilöi lopuksi teelehdet ja mausteet siivilän läpi, kaada kuppiin ja nauti kuumana.

Tuloksena saatu intialaistyylinen masala-maitotee on rikas ja tuoksuva, ja olet varmasti riippuvainen siitä heti, kun juot sen.

**Step 4 — LibreTranslate hop → English (final output)**

First, gather the materials. Prepare 2 cups of full-fat milk, 1 cup of fresh water, 2 tablespoons (2 teaspoons) sprinkling black tea leaves, 1 inch ginger (grated), 2 mung beans (lightly crushed), 1 small cinnamon bar and sugar according to taste.

1. Place the water, grated ginger, crushed tofu and cinnamon bar in the pot and boil at medium heat. You can feel the aroma dancing in the pot while it's boiling.
2. Next add black tea leaves, mix gently and boil for about 2 minutes until the tea turns dark brown.
3. Pour the milk, add sugar according to taste, lower the heat and cook slowly for 3-4 minutes. The filling of the milk and the aroma of black tea combine perfectly.
4. Finally, sieve the leaves and spices through the sieve, pour in the cup, and enjoy hot.

The resulting Indian-style masala milk tea is rich and fragrant, and you will depend on it as soon as you drink it.

## New prompt — ZeroGPT final: **56.1% "Likely Human"**

**Step 1 — LLM rewrite → Chinese**

想泡一杯正宗的印度马萨拉茶，得先把东西备齐：两杯全脂牛奶、一杯水、两小勺散装红茶叶、一寸左右的鲜姜擦成泥，两个捣碎的绿豆蔻荚，一根小肉桂棒，糖随个人口味加。先把水和所有香料一起倒进锅里，等它翻滚沸腾时闻到那股味儿，你就知道差不多了。接下来撒进茶叶，盖上盖子闷个两分钟左右，让茶味渗进去。再把牛奶倒进去，撒点糖，转小火再炖三四分钟，别让它溢出来。最后把茶渣滤掉，倒进杯子，趁热喝，浓郁的茶香和辣味立刻在嘴里炸开，这样的茶才算是正宗。

**Step 2 — LLM rewrite → Japanese**

本格的なインドのマサラティーを作りたいなら、まずは材料をそろえるんだ。全脂牛乳が2カップ、水が1カップ、散らした紅茶葉を小さじ2杯くらい、みじん切りにした生姜を1インチほど、カルダモンのさやを2個潰したやつ、小さめのシナモンスティック1本、砂糖は好きなだけでいい。鍋に水と全部のスパイスを入れて火にかけ、沸騰して香りが漂ってきたらだいたいOK。そこへ茶葉を入れ、蓋をして2分ほど蒸らす。続いて牛乳を注ぎ、砂糖を足して弱火で3、4分ほど煮る。あふれそうになるのは避けてね。最後に茶こしで渣（こし）を除いてカップに注ぎ、熱いうちに飲む。濃厚な茶の香りとピリッとしたスパイスが口の中で一気に広がる、これが正真正銘のマサラティーだ。正直、手間はかかるけど、やってみる価値はある。

**Step 3 — Google hop → Finnish**

Jos haluat valmistaa aitoa intialaista masalateetä, kerää ensin ainekset. 2 kupillista täysrasvaista maitoa, 1 kuppi vettä, noin 2 teelusikallista ripoteltuja mustan teen lehtiä, noin tuuma hienonnettua inkivääriä, 2 murskattua kardemummapalkoa, 1 pieni kanelitanko ja niin paljon sokeria kuin haluat. Laita vesi ja kaikki mausteet kattilaan ja kuumenna. Kun se kiehuu ja voit haistaa tuoksun, on hyvä mennä. Lisää joukkoon teelehdet, peitä ja anna hautua noin 2 minuuttia. Kaada seuraavaksi maito, lisää sokeri ja keitä miedolla lämmöllä noin 3-4 minuuttia. Vältä ylivuotoa. Poista lopuksi jäännökset teesiivilällä, kaada kuppiin ja juo vielä kuumana. Tämä on aito masala-tee, jossa on rikas teen aromi ja suussa leviävät kirpeät mausteet. Rehellisesti sanottuna se vaatii paljon vaivaa, mutta se on kokeilemisen arvoinen.

**Step 4 — LibreTranslate hop → English (final output)**

If you want to make a genuine Indian masala tea, first gather the ingredients. 2 cups of full-fat milk, 1 cup of water, about 2 teaspoons of sprinkled black tea leaves, about an inch of chopped ginger, 2 crushed cardamom blocks, 1 small cinnamon bar and as much sugar as you want. Put the water and all the spices in the pot and heat up. When it boils, and you can smell it, it's good to go. Add tea leaves, cover and allow to boil for about 2 minutes. Next, pour the milk, add sugar and cook with low heat for about 3-4 minutes. Avoid overflow. Finally remove the remains with a teaspoon, pour into a cup and drink hot. This is a genuine masala tea with a rich aroma of tea and bitter spices spreading through the mouth. To be honest, it takes a lot of effort, but it's worth a try.

## Quality notes

- Old kept the AI format (numbered list) and corrupted facts mid-chain: cardamom → "mung beans" → "tofu", teaspoon/tablespoon confusion, invented "you will depend on it" ending. ZeroGPT still flagged it 100%.
- New dissolved the list into a person's spoken instructions, kept all quantities and every spice name, added a natural closing aside ("To be honest, it takes a lot of effort, but it's worth a try"). 56.1% — Likely Human.
