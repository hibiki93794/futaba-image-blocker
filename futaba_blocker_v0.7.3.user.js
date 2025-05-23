// ==UserScript==
// @name         不快コンテンツブロッカー (ふたばちゃんねる用)
// @namespace    http://tampermonkey.net/
// @version      0.7.3 // デバッグログ追加バージョン
// @description  ふたばちゃんねる上の不快な画像や迷惑テキストを判定し、レス全体を非表示に(メッセージなし)。ハッシュリストのインポート/エクスポート機能付き。クロスオリジン対策試行。
// @author       You
// @match        http://*.2chan.net/*/futaba.htm*
// @match        はいhttps://*.2chan.net/*/futaba.htm*
// @match        http://*.2chan.、承知いたしました。
デバッグ用の `console.log` を追加したnet/*/res/*.htm*
// @match        https://*.2chan.net/*/res/*.htm*
バージョン `0.7.3` の全コードを以下に記載します。

**主な変更点**:
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      *
// @downloadURL  https://*   バージョンを `0.7.3` に更新。
*   説明文に「デバッグログraw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/main/YOUR_SCRIPT追加」を追記。
*   スクリプト起動時、ハッシュ登録時、ハッシュクリア時、ハッシュ数確認時に、`blockedImageHashes` の状態とストレージ操作の状況を確認するための `console.log_FILENAME.user.js
// @updateURL    https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/main/YOUR_SCRIPT_FILENAME.user.js
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // --- 設定値 ---
    const IMAGE_BLOCKED_HASHES_KEY = 'futabaChan_blockedImageHashes_v` を追加。

GitHubのURL部分は、引き続きご自身のものに置き換えてください。

```javascript
// ==UserScript==
// @name         不快コンテンツブロッカー (ふたばちゃんねる用)
// @1_postBlock';
    const SIMILARITY_THRESHOLD = 6;
    const DHASH_SIZE = 8;
    const TEXT_NG_RULES = { MIN_TEXT_LENGTH_FOR_RULES: 10, MAX_DIGITS_SEQUENCE: 30, MAX_SYMBOLS_SEQUENCE: 2namespace    http://tampermonkey.net/
// @version      0.7.3 // デバッグログ追加
// @description  ふたばちゃんねる上の不快な画像や迷惑テキストを判定し、レス全体を非表示に(メッセージなし)。ハッシュリストのインポート/エクスポート機能付き。クロスオリジン対策試行。デバッグログ追加。
// @author       You
// @match        http://*.2chan.net/*/futaba.htm*
// @match        https://*.2chan.net/*/futaba.htm0, MAX_UNICODE_SYMBOLS_SEQUENCE: 15, MAX_ALPHABET_ONLY_SEQUENCE: 35, EMOJI_PERCENTAGE_THRESHOLD: 0.6 };

    let blocked*
