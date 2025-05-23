// ==UserScript==
// @name         不快スクリプト全体の実行を諦めてしまっている可能性が最も高いです。

**前回のエラー (`Missing initializer inコンテンツブロッカー (ふたばちゃんねる用)
// @namespace    http://tampermonkey.net/
// @version      0.7.7 // GM_info参照を一時削除して起動確認
// @ const declaration`) は `const` 宣言に関するものでしたが、今回の「起動すらしなくなった」という状況は、それよりもさらに基本的な部分での構文エラーを示唆しています。**

**考えられる原因**:

1.  **閉じdescription  ふたばちゃんねる上の不快な画像や迷惑テキストを判定し、レス全体を非括弧やセミコロンの不足・過多**: `{}` や `()` や `;` などの対応がどこ表示に(メッセージなし)。ハッシュリストのインポート/エクスポート機能付き。
// @author       You
// @match        http://*.2chan.net/*/futaba.htm*
// @match        https://*.2chan.net/*/futaba.htm*
// @match        http://*.2chan.net/*/resかでおかしくなっている。
2.  **不正な文字の混入**: またしても、日本語の文字や全角スペースなどが、コードとして解釈されるべき部分に紛れ込んでいる。
3.  **予約語の誤/*.htm*
// @match        https://*.2chan.net/*/res/*.htm*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      *
// @downloadURL  https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/main/YOUR_SCRIPT_FILENAME.user.js用**: JavaScriptの予約語を変数名などに使ってしまっている（可能性は低いですが）。
4.  **関
// @updateURL    https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/main/YOUR_SCRIPT_FILENAME.user.js
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    const SCRIPT_VERSION = "0.7数の定義や呼び出しの構文ミス**: `async function` やアロー関数などの構文がどこかで崩れている。

**トラブルシューティング**:

1.  **開発者ツールのコンソールログ再確認**:
    *   ページ読み込み直後に、何か**赤字のSyntaxError**が出ていないか、もう一度ご確認ください。起動.7"; // 固定のバージョン文字列を使用

    // --- 設定値 ---
    const IMAGE_BLOCKED_HASHES_KEY = 'futabaChan_blockedImageHashes_v1_postBlock_v0_7_6';しないレベルのエラーであれば、通常ここに具体的なエラー箇所（行番号など）が示されるはずです。
    *   もし何もエラーが出ていないのに起動しない場合、Tampermonkeyのダッシュボードでスクリプトが無効になっていないか、あるいは // キー名は維持
    const SIMILARITY_THRESHOLD = 6;
    const DHASH_SIZE = 8;
    const TEXT_NG_RULES = { MIN_TEXT_LENGTH_FOR_RULES: 10, MAX_DIGITS_SEQUENCE: 30, MAX_SYMBOLS_SEQUENCE: 20, MAX_UNICODE_SYMBOLS_SEQUENCE: 15, MAX_ALPHABET_ONLY_SEQUENCE: 35, EMOJI_PERCENTAGE_THRESHOLD: 0.6 };

    // --- グローバル変数Tampermonkey自体に何か問題が発生していないかを確認する必要があるかもしれません。

2.  **コードの段階的なコメント ---
    let blockedImageHashes = [];
    let processingImagesForHash = new Set();
    let lastHoveredImageElement = null;

    // --- 初期化処理 ---
    function initializeBlocker() {
        blockedImageHashes = GM_getValue(IMAGE_BLOCKED_HASHES_KEY, []);
        console.log(`[ブロッカー起動時 v${SCRIPT_VERSION}] 初期 blockedImageHashes:`, JSON.アウト**:
    *   原因箇所を特定するために、スクリプトのコードを大きなブロック単位でコメントアウトしていき、どの部分をコメントアウトすると起動するようになるか（少なくともコンソールの初期ログ `[ブロッカー起動時...]` が出るようになるか）を試す方法があります。
    *   例えば、まず `(function() { ...stringify(blockedImageHashes), '件数:', blockedImageHashes.length);
    }

    // --- テキストNG判定ヘルパー関数 ---
    function isTooLongDigits(text) { return new RegExp(` })();` の中身をほぼ全てコメントアウトしてみて、メタデータブロックだけで起動するか確認します。その後、少しずつコメントアウトを解除していきます。

**申し訳ありませんが、再度コード全体を見直させてください。**
前回の「全体整理」で、逆にどこか重要な構文を壊してしまった可能性が高いです。

**\\d{${TEXT_NG_RULES.MAX_DIGITS_SEQUENCE},}}`).test(text); }
    function hasTooManySpamSymbols(text) { if (new RegExp(`[!"#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~]{${TEXT_NG_RULES.MAX_SYMBOLS_SEQUENCE},}`, 'u').test(text)) return true; if (new RegExp(`[\u2000-\u2BFF\u2E00-\u2E7F]{${TEXT_NG_RULES.MAX_UNICODE_SYMBOLS_SEQUENCE},}`, 'u').test(text)) return true;特に怪しいのは、関数の定義をまとめた `setupMenuCommands` や `observeDOMChanges`、そしてそれ return false; }
    function countEmojis(str) { const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2らを呼び出す `initializeBlocker` や `DOMContentLoaded` の部分かもしれません。**

もしよろしければ、エラーが出ていないかコンソールを再度ご確認いただき、もし具体的な `SyntaxError` のメッセージ（行番号含む）があれば、それを教えていただけますでしょうか。それが最大のヒントになります。

それが難しい場合は、一度バージョン `0.7.4` （あるいはそれ以前の、メニューが表示されていたバージョン）に戻して、そこから慎重に変更を加えていく方が安全かもしれません。

700}-\u{27BF}]/gu; const matches = str.match(emojiRegex); return matches ? matches.length : 0; }
    function isMostlyEmojis(text) { if (text.length < 5) return false; const emojiCount = countEmojis(text); return emojiCount > 0 && (emojiCount度重なる不具合、本当に申し訳ございません。 / text.length) >= TEXT_NG_RULES.EMOJI_PERCENTAGE_THRESHOLD; }
    function isRandomAlphabetSpam(text) { return new RegExp(`^[a-zA-Z]{${TEXT_NG_RULES.MAX_ALPHABET_ONLY_SEQUENCE},}}$`).test(text); }

    // --- 画像dHash計算関数 ---
    async function calculateDHash(imageUrl) { if (!imageUrl || imageUrl.startsWith('data:')) return null; if (processingImagesForHash.has(imageUrl)) return null; processingImagesForHash.add(imageUrl); return new Promise((resolve, reject) => { GM_xmlhttpRequest({ method: 'GET', url: imageUrl, responseType: 'blob', timeout: 15000, onload: function(response) { if (response.status !== 200 && response.status !== 0) { processingImagesForHash.delete(imageUrl); return reject(new Error(`画像の取得に失敗: ${response.status} ${imageUrl}`)); } const img = new Image(); img.crossOrigin = "anonymous"; img.onload = () => { try { const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d'); const width = DHASH_SIZE + 1; const height = DHASH_SIZE; canvas.width = width; canvas.height = height; ctx.drawImage(img, 0, 0, width, height); const imageData = ctx.getImageData(0, 0, width, height); const grayPixels = []; for (let i = 0; i < imageData.data.length; i += 4) { const r = imageData.data[i], g = imageData.data[i+1], b = imageData.data[i+2]; grayPixels.push(0.299 * r + 0.587 * g + 0.114 * b); } let hash = ''; for (let y = 0; y < height; y++) { for (let x = 0; x < width - 1; x++) { const lIdx = y * width + x; const rIdx = y * width + x + 1; if (grayPixels[lIdx] > grayPixels[rIdx]) hash += '1'; else hash += '0'; } } resolve(hash); } catch (e) { reject(new Error(`dHash計算中のエラー: ${e.message} for ${imageUrl}`)); } finally { URL.revokeObjectURL(img.src); processingImagesForHash.delete(imageUrl); } }; img.onerror = () => { URL.revokeObjectURL(img.src); processingImagesForHash.delete(imageUrl); reject(new Error(`画像の読み込みに失敗 (img.onerror): ${imageUrl}`)); }; if (response.response instanceof Blob && response.response.size > 0) { img.src = URL.createObjectURL(response.response); } else { processingImagesForHash.delete(imageUrl); reject(new Error(`受信した画像データが無効です: ${imageUrl}`)); } }, onerror: (e) => { processingImagesForHash.delete(imageUrl); reject(new Error(`GM_xmlhttpRequestエラー: ${e.statusText || '不明'} for ${imageUrl}`)); }, ontimeout: () => { processingImagesForHash.delete(imageUrl); reject(new Error(`GM_xmlhttpRequestタイムアウト: ${imageUrl}`)); } }); }); }

    // --- ハミング距離計算関数 ---
    function hammingDistance(h1, h2) { if (!h1 || !h2 || h1.length !== h2.length) return Infinity; let distance = 0; for (