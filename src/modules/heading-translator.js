/**
 * Module: Heading Translator
 * Translates Japanese section headings across Melonbooks to English.
 */

const HEADING_SELECTOR = '.section-find, .page-headline, .title-h2, h2.title';

const SEASON_TRANSLATIONS = new Map([
  ['春', 'Spring'],
  ['夏', 'Summer'],
  ['秋', 'Autumn'],
  ['冬', 'Winter']
]);

const LITERARY_FLEA_MARKET_LOCATIONS = new Map([
  ['東京', 'Tokyo'],
  ['大阪', 'Osaka'],
  ['福岡', 'Fukuoka'],
  ['京都', 'Kyoto']
]);

const KANJI_DIGITS = new Map([
  ['〇', 0],
  ['零', 0],
  ['一', 1],
  ['二', 2],
  ['三', 3],
  ['四', 4],
  ['五', 5],
  ['六', 6],
  ['七', 7],
  ['八', 8],
  ['九', 9]
]);

const KANJI_UNITS = new Map([
  ['十', 10],
  ['百', 100],
  ['千', 1000]
]);

export const EXACT_TRANSLATIONS = new Map([
  /* Product page headings */
  ['作品情報', 'Product Information'],
  ['作品詳細', 'Product Details'],
  ['特典情報', 'Bonus Information'],
  ['サークル(先生)からのコメント/作品詳細', 'Circle/Creator Comments and Product Details'],
  ['スタッフのオススメポイント', 'Staff Recommendation'],
  ['このレーベルの他の作品', 'Other Works from This Label'],
  ['このサークルのほかの作品', 'Other Works from This Circle'],
  ['関連作品', 'Related Works'],
  ['よく一緒に買われている商品', 'Frequently Bought Together'],
  ['ほかの人はこんな商品もチェックしています', 'Other Customers Also Checked'],
  ['最近チェックした商品', 'Recently Viewed Items'],
  ['店舗在庫', 'Store Inventory'],
  ['店舗在庫状況', 'Store Inventory Status'],

  /* Front page .section-find headings */
  ['インフォメーション', 'Information'],
  ['フェア・イベント情報', 'Fair & Event Information'],
  ['ピックアップ', 'Featured'],
  ['総合予約ランキング', 'Overall Preorder Ranking'],
  ['総合販売ランキング', 'Overall Sales Ranking'],
  ['同人関連情報', 'Doujin Information'],
  ['『一般同人誌』ランキング', 'General Doujinshi Ranking'],
  ['『オリジナル同人誌』ランキング', 'Original Doujinshi Ranking'],
  ['『サブカル同人誌』ランキング', 'Subculture Doujinshi Ranking'],
  ['『成年同人誌』ランキング', 'Adult Doujinshi Ranking'],
  ['『同人誌』新着作品', 'New Doujinshi Releases'],
  ['『同人ソフト』新着作品', 'New Doujin Software Releases'],
  ['『同人アイテム』新着作品', 'New Doujin Item Releases'],
  ['コミック関連情報', 'Comic Information'],
  ['『コミック』ランキング', 'Comic Ranking'],
  ['『ノベル』ランキング', 'Novel Ranking'],
  ['『雑誌ムック』ランキング', 'Magazine/Mook Ranking'],
  ['『成年コミック』ランキング', 'Adult Comic Ranking'],
  ['『コミック』新着', 'New Comics'],
  ['『ノベル』新着', 'New Novels'],
  ['『雑誌ムック』新着', 'New Magazines/Mooks'],
  ['『成年コミック』新着', 'New Adult Comics'],
  ['『ゲーム』ランキング', 'Game Ranking'],
  ['『ゲーム』新着作品', 'New Game Releases'],
  ['グッズ関連情報', 'Goods Information'],
  ['『グッズ』ランキング', 'Goods Ranking'],
  ['『グッズ』新着作品', 'New Goods Releases'],
  ['『音楽』ランキング', 'Music Ranking'],
  ['『音楽』新着作品', 'New Music Releases'],
  ['『映像』ランキング', 'Video Ranking'],
  ['『映像』新着作品', 'New Video Releases'],
  ['うりぼう関連情報', 'Uribou Information'],
  ['『うりぼうざっか店』ランキング', 'Uribou Zakka Shop Ranking'],
  ['『うりぼうざっか店』新着作品', 'New Uribou Zakka Shop Releases'],
  ['電子書籍関連情報', 'E-book Information'],
  ['『同人誌(電子)』新着作品', 'New Doujinshi E-book Releases'],
  ['『成年コミック(電子)』新着作品', 'New Adult Comic E-book Releases'],
  ['『ダウンロード』新着作品', 'New Download Releases'],
  ['『電子書籍』ランキング', 'E-book Ranking'],
  ['『ダウンロード作品』ランキング', 'Download Works Ranking'],
  ['あなたへのオススメ', 'Recommendations for You'],
  ['お知らせ', 'Notices'],
  ['【ランキング】', 'Ranking'],

  /* Front page .page-headline headings */
  ['最新ランキング情報', 'Latest Ranking Information'],
  ['予約開始', 'Preorders Open'],
  ['新入荷', 'New Arrivals'],
  ['人気キーワード', 'Popular Keywords'],
  ['ジャンル', 'Genre'],
  ['レーベルで探す', 'Search by Label'],
  ['サークルで探す', 'Search by Circle'],
  ['関連キーワードで探す', 'Search by Related Keywords'],
  ['サークル新着投稿画像', 'Latest Circle Posted Images'],
  ['サークル新着情報', 'Latest Circle News'],
  ['特集情報', 'Feature Information'],

  /* Recurring event headings with stable names */
  ['そうさくマーケット', 'Creation Market'],
  ['ぼっち・ざ・おんりー!', 'Bocchi the Only!'],
  ['ガタケットin高田', 'Gataket in Takada'],
  ['NIKKE クリエイターズ大応援祭', 'NIKKE Creators Support Festival'],
  ['イベント横断スタンプラリー', 'Cross-Event Stamp Rally'],
  ['メガMBFes TOKYO in東京流通センター(TRC)', 'Mega MBFes TOKYO in Tokyo Ryutsu Center (TRC)'],
  ['Prism Garden ― 光の庭に咲く、ひとひらの想い', 'Prism Garden - A Petal Blooming in the Garden of Light']
]);