// @match        http://*.2chan.net/*/res/*.htm*
// @match        https://*.2chan.net/*/res/*.htm*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      *
// @downloadURL  https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/main/YOUR_SCRIPT_FILENAME.user.js
// @updateURL    ImageHashes = GM_getValue(IMAGE_BLOCKED_HASHES_KEY, []);
    console.log('[ブロッカー起動時] 初期 blockedImageHashes:', JSON.stringify(blockedImageHashes), '件数:', blockedImageHashes.length); // DEBUG LOG

    let processingImagesForHash = new Set();

    // --- テキストNG判定ヘルパー関数 ---
    function isTooLongDigits(text) { return new RegExp(`\\d{${TEXT_NG_RULES.MAX_DIGITS_SEQUENCE},}}`).test(text); }
    function hasTooManySpamSymbols(text) { if (new RegExp(`[!"#$%&'()*+,-https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/main/YOUR_SCRIPT_FILENAME.user.js
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // --- 設定値 ---
    const IMAGE_BLOCKED_HASHES_KEY = 'futabaChan_blockedImageHashes_v1_postBlock';
    const SIMILARITY_THRESHOLD = 6;
    const DHASH_SIZE = 8;
    const TEXT_NG_RULES./:;<=>?@[\\]^_\`{|}~]{${TEXT_NG_RULES.MAX_SYMBOLS_SEQUENCE},}`, 'u').test(text)) return true; if (new RegExp(`[\u2000-\u2BFF\u2E00-\u2E7F]{${TEXT_NG_RULES.MAX_UNICODE_SYMBOLS_SEQUENCE},}`, 'u').test(text)) return true; return false; }
    function countEmojis(str) { const emojiRegex = /[\u{1F600 = { MIN_TEXT_LENGTH_FOR_RULES: 10, MAX_DIGITS_SEQUENCE: 30, MAX_SYMBOLS_SEQUENCE: 20, MAX_UNICODE_SYMBOLS_SEQUENCE: 15, MAX_ALPHABET_ONLY_SEQUENCE: 35, EMOJI_PERCENTAGE_THRESHOLD: 0.6 };

    let blockedImageHashes = GM_getValue(IMAGE_BLOCKED_HASHES_KEY, []);
    console.log('[ブロッカー起動時] 初期 blockedImageHashes:', JSON.stringify(}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu; const matches = str.match(emojiRegex); return matches ? matches.length : 0; }
    function isMostlyEmojis(text) { if (text.length < 5) return false; const emojiCount = countEmojis(text); return emojiCount > 0 && (emojiblockedImageHashes), '件数:', blockedImageHashes.length);
    let processingImagesForHash = new Set();

    // --- テキストNG判定ヘルパー関数 ---
    function isTooLongDigits(text) { return new RegExp(`\\d{${TEXT_NG_RULES.MAX_DIGITS_SEQUENCE},}}`).test(text); }
    function hasTooManySpamSymbols(text) { if (new RegExp(`[!"#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~]{${Count / text.length) >= TEXT_NG_RULES.EMOJI_PERCENTAGE_THRESHOLD; }
    function isRandomAlphabetSpam(text) { return new RegExp(`^[a-zA-Z]{${TEXT_NG_RULES.MAX_ALPHABET_ONLY_SEQUENCE},}}$`).test(text); }

    // --- 画像dHash計算関数 (calculateDHash) ---
    async function calculateDHash(imageUrl) { if (!imageUrl || imageUrl.startsWith('data:')) return null; if (processingImagesForHash.has(imageUrlTEXT_NG_RULES.MAX_SYMBOLS_SEQUENCE},}`, 'u').test(text)) return true; if (new RegExp(`[\u2000-\u2BFF\u2E00-\u2E7F]{${TEXT_NG_RULES.MAX_UNICODE_SYMBOLS_SEQUENCE},}`, 'u').test(text)) return true; return false; }
    function countEmojis(str) { const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300)) return null; processingImagesForHash.add(imageUrl); return new Promise((resolve, reject) => { GM_xmlhttpRequest({ method: 'GET', url: imageUrl, responseType: 'blob', timeout: 15000, onload: function(response) { if (response.status !== 200 && response.status !== 0) { processingImagesForHash.delete(imageUrl); return reject(new Error(`画像の取得に失敗: ${response.status} ${imageUrl}`)); } const img = new Image(); img.crossOrigin = "anonymous"; img.onload = () => {}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu; const matches = str.match(emojiRegex); return matches ? matches.length : 0; }
    function isMostlyEmojis(text) { if (text.length < 5) return false; const emojiCount = countEmojis(text); return try { const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d'); const width = DHASH_SIZE + 1; const height = DHASH_SIZE; canvas.width = width; canvas.height = height; ctx.drawImage(img, 0, 0, width, height); const imageData = ctx.getImageData(0, 0, width, height); const grayPixels = []; for (let i = 0; i < imageData.data.length; i += 4) { const r = imageData.data[i], emojiCount > 0 && (emojiCount / text.length) >= TEXT_NG_RULES.EMOJI_PERCENTAGE_THRESHOLD; }
    function isRandomAlphabetSpam(text) { return new RegExp(`^[a-zA-Z]{${TEXT_NG_RULES.MAX_ALPHABET_ONLY_SEQUENCE},}}$`).test(text); }

    // --- 画像dHash計算関数 (calculateDHash) ---
    async function calculateDHash(imageUrl) { if (!imageUrl || imageUrl.startsWith('data:')) return null; if (processingImagesForHash.has(imageUrl)) return null; processingImagesForHash.add(imageUrl); return new Promise g = imageData.data[i+1], b = imageData.data[i+2]; grayPixels.push(0.299 * r + 0.587 * g + 0.114 * b); } let hash = ''; for (let y = 0; y < height; y++) { for (let x = 0; x < width - 1; x++) { const l = y * width + x, r = y * width + x + 1; if (grayPixels[l] > grayPixels[((resolve, reject) => { GM_xmlhttpRequest({ method: 'GET', url: imageUrl, responseType: 'blob', timeout: 15000, onload: function(response) { if (response.status !== 200 && response.status !== 0) { processingImagesForHash.delete(imageUrl); return reject(new Error(`画像の取得に失敗: ${response.status} ${imageUrl}`)); } const img = new Image(); img.crossOrigin = "anonymous"; img.onload = () => { try { const canvas = document.createElement('canvas');r]) hash += '1'; else hash += '0'; } } processingImagesForHash.delete(imageUrl); resolve(hash); } catch (e) { processingImagesForHash.delete(imageUrl); reject(new Error(`dHash計算中のエラー: ${e.message} for ${imageUrl}`)); } finally { URL.revokeObjectURL(img.src); } }; img.onerror = () => { processingImagesForHash.delete(imageUrl); URL.revokeObjectURL(img.src); reject(new Error(`画像の読み込みに失敗 (img.onerror): ${imageUrl}`)); }; if (response.response instanceof Blob && response.response const ctx = canvas.getContext('2d'); const width = DHASH_SIZE + 1; const height = DHASH_SIZE; canvas.width = width; canvas.height = height; ctx.drawImage(img, 0, 0, width, height); const imageData = ctx.getImageData(0, 0, width, height); const grayPixels = []; for (let i = 0; i < imageData.data.length; i += 4) { const r = imageData.data[i], g = imageData.data[i+1], b =.size > 0) img.src = URL.createObjectURL(response.response); else { processingImagesForHash.delete(imageUrl); reject(new Error(`受信した画像データが無効です: ${imageUrl}`)); } }, onerror: (e) => { processingImagesForHash.delete(imageUrl); reject(new Error(`GM_xmlhttpRequestエラー: ${e.statusText || '不明'} for ${imageUrl}`)); }, ontimeout: () => { processingImagesForHash.delete(imageUrl); reject(new Error(`GM_xmlhttpRequestタイムアウト: ${imageUrl}`)); } }); }); }

    // --- ハミング距離計算関数 (hammingDistance) ---
    function hammingDistance(h1, h2) { if imageData.data[i+2]; grayPixels.push(0.299 * r + 0.587 * g + 0.114 * b); } let hash = ''; for (let y = 0; y < height; y++) { for (let x = 0; x < width - 1; x++) { const l = y * width + x, r = y * width + x + 1; if (grayPixels[l] > grayPixels[r]) hash += '1'; else hash += '0'; } } processingImagesForHash.delete(imageUrl); resolve(hash); } catch (e) { processingImagesForHash.delete(imageUrl); reject(new Error(`dHash計算中のエラー: ${e.message} for ${imageUrl}`)); } (!h1 || !h2 || h1.length !== h2.length) return Infinity; let d = 0; for (let i = 0; i < h1.length; i++) if (h1[i] !== h2[i]) d++; return d; }

    // --- レス処理関数 (processPostElement) ---
    async function processPostElement(postElement) { if (!postElement || postElement.ownerDocument !== document || postElement.classList.contains('futaba-content-processed') || !postElement.closest('body')) { return; } const postRow = postElement.tagName === 'TR' ? postElement : postElement finally { URL.revokeObjectURL(img.src); } }; img.onerror = () => { processingImagesForHash.delete(imageUrl); URL.revokeObjectURL(img.src); reject(new Error(`画像の読み込みに失敗 (img.onerror): ${imageUrl}`)); }; if (response.response instanceof Blob && response.response.size > 0) img.src = URL.createObjectURL(response.response); else { processingImagesForHash.delete(imageUrl); reject(new Error(`受信した画像データが無効です: ${imageUrl}`)); } }, onerror: (e) => { processingImagesForHash.delete(imageUrl); reject(new Error(`GM_xmlhttpRequestエラー: ${e.statusText || '不明'} for ${imageUrl}`)); }, ontimeout: () => { processingImagesForHash.delete(imageUrl); reject(new Error(`GM_xmlhttpRequestタイムアウト: ${imageUrl}`)); } }); }); }

    // --- ハミング距離計算関数 (hammingDistance) ---
    function hammingDistance(h1, h2) { if (!h1 || !h.closest('tr'); if (!postRow || postRow.ownerDocument !== document || postRow.classList.contains('futaba-content-processed')) { if(postElement.tagName === 'IMG' && postElement.ownerDocument === document) postElement.classList.add('futaba-image-scan-attempted'); return; } postRow.classList.add('futaba-content-processed'); let ngReason = null; let ngDetails = ""; const blockquote = postRow.querySelector('blockquote'); if (blockquote && blockquote.ownerDocument === document) { const postText = (2 || h1.length !== h2.length) return Infinity; let d = 0; for (let i = 0; i < h1.length; i++) if (h1[i] !== h2[i]) d++; return d; }

    // --- レス処理関数 (processPostElement) ---
    async function processPostElement(postElement) { if (!postElement || postElement.ownerDocument !== document || postElement.classList.contains('futaba-content-processed') || !postElement.closest('body')) { return; } const postRow = postElement.tagName === 'TR' ? postElement : postElement.closest('tr'); if (!postRow || postRow.ownerDocument !== document || postRow.classList.contains('futabablockquote.textContent || "").trim(); if (postText.length >= TEXT_NG_RULES.MIN_TEXT_LENGTH_FOR_RULES) { if (isTooLongDigits(postText)) ngReason = "長すぎる数字列"; else if (hasTooManySpamSymbols(postText)) ngReason = "迷惑な記号が多すぎ"; else if (isMostlyEmojis(postText)) ngReason = "絵文字が多すぎ"; else if (isRandomAlphabetSpam(postText)) ngReason = "ランダム風英字"; if (ngReason) ngDetails = `テキスト「${postText.substring(0, 30)}...」`; } } if (!ngReason) { const imgElement = postRow.querySelector('img:not(.futaba-image-scan-attempted)'); if (imgElement && imgElement.ownerDocument === document && imgElement.src) { imgElement.classList.add('futaba-image-scan-attempted'); const imageUrl = imgElement.src; let effectiveImageUrl = imageUrl; if (imgElement.parentNode?.tagName === 'A' && imgElement.parentNode.href) { const link-content-processed')) { if(postElement.tagName === 'IMG' && postElement.ownerDocument === document) postElement.classList.add('futaba-image-scan-attempted'); return; } postRow.classList.add('futaba-content-processed'); let ngReason = null; let ngDetails = ""; const blockquote = postRow.querySelector('blockquote'); if (blockquote && blockquote.ownerDocument === document) { const postText = (blockquote.textContent || "").trim(); if (postText.length >= TEXT_NG_RULES.MIN_TEXT_LENGTH_FOR_RULES) { if (isTooLongDigits(postText)) ngReason = "長すぎる数字列"; else if (hasTooManySpamSymbols(postText)) ngReason = "迷惑な記号が多すぎ"; else if (isMostlyEmojis(postText)) ngReason = "絵文字が多すぎ"; else if (isRandomUrl = new URL(imgElement.parentNode.href, document.baseURI).href; if (/\.(jpe?g|png|gif|webp)$/i.test(linkUrl) && !linkUrl.includes('futaba.htm') && !linkUrl.includes('/res/')) { effectiveImageUrl = linkUrl; } } try { const currentHash = await calculateDHash(effectiveImageUrl); if (currentHash) { for (const blockedHash of blockedImageHashes) { if (hammingDistance(currentHash, blockedHash) <= SIMILARITY_THRESHOLD) { ngReason = "不快な画像"; ngDetails = `画像URL: ${imageUrl.substring(0,60)}... (ハッシュ元: ${effectiveImageUrl.substring(0,60)}...)`; break; } } } } catch (error) { console.warn(`[不快コンテンツブロッカー] 画像ハッシュ計算エラー: ${error.message}`, `(対象URL: ${effectiveImageUrl})`); } } } if (ngReason) { postAlphabetSpam(postText)) ngReason = "ランダム風英字"; if (ngReason) ngDetails = `テキスト「${postText.substring(0, 30)}...」`; } } if (!ngReason) { const imgElement = postRow.querySelector('img:not(.futaba-image-scan-attempted)'); if (imgElement && imgElement.ownerDocument === document && imgElement.src) { imgElement.classList.add('futaba-image-scan-attempted'); const imageUrl = imgElement.src; let effectiveImageUrl = imageUrl; if (imgElement.parentNode?.tagName === 'A' && imgElement.parentNode.href) { const linkUrl = new URL(imgElement.parentNode.href, document.baseURI).href; if (/\.(jpe?g|png|gif|webp)$/i.test(linkUrl) && !linkUrl.includes('futaba.htmRow.style.display = 'none'; let resNoText = ""; const checkbox = postRow.querySelector('input[type="checkbox"]'); if (checkbox?.name) resNoText = `レス ${checkbox.name} `; console.log(`%c[不快コンテンツブロッカー]%c ${resNoText}の内容を非表示 (理由: ${ngReason})。詳細: ${ngDetails}`, "color:crimson;font-weight:bold;", "color:default;"); } }

    // --- メイン処理 (スキャンと監視) ---
    function scanAndProcessPostsInNode(parentNode) { if (parentNode.ownerDocument !== document) return; parentNode.querySelectorAll('tr:not(.futaba-content-processed)').forEach(tr => { if (tr.ownerDocument') && !linkUrl.includes('/res/')) { effectiveImageUrl = linkUrl; } } try { const currentHash = await calculateDHash(effectiveImageUrl); if (currentHash) { for (const blockedHash of blockedImageHashes) { if (hammingDistance(currentHash, blockedHash) <= SIMILARITY_THRESHOLD) { ngReason = "不快な画像"; ngDetails = `画像URL: ${imageUrl.substring(0,60)}... (ハッシュ元: ${effectiveImageUrl.substring(0,60)}...)`; break; } } } } catch (error) { console.warn(`[不快コンテンツブロッカー] 画像ハッシュ計算エラー: ${error.message}`, `(対象URL: ${effectiveImageUrl})`); } } } if (ngReason) { postRow. !== document) return; if (tr.querySelector('td input[type="checkbox"][name]')) { setTimeout(() => processPostElement(tr), 0); } else { tr.classList.add('futaba-content-processed'); } }); }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', () => scanAndProcessPostsInNode(document.body)); } else { scanAndProcessPostsInNode(document.body); }
    const observer = new MutationObserver((mutationsList) => { for (const mutation of mutationsList) { if (mutation.type === 'childList' && mutation.addedNodes.length > 0) { mutation.addedNodes.forEach(node => { if (node.nodeType === Node.ELEMENT_NODE && node.ownerDocumentstyle.display = 'none'; let resNoText = ""; const checkbox = postRow.querySelector('input[type="checkbox"]'); if (checkbox?.name) resNoText = `レス ${checkbox.name} `; console.log(`%c[不快コンテンツブロッカー]%c ${resNoText}の内容を非表示 (理由: ${ngReason})。詳細: ${ngDetails}`, "color:crimson;font-weight:bold;", "color:default;"); } }

    // --- メイン処理 (スキャンと監視) ---
    function scanAndProcessPostsInNode(parentNode) { if (parentNode.ownerDocument !== document) return; parentNode.querySelectorAll('tr:not(. === document) { if ((node.tagName === 'TR' || node.tagName === 'TABLE' || node.tagName === 'TBODY') && !node.classList.contains('futaba-content-processed')) { scanAndProcessPostsInNode(node); } else if (node.querySelector && node.querySelector('tr:not(.futaba-content-processed)')) { scanAndProcessPostsInNode(node); } } }); } } });
    observer.observe(document.body, { childList: true, subtree: true });

    // --- 右クリックメニュー関連 ---
    let lastHoveredImageElement = null;
    document.addEventListener('mouseover', (event) => {futaba-content-processed)').forEach(tr => { if (tr.ownerDocument !== document) return; if (tr.querySelector('td input[type="checkbox"][name]')) { setTimeout(() => processPostElement(tr), 0); } else { tr.classList.add('futaba-content-processed'); } }); }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', () => scanAndProcessPostsInNode(document.body)); } else { scanAndProcessPostsInNode(document.body); }
    const observer = new MutationObserver(( if (event.target && event.target.ownerDocument === document && event.target.tagName === 'IMG') { lastHoveredImageElement = event.target; } }, true);

    GM_registerMenuCommand("■ この画像を不快登録 (レスごと非表示)", async () => {
        if (lastHoveredImageElement?.src && lastHoveredImageElement.ownerDocument === document && lastHoveredImageElement.closest('body')) {
            const imgToBlock = lastHoveredImageElement; const originalSrc = imgToBlock.src;
            alertmutationsList) => { for (const mutation of mutationsList) { if (mutation.type === 'childList' && mutation.addedNodes.length > 0) { mutation.addedNodes.forEach(node => { if (node.nodeType === Node.ELEMENT_NODE && node.ownerDocument === document) { if ((node.tagName === 'TR' || node.tagName === 'TABLE' || node.tagName === 'TBODY') && !node.classList.contains('futaba-content-processed')) { scanAndProcessPostsInNode(node); } else if(`以下の画像のハッシュを登録試行:\n${originalSrc.substring(0,100)}\n\n※登録後、この画像を含むレス全体が非表示対象になります。`);
            let imageToHashUrl = originalSrc;
            if (imgToBlock.parentNode?.tagName === 'A' && imgToBlock.parentNode.href) { const linkUrl = new URL(imgToBlock.parentNode.href, document.baseURI).href; if (/\.(jpe?g|png|gif|webp)$/i.test(linkUrl) && !linkUrl (node.querySelector && node.querySelector('tr:not(.futaba-content-processed)')) { scanAndProcessPostsInNode(node); } } }); } } });
    observer.observe(document.body, { childList: true, subtree: true });

    // --- 右クリックメニュー関連 ---
    let lastHoveredImageElement = null;
    document.addEventListener('mouseover', (event) => { if (event.target && event.target.ownerDocument === document && event.target.tagName === 'IMG') { lastHoveredImageElement = event.target; } }, true);

    GM_registerMenuCommand("■ この画像を不快登録 (レスごと.includes('futaba.htm') && !linkUrl.includes('/res/')) { imageToHashUrl = linkUrl; console.log(`%c[ブロッカー]%c 登録時: サムネの代わりにリンク先 ${imageToHashUrl.substring(0,60)}... を使用`, "color:orange;font-weight:bold;", "color:default;"); } }
            try {
                const hash = await calculateDHash(imageToHashUrl);
                if (hash) {
                    if (!blockedImageHashes.includes(hash)) {
                        blockedImageHashes.push(hash);
                        GM_setValue(IMAGE_BLOCKED_非表示)", async () => {
        if (lastHoveredImageElement?.src && lastHoveredImageElement.ownerDocument === document && lastHoveredImageElement.closest('body')) {
            const imgToBlock = lastHoveredImageElement;
            const originalSrc = imgToBlock.src;
            // alert(`以下の画像のハッシュを登録試行:\n${originalSrc.substring(0,100)}\n\n※登録後、この画像を含むレス全体が非表示対象になります。`); // 一旦アラートはコメントアウトしてHASHES_KEY, blockedImageHashes);
                        console.log('[ハッシュ登録後] GM_setValue 実行。新しいリスト:', JSON.stringify(blockedImageHashes), '件数:', blockedImageHashes.length); // DEBUG LOG
                        let checkSaved = GM_getValue(IMAGE_BLOCKED_HASHES_KEY, []); // DEBUG LOG
                        console.log('[ハッシュ登録後] 直後のGM_getValueでの確認:', JSON.stringify(checkSaved), '件数:', checkSaved.length); // DEBUG LOG
                        alert(`ハッシュ [${hash.ログで確認
            let imageToHashUrl = originalSrc;
            if (imgToBlock.parentNode?.tagName === 'A' && imgToBlock.parentNode.href) {
                const linkUrl = new URL(imgToBlock.parentNode.href, document.baseURI).href;
                if (/\.(jpe?g|png|gif|webp)$/i.test(linkUrl) && !linkUrl.includes('futaba.htm') && !linkUrl.includes('/res/')) {
                    imageToHashUrl = linkUrl;
                    substring(0,16)}...] を登録しました。\nこの画像および類似画像を含むレスは今後非表示になります。`);
                        const postRowToProcess = imgToBlock.closest('tr');
                        if (postRowToProcess?.classList.contains('futaba-content-processed')) { postRowToProcess.classList.remove('futaba-content-processed'); postRowToProcess.style.display = ''; const nextSibling = postRowToProcess.nextSibling; if (nextSibling?.classList.contains('futaba-content-processed')) nextSiblingconsole.log(`%c[ブロッカー]%c 登録時: サムネの代わりにリンク先 ${imageToH.remove(); }
                        if(imgToBlock.classList.contains('futaba-image-scan-attempted')) imgToBlock.classList.remove('futaba-image-scan-attempted');
                        if (postRowToProcess && postRowToProcess.ownerDocument === document) await processPostElement(postRowToProcess);
                        else if(imgToBlock && imgToBlock.ownerDocument === document) await processPostElement(imgToBlock);
                    } else alert(`この画像のハッシュ [${hash.substring(0,16)}...] は既に登録済。`);
                } else alert('画像のハッシュ計算に失敗しました。');
            } catch (error) { alert('ハッシュ登録中にエラー: ' + error.message); console.error("[ブロッカー] ハッシュ登録エラー:", error); }
        } else alert('画像の上にカーソルを合わせてからメニューを選択してください。(対象が異なるフレームの可能性があります)');
        lastHoveredImageElement = null;
    });

    GM_registerMenuCommand("■ 登録済み不快画像ハッシュを全てクリア", () => {
        if (confirm("本当に登録されている不快画像のハッシュを全てクリアしますか？\nこの操作は元に戻せません。")) {
            blockedImageHashes = [];
            GM_setValue(IMAGE_BLOCKED_HASHES_KEY, []);
            console.log('[ハッシュクリア後] GM_setValue 実行。リストは空のは