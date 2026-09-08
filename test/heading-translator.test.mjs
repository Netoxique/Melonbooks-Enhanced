import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DYNAMIC_TRANSLATIONS,
  EXACT_TRANSLATIONS,
  PREFIX_TRANSLATIONS,
  TRANSLATIONS,
  translateText
} from '../src/modules/heading-translator.js';

test('Heading Translator - Dictionary reconciliation', () => {
  assert.equal(TRANSLATIONS, EXACT_TRANSLATIONS);
  assert.equal(TRANSLATIONS.get('【ランキング】'), 'Ranking');
  assert.equal(
    TRANSLATIONS.get('サークル(先生)からのコメント/作品詳細'),
    'Circle/Creator Comments and Product Details'
  );
  assert.equal(TRANSLATIONS.get('作品詳細'), 'Product Details');
  assert.equal(TRANSLATIONS.get('作品情報'), 'Product Information');
  assert.equal(TRANSLATIONS.get('店舗在庫'), 'Store Inventory');
});

test('Heading Translator - Translation logic', () => {
  assert.equal(translateText('作品情報'), 'Product Information');
  assert.equal(translateText('【ランキング】'), 'Ranking');
  assert.equal(translateText('  作品詳細  '), 'Product Details');
  assert.equal(translateText('Random Heading'), 'Random Heading');
});

test('Heading Translator - Exact recurring event translations', () => {
  const cases = [
    ['そうさくマーケット', 'Creation Market'],
    ['ぼっち・ざ・おんりー!', 'Bocchi the Only!'],
    ['ガタケットin高田', 'Gataket in Takada'],
    ['NIKKE クリエイターズ大応援祭', 'NIKKE Creators Support Festival'],
    ['イベント横断スタンプラリー', 'Cross-Event Stamp Rally'],
    ['メガMBFes TOKYO in東京流通センター(TRC)', 'Mega MBFes TOKYO in Tokyo Ryutsu Center (TRC)'],
    ['Prism Garden ― 光の庭に咲く、ひとひらの想い', 'Prism Garden - A Petal Blooming in the Garden of Light']
  ];

  for (const [input, expected] of cases) {
    assert.equal(translateText(input), expected, input);
  }
});

test('Heading Translator - Numbered recurring event translations', () => {
  assert.ok(DYNAMIC_TRANSLATIONS.length > 0);

  const cases = [
    ['コミックマーケット108', 'Comiket 108'],
    ['コミックマーケット 109', 'Comiket 109'],
    ['コミティア155', 'COMITIA 155'],
    ['関西コミティア75', 'Kansai COMITIA 75'],
    ['こみっく★トレジャー47', 'Comic Treasure 47'],
    ['こみっくトレジャー48', 'Comic Treasure 48'],
    ['博麗神社 例大祭(第23回)', 'Reitaisai 23'],
    ['第二十三回博麗神社例大祭', 'Reitaisai 23'],
    ['博麗神社秋季例大祭(第12回)', 'Autumn Reitaisai 12'],
    ['#にじそうさく11', '#Nijisousaku 11'],
    ['にじそうさく12', '#Nijisousaku 12'],
    ['せんアカ15', 'Sensei no Archive 15'],
    ['せんせーのアーカイブ16', 'Sensei no Archive 16'],
    ['僕らのラブライブ!49', 'Bokura no Love Live! 49'],
    ['歌姫庭園40-THE IDOL G@RDEN-', 'Utahime Teien 40 -THE IDOL G@RDEN-'],
    ['ふたけっと35', 'Futaket 35'],
    ['けもケット16', 'Kemoket 16'],
    ['新春けもケット12', 'New Year Kemoket 12'],
    ['ショタフェス21', 'ShotaFes 21'],
    ['文学フリマ東京41', 'Bungaku Flea Market Tokyo 41'],
    ['文学フリマ大阪13', 'Bungaku Flea Market Osaka 13'],
    ['文学フリマ福岡11', 'Bungaku Flea Market Fukuoka 11'],
    ['文学フリマ京都10', 'Bungaku Flea Market Kyoto 10'],
    ['おでかけライブin札幌160', 'Odekake Live in Sapporo 160'],
    ['仙台コミケ282', 'Sendai Comike 282'],
    ['ぷにケット53', 'Puniket 53'],
    ['ぷにケット54', 'Puniket 54']
  ];

  for (const [input, expected] of cases) {
    assert.equal(translateText(input), expected, input);
  }
});

test('Heading Translator - Year, season, and date event translations', () => {
  const cases = [
    ['スーパーヒロインタイム2026春', 'Super Heroine Time 2026 Spring'],
    ['スーパーヒロインタイム2027秋', 'Super Heroine Time 2027 Autumn'],
    ['サンシャインクリエイション2026Spring', 'Sunshine Creation 2026 Spring'],
    ['サンライズクリエイション京都2024春', 'Sunrise Creation Kyoto 2024 Spring'],
    ['TRCオンリーライブ2026 Apr.05', 'TRC Only Live 2026 Apr.05'],
    ['関西オンリーフェスタ2025 Nov.23', 'Kansai Only Festa 2025 Nov.23'],
    ['コミックライブin名古屋 ウインタースペシャル2024', 'Comic Live in Nagoya Winter Special 2024'],
    ['東方メロン2025秋', 'Touhou Melon 2025 Autumn'],
    ['TOKYO FES Jan.2026', 'TOKYO FES Jan.2026'],
    ['OSAKA FES Mar. 2026', 'OSAKA FES Mar. 2026'],
    ['VALENTINE ROSE FES 2026', 'VALENTINE ROSE FES 2026']
  ];

  for (const [input, expected] of cases) {
    assert.equal(translateText(input), expected, input);
  }
});

test('Heading Translator - Prefix translations preserve changing suffixes', () => {
  assert.ok(PREFIX_TRANSLATIONS.length > 0);

  const cases = [
    ['ヒロインMIX Apr.5', 'Heroine MIX Apr.5'],
    ['ヒロインMIX Sept.12', 'Heroine MIX Sept.12'],
    ['鎮守府フレンドシップ・デイ', 'Naval Base Friendship Day'],
    ['鎮守府フレンドシップ・デイ LAST DAY', 'Naval Base Friendship Day LAST DAY'],
    ['オリジナル同人フェスティバル2026春蘭祭', 'Original Doujin Festival 2026春蘭祭']
  ];

  for (const [input, expected] of cases) {
    assert.equal(translateText(input), expected, input);
  }
});
