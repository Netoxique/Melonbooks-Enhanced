// ==UserScript==
// @name         Melonbooks - Product Page Favorite Author Remover
// @namespace    local.melonbooks
// @version      1.0.3
// @description  Allows author heart buttons on Melonbooks product pages to add or remove authors from favorites with status notifications.
// @match        https://www.melonbooks.co.jp/detail/*
// @match        https://melonbooks.co.jp/detail/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
  "use strict";

  class MelonbooksProductFavoriteAuthorRemover {
    static version = "1.0.3";

    static favoriteAuthorPagePath = "/mypage/favorite_author.php";
    static buttonSelector = "a.favorite_author.fav-button-short__icon";
    static maxScanPages = 50;
    static pageFetchBatchSize = 4;
    static requestTimeoutMs = 15000;
    static busyAttribute = "data-mb-author-favorite-busy";
    static busyClass = "mb-author-favorite-busy";
    static toastId = "mb-author-favorite-toast";

    static authorCache = new Map();
    static toastTimer = null;

    static init() {
      this.installStyles();
      document.addEventListener(
        "click",
        (event) => this.handleClick(event),
        true
      );

      if (document.readyState === "loading") {
        document.addEventListener(
          "DOMContentLoaded",
          () => this.markButtons(),
          {
            once: true,
          }
        );
      } else {
        this.markButtons();
      }
    }

    static handleClick(event) {
      const target =
        event.target instanceof Element ? event.target : null;

      const button = target?.closest(this.buttonSelector);

      if (!button || !this.isProductDetailPage()) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if (button.getAttribute(this.busyAttribute) === "1") {
        return;
      }

      const authorName = this.getAuthorName(button);
      const shouldAdd = !this.isFavorited(button);

      this.setFavoriteAuthor(
        button,
        authorName,
        shouldAdd
      ).catch((error) => {
        console.error(
          "[Melonbooks Favorite Author Remover]",
          error
        );

        if (authorName) {
          this.setAuthorButtonsBusy(authorName, false);
        } else {
          this.resetBusy(button);
        }

        this.showToast(
          shouldAdd
            ? "Could not add author to favorites."
            : "Could not remove author from favorites.",
          true
        );
      });
    }

    static async setFavoriteAuthor(
      button,
      suppliedAuthorName,
      shouldAdd
    ) {
      const authorName =
        suppliedAuthorName || this.getAuthorName(button);

      if (!authorName) {
        throw new Error(
          "Could not read the author name from the product page button."
        );
      }

      this.setAuthorButtonsBusy(authorName, true);

      this.showToast(
        shouldAdd
          ? `Adding ${authorName} to favorites...`
          : `Removing ${authorName} from favorites...`,
        false,
        0
      );

      try {
        if (shouldAdd) {
          await this.submitAddFavoriteAuthor(authorName);

          this.markAuthorAsFavorited(authorName);
          this.authorCache.delete(
            this.normalizeName(authorName)
          );

          this.showToast(
            "Author added to favorites.",
            false
          );

          return;
        }

        const favoriteData =
          await this.findFavoriteAuthorData(authorName);

        if (
          !favoriteData?.authorId ||
          !favoriteData.transactionId
        ) {
          throw new Error(
            `Could not find author_id for "${authorName}" on the favorite authors page.`
          );
        }

        await this.submitDeleteFavoriteAuthor(
          favoriteData
        );

        this.markAuthorAsNotFavorited(authorName);
        this.authorCache.delete(
          this.normalizeName(authorName)
        );

        this.showToast(
          "Author removed from favorites.",
          false
        );
      } finally {
        this.setAuthorButtonsBusy(authorName, false);
      }
    }

    static isProductDetailPage() {
      return window.location.pathname.startsWith(
        "/detail/"
      );
    }

    static isFavorited(button) {
      if (
        button.classList.contains(
          "fav-button-short__icon--not-done"
        )
      ) {
        return false;
      }

      return (
        button.classList.contains("favorited") ||
        button.classList.contains(
          "fav-button-short__icon--done"
        )
      );
    }

    static getAuthorName(button) {
      const directName =
        button.dataset.authorname ||
        button.getAttribute("data-authorname") ||
        button.getAttribute("data-authorName");

      if (directName?.trim()) {
        return directName.trim();
      }

      const infoCell = button.closest(
        ".product_info, td, tr"
      );

      const authorLink = infoCell?.querySelector(
        'a[href*="text_type=author"]'
      );

      return authorLink?.textContent?.trim() || "";
    }

    static getProductId() {
      const queryProductId = new URL(
        window.location.href
      ).searchParams.get("product_id");

      if (queryProductId?.trim()) {
        return queryProductId.trim();
      }

      const input = document.querySelector(
        'input[name="product_id"]'
      );

      return input?.value?.trim() || "";
    }

    static getProductTransactionId() {
      const selectors = [
        '#form_product input[name="transactionid"]',
        'form[data-page="detail"] input[name="transactionid"]',
        'input[name="transactionid"]',
      ];

      for (const selector of selectors) {
        const value = document
          .querySelector(selector)
          ?.value?.trim();

        if (value) {
          return value;
        }
      }

      const pageHtml =
        document.documentElement?.innerHTML || "";

      const match = pageHtml.match(
        /\btransactionid\s*=\s*['"]([^'"]+)['"]/
      );

      return match?.[1]?.trim() || "";
    }

    static normalizeName(value) {
      return String(value || "")
        .replace(/\s+/g, " ")
        .trim();
    }

    static getMatchingAuthorButtons(authorName) {
      const normalizedAuthorName =
        this.normalizeName(authorName);

      return Array.from(
        document.querySelectorAll(
          this.buttonSelector
        )
      ).filter(
        (button) =>
          this.normalizeName(
            this.getAuthorName(button)
          ) === normalizedAuthorName
      );
    }

    static setBusy(button) {
      button.setAttribute(
        this.busyAttribute,
        "1"
      );

      button.classList.add(this.busyClass);
      button.setAttribute("aria-busy", "true");
    }

    static resetBusy(button) {
      button.removeAttribute(this.busyAttribute);
      button.classList.remove(this.busyClass);
      button.removeAttribute("aria-busy");
    }

    static setAuthorButtonsBusy(
      authorName,
      isBusy
    ) {
      this.getMatchingAuthorButtons(
        authorName
      ).forEach((button) => {
        if (isBusy) {
          this.setBusy(button);
        } else {
          this.resetBusy(button);
        }
      });
    }

    static markAuthorAsFavorited(authorName) {
      this.getMatchingAuthorButtons(
        authorName
      ).forEach((button) => {
        button.classList.remove(
          "favorite",
          "fa-regular",
          "fav-button-short--done",
          "fav-button-short__icon--not-done"
        );

        button.classList.add(
          "favorited",
          "fa-solid",
          "fa-heart",
          "favorite_author",
          "fav-button-short__icon",
          "fav-button-short__icon--done"
        );

        if (!button.hasAttribute("href")) {
          button.setAttribute("href", "#");
        }

        button.setAttribute(
          "aria-hidden",
          "true"
        );

        button.setAttribute(
          "aria-pressed",
          "true"
        );

        button.setAttribute(
          "title",
          "お気に入り作家から解除"
        );

        this.resetBusy(button);
      });
    }

    static markAuthorAsNotFavorited(authorName) {
      this.getMatchingAuthorButtons(
        authorName
      ).forEach((button) => {
        button.classList.remove(
          "favorite",
          "favorited",
          "fa-regular",
          "fav-button-short--done",
          "fav-button-short__icon--done"
        );

        button.classList.add(
          "fa-solid",
          "fa-heart",
          "favorite_author",
          "fav-button-short__icon",
          "fav-button-short__icon--not-done"
        );

        if (!button.hasAttribute("href")) {
          button.setAttribute("href", "#");
        }

        button.setAttribute(
          "aria-hidden",
          "true"
        );

        button.setAttribute(
          "aria-pressed",
          "false"
        );

        button.setAttribute(
          "title",
          "お気に入り作家に追加"
        );

        this.resetBusy(button);
      });
    }

    static markButtons() {
      document
        .querySelectorAll(this.buttonSelector)
        .forEach((button) => {
          const isFavorited =
            this.isFavorited(button);

          button.setAttribute(
            "aria-pressed",
            String(isFavorited)
          );

          button.setAttribute(
            "title",
            isFavorited
              ? "お気に入り作家から解除"
              : "お気に入り作家に追加"
          );
        });
    }

    static async submitAddFavoriteAuthor(
      authorName
    ) {
      const productId = this.getProductId();
      const transactionId =
        this.getProductTransactionId();

      if (!productId) {
        throw new Error(
          "Could not find the product ID on the product page."
        );
      }

      if (!transactionId) {
        throw new Error(
          "Could not find the product-page transaction ID."
        );
      }

      const body = new URLSearchParams();

      body.set(
        "favorite_author_name",
        authorName
      );

      body.set("product_id", productId);
      body.set("mode", "regist_author_ajax");
      body.set("transactionid", transactionId);

      const url = new URL(
        window.location.pathname,
        window.location.origin
      );

      url.searchParams.set(
        "product_id",
        productId
      );

      const responseText = await this.fetchText(
        url.toString(),
        {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded; charset=UTF-8",
            Accept:
              "application/json, text/javascript, */*; q=0.01",
            "X-Requested-With":
              "XMLHttpRequest",
          },
          body: body.toString(),
        }
      );

      if (
        this.looksLikeLoginPage(responseText)
      ) {
        this.redirectToLogin();

        throw new Error(
          "The add request was redirected to login."
        );
      }

      let responseData;

      try {
        responseData = JSON.parse(
          responseText.trim()
        );
      } catch {
        throw new Error(
          "Melonbooks returned an invalid response while adding the author."
        );
      }

      if (
        !this.isSuccessfulStatus(
          responseData?.status
        )
      ) {
        const message = String(
          responseData?.message || ""
        ).trim();

        if (message.includes("ログイン")) {
          this.redirectToLogin();
        }

        throw new Error(
          message ||
            "Melonbooks did not confirm the author favorite."
        );
      }
    }

    static async findFavoriteAuthorData(
      authorName
    ) {
      const normalizedAuthorName =
        this.normalizeName(authorName);

      if (
        this.authorCache.has(
          normalizedAuthorName
        )
      ) {
        return this.authorCache.get(
          normalizedAuthorName
        );
      }

      const firstPageDoc =
        await this.fetchFavoriteAuthorPage(1);

      const firstPageMatch =
        this.parseFavoriteAuthorPage(
          firstPageDoc,
          authorName
        );

      if (firstPageMatch) {
        this.authorCache.set(
          normalizedAuthorName,
          firstPageMatch
        );

        return firstPageMatch;
      }

      const maxPage = Math.min(
        this.getMaxPage(firstPageDoc),
        this.maxScanPages
      );

      for (
        let startPage = 2;
        startPage <= maxPage;
        startPage += this.pageFetchBatchSize
      ) {
        const pages = [];

        for (
          let page = startPage;
          page <= maxPage &&
          page <
            startPage +
              this.pageFetchBatchSize;
          page += 1
        ) {
          pages.push(page);
        }

        const results = await Promise.all(
          pages.map(async (page) => {
            try {
              const doc =
                await this.fetchFavoriteAuthorPage(
                  page
                );

              return this.parseFavoriteAuthorPage(
                doc,
                authorName
              );
            } catch (error) {
              console.warn(
                `[Melonbooks Favorite Author Remover] Failed to scan page ${page}.`,
                error
              );

              return null;
            }
          })
        );

        const match = results.find(Boolean);

        if (match) {
          this.authorCache.set(
            normalizedAuthorName,
            match
          );

          return match;
        }
      }

      return null;
    }

    static async fetchFavoriteAuthorPage(
      pageNumber
    ) {
      const url = new URL(
        this.favoriteAuthorPagePath,
        window.location.origin
      );

      if (pageNumber > 1) {
        url.searchParams.set(
          "pageno",
          String(pageNumber)
        );
      }

      const text = await this.fetchText(
        url.toString(),
        {
          method: "GET",
          credentials: "same-origin",
        }
      );

      if (this.looksLikeLoginPage(text)) {
        this.redirectToLogin();

        throw new Error(
          "The favorite-author page request was redirected to login."
        );
      }

      return new DOMParser().parseFromString(
        text,
        "text/html"
      );
    }

    static parseFavoriteAuthorPage(
      doc,
      authorName
    ) {
      const normalizedAuthorName =
        this.normalizeName(authorName);

      const transactionId =
        doc.querySelector(
          'form#form1 input[name="transactionid"]'
        )?.value ||
        doc.querySelector(
          'input[name="transactionid"]'
        )?.value ||
        "";

      const entries = doc.querySelectorAll(
        ".circle-content"
      );

      for (const entry of entries) {
        const nameLink = entry.querySelector(
          ".page-single-arr-anchor a, h2 a"
        );

        const entryAuthorName =
          this.normalizeName(
            nameLink?.textContent || ""
          );

        if (
          entryAuthorName !==
          normalizedAuthorName
        ) {
          continue;
        }

        const deleteLink = entry.querySelector(
          'a[onclick*="delete_favorite_author"]'
        );

        const onclick =
          deleteLink?.getAttribute("onclick") ||
          "";

        const authorIdMatch = onclick.match(
          /setModeAndSubmit\(\s*['"]delete_favorite_author['"]\s*,\s*['"]author_id['"]\s*,\s*['"]([^'"]+)['"]\s*\)/
        );

        if (!authorIdMatch) {
          return null;
        }

        return {
          authorName: entryAuthorName,
          authorId: authorIdMatch[1],
          transactionId,
        };
      }

      return null;
    }

    static getMaxPage(doc) {
      let maxPage = 1;

      doc
        .querySelectorAll(".pagenavi a")
        .forEach((link) => {
          const values = [
            link.getAttribute("title"),
            link.getAttribute("href"),
            link.getAttribute("onclick"),
            link.textContent,
          ];

          values.forEach((value) => {
            const matches = String(
              value || ""
            ).match(/\d+/g);

            if (!matches) {
              return;
            }

            matches.forEach((match) => {
              const number = Number(match);

              if (
                Number.isFinite(number) &&
                number > maxPage
              ) {
                maxPage = number;
              }
            });
          });
        });

      return maxPage;
    }

    static async submitDeleteFavoriteAuthor(
      favoriteData
    ) {
      const body = new URLSearchParams();

      body.set(
        "transactionid",
        favoriteData.transactionId
      );

      body.set(
        "mode",
        "delete_favorite_author"
      );

      body.set(
        "author_id",
        favoriteData.authorId
      );

      body.set("orderby", "");
      body.set("disp_number", "");
      body.set("pageno", "1");

      const responseText = await this.fetchText(
        new URL(
          this.favoriteAuthorPagePath,
          window.location.origin
        ).toString(),
        {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded; charset=UTF-8",
          },
          body: body.toString(),
        }
      );

      if (
        this.looksLikeLoginPage(responseText)
      ) {
        this.redirectToLogin();

        throw new Error(
          "The delete request was redirected to login."
        );
      }
    }

    static isSuccessfulStatus(status) {
      return (
        status === true ||
        status === 1 ||
        status === "1" ||
        status === "true"
      );
    }

    static looksLikeLoginPage(responseText) {
      return (
        responseText.includes("ログイン") &&
        (
          responseText.includes(
            'name="login_email"'
          ) ||
          responseText.includes(
            'name="login_pass"'
          ) ||
          responseText.includes(
            "パスワード"
          )
        )
      );
    }

    static redirectToLogin() {
      const returnUrl =
        `${window.location.origin}` +
        `${window.location.pathname}` +
        `${window.location.search}`;

      window.location.href =
        `/mypage/?ru=${encodeURIComponent(
          returnUrl
        )}`;
    }

    static async fetchText(url, options) {
      const controller = new AbortController();

      const timeoutId = window.setTimeout(
        () => controller.abort(),
        this.requestTimeoutMs
      );

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status} while requesting ${url}`
          );
        }

        return await response.text();
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    static showToast(
      message,
      isError = false,
      durationMs = 2200
    ) {
      let toast = document.getElementById(
        this.toastId
      );

      if (!toast) {
        toast = document.createElement("div");
        toast.id = this.toastId;

        document.documentElement.appendChild(
          toast
        );
      }

      toast.textContent = message;

      toast.classList.toggle(
        "is-error",
        Boolean(isError)
      );

      toast.classList.add("is-visible");

      window.clearTimeout(this.toastTimer);

      if (durationMs > 0) {
        this.toastTimer =
          window.setTimeout(() => {
            toast.classList.remove(
              "is-visible"
            );
          }, durationMs);
      }
    }

    static installStyles() {
      const style =
        document.createElement("style");

      style.textContent = `
        .${this.busyClass} {
          opacity: 0.55 !important;
          cursor: wait !important;
          pointer-events: none !important;
        }

        #${this.toastId} {
          position: fixed;
          right: 18px;
          bottom: 18px;
          z-index: 2147483647;
          max-width: 320px;
          padding: 10px 14px;
          border-radius: 8px;
          background: #222;
          color: #fff;
          font-size: 13px;
          line-height: 1.4;
          box-shadow:
            0 4px 14px
            rgba(0, 0, 0, 0.25);
          opacity: 0;
          transform: translateY(8px);
          transition:
            opacity 160ms ease,
            transform 160ms ease;
          pointer-events: none;
        }

        #${this.toastId}.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        #${this.toastId}.is-error {
          background: #9f1d1d;
        }
      `;

      const appendStyle = () => {
        const parent =
          document.head ||
          document.documentElement;

        if (
          parent &&
          !style.isConnected
        ) {
          parent.appendChild(style);
        }
      };

      if (
        document.head ||
        document.documentElement
      ) {
        appendStyle();
      } else {
        document.addEventListener(
          "DOMContentLoaded",
          appendStyle,
          {
            once: true,
          }
        );
      }
    }
  }

  MelonbooksProductFavoriteAuthorRemover.init();
})();