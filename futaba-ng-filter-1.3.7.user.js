// ==UserScript==
// @name         futaba-ng-filter
// @namespace    https://example.com/
// @version      1.3.7
// @description  コピペ連投（30秒以内に同文が3回）をNG。最初の投稿は必ず許容。ｷﾀ━━━も例外。
// @match        https://*.2chan.net/*
// @run-at       document-end
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  const exemptTexts = [
    'ｷﾀ━━━(ﾟ∀ﾟ)━━━!!',
  ];

  const recentPosts = [];

  function similarity(a, b) {
    const len = Math.max(a.length, b.length);
    if (len === 0) return 1;
    let match = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] === b[i]) match++;
    }
    return match / len;
  }

  function isFrequentDuplicate(text, now, windowSec = 30, threshold = 3) {
    const normalized = text.trim().replace(/\s+/g, '');
    const nowTime = now.getTime();
    let count = 0;

    for (const post of recentPosts) {
      const diffSec = (nowTime - post.time) / 1000;
      const isSimilar = normalized === post.text || similarity(normalized, post.text) >= 0.9;
      if (isSimilar && diffSec <= windowSec) {
        count++;
      }
    }

    if (count >= threshold) {
      console.log('[NGフィルタ] コピペ連投NG:', normalized, '→', count, '回ヒット');
      return true;
    }

    return false;
  }

  function isNgText(text) {
    const now = new Date();
    const normalized = text.trim().replace(/\s+/g, '');

    if (exemptTexts.includes(normalized)) return false;

    // 履歴に先に追加（1回目は必ずセーフ）
    recentPosts.push({ text: normalized, time: now.getTime() });
    if (recentPosts.length > 200) recentPosts.shift();

    // NG判定は後
    return isFrequentDuplicate(normalized, now);
  }

  function hideIfMatch(elements, label) {
    console.log(`[NGフィルタ] ${label}: ${elements.length}件`);
    elements.forEach(el => {
      const text = el.innerText || el.textContent || '';
      if (isNgText(text)) {
        console.log(`[NGフィルタ] 非表示 @${label}:`, text.slice(0, 40));
        const container =
          el.closest('table') ||
          el.closest('tr') ||
          el.closest('div') ||
          el;
        if (container) container.style.display = 'none';
      }
    });
  }

  function scan() {
    hideIfMatch(document.querySelectorAll('dd'), 'dd');
    hideIfMatch(document.querySelectorAll('div.post'), 'div.post');
    hideIfMatch(document.querySelectorAll('blockquote'), 'blockquote');
  }

  scan();
})();
