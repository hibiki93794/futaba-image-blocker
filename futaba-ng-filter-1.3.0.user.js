// ==UserScript==
// @name         futaba-ng-filter
// @namespace    https://example.com/
// @version      1.3.0
// @description  荒らしレス（意味不明な文字列・記号・絵文字・数字・木プレフィクスなど）を自動で非表示
// @match        https://*.2chan.net/*
// @run-at       document-end
// @grant        none
// @license      MIT // ふたば☆ちゃんねるのMAYで開発配布したものであり、としあきならコードの利用、変更、再配布、商用利用許可します。
// ==/UserScript==

(function () {
  'use strict';

  /** NGワード（任意で追加） **/
  const keywords = [
    // '壁打ち',
  ];

  /** 正規表現でのNGパターン（木口ロ＋記号など） **/
  const regexes = [
    /^[木口ロ][^ぁ-んァ-ヶ一-龠]{3,}/m, // 木abc$$ など記号混じり
  ];

  /** ランダム文字列・記号スパム・絵文字混合などの判定（最新版） **/
  function isNoiseText(text) {
    const length = text.length;
  if (length < 10) return false;

  const emojiRe = /[\p{Extended_Pictographic}]/gu;
  const kanaRe = /[ぁ-ゖァ-ヺ]/g;
  const asciiRe = /[A-Za-zａ-ｚＡ-Ｚ]/g;
  const numRe = /[0-9０-９]/g;
  const symbolRe = /[!-/:-@[-`{-~”“’†‡‰¢£€¡¿↹ⅸ↾]/g;

  const emojiCount = (text.match(emojiRe) || []).length;
  const kanaCount = (text.match(kanaRe) || []).length;
  const asciiCount = (text.match(asciiRe) || []).length;
  const numCount = (text.match(numRe) || []).length;
  const symbolCount = (text.match(symbolRe) || []).length;

  const emojiRate = emojiCount / length;
  const kanaRate = kanaCount / length;
  const asciiRate = asciiCount / length;
  const numRate = numCount / length;
  const symbolRate = symbolCount / length;
  const combinedRate = kanaRate + asciiRate + numRate;

  // --- 判定条件群 ---
  if (kanaRate > 0.1 && asciiRate > 0.1 && numRate > 0.1 && length > 20) return true; // 既存
  if ((asciiRate + numRate) > 0.8 && length > 10) return true; // 既存
  if ((asciiRate > 0.5 && symbolRate > 0.2) && length > 15) return true; // 英字＋記号
  if (numRate > 0.7 && length > 8) return true; // 数字スパム
  if (/([a-zA-Z0-9])\1{3,}/.test(text)) return true; // 同一文字4連以上
  if (/([ａ-ｚＡ-Ｚ0-９0-9]){4,}/.test(text) && length < 25) return true; // 機械っぽい短文
  if (kanaRate > 0.2 && asciiRate > 0.2 && numRate > 0.1 && length >= 10) return true;
  if (kanaRate > 0.2 && asciiRate > 0.2 && numRate > 0.1 && length >= 10 && length <= 25) return true; // 英数かなごちゃ混ぜ短文 ← NEW
  if (emojiRate > 0.25 && emojiCount >= 5) return true; // 既存
  if (symbolRate > 0.3 && symbolCount > 5 && length > 30) return true; // 既存
  if (length > 100 && combinedRate > 0.6) return true; // 既存

  return false;
}

  /** NG判定（ワード・正規表現・ランダム文字列） **/
  function isNgText(text) {
    if (keywords.some(word => text.includes(word))) return true;
    if (regexes.some(re => re.test(text))) return true;
    if (isNoiseText(text)) return true;
    return false;
  }

  /** 投稿を検査して非表示にする **/
  function hideIfMatch(elements, label) {
    console.log(`[NGフィルタ] ${label}: ${elements.length}件`);
    elements.forEach(el => {
      const text = el.innerText || el.textContent || '';
      if (isNgText(text)) {
        console.log(`[NGフィルタ] ヒット@${label}:`, text.slice(0, 40));
        const container = el.closest('table') || el.closest('div') || el;
        container.style.display = 'none';
      }
    });
  }

  /** 各形式（dd, div.post, blockquote）に対応 **/
  function scan() {
    hideIfMatch(document.querySelectorAll('dd'), 'dd');
    hideIfMatch(document.querySelectorAll('div.post'), 'div.post');
    hideIfMatch(document.querySelectorAll('blockquote'), 'blockquote');
  }

  scan(); // 初回実行
})();
