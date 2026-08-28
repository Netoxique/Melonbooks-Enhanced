// ==UserScript==
// @name         Melonbooks - English Heading Translator
// @namespace    local.melonbooks
// @version      1.0.4
// @description  Translate selected Melonbooks section headings from Japanese to English.
// @match        https://www.melonbooks.co.jp/*
// @match        https://melonbooks.co.jp/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
  "use strict";

  class MelonbooksEnglishHeadingTranslator {
    static version = "1.0.4";

    static selector = ".section-find, .page-headline";

    static translations = new Map([
      /*
        Product page headings
      */
      ["作品情報", "Product Information"],
      ["作品詳細", "Product Details"],
      ["特典情報", "Bonus Information"],
      ["サークル(先生)からのコメント/作品詳細", "Circle (Creator) Comments / Product Details"],
      ["スタッフのオススメポイント", "Staff Recommendation"],
      ["このレーベルの他の作品", "Other Works from This Label"],
      ["このサークルのほかの作品", "Other Works from This Circle"],
      ["関連作品", "Related Works"],
      ["よく一緒に買われている商品", "Frequently Bought Together"],
      ["ほかの人はこんな商品もチェックしています", "Other Customers Also Checked"],
      ["最近チェックした商品", "Recently Viewed Items"],
      ["店舗在庫", "Store Inventory"],
      ["店舗在庫状況", "Store Inventory Status"],

      /*
        Front page .section-find headings
      */
      ["インフォメーション", "Information"],
      ["フェア・イベント情報", "Fair & Event Information"],
      ["ピックアップ", "Featured"],
      ["総合予約ランキング", "Overall Preorder Ranking"],
      ["総合販売ランキング", "Overall Sales Ranking"],
      ["同人関連情報", "Doujin Information"],
      ["『一般同人誌』ランキング", "General Doujinshi Ranking"],
      ["『オリジナル同人誌』ランキング", "Original Doujinshi Ranking"],
      ["『サブカル同人誌』ランキング", "Subculture Doujinshi Ranking"],
      ["『成年同人誌』ランキング", "Adult Doujinshi Ranking"],
      ["『同人誌』新着作品", "New Doujinshi Releases"],
      ["『同人ソフト』新着作品", "New Doujin Software Releases"],
      ["『同人アイテム』新着作品", "New Doujin Item Releases"],
      ["コミック関連情報", "Comic Information"],
      ["『コミック』ランキング", "Comic Ranking"],
      ["『ノベル』ランキング", "Novel Ranking"],
      ["『雑誌ムック』ランキング", "Magazine/Mook Ranking"],
      ["『成年コミック』ランキング", "Adult Comic Ranking"],
      ["『コミック』新着", "New Comics"],
      ["『ノベル』新着", "New Novels"],
      ["『雑誌ムック』新着", "New Magazines/Mooks"],
      ["『成年コミック』新着", "New Adult Comics"],
      ["『ゲーム』ランキング", "Game Ranking"],
      ["『ゲーム』新着作品", "New Game Releases"],
      ["グッズ関連情報", "Goods Information"],
      ["『グッズ』ランキング", "Goods Ranking"],
      ["『グッズ』新着作品", "New Goods Releases"],
      ["『音楽』ランキング", "Music Ranking"],
      ["『音楽』新着作品", "New Music Releases"],
      ["『映像』ランキング", "Video Ranking"],
      ["『映像』新着作品", "New Video Releases"],
      ["うりぼう関連情報", "Uribou Information"],
      ["『うりぼうざっか店』ランキング", "Uribou Zakka Shop Ranking"],
      ["『うりぼうざっか店』新着作品", "New Uribou Zakka Shop Releases"],
      ["電子書籍関連情報", "E-book Information"],
      ["『同人誌(電子)』新着作品", "New Doujinshi E-book Releases"],
      ["『成年コミック(電子)』新着作品", "New Adult Comic E-book Releases"],
      ["『ダウンロード』新着作品", "New Download Releases"],
      ["『電子書籍』ランキング", "E-book Ranking"],
      ["『ダウンロード作品』ランキング", "Download Works Ranking"],
      ["あなたへのオススメ", "Recommendations for You"],
      ["お知らせ", "Notices"],
      ["【ランキング】", "Ranking"],

      /*
        Front page .page-headline headings
      */
      ["最新ランキング情報", "Latest Ranking Information"],
      ["予約開始", "Preorders Open"],
      ["新入荷", "New Arrivals"],
      ["人気キーワード", "Popular Keywords"],
      ["ジャンル", "Genre"],
      ["レーベルで探す", "Search by Label"],
      ["サークルで探す", "Search by Circle"],
      ["関連キーワードで探す", "Search by Related Keywords"],
      ["サークル新着投稿画像", "Latest Circle Posted Images"],
      ["サークル新着情報", "Latest Circle News"],
      ["特集情報", "Feature Information"]
    ]);

    static init() {
      this.translateAll(document);

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          this.translateAll(document);
        }, { once: true });
      }

      this.observeDynamicHeadings();
    }

    static normalizeText(text) {
      return String(text || "")
        .replace(/\u00a0/g, " ")
        .replace(/[ \t\r\n]+/g, " ")
        .trim();
    }

    static translateAll(root) {
      if (!root || !root.querySelectorAll) {
        return;
      }

      root.querySelectorAll(this.selector).forEach((element) => {
        this.translateElement(element);
      });
    }

    static translateElement(element) {
      if (!(element instanceof HTMLElement)) {
        return;
      }

      const japaneseText = this.normalizeText(element.textContent);

      if (!japaneseText) {
        return;
      }

      const englishText = this.translations.get(japaneseText);

      if (!englishText || japaneseText === englishText) {
        return;
      }

      this.replaceTextPreservingStructure(element, englishText);
      element.dataset.melonbooksHeadingTranslatorVersion = this.version;
      element.dataset.melonbooksHeadingTranslatorOriginal = japaneseText;
    }

    static replaceTextPreservingStructure(element, replacementText) {
      const textNodes = this.getTextNodes(element);
      const firstTextNode = textNodes.find((node) => this.normalizeText(node.nodeValue));

      if (!firstTextNode) {
        element.textContent = replacementText;
        return;
      }

      for (const node of textNodes) {
        if (node === firstTextNode) {
          node.nodeValue = this.applyOriginalSpacing(node.nodeValue, replacementText);
        } else if (this.normalizeText(node.nodeValue)) {
          node.nodeValue = "";
        }
      }
    }

    static getTextNodes(root) {
      const nodes = [];
      const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            const parent = node.parentElement;

            if (!parent) {
              return NodeFilter.FILTER_REJECT;
            }

            const tagName = parent.tagName.toLowerCase();

            if (tagName === "script" || tagName === "style" || tagName === "noscript") {
              return NodeFilter.FILTER_REJECT;
            }

            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      let node = walker.nextNode();

      while (node) {
        nodes.push(node);
        node = walker.nextNode();
      }

      return nodes;
    }

    static applyOriginalSpacing(originalText, replacementText) {
      const leadingSpace = String(originalText).match(/^\s*/)?.[0] || "";
      const trailingSpace = String(originalText).match(/\s*$/)?.[0] || "";
      return `${leadingSpace}${replacementText}${trailingSpace}`;
    }

    static observeDynamicHeadings() {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            this.handleAddedNode(node);
          }

          if (
            mutation.type === "characterData" &&
            mutation.target &&
            mutation.target.parentElement
          ) {
            const heading = mutation.target.parentElement.closest(this.selector);
            this.translateElement(heading);
          }
        }
      });

      const startObserver = () => {
        const target = document.body || document.documentElement;

        if (!target) {
          return;
        }

        observer.observe(target, {
          childList: true,
          subtree: true,
          characterData: true
        });
      };

      if (document.body || document.documentElement) {
        startObserver();
      } else {
        document.addEventListener("DOMContentLoaded", startObserver, { once: true });
      }
    }

    static handleAddedNode(node) {
      if (!(node instanceof Element)) {
        return;
      }

      if (node.matches(this.selector)) {
        this.translateElement(node);
      }

      this.translateAll(node);
    }
  }

  MelonbooksEnglishHeadingTranslator.init();
})();