// Backward-compatible export used by existing tests and callers.
export const TRANSLATIONS = EXACT_TRANSLATIONS;

function japaneseNumeralToNumber(value) {
  let total = 0;
  let current = 0;

  for (const char of String(value || '')) {
    if (KANJI_DIGITS.has(char)) {
      current = (current * 10) + KANJI_DIGITS.get(char);
      continue;
    }

    const unit = KANJI_UNITS.get(char);
    if (!unit) return null;

    total += (current || 1) * unit;
    current = 0;
  }

  return total + current;
}

function translateSeason(season) {
  return SEASON_TRANSLATIONS.get(season) || season;
}

function appendSuffix(base, suffix) {
  const trimmed = String(suffix || '').trim();
  return trimmed ? `${base} ${trimmed}` : base;
}

export const DYNAMIC_TRANSLATIONS = [
  { pattern: /^コミックマーケット\s*(\d+)$/u, replace: (_match, number) => `Comiket ${number}` },
  { pattern: /^コミティア\s*(\d+)$/u, replace: (_match, number) => `COMITIA ${number}` },
  { pattern: /^関西コミティア\s*(\d+)$/u, replace: (_match, number) => `Kansai COMITIA ${number}` },
  { pattern: /^こみっく(?:★)?トレジャー\s*(\d+)$/u, replace: (_match, number) => `Comic Treasure ${number}` },
  {
    pattern: /^博麗神社\s*例大祭\s*[（(]\s*第\s*(\d+)\s*回\s*[）)]$/u,
    replace: (_match, number) => `Reitaisai ${number}`
  },
  {
    pattern: /^第([〇零一二三四五六七八九十百千]+)回博麗神社例大祭$/u,
    replace: (_match, number) => `Reitaisai ${japaneseNumeralToNumber(number)}`
  },
  {
    pattern: /^博麗神社秋季例大祭\s*[（(]\s*第\s*(\d+)\s*回\s*[）)]$/u,
    replace: (_match, number) => `Autumn Reitaisai ${number}`
  },
  { pattern: /^#?にじそうさく\s*(\d+)$/u, replace: (_match, number) => `#Nijisousaku ${number}` },
  { pattern: /^せんアカ\s*(\d+)$/u, replace: (_match, number) => `Sensei no Archive ${number}` },
  { pattern: /^せんせーのアーカイブ\s*(\d+)$/u, replace: (_match, number) => `Sensei no Archive ${number}` },
  { pattern: /^僕らのラブライブ!\s*(\d+)$/u, replace: (_match, number) => `Bokura no Love Live! ${number}` },
  {
    pattern: /^歌姫庭園\s*(\d+)(.*)$/u,
    replace: (_match, number, suffix) => appendSuffix(`Utahime Teien ${number}`, suffix)
  },
  { pattern: /^ふたけっと\s*(\d+)$/u, replace: (_match, number) => `Futaket ${number}` },
  { pattern: /^けもケット\s*(\d+)$/u, replace: (_match, number) => `Kemoket ${number}` },
  { pattern: /^新春けもケット\s*(\d+)$/u, replace: (_match, number) => `New Year Kemoket ${number}` },
  { pattern: /^ショタフェス\s*(\d+)$/u, replace: (_match, number) => `ShotaFes ${number}` },
  {
    pattern: /^文学フリマ(東京|大阪|福岡|京都)\s*(\d+)$/u,
    replace: (_match, location, number) => `Bungaku Flea Market ${LITERARY_FLEA_MARKET_LOCATIONS.get(location)} ${number}`
  },
  { pattern: /^おでかけライブin札幌\s*(\d+)$/u, replace: (_match, number) => `Odekake Live in Sapporo ${number}` },
  { pattern: /^仙台コミケ\s*(\d+)$/u, replace: (_match, number) => `Sendai Comike ${number}` },
  { pattern: /^ぷにケット\s*(\d+)$/u, replace: (_match, number) => `Puniket ${number}` },

  /* Year, season, and date based recurring events */
  {
    pattern: /^スーパーヒロインタイム\s*(\d{4})\s*([春夏秋冬])$/u,
    replace: (_match, year, season) => `Super Heroine Time ${year} ${translateSeason(season)}`
  },
  {
    pattern: /^サンシャインクリエイション\s*(\d{4})\s*(Spring|Summer|Autumn|Winter)$/u,
    replace: (_match, year, season) => `Sunshine Creation ${year} ${season}`
  },
  {
    pattern: /^サンライズクリエイション京都\s*(\d{4})\s*([春夏秋冬])$/u,
    replace: (_match, year, season) => `Sunrise Creation Kyoto ${year} ${translateSeason(season)}`
  },
  {
    pattern: /^TRCオンリーライブ\s*(\d{4})(.*)$/u,
    replace: (_match, year, suffix) => appendSuffix(`TRC Only Live ${year}`, suffix)
  },
  {
    pattern: /^関西オンリーフェスタ\s*(\d{4})(.*)$/u,
    replace: (_match, year, suffix) => appendSuffix(`Kansai Only Festa ${year}`, suffix)
  },
  {
    pattern: /^コミックライブin名古屋\s*ウインタースペシャル\s*(\d{4})$/u,
    replace: (_match, year) => `Comic Live in Nagoya Winter Special ${year}`
  },
  {
    pattern: /^東方メロン\s*(\d{4})\s*([春夏秋冬])$/u,
    replace: (_match, year, season) => `Touhou Melon ${year} ${translateSeason(season)}`
  },

  /* Already-English recurring event names are normalized and passed through. */
  { pattern: /^TOKYO FES\s+(.+)$/u, replace: (_match, suffix) => `TOKYO FES ${suffix}` },
  { pattern: /^OSAKA FES\s+(.+)$/u, replace: (_match, suffix) => `OSAKA FES ${suffix}` },
  { pattern: /^VALENTINE ROSE FES\s+(\d{4})$/u, replace: (_match, year) => `VALENTINE ROSE FES ${year}` }
];

export const PREFIX_TRANSLATIONS = [
  { prefix: 'ヒロインMIX', replacement: 'Heroine MIX' },
  { prefix: '鎮守府フレンドシップ・デイ', replacement: 'Naval Base Friendship Day' },
  { prefix: 'オリジナル同人フェスティバル', replacement: 'Original Doujin Festival', separator: ' ' }
];

export function normalizeText(text) {
  return String(text || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t\r\n]+/g, ' ')
    .trim();
}

