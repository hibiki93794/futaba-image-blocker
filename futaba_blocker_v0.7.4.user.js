// ==UserScript==
// @name         不快コンテンツブロッカー (ふたばちゃんねる用)
// @namespace    http://tampermonkey.net/
// @version      0.7.4 // メタデータ構文エラー修正
// @description  ふたばちゃんねる上の不快な画像や迷惑テキストを判定し、レス全体を非表示に(メッセージなし)。ハッシュリストのインポート/エクスポート機能付き。クロスオリジン対策試行。デバッグログ追加。
// @author       You
// @match        http://*.2chan.net/*/futaba.htm*
// @match        https://*.2chan.net/*/futaba.htm* // 「はい」を削除しました
// @match        http://*.2chan.net/*/res/*.htm*
// @match        https://*.2chan.net/*/res/*.htm*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      *
// @downloadURL  https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/main/YOUR_SCRIPT_FILENAME.user.js
// @updateURL    https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/main/YOUR_SCRIPT_FILENAME.user.js
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // --- 設定値 ---
    const IMAGE_BLOCKED_HASHESはい、承知_KEY = 'futabaChan_blockedImageHashes_v1_postBlock';
    const SIMILARITY_THRESHOLDいたしました。
前回の私のミスでメタデータブロックに「はい」という = 6;
    const DHASH_SIZE = 8;
    const TEXT_NG_RULES =日本語が混入してしまった点を修正し、バージョンを `0.7.4` (メタデータ修正版 { MIN_TEXT_LENGTH_FOR_RULES: 10, MAX_DIGITS_SEQUENCE: 30, MAX_SYMBOLS_SEQUENCE: 20, MAX_UNICODE_SYMBOLS_SEQUENCE: ) とした全コードを以下に記載します。

**修正点**:
*   バージョンを `0.7.15, MAX_ALPHABET_ONLY_SEQUENCE: 35, EMOJI_PERCENTAGE_THRESHOLD: 0.6 };

    let blockedImageHashes = GM_getValue(IMAGE_BLOCKED_4` に更新。
*   メタデータブロックの `@match https://*.2chan.net/*/futaba.htmHASHES_KEY, []);
    console.log('[ブロッカー起動時] 初期 blockedImageHashes:', JSON.stringify(*` の行から、誤って混入していた「はい」という文字を削除。

その他のデバッグログや機能は、バージョン `0.7.3` のままです。

```javascript
// ==UserScript==
// @nameblockedImageHashes), '件数:', blockedImageHashes.length);
    let processingImagesForHash = new Set();

    // --- テキストNG判定ヘルパー関数 ---
    function isTooLongDigits(text) { return         不快コンテンツブロッカー (ふたばちゃんねる用)
// @namespace    http://tamper new RegExp(`\\d{${TEXT_NG_RULES.MAX_DIGITS_SEQUENCE},}}`).test(monkey.net/
// @version      0.7.4 // メタデータ修正
// @description  ふたばtext); }
    function hasTooManySpamSymbols(text) { if (new RegExp(`[!"#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~]{${TEXT_NGちゃんねる上の不快な画像や迷惑テキストを判定し、レス全体を非表示に(メッセージなし)。ハッシュリストのインポート/エクスポート機能付き。クロスオリジン対策試行。デバッグログ追加。
// @author       You
// @match        http://*.2chan.net/*/futaba.htm*
_RULES.MAX_SYMBOLS_SEQUENCE},}`, 'u').test(text)) return true; if (new RegExp(`[\u2000-\u2BFF\u2E00-\u2E7F]{${TEXT_NG_RULES.MAX_UNICODE_SYMBOLS_SEQUENCE},}`, 'u').test(text))// @match        https://*.2chan.net/*/futaba.htm* // 「はい」を削除
// @match        http://*.2chan.net/*/res/*.htm*
// @match        https://*.2chan.net/*/res/*.htm*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue return true; return false; }
    function countEmojis(str) { const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      *
// @downloadURL  https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/main/YOUR_SCRIPT_FILENAME.user.js
// @updateURL    https://raw.900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu; const matches = str.match(emojiRegex); return matches ? matches.length : 0; }
    function isMostlyEmojis(text) { if (text.length < 5) return false; const emojiCount = countEmojis(text); return emojiCount > 0 &&githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/main/YOUR_SCRIPT_FILENAME.user.js
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // --- 設定値 ---
    const IMAGE_BLOCKED_HASHES_KEY = 'futabaChan_blockedImageHashes_v1_postBlock';
    const SIMILARITY_THRESHOLD = 6;
    const DHASH_SIZE = 8;
    const TEXT_NG_RULES = (emojiCount / text.length) >= TEXT_NG_RULES.EMOJI_PERCENTAGE_THRESHOLD; }
    function isRandomAlphabetSpam(text) { return new RegExp(`^[a-zA-Z]{${TEXT_NG_RULES.MAX_ALPHABET_ONLY_SEQUENCE},}}$`).test(text); }

    // --- 画像dHash計算関数 (calculateDHash) ---
    async function calculateDHash(imageUrl) { { MIN_TEXT_LENGTH_FOR_RULES: 10, MAX_DIGITS_SEQUENCE: 30, MAX_SYMBOLS_SEQUENCE: 20, MAX_UNICODE_SYMBOLS_SEQUENCE: 15, MAX_ALPHABET_ONLY_SEQUENCE: 35, EMOJI_PERCENTAGE_THRESHOLD: 0.6 };

    let blockedImageHashes = GM_getValue(IMAGE_BLOCKED_ if (!imageUrl || imageUrl.startsWith('data:')) return null; if (processingImagesForHash.has(imageUrl)) return null; processingImagesForHash.add(imageUrl); return new Promise((resolve, reject) => { GM_xmlhttpRequest({ method: 'GET', url: imageUrl, responseType: 'blob', timeout: 15000, onload: function(response) { if (response.status !== 200 && response.status !== 0) { processingImagesForHash.delete(imageUrl); return reject(new Error(`画像の取得に失敗: ${response.HASHES_KEY, []);
    console.log('[ブロッカー起動時] 初期 blockedImageHashes:', JSON.stringify(blockedImageHashes), '件数:', blockedImageHashes.length);
    let processingImagesForHash = new Set();

    // --- テキストNG判定ヘルパー関数 ---
    function isTooLongDigits(text) { return new RegExp(`\\d{${TEXT_NG_RULES.MAX_DIGITS_SEQUENCE},}}`).test(text); }
    function hasTooManySpamSymbols(text) { if (new RegExp(`[!"#$%status} ${imageUrl}`)); } const img = new Image(); img.crossOrigin = "anonymous"; img.onload = () => { try { const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d'); const width = DHASH_SIZE + 1; const height = DHASH_SIZE; canvas.width = width; canvas.height = height; ctx.drawImage(img, 0, 0, width, height); const imageData = ctx.&'()*+,-./:;<=>?@[\\]^_\`{|}~]{${TEXT_NG_RULES.MAX_SYMBOLS_SEQUENCE},}`, 'u').test(text)) return true; if (new RegExp(`[\u2000-\u2BFF\u2E00-\u2E7F]{${TEXT_NG_RULES.MAX_UNICODE_SYMBOLS_SEQUENCE},}`, 'u').test(text))getImageData(0, 0, width, height); const grayPixels = []; for (let i = 0; i < imageData.data.length; i += 4) { const r = imageData.data[i], g = imageData.data[i+1], b = imageData.data[i+2]; grayPixels.push(0.299 * r + 0.587 * g + 0.114 * b); } let hash = ''; for (let y = 0; y < height; y++) { for return true; return false; }
    function countEmojis(str) { const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu; const matches = str.match(emoji (let x = 0; x < width - 1; x++) { const l = y * width + x, r = y * width + x + 1; if (grayPixels[l] > grayPixels[r]) hash += '1'; else hash += '0'; } } processingImagesForHash.delete(imageUrl); resolve(hash); } catch (e) { processingImagesForHash.delete(imageUrl); reject(new Error(`dHash計算中のRegex); return matches ? matches.length : 0; }
    function isMostlyEmojis(text) { if (text.length < 5) return false; const emojiCount = countEmojis(text); return emojiCount > 0 && (emojiCount / text.length) >= TEXT_NG_RULES.EMOJI_PERCENTAGE_THRESHOLD; }
    function isRandomAlphabetSpam(text) { return new RegExp(`^[a-zA-Z]{${TEXT_NG_RULES.MAX_ALPHABET_ONLY_SEQUENCE},}}$`).test(エラー: ${e.message} for ${imageUrl}`)); } finally { URL.revokeObjectURL(img.src); } }; img.onerror = () => { processingImagesForHash.delete(imageUrl); URL.revokeObjectURL(img.src); reject(new Error(`画像の読み込みに失敗 (img.onerror): ${imageUrl}`)); }; if (response.response instanceof Blob && response.response.size > 0) img.src = URL.createObjectURL(response.response); else { processingImagesForHash.text); }

    // --- 画像dHash計算関数 (calculateDHash) ---
    async function calculateDHash(imageUrl) { if (!imageUrl || imageUrl.startsWith('data:')) return null; if (processingImagesForHash.has(imageUrl)) return null; processingImagesForHash.add(imageUrl); return new Promise((resolve, reject) => { GM_xmlhttpRequest({ method: 'GET', url: imageUrl, responseType: 'blob', timeout:delete(imageUrl); reject(new Error(`受信した画像データが無効です: ${imageUrl}`)); } }, onerror: (e) => { processingImagesForHash.delete(imageUrl); reject(new Error(`GM_xmlhttpRequestエラー: ${e.statusText || '不明'} for ${imageUrl}`)); }, ontimeout: () => { processingImagesForHash.delete(imageUrl); reject(new Error(`GM_xmlhttpRequestタイムアウト: ${imageUrl}`)); } }); }); }

    // --- ハミング 15000, onload: function(response) { if (response.status !== 200 && response.status !== 0) { processingImagesForHash.delete(imageUrl); return reject(new Error(`画像の取得に失敗: ${response.status} ${imageUrl}`)); } const img = new Image(); img.crossOrigin = "anonymous"; img.onload = () => { try { const canvas = document.createElement('canvas'); const ctx = canvas.距離計算関数 (hammingDistance) ---
    function hammingDistance(h1, h2) { if (!h1 || !h2 || h1.length !== h2.length) return Infinity; let d = 0; for (let i = 0; i < h1.length; i++) if (h1[i] !== h2[i]) d++; return d; }

    // --- レス処理関数 (processPostElement) ---getContext('2d'); const width = DHASH_SIZE + 1; const height = DHASH_SIZE; canvas.width = width; canvas.height = height; ctx.drawImage(img, 0, 0, width, height); const imageData = ctx.getImageData(0, 0, width, height); const grayPixels = []; for (let i = 0; i < imageData.data.length; i += 4) { const r = imageData.data[i], g = imageData.data[i+1], b = imageData.data[
    async function processPostElement(postElement) { if (!postElement || postElement.ownerDocument !== document || postElement.classList.contains('futaba-content-processed') || !postElement.closest('body')) { return; } const postRow = postElement.tagName === 'TR' ? postElement : postElement.closest('tr'); if (!postRow || postRow.ownerDocument !== document || postRow.classList.contains('futaba-content-processed')) { if(postElement.tagName === 'IMG' && postElement.ownerDocument === document) postElement.classList.i+2]; grayPixels.push(0.299 * r + 0.587 * g + 0.114 * b); } let hash = ''; for (let y = 0; y < height; y++) { for (let x = 0; x < width - 1; x++) { const l = y * width + x, r = y * width + x + 1; if (grayPixels[l] > grayPixels[r]) hash += '1'; else hash += '0'; } } processingImagesForadd('futaba-image-scan-attempted'); return; } postRow.classList.add('futaba-content-processed'); let ngReason = null; let ngDetails = ""; const blockquote = postRow.querySelector('blockquote'); if (blockquote && blockquote.ownerDocument === document) { const postText = (blockquote.textContent || "").trim(); if (postText.length >= TEXT_NG_RULES.MIN_TEXT_LENGTH_FOR_RULES) { if (isTooLongDigits(postText)) ngReason = "長すぎる数字列"; else if (hasTooManySpamSymbols(postText)) ngReason = "迷惑な記号が多すぎ"; else if (Hash.delete(imageUrl); resolve(hash); } catch (e) { processingImagesForHash.delete(imageUrl); reject(new Error(`dHash計算中のエラー: ${e.message} for ${imageUrl}`)); } finally { URL.revokeObjectURL(img.src); } }; img.onerror = () => { processingImagesForHash.delete(imageUrl); URL.revokeObjectURL(img.src); reject(new Error(`画像の読み込みに失敗 (img.onerror): ${imageUrl}`)); }; if (response.response instanceof Blob && response.response.size > 0) img.src = URL.createObjectURL(response.response); else { processingImagesForHash.delete(imageUrl); reject(new Error(`受信した画像データが無isMostlyEmojis(postText)) ngReason = "絵文字が多すぎ"; else if (isRandomAlphabetSpam(postText)) ngReason = "ランダム風英字"; if (ngReason) ngDetails = `テキスト「${postText.substring(0, 30)}...」`; } } if (!ngReason) { const imgElement = postRow.querySelector('img:not(.futaba-image-scan-attempted)'); if (imgElement && imgElement.ownerDocument === document && imgElement.src) { imgElement.classList.add('futaba-image-scan-attempted'); const imageUrl = imgElement.src; let effectiveImageUrl = imageUrl; if (imgElement効です: ${imageUrl}`)); } }, onerror: (e) => { processingImagesForHash.delete(imageUrl); reject(new Error(`GM_xmlhttpRequestエラー: ${e.statusText || '不明'} for ${imageUrl}`)); }, ontimeout: () => { processingImagesForHash.delete(imageUrl); reject(new Error(`GM_xmlhttpRequestタイムアウト: ${imageUrl}`)); } }); }); }

    // --- ハミング距離計算関数 (hammingDistance) ---
    function hammingDistance(h1, h2) { if (!h1 || !h2 || h1.length !== h2.length) return Infinity; let d = 0; for (let i = .parentNode?.tagName === 'A' && imgElement.parentNode.href) { const linkUrl = new URL(imgElement.parentNode.href, document.baseURI).href; if (/\.(jpe?g|png|gif|webp)$/i.test(linkUrl) && !linkUrl.includes('futaba.htm') && !linkUrl.includes('/res/')) { effectiveImageUrl = linkUrl; } } try { const currentHash = await calculateDHash(effectiveImageUrl); if (currentHash) { for (const blockedHash of blockedImageHashes) { if (hammingDistance(currentHash, blockedHash) <= SIMILARITY_THRESHOLD) { ngReason = "不0; i < h1.length; i++) if (h1[i] !== h2[i]) d++; return d; }

    // --- レス処理関数 (processPostElement) ---
    async function processPostElement(postElement) { if (!postElement || postElement.ownerDocument !== document || postElement.classList.contains('futaba-content-processed') || !postElement.closest('body')) { return; } const postRow = postElement.tagName === 'TR' ? postElement : postElement.closest('tr'); if (!postRow || postRow.ownerDocument !== document || postRow.classList.contains('futaba-content-processed')) { if快な画像"; ngDetails = `画像URL: ${imageUrl.substring(0,60)}... (ハッシュ元: ${effectiveImageUrl.substring(0,60)}...)`; break; } } } } catch (error) { console.warn(`[不快コンテンツブロッカー] 画像ハッシュ計算エラー: ${error.message}`, `(対象URL: ${effectiveImageUrl})`); } } } if (ngReason) { postRow.style.display = 'none'; let resNoText = ""; const checkbox = postRow.querySelector('input[type="checkbox"]'); if (checkbox?.name) resNoText = `レス ${checkbox.name} `; console.log(`%c[不快コンテンツブロッカー]%c ${resNoText}の内容を非表示 (理由: ${ngReason})。詳細: ${ngDetails(postElement.tagName === 'IMG' && postElement.ownerDocument === document) postElement.classList.add('futaba-image-scan-attempted'); return; } postRow.classList.add('futaba-content-processed'); let ngReason = null; let ngDetails = ""; const blockquote = postRow.querySelector('blockquote'); if (blockquote && blockquote.ownerDocument === document) { const postText = (blockquote.textContent || "").trim(); if (postText.length >= TEXT_NG_RULES.MIN_TEXT_LENGTH_FOR_RULES) { if (isTooLongDigits(postText)) ngReason = "長すぎる数字列"; else if (hasTooManySpamSymbols(postText)) ngReason = "迷惑な記号が多すぎ"; else if (isMostlyEmojis(postText)) ngReason = "絵文字が多すぎ"; else if (isRandomAlphabetSpam(postText}`, "color:crimson;font-weight:bold;", "color:default;"); } }

    // --- メイン処理 (スキャンと監視) ---
    function scanAndProcessPostsInNode(parentNode) { if (parentNode.ownerDocument !== document) return; parentNode.querySelectorAll('tr:not(.futaba-content-processed)').forEach(tr => { if (tr.ownerDocument !== document) return; if (tr.querySelector('td input[type="checkbox"][name]')) { setTimeout(() => processPostElement(tr), 0); } else { tr.classList.add('futaba-content-processed'); } }); }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', () => scanAndProcessPostsInNode(document.body)); } else { scanAndProcessPostsInNode(document)) ngReason = "ランダム風英字"; if (ngReason) ngDetails = `テキスト「${postText.substring(0, 30)}...」`; } } if (!ngReason) { const imgElement = postRow.querySelector('img:not(.futaba-image-scan-attempted)'); if (imgElement && imgElement.ownerDocument === document && imgElement.src) { imgElement.classList.add('futaba-image-scan-attempted'); const imageUrl = imgElement.src; let effectiveImageUrl = imageUrl; if (imgElement.parentNode?.tagName === 'A' && imgElement.parentNode.href) { const linkUrl = new URL(imgElement.parentNode.href, document.baseURI).href; if (/\.(jpe?g|png|gif|webp)$.body); }
    const observer = new MutationObserver((mutationsList) => { for (const mutation of mutationsList) { if (mutation.type === 'childList' && mutation.addedNodes.length > 0) { mutation.addedNodes.forEach(node => { if (node.nodeType === Node.ELEMENT_NODE && node.ownerDocument === document) { if ((node.tagName === 'TR' || node.tagName === 'TABLE' || node.tagName === 'TBODY') && !node.classList.contains('futaba-content-processed')) { scanAndProcessPostsInNode(node); } else if (node.querySelector && node.querySelector('tr:not(.futaba-content-processed)')) { scanAndProcessPostsInNode(node); } } }); } } });
    observer/i.test(linkUrl) && !linkUrl.includes('futaba.htm') && !linkUrl.includes('/res/')) { effectiveImageUrl = linkUrl; } } try { const currentHash = await calculateDHash(effectiveImageUrl); if (currentHash) { for (const blockedHash of blockedImageHashes) { if (hammingDistance(currentHash, blockedHash) <= SIMILARITY_THRESHOLD) { ngReason = "不快な画像"; ngDetails = `画像URL: ${imageUrl.substring(0,60)}... (ハッシュ元: ${effectiveImageUrl.substring(0,60)}...)`; break; } } } } catch (error) { console.warn(`.observe(document.body, { childList: true, subtree: true });

    // --- 右クリックメニュー関連 ---
    let lastHoveredImageElement = null;
    document.addEventListener('mouseover', (event) => { if (event.target && event.target.ownerDocument === document && event.target.tagName === 'IMG') { lastHoveredImageElement = event.target; } }, true);

    GM_registerMenuCommand("■ この画像を不快登録 (レスごと非表示)", async () => {
        if (lastHoveredImageElement?.src && lastHoveredImageElement.ownerDocument === document && lastHoveredImageElement.closest('body')) {
            const[不快コンテンツブロッカー] 画像ハッシュ計算エラー: ${error.message}`, `(対象URL: ${effectiveImageUrl})`); } } } if (ngReason) { postRow.style.display = 'none'; let resNoText = ""; const checkbox = postRow.querySelector('input[type="checkbox"]'); if (checkbox?.name) resNoText = `レス ${checkbox.name} `; console.log(`%c[不快コンテンツブロッカー]%c ${resNoText}の内容を非表示 (理由: ${ngReason})。詳細: ${ngDetails}`, "color:crimson;font-weight:bold;", "color:default;"); } }

    // --- メイン処理 (スキャンと監視) ---
    function scanAndProcessPostsInNode(parentNode imgToBlock = lastHoveredImageElement; const originalSrc = imgToBlock.src;
            // alert(`以下の画像のハッシュを登録試行:\n${originalSrc.substring(0,100)}\n\n※登録後、この画像を含むレス全体が非表示対象になります。`); // デバッグ中はアラートを減らす
            let imageToHashUrl = originalSrc;
            if (imgToBlock.parentNode?.tagName === 'A' && imgToBlock.parentNode.href) { const linkUrl = new URL(imgToBlock.parentNode.href, document.baseURI).href; if (/\.(jpe?g|png|gif|webp)$/i.test(linkUrl) && !linkUrl.includes('futaba.htm') && !linkUrl) { if (parentNode.ownerDocument !== document) return; parentNode.querySelectorAll('tr:not(.futaba-content-processed)').forEach(tr => { if (tr.ownerDocument !== document) return; if (tr.querySelector('td input[type="checkbox"][name]')) { setTimeout(() => processPostElement(tr), 0); } else { tr.classList.add('futaba-content-processed'); } }); }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', () => scanAndProcessPostsInNode(document.body)); } else { scanAndProcessPostsInNode(document.body); }
    const observer = new MutationObserver((mutationsList) => { for (const mutation of mutationsList) { if (mutation.type === 'childList' && mutation.addedNodes.includes('/res/')) { imageToHashUrl = linkUrl; console.log(`%c[ブロッカー]%c 登録時: サムネの代わりにリンク先 ${imageToHashUrl.substring(0,60)}... を使用`, "color:orange;font-weight:bold;", "color:default;"); } }
            try {
                const hash = await calculateDHash(imageToHashUrl);
                if (hash) {
                    if (!blockedImageHashes.includes(hash)) {
                        blockedImageHashes.push(hash);
                        GM_setValue(IMAGE_BLOCKED_HASHES_KEY, blockedImageHashes);
                        console.log('[ハッシュ登録後] GM_setValue 実行。新しいリスト:', JSON.stringify(blockedImage.length > 0) { mutation.addedNodes.forEach(node => { if (node.nodeType === Node.ELEMENT_NODE && node.ownerDocument === document) { if ((node.tagName === 'TR' || node.tagName === 'TABLE' || node.tagName === 'TBODY') && !node.classList.contains('futaba-content-processed')) { scanAndProcessPostsInNode(node); } else if (node.querySelector && node.querySelector('tr:not(.futaba-content-processed)')) { scanAndProcessPostsInNode(node); } } }); } } });
    observer.observe(document.body, { childList: true, subtree: true });

    // --- 右クリックメニュー関連 ---
    let lastHoveredImageElement = null;
    document.addEventListener('mouseover', (Hashes), '件数:', blockedImageHashes.length);
                        let checkSaved = GM_getValue(IMAGE_BLOCKED_HASHES_KEY, []);
                        console.log('[ハッシュ登録後] 直後のGM_getValueでの確認:', JSON.stringify(checkSaved), '件数:', checkSaved.length);
                        alert(`ハッシュ [${hash.substring(0,16)}...] を登録しました。\nこの画像および類似画像を含むレスは今後非表示になります。`);
                        const postRowToProcess = imgToBlock.closest('tr');
                        if (postRowToProcess?.classList.contains('futaba-content-processed')) { postRowToProcess.classList.remove('futaba-content-processed'); postRowToProcess.style.displayevent) => { if (event.target && event.target.ownerDocument === document && event.target.tagName === 'IMG') { lastHoveredImageElement = event.target; } }, true);

    GM_registerMenuCommand("■ この画像を不快登録 (レスごと非表示)", async () => {
        if (lastHoveredImageElement?.src && lastHoveredImageElement.ownerDocument === document && lastHoveredImageElement.closest('body')) {
            const imgToBlock = lastHoveredImageElement; const originalSrc = imgToBlock.src;
            // alert(`以下の画像のハッシュを登録試行:\n${originalSrc.substring(0,100)}\n\n = ''; const nextSibling = postRowToProcess.nextSibling; if (nextSibling?.classList.contains('futaba-content-processed')) nextSibling.remove(); }
                        if(imgToBlock.classList.contains('futaba-image-scan-attempted')) imgToBlock.classList.remove('futaba-image-scan-attempted');
                        if (postRowToProcess && postRowToProcess.ownerDocument === document) await processPostElement(postRowToProcess);
                        else if(imgToBlock && imgToBlock.ownerDocument === document) await processPostElement(imgToBlock);
                    } else alert(`この画像のハッシュ [${hash.substring(0,16)}...] は既に登録済。`);
                } else alert('画像のハッシュ計算※登録後、この画像を含むレス全体が非表示対象になります。`); // デバッグ中は一時的にコメントアウト
            let imageToHashUrl = originalSrc;
            if (imgToBlock.parentNode?.tagName === 'A' && imgToBlock.parentNode.href) { const linkUrl = new URL(imgToBlock.parentNode.href, document.baseURI).href; if (/\.(jpe?g|png|gif|webp)$/i.test(linkUrl) && !linkUrl.includes('futaba.htm') && !linkUrl.includes('/res/')) { imageToHashUrl = linkUrl; console.log(`%c[ブロッカー]%c 登録時: サムネの代わりにリンク先 ${imageToHashUrl.substring(0,60)}... を使用`, "に失敗しました。');
            } catch (error) { alert('ハッシュ登録中にエラー: ' + error.message); console.error("[ブロッカー] ハッシュ登録エラー:", error); }
        } else alert('画像の上にカーソルを合わせてからメニューを選択してください。(対象が異なるフレームの可能性があります)');
        lastHoveredImageElement = null;
    });

    GM_registerMenuCommand("■ 登録済み不快画像ハッシュを全てクリア", () => {
        if (confirm("本当に登録されている不快画像のハッシュを全てクリアしますか？\nこの操作は元に戻せません。")) {
            blockedImageHashes = [];
            GM_setValue(IMAGE_BLOCKED_HASHES_KEY, []);
            console.log('[ハッシュクリア後] GM_setValue color:orange;font-weight:bold;", "color:default;"); } }
            try {
                const hash = await calculateDHash(imageToHashUrl);
                if (hash) {
                    if (!blockedImageHashes.includes(hash)) {
                        blockedImageHashes.push(hash);
                        GM_setValue(IMAGE_BLOCKED_HASHES_KEY, blockedImageHashes);
                        console.log('[ハッシュ登録後] GM_setValue 実行。新しいリスト:', JSON.stringify(blockedImageHashes), '件数:', blockedImageHashes.length);
                        let checkSaved = GM_getValue(IMAGE_BLOCKED_HASHES_KEY, []);
                        console.log('[ハッシュ登録後] 直後のGM_getValueでの実行。リストは空のはず。');
            let checkCleared = GM_getValue(IMAGE_BLOCKED_HASHES_KEY, []);
            console.log('[ハッシュクリア後] 直後のGM_getValueでの確認:', JSON.stringify(checkCleared), '件数:', checkCleared.length);
            alert("登録済みハッシュを全てクリアしました。\nページを再読み込みすると、ブロックされていた画像が表示されるようになります。");
        }
    });

    GM_registerMenuCommand("■ 現在のブロックハッシュ数を確認", () => {
        let currentListFromVar = blockedImageHashes;
        let currentListFromStorage = GM_getValue(IMAGE_BLOCKED_HASHES_KEY, []);
        console.log('[ハッシュ数確認] 変数内のリスト確認:', JSON.stringify(checkSaved), '件数:', checkSaved.length);
                        alert(`ハッシュ [${hash.substring(0,16)}...] を登録しました。\nこの画像および類似画像を含むレスは今後非表示になります。`);
                        const postRowToProcess = imgToBlock.closest('tr');
                        if (postRowToProcess?.classList.contains('futaba-content-processed')) { postRowToProcess.classList.remove('futaba-content-processed'); postRowToProcess.style.display = ''; const nextSibling = postRowToProcess.nextSibling; if (nextSibling?.classList.contains('futaba-content-processed')) nextSibling.remove(); }
                        if(imgToBlock.classList.contains('futaba-image-scan-attempted')) imgToBlock.classList.remove('futaba-image-scan-attempted');:', JSON.stringify(currentListFromVar), '件数:', currentListFromVar.length);
        console.log('[ハッシュ数確認] ストレージからのリスト:', JSON.stringify(currentListFromStorage), '件数:', currentListFromStorage.length);
        alert(`現在 ${currentListFromVar.length} 件の画像ハッシュがブロックリストに登録されています。(ストレージからは ${currentListFromStorage.length} 件)`);
    });

    function exportBlockedHashes() { if (blockedImageHashes.length === 0) { alert("エクスポートするブロック済み画像ハッシュがありません。"); return; } const filename = `futaba_blocked_image_hashes_${new Date().toISOString().slice(0,10)}.json`; const jsonStr = JSON.stringify(blockedImageHashes, null
                        if (postRowToProcess && postRowToProcess.ownerDocument === document) await processPostElement(postRowToProcess);
                        else if(imgToBlock && imgToBlock.ownerDocument === document) await processPostElement(imgToBlock);
                    } else alert(`この画像のハッシュ [${hash.substring(0,16)}...] は既に登録済。`);
                } else alert('画像のハッシュ計算に失敗しました。');
            } catch (error) { alert('ハッシュ登録中にエラー: ' + error.message); console.error("[ブロッカー] ハッシュ登録エラー:", error); }
        } else alert('画像の上にカーソルを合わせてからメニューを選択してください。(対象が異なるフレームの可能性があります)');
        lastHoveredImageElement = null;
    });, 2); const blob = new Blob([jsonStr], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); alert(`${blockedImageHashes.length} 件の画像ハッシュを ${filename} としてエクスポートしました。`); }
    function importBlockedHashes() { const input = document.createElement('input'); input.type = 'file'; input.accept = '.json,text/plain'; input.style.display = 'none'; input.onchange = (event) => { const file = event.target.files[0];

    GM_registerMenuCommand("■ 登録済み不快画像ハッシュを全てクリア", () => {
        if (confirm("本当に登録されている不快画像のハッシュを全てクリアしますか？\nこの操作は元に戻せません。")) {
            blockedImageHashes = [];
            GM_setValue(IMAGE_BLOCKED_HASHES_KEY, []);
            console.log('[ハッシュクリア後] GM_setValue 実行。リストは空のはず。');
            let checkCleared = GM_getValue(IMAGE_BLOCKED_HASHES_KEY, []);
            console.log('[ハッシュクリア後] 直後のGM_getValueでの確認:', JSON.stringify(checkCleared), '件数:', checkCleared.length);
            alert("登録済みハッシュを全てクリアしました。\nページを再読み込みすると、ブロックされていた画像が表示されるようになります。");
         if (!file) { alert("ファイルが選択されませんでした。"); return; } const reader = new FileReader(); reader.onload = (e) => { try { const importedData = JSON.parse(e.target.result); if (!Array.isArray(importedData)) throw new Error("インポートデータは配列である必要があります。"); const validHashes = importedData.filter(hash => typeof hash === 'string' && /^[01]{64}$/.test(hash)); if (validHashes.length === 0 && importedData.length > 0) { alert("有効なハッシュ形式 (64桁の0または1) のデータが見つかりませんでした。"); return; } if (validHashes.length === 0 && importedData.length === 0) { alert("インポートする有効なハッシュがファイル内にありませんでした。"); return; } const oldSize = blockedImageHashes.}
    });

    GM_registerMenuCommand("■ 現在のブロックハッシュ数を確認", () => {
        let currentListFromVar = blockedImageHashes;
        let currentListFromStorage = GM_getValue(IMAGE_BLOCKED_HASHES_KEY, []);
        console.log('[ハッシュ数確認] 変数内のリスト:', JSON.stringify(currentListFromVar), '件数:', currentListFromVar.length);
        console.log('[ハッシュ数確認] ストレージからのリスト:', JSON.stringify(currentListFromStorage), '件数:', currentListFromStorage.length);
        alert(`現在 ${currentListFromVar.length} 件の画像ハッシュがブロックリストに登録されています。(ストレージからは ${currentListFromStorage.length} 件)`);
    });

    function exportBlockedHashes() { if (blockedImageHashes.length === 0) { alert("エクスlength; const combinedHashes = new Set([...blockedImageHashes, ...validHashes]); blockedImageHashes = Array.from(combinedHashes); GM_setValue(IMAGE_BLOCKED_HASHES_KEY, blockedImageHashes); const newItemsCount = blockedImageHashes.length - oldSize; alert(`${validHashes.length} 件のハッシュがファイルから読み込まれました。\n${newItemsCount} 件の新しいハッシュがリストに追加されました。\n現在の合計: ${blockedImageHashes.length} 件。\nページを再読み込みするか、新しいコンテンツが表示されると適用されます。`); } catch (error) { alert(`ファイルの読み込みまたは解析中にエラー:\n${error.message}\n\n正しいJSONファイルか確認してください。`); console.error("ハッシュインポートエラー:", error); } finally { document.body.removeChild(input); } }; reader.onerror = () => { alert("ポートするブロック済み画像ハッシュがありません。"); return; } const filename = `futaba_blocked_image_hashes_${new Date().toISOString().slice(0,10)}.json`; const jsonStr = JSON.stringify(blockedImageHashes, null, 2); const blob = new Blob([jsonStr], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); alert(`${blockedImageHashes.length} 件の画像ハッシュを ${filename} としてエクスポートしました。`); }
    function importBlockedHashes() { const input = document.createElement('input'); input.type = 'file'; input.accept = '.json,text/plain';ファイルの読み込みに失敗しました。"); console.error("FileReaderエラー:", reader.error); document.body.removeChild(input); }; reader.readAsText(file); }; document.body.appendChild(input); input.click(); }
    GM_registerMenuCommand("💾 画像ハッシュリストをエクスポート", exportBlockedHashes);
    GM_registerMenuCommand("📂 画像ハッシュリストをインポート", importBlockedHashes);

    console.log('%c[不快コンテンツブロッカー (ふたばちゃんねる用 v0.7.4)]%c が動作を開始。メタデータ修正。デバッグログ付き。', "color:orange;font-weight:bold;", "color:default;");
})();