export function translateText(text) {
  const norm = normalizeText(text);
  if (!norm) return text;

  if (EXACT_TRANSLATIONS.has(norm)) {
    return EXACT_TRANSLATIONS.get(norm);
  }

  for (const rule of DYNAMIC_TRANSLATIONS) {
    const match = norm.match(rule.pattern);
    if (match) {
      return rule.replace(...match);
    }
  }

  for (const rule of PREFIX_TRANSLATIONS) {
    if (!norm.startsWith(rule.prefix)) continue;

    const suffix = norm.slice(rule.prefix.length);
    const separator = rule.separator && suffix && !/^\s/u.test(suffix) ? rule.separator : '';
    return `${rule.replacement}${separator}${suffix}`;
  }

  return text;
}

function getTextNodes(root) {
  const nodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tagName = parent.tagName.toLowerCase();
      if (tagName === 'script' || tagName === 'style' || tagName === 'noscript') {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  let node = walker.nextNode();
  while (node) {
    nodes.push(node);
    node = walker.nextNode();
  }
  return nodes;
}

function applyOriginalSpacing(originalText, replacementText) {
  const leadingSpace = String(originalText).match(/^\s*/)?.[0] || '';
  const trailingSpace = String(originalText).match(/\s*$/)?.[0] || '';
  return `${leadingSpace}${replacementText}${trailingSpace}`;
}

function replaceTextPreservingStructure(element, replacementText) {
  const textNodes = getTextNodes(element);
  const firstTextNode = textNodes.find((node) => normalizeText(node.nodeValue));

  if (!firstTextNode) {
    element.textContent = replacementText;
    return;
  }

  for (const node of textNodes) {
    if (node === firstTextNode) {
      node.nodeValue = applyOriginalSpacing(node.nodeValue, replacementText);
    } else if (normalizeText(node.nodeValue)) {
      node.nodeValue = '';
    }
  }
}

function translateElement(element) {
  if (!(element instanceof HTMLElement)) return;

  const japaneseText = normalizeText(element.textContent);
  if (!japaneseText) return;

  const englishText = translateText(japaneseText);
  if (!englishText || japaneseText === englishText) return;

  replaceTextPreservingStructure(element, englishText);
  element.dataset.melonbooksHeadingTranslatorOriginal = japaneseText;
}

function translateAll(root) {
  if (!root || !root.querySelectorAll) return;
  root.querySelectorAll(HEADING_SELECTOR).forEach((el) => translateElement(el));
}

export const HeadingTranslatorModule = {
  id: 'heading-translator',
  name: 'Heading Translator',
  lifecycle: 'document-start',

  matches(context) {
    return context.isMelonbooks;
  },

  init() {
    translateAll(document);

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        translateAll(document);
      }, { once: true });
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) {
            if (node.matches(HEADING_SELECTOR)) {
              translateElement(node);
            }
            translateAll(node);
          }
        }

        if (mutation.type === 'characterData' && mutation.target && mutation.target.parentElement) {
          const heading = mutation.target.parentElement.closest(HEADING_SELECTOR);
          if (heading) {
            translateElement(heading);
          }
        }
      }
    });

    const startObserver = () => {
      const target = document.body || document.documentElement;
      if (target) {
        observer.observe(target, {
          childList: true,
          subtree: true,
          characterData: true
        });
      }
    };

    if (document.body || document.documentElement) {
      startObserver();
    } else {
      document.addEventListener('DOMContentLoaded', startObserver, { once: true });
    }
  }
};
