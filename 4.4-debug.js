// ==UserScript==
// @name         不快画像ブロッカー (ふ        *   現在のメモリ上の `blockedImageHashes.length`。
        *   `GM_getValue` でストレたばちゃんねる用)
// @namespace    http://tampermonkey.net/
// @version      0.ージから直接取得したリストの `length`。
        *   両方のリストの内容自体もコンソールに出力4.4-debug // 永続化テスト強化版
// @description  ふたばちゃんねる。
3.  **これ以外の機能的なロジックには一切変更を加えません。**

**v0上の不快な画像を知覚ハッシュで判定し、そのレス全体を非表示にします。(永続化デ.4.4-debug (永続化テスト強化版) コード案**

```javascript
// ==Userバッグログ追加)
// @author       You // としあき
// @match        http://*.2chan.netScript==
// @name         不快画像ブロッカー (ふたばちゃんねる用)
// @/*/futaba.htm*
// @match        https://*.2chan.net/*/futaba.htm*namespace    http://tampermonkey.net/
// @version      0.4.4-debug // 
// @match        http://*.2chan.net/*/res/*.htm*
// @match        https://永続化テスト強化版
// @description  ふたばちゃんねる上の不快な画像を知覚ハッシュで*.2chan.net/*/res/*.htm*
// @grant        GM_xmlhttpRequest
// @grant        判定し、そのレス全体を非表示にします。(永続化デバッグログ追加)
// @author       You //GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @ としあき
// @match        http://*.2chan.net/*/futaba.htm*
//connect      *
// @downloadURL  https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/ @match        https://*.2chan.net/*/futaba.htm*
// @match        http://*.YOUR_REPOSITORY_NAME/main/YOUR_SCRIPT_FILENAME.user.js
// @updateURL    https://raw.2chan.net/*/res/*.htm*
// @match        https://*.2chan.net/*/res/*.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/main/YOUR_SCRIPT_FILENAMEhtm*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        .user.js
// @license      MIT // ふたば☆ちゃんねるのMAYで開発配布したGM_setValue
// @grant        GM_registerMenuCommand
// @connect      *
// @downloadURLものであり、としあきならコードの利用、変更、再配布、商用利用許可します。
//  https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/main/ ==/UserScript==

(function() {
    'use strict';

    // --- 設定値 ---
YOUR_SCRIPT_FILENAME.user.js
// @updateURL    https://raw.githubusercontent.com/    const BLOCKED_HASHES_KEY = 'futabaChan_blockedImageHashes_v1_postYOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/main/YOUR_SCRIPT_FILENAME.user.js
Block'; // v0.4.4 と同じキー名
    const SIMILARITY_THRESHOLD = 6// @license      MIT // ふたば☆ちゃんねるのMAYで開発配布したものであり、としあ;
    const DHASH_SIZE = 8;

    let blockedImageHashes = GM_getValue(きならコードの利用、変更、再配布、商用利用許可します。
// ==/UserScript==BLOCKED_HASHES_KEY, []);
    // ▼▼▼ DEBUG LOG ▼▼▼
    console.log(`

(function() {
    'use strict';

    // --- 設定値 ---
    const BLOCKED_[ブロッカー v0.4.4-debug START] 初期 blockedImageHashes (${BLOCKED_HASHESHASHES_KEY = 'futabaChan_blockedImageHashes_v1_postBlock_DEBUG'; // デ_KEY}):`, JSON.stringify(blockedImageHashes), '件数:', blockedImageHashes.length);バッグ用にキー名を少し変えるのもあり
    const SIMILARITY_THRESHOLD = 6;
    const
    // ▲▲▲ DEBUG LOG ▲▲▲
    let processingImages = new Set();

    // --- DHASH_SIZE = 8;

    let blockedImageHashes = GM_getValue(BLOCKED_HASH dHash 計算関数 (calculateDHash) ---
    async function calculateDHash(imageUrl) { /* あなたの vES_KEY, []);
    console.log(`[ブロッカー v0.4.4-debug START] 初期0.4.4 と同じ */
        if (!imageUrl || imageUrl.startsWith('data:')) { return null; }
ロード blockedImageHashes (${BLOCKED_HASHES_KEY}):`, JSON.stringify(blockedImageHashes), `        if (processingImages.has(imageUrl)) { return null; }
        processingImages.add(imageUrl);件数: ${blockedImageHashes.length}`);

    let processingImages = new Set();

    // --- dHash 計算
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: '関数 (calculateDHash) ---
    async function calculateDHash(imageUrl) { /* v0.4.GET', url: imageUrl, responseType: 'blob', timeout: 15000,
                onload4 と同じ */
        if (!imageUrl || imageUrl.startsWith('data:')) { return null; }
        if (processing: function(response) {
                    if (response.status !== 200 && response.status !== 0) {Images.has(imageUrl)) { return null; }
        processingImages.add(imageUrl);
        return new processingImages.delete(imageUrl); return reject(new Error(`画像の取得に失敗: ${response.status} ${ Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET', url:imageUrl}`)); }
                    const img = new Image(); img.crossOrigin = "anonymous";
                    img.onload imageUrl, responseType: 'blob', timeout: 15000,
                onload: function(response = () => {
                        try {
                            const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
                            const width = DHASH_SIZE + 1; const height = DHASH_) {
                    if (response.status !== 200 && response.status !== 0) { processingImages.delete(imageUrl); return reject(new Error(`画像の取得に失敗: ${response.status} ${imageUrl}`)); }
SIZE; canvas.width = width; canvas.height = height;
                            ctx.drawImage(img, 0, 0, width, height);
                            const imageData = ctx.getImageData(0, 0, width                    const img = new Image(); img.crossOrigin = "anonymous";
                    img.onload = () => {
                        try {
                            const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d, height); const grayPixels = [];
                            for (let i = 0; i < imageData.data.');
                            const width = DHASH_SIZE + 1; const height = DHASH_SIZE; canvas.width =length; i += 4) { const r = imageData.data[i], g = imageData.data[i+1], b = imageData.data[i+2]; grayPixels.push(0.299 * width; canvas.height = height;
                            ctx.drawImage(img, 0, 0, width, r + 0.587 * g + 0.114 * b); }
                            let height);
                            const imageData = ctx.getImageData(0, 0, width, height); const grayPixels = [];
 hash = '';
                            for (let y = 0; y < height; y++) { for (let x                            for (let i = 0; i < imageData.data.length; i += 4) { const r = imageData.data[i], g = imageData.data[i+1], b = imageData.data[ = 0; x < width - 1; x++) { const leftPixelIndex = y * width + x; const rightPixelIndex = y * width + x + 1; if (grayPixels[leftPixelIndex]i+2]; grayPixels.push(0.299 * r + 0.587 * > grayPixels[rightPixelIndex]) { hash += '1'; } else { hash += '0'; } } g + 0.114 * b); }
                            let hash = '';
                            for (let y }
                            resolve(hash);
                        } catch (e) { reject(new Error(`dHash計算中の = 0; y < height; y++) { for (let x = 0; x < width - エラー: ${e.message} for ${imageUrl}`)); }
                        finally { if(img.src.startsWith('1; x++) { const leftPixelIndex = y * width + x; const rightPixelIndex = y * widthblob:')) URL.revokeObjectURL(img.src); processingImages.delete(imageUrl); }
                    };
                    img + x + 1; if (grayPixels[leftPixelIndex] > grayPixels[rightPixelIndex]) {.onerror = () => { if(img.src.startsWith('blob:')) URL.revokeObjectURL(img. hash += '1'; } else { hash += '0'; } } }
                            resolve(hash);
                        } catch (e) { reject(new Error(`dHash計算中のエラー: ${e.message} for ${imageUrl}`)); }src); processingImages.delete(imageUrl); reject(new Error(`画像の読み込みに失敗 (img.onerror): ${imageUrl}`)); };
                    if (response.response instanceof Blob && response.response.size > 0) { img.src =
                        finally { if(img.src.startsWith('blob:')) URL.revokeObjectURL(img.src); URL.createObjectURL(response.response); }
                    else { processingImages.delete(imageUrl); reject(new Error(`受信 processingImages.delete(imageUrl); }
                    };
                    img.onerror = () => { if(img.src.した画像データが無効です (Blobでないかサイズ0): ${imageUrl}`)); }
                },
                onerror:startsWith('blob:')) URL.revokeObjectURL(img.src); processingImages.delete(imageUrl); reject(new Error(`画像の function(error) { processingImages.delete(imageUrl); reject(new Error(`GM_xmlhttpRequestエラー: ${error.読み込みに失敗 (img.onerror): ${imageUrl}`)); };
                    if (response.response instanceof Blob && response.responsestatusText || '不明なネットワークエラー'} for ${imageUrl}`)); },
                ontimeout: function() { processing.size > 0) { img.src = URL.createObjectURL(response.response); }
                    else { processingImages.delete(imageUrl); reject(new Error(`GM_xmlhttpRequestタイムアウト: ${imageUrl}`)); }
            });
        Images.delete(imageUrl); reject(new Error(`受信した画像データが無効です (Blobでないかサイズ0});
    }

    // --- ハミング距離計算関数 (hammingDistance) ---
    function hammingDistance(): ${imageUrl}`)); }
                },
                onerror: function(error) { processingImages.delete(imageUrl); reject(hash1, hash2) { /* あなたの v0.4.4 と同じ */
        if (!hashnew Error(`GM_xmlhttpRequestエラー: ${error.statusText || '不明なネットワークエラー'} for ${imageUrl1 || !h2 || hash1.length !== hash2.length) { return Infinity; }
        let}`)); },
                ontimeout: function() { processingImages.delete(imageUrl); reject(new Error(`GM_xml distance = 0;
        for (let i = 0; i < hash1.length; i++) { if (hash1[i] !== hash2[i]) { distance++; } }
        return distance;httpRequestタイムアウト: ${imageUrl}`)); }
            });
        });
    }

    // --- ハミング距離計算関数 (hammingDistance) ---
    function hammingDistance(hash1, hash2) { /* v0.4.
    }

    // --- 画像処理関数 (processImageElement) ---
    async function processImageElement(4 と同じ */
        if (!hash1 || !h2 || hash1.length !== hash2.length)imgElement) { /* あなたの v0.4.4 と同じ */
        if (!imgElement || ! { return Infinity; }
        let distance = 0;
        for (let i = 0; iimgElement.src || imgElement.classList.contains('futaba-image-processed') || !imgElement. < hash1.length; i++) { if (hash1[i] !== hash2[i]) { distanceclosest('body')) { return; }
        const postProcessedClass = 'futaba-post-processed-by-blocker++; } }
        return distance;
    }

    // --- 画像処理関数 (processImageElement) ---';
        const parentPostElement = imgElement.closest('tr') || imgElement.closest('td');
        if
    async function processImageElement(imgElement) { /* v0.4.4 と同じ */
        if (!img (parentPostElement && parentPostElement.classList.contains(postProcessedClass)) { imgElement.classList.add('futabaElement || !imgElement.src || imgElement.classList.contains('futaba-image-processed') || !imgElement.closest('body')) { return; }
        const postProcessedClass = 'futaba-post--image-processed'); return; }
        imgElement.classList.add('futaba-image-processed');
        const imageUrl = imgElement.src;
        let effectiveImageUrl = imageUrl;
        if (imgElement.parentNode &&processed-by-blocker';
        const parentPostElement = imgElement.closest('tr') || imgElement.closest('td');
        if (parentPostElement && parentPostElement.classList.contains(postProcessedClass imgElement.parentNode.tagName === 'A' && imgElement.parentNode.href) { const linkUrl = new URL(imgElement.parentNode.href, document.baseURI).href; if (/\.(jpe?g|)) { imgElement.classList.add('futaba-image-processed'); return; }
        imgElement.classList.png|gif|webp)$/i.test(linkUrl) && !linkUrl.includes('futaba.add('futaba-image-processed');
        const imageUrl = imgElement.src;
        let effectiveImageUrlhtm') && !linkUrl.includes('/res/')) { effectiveImageUrl = linkUrl; } }
        try = imageUrl;
        if (imgElement.parentNode && imgElement.parentNode.tagName === 'A' && imgElement.parentNode.href) { const linkUrl = new URL(imgElement.parentNode.href, document.base {
            const currentHash = await calculateDHash(effectiveImageUrl);
            if (!currentHash) { imgElement.classList.remove('futaba-image-processed'); return; }
            for (const blockedHash ofURI).href; if (/\.(jpe?g|png|gif|webp)$/i.test(link blockedImageHashes) {
                const distance = hammingDistance(currentHash, blockedHash);
                if (Url) && !linkUrl.includes('futaba.htm') && !linkUrl.includes('/res/')) { effectiveImageUrl = linkUrl; } }
        try {
            const currentHash = await calculateDHash(distance <= SIMILARITY_THRESHOLD) {
                    const postRow = imgElement.closest('tr');
                    effectiveImageUrl);
            if (!currentHash) { imgElement.classList.remove('futaba-image-processedif (postRow && !postRow.classList.contains(postProcessedClass)) {
                        postRow.style.display = 'none'; postRow.classList.add(postProcessedClass);
                        let resNoText ='); return; }
            for (const blockedHash of blockedImageHashes) { // blockedImageHashes を ""; const checkbox = postRow.querySelector('input[type="checkbox"]'); if (checkbox && checkbox.name) { resNoText = `レス ${checkbox.name} `; }
                        console.log(`%c[ブロ参照
                const distance = hammingDistance(currentHash, blockedHash);
                if (distance <= SIMILARITY_THRESHOLD) {
                    const postRow = imgElement.closest('tr');
                    if (postRow && !ッカー v0.4.4-debug]%c ${resNoText}の内容を非表示 (不快画像を検出、距離: ${distance})。画像URL: ${imageUrl} (ハッシュ元: ${effectiveImageUrl.substring(0postRow.classList.contains(postProcessedClass)) {
                        postRow.style.display = 'none'; postRow.classList.add(postProcessedClass);
                        let resNoText = ""; const checkbox = postRow,60)}...)`, "color:orange;font-weight:bold;", "color:default;");
.querySelector('input[type="checkbox"]'); if (checkbox && checkbox.name) { resNoText = `                        const placeholderRow = document.createElement('tr'); placeholderRow.classList.add(postProcessedClass); const placeholderレス ${checkbox.name} `; }
                        console.log(`%c[ブロッカー v0.4.4-Cell = document.createElement('td'); const originalCell = postRow.querySelector('td');
                        if (originaldebug]%c ${resNoText}の内容を非表示 (不快画像を検出、距離: ${distance})。画像URL:Cell) { placeholderCell.className = originalCell.className; let totalColspan = 0; for(const cell of Array ${imageUrl} (ハッシュ元: ${effectiveImageUrl.substring(0,60)}...)`, "color:orange;font.from(postRow.cells)) { totalColspan += cell.colSpan; } placeholderCell.colSpan = totalCol-weight:bold;", "color:default;");
                        const placeholderRow = document.createElement('tr'); placeholderspan > 0 ? totalColspan : 1; }
                        const placeholderText = document.createElement('span'); placeholderRow.classList.add(postProcessedClass); const placeholderCell = document.createElement('td'); const originalCell =Text.textContent = ``; placeholderText.style.cssText = "color: gray; font-size: small postRow.querySelector('td');
                        if (originalCell) { placeholderCell.className = originalCell.className; font-style: italic;"; placeholderCell.appendChild(placeholderText); placeholderRow.appendChild(placeholderCell);
                        if (postRow.parentNode) { postRow.parentNode.insertBefore(placeholderRow, postRow.nextSibling; let totalColspan = 0; for(const cell of Array.from(postRow.cells)) { totalColspan += cell.colSpan; } placeholderCell.colSpan = totalColspan > 0 ? totalColspan :); }
                    } else if (!postRow) { console.log(`%c[ブロッカー v0.4.4 1; }
                        const placeholderText = document.createElement('span'); placeholderText.textContent = ``; placeholder-debug]%c 類似画像 (距離: ${distance}) を検出。画像のみ非表示: ${imageUrl} (trText.style.cssText = "color: gray; font-size: small; font-style: italic;"; placeholderCell.appendChild(placeholderText); placeholderRow.appendChild(placeholderCell);
                        if (postRow.parentNodeが見つからず)`, "color:orange;font-weight:bold;", "color:default;"); imgElement.style.display = 'none'; }
                    return;
                }
            }
        } catch (error) {) { postRow.parentNode.insertBefore(placeholderRow, postRow.nextSibling); }
                    } else if console.warn(`[ブロッカー v0.4.4-debug] 画像処理エラー: ${error.message (!postRow) { console.log(`%c[ブロッカー v0.4.4-debug]%c 類似画像 (距離: ${distance}) を検出。画像のみ非表示: ${imageUrl} (trが見つから}`, `(対象URL: ${effectiveImageUrl})`); imgElement.classList.remove('futaba-image-processed'); }
    }

    // --- メイン処理 (scanImagesInNode, Observerなど) ---
    functionず)`, "color:orange;font-weight:bold;", "color:default;"); imgElement.style.display = 'none'; }
                    return;
                }
            }
        } catch (error) { scanImagesInNode(parentNode) { /* あなたの v0.4.4 と同じ */
        if (!parentNode || !parentNode.querySelectorAll) return;
        parentNode.querySelectorAll('img:not(.futaba-image-processed console.warn(`[ブロッカー v0.4.4-debug] 画像処理エラー: ${error.message}`, `)').forEach(img => {
            const parentPostElement = img.closest('tr') || img.closest('td');(対象URL: ${effectiveImageUrl})`); imgElement.classList.remove('futaba-image-processed'); }
            if (parentPostElement && parentPostElement.classList.contains('futaba-post-processed-by
    }

    // --- メイン処理 (scanImagesInNode, Observerなど) ---
    // v-blocker')) { img.classList.add('futaba-image-processed'); return; }
            if (img0.4.4 と同じ
    function scanImagesInNode(parentNode) { if (!parentNode || !parentNode.src && !img.closest('a[href*="javascript:void"]')) {
                if (img.querySelectorAll) return; parentNode.querySelectorAll('img:not(.futaba-image-processed)').forEach(img.complete || img.naturalWidth > 0) { setTimeout(() => processImageElement(img), 0); => { const parentPostElement = img.closest('tr') || img.closest('td'); if (parentPostElement && parentPostElement.classList.contains('futaba-post-processed-by-blocker')) { img.classList.add(' }
                else { img.addEventListener('load', () => setTimeout(() => processImageElement(img), 0), { once: true }); img.addEventListener('error', () => img.classList.add('futaba-image-processedfutaba-image-processed'); return; } if (img.src && !img.closest('a[href'), { once: true }); }
            } else { img.classList.add('futaba-image-processed*="javascript:void"]')) { if (img.complete || img.naturalWidth > 0) { setTimeout'); }
        });
    }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded(() => processImageElement(img), 0); } else { img.addEventListener('load', () => setTimeout(() => processImageElement(img), 0), { once: true }); img.addEventListener('error', () => img.classList.', () => { if(document.body) scanImagesInNode(document.body); });
    } else { if(document.body) scanImagesInNode(document.body); }
    const observer = new MutationObserveradd('futaba-image-processed'), { once: true }); } } else { img.classList.add('futaba-((mutationsList) => { /* あなたの v0.4.4 と同じ */ for (const mutation of mutationsimage-processed'); } }); }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', ()List) { if (mutation.type === 'childList' && mutation.addedNodes.length > 0) => { if(document.body) scanImagesInNode(document.body); });
    } else { if(document. { mutation.addedNodes.forEach(node => { if (node.nodeType === Node.ELEMENT_NODE)body) scanImagesInNode(document.body); }
    const observer = new MutationObserver((mutationsList { if ((node.tagName === 'TR' || node.tagName === 'TD') && node.classList && node) => { for (const mutation of mutationsList) { if (mutation.type === 'childList' && mutation.classList.contains('futaba-post-processed-by-blocker')) { if (node.querySelectorAll) node.querySelectorAll.addedNodes.length > 0) { mutation.addedNodes.forEach(node => { if (node.nodeType === Node.ELEMENT_NODE) { if ((node.tagName === 'TR' || node.tagName === 'TD')('img:not(.futaba-image-processed)').forEach(img => img.classList.add('futaba-image-processed')); return; } if (node.querySelectorAll) scanImagesInNode(node); else if (node.tagName && node.classList && node.classList.contains('futaba-post-processed-by-blocker')) { === 'IMG' && node.parentNode) scanImagesInNode(node.parentNode); } }); } } });
    if (document.body) { observer.observe(document.body, { childList: true, subtree: if (node.querySelectorAll) node.querySelectorAll('img:not(.futaba-image-processed)').forEach(img => img.classList.add('futaba-image-processed')); return; } if (node.querySelectorAll) scanImagesInNode( true }); } else { document.addEventListener('DOMContentLoaded', () => { if(document.body) observer.observe(node); else if (node.tagName === 'IMG' && node.parentNode) scanImagesInNode(node.document.body, { childList: true, subtree: true }); });}

    // --- 右クリックメニュー関連 ---parentNode); } }); } } });
    if (document.body) { observer.observe(document.body, { child
    let lastHoveredImageElement = null;
    document.addEventListener('mouseover', function(event) { if (event.target && event.target.tagName === 'IMG') { lastHoveredImageElement = event.List: true, subtree: true }); } else { document.addEventListener('DOMContentLoaded', () => { if(document.target; } }, true);

    GM_registerMenuCommand("■ この画像(カーソル直下)を不body) observer.observe(document.body, { childList: true, subtree: true }); });}

    // --- 右快登録", async () => {
        if (lastHoveredImageElement && lastHoveredImageElement.srcクリックメニュー関連 ---
    let lastHoveredImageElement = null;
    document.addEventListener('mouseover', function(event && lastHoveredImageElement.closest('body')) {
            const imgToBlock = lastHoveredImageElement) { if (event.target && event.target.tagName === 'IMG') { lastHoveredImageElement = event.;
            const originalSrc = imgToBlock.src;
            alert(`以下の画像のハッシュを登録試行しますtarget; } }, true);

    GM_registerMenuCommand("■ この画像を不快登録", async () => {
        if (lastHoveredImageElement && lastHoveredImageElement.src && lastHoveredImageElement:\n${originalSrc.substring(0,100)}${originalSrc.length > 100.closest('body')) {
            const imgToBlock = lastHoveredImageElement;
            const originalSrc ? '...' : ''}\n\n※サムネイルの場合、リンク先の元画像が優先。\n登録後、この画像を含むレス全体が非表示対象になります。`);
            let imageToHashUrl = originalSrc;
            if (imgTo = imgToBlock.src;
            alert(`以下の画像のハッシュを登録試行します:\n${originalBlock.parentNode && imgToBlock.parentNode.tagName === 'A' && imgToBlock.parentNode.href)Src.substring(0,100)}${originalSrc.length > 100 ? '...' : ''}\n\n※サムネイルの場合、リンク先の元画像が優先。\n登録後、この画像を含むレス全体 { const linkUrl = new URL(imgToBlock.parentNode.href, document.baseURI).href; if (/\が非表示対象になります。`);
            let imageToHashUrl = originalSrc;
            if (imgToBlock.parentNode && imgToBlock.parentNode.tagName === 'A' && imgToBlock.parentNode.href).(jpe?g|png|gif|webp)$/i.test(linkUrl) && !linkUrl.includes('futaba.htm') && !linkUrl.includes('/res/')) { imageToHashUrl = linkUrl; console.log(`%c[ブロッカー v0.4.4-debug]%c 登録時 { const linkUrl = new URL(imgToBlock.parentNode.href, document.baseURI).href; if (/\.(jpe?g|png|gif|webp)$/i.test(linkUrl) && !link: サムネイル ${originalSrc.substring(0,60)}... の代わりにリンク先 ${imageToHashUrl.substring(0,60)}... を使用`, "color:orange;font-weight:bold;",Url.includes('futaba.htm') && !linkUrl.includes('/res/')) { imageToHashUrl = linkUrl; console.log(`%c[ブロッカー v0.4.4-debug]%c  "color:default;"); } }
            try {
                const hash = await calculateDHash(imageToHashUrl);
                if (hash) {
                    if (!blockedImageHashes.includes(hash)) {
                        blocked登録時: サムネイル ${originalSrc.substring(0,60)}... の代わりにリンク先 ${imageToHashUrl.substring(0,60)}... を使用`, "color:orange;font-weight:ImageHashes.push(hash);
                        // ▼▼▼ DEBUG LOG ▼▼▼
                        console.logbold;", "color:default;"); } }
            try {
                const hash = await calculateDHash((`[ブロッカー v0.4.4-debug HASH ADD] blockedImageHashes に push 後:`, JSON.imageToHashUrl);
                if (hash) {
                    if (!blockedImageHashes.includes(hash)) {
                        blockedImageHashes.push(hash);
                        console.log(`[ブロッカー v0stringify(blockedImageHashes), '件数:', blockedImageHashes.length);
                        GM_setValue(.4.4-debug REG] blockedImageHashes.push後:`, JSON.stringify(blockedImageHashes), `BLOCKED_HASHES_KEY, blockedImageHashes);
                        console.log(`[ブロッカー v0件数: ${blockedImageHashes.length}`);
                        GM_setValue(BLOCKED_HASHES_KEY.4.4-debug HASH ADD] GM_setValue(${BLOCKED_HASHES_KEY}) 実行後`);, blockedImageHashes);
                        console.log(`[ブロッカー v0.4.4-debug REG
                        let_check_save = GM_getValue(BLOCKED_HASHES_KEY, []);
                        console.log(`] GM_setValue後 (${BLOCKED_HASHES_KEY})`);
                        let verifySaved = GM_getValue(BLOCKED[ブロッカー v0.4.4-debug HASH ADD] 直後のGM_getValue確認:`, JSON._HASHES_KEY, []);
                        console.log(`[ブロッカー v0.4.4-debugstringify(_check_save), '件数:', _check_save.length);
                        // ▲▲▲ DEBUG LOG ▲ REG] GM_setValue直後のGM_getValue確認:`, JSON.stringify(verifySaved), `件数: ${verifySaved▲▲
                        alert(`ハッシュ [${hash.substring(0,16)}...] を登録しました。\.length}`);
                        alert(`ハッシュ [${hash.substring(0,16)}...] を登録しましたnこの画像および類似画像を含むレスは今後非表示になります。\n(対象: ${imageToHashUrl.substring(。\nこの画像および類似画像を含むレスは今後非表示になります。\n(対象: ${imageToHashUrl.0,80)}...)`);
                        const postRowToProcess = imgToBlock.closest('tr');
substring(0,80)}...)`);
                        const postRowToProcess = imgToBlock.closest('tr                        if (postRowToProcess) { /* ... あなたの v0.4.4 の即時反映処理 ...');
                        if (postRowToProcess) { if (postRowToProcess.classList.contains('futaba */
                            if (postRowToProcess.classList.contains('futaba-post-processed-by-blocker')) {-post-processed-by-blocker')) { postRowToProcess.classList.remove('futaba-post
                                postRowToProcess.classList.remove('futaba-post-processed-by-blocker');
                                postRowToProcess.style.display = '';
                                const nextSibling = postRowToProcess.nextSibling-processed-by-blocker'); postRowToProcess.style.display = ''; const nextSibling = postRowToProcess.nextSibling; if (nextSibling && nextSibling.classList && nextSibling.classList.contains('fut;
                                if (nextSibling && nextSibling.classList && nextSibling.classList.contains('futaba-postaba-post-processed-by-blocker')) { nextSibling.remove(); } } imgToBlock.classList-processed-by-blocker')) {
                                    nextSibling.remove();
                                }
                            }
.remove('futaba-image-processed'); await processImageElement(imgToBlock); }
                    } else {                            imgToBlock.classList.remove('futaba-image-processed');
                            await processImageElement(img alert(`この画像 (または類似画像) のハッシュ [${hash.substring(0,16)}...] は既に登録ToBlock);
                        }
                    } else { alert(`この画像 (または類似画像) のハッシュ [${hashされています。`); }
                } else { alert('画像のハッシュ計算に失敗しました。画像が読み込めないか、対応していない形式の可能性があります。'); }
            } catch (error) { alert('ハッシュ登録中に.substring(0,16)}...] は既に登録されています。`); }
                } else { alert('画像のハッシュ計算に失敗しました。画像が読み込めないか、対応していない形式の可能性があります。'); }
            エラーが発生しました: ' + error.message); console.error("[ブロッカー v0.4.4-debug] ハッシュ登録エラー:", error); }
        } else { alert('画像の上にマウスカーソルを合わせてから、Tam} catch (error) { alert('ハッシュ登録中にエラーが発生しました: ' + error.message); console.error("[ブロッカー v0.4.4-debug] ハッシュ登録エラー:", error); }
        }permonkeyの拡張機能アイコンをクリックし、このメニューを選択してください。'); }
        lastHoveredImageElement = else { alert('画像の上にマウスカーソルを合わせてから、Tampermonkeyの拡張機能アイコンをクリックし、この null;
    });

    GM_registerMenuCommand("■ 登録済み不快画像ハッシュを全てクリア",メニューを選択してください。'); }
        lastHoveredImageElement = null;
    });

    GM_register () => {
        if (confirm("本当に登録されている不快画像のハッシュを全てクリアしますか？\nこの操作は元に戻せません。")) {
            blockedImageHashes = [];
            GM_setValue(BLOCKEDMenuCommand("■ 登録済み不快画像ハッシュを全てクリア", () => {
        if (confirm("本当に登録されている不快画像のハッシュを全てクリアしますか？\nこの操作は元に戻せません_HASHES_KEY, []);
            console.log(`[ブロッカー v0.4.4-debug CLEAR] GM。")) {
            // ▼▼▼ DEBUG LOG ▼▼▼
            console.log(`[ブロッカー v0._setValue([])後 (${BLOCKED_HASHES_KEY})`);
            let verifyCleared = GM_getValue(BLOCKED_4.4-debug HASH CLEAR] クリア前の blockedImageHashes:`, JSON.stringify(blockedImageHashes),HASHES_KEY, []);
            console.log(`[ブロッカー v0.4.4-debug CLEAR '件数:', blockedImageHashes.length);
            blockedImageHashes = [];
            console.log] 直後のGM_getValue確認:`, JSON.stringify(verifyCleared), `件数: ${verifyCleared.length(`[ブロッカー v0.4.4-debug HASH CLEAR] blockedImageHashes = [] 直後:}`);
            alert("登録済みハッシュを全てクリアしました。\nページを再読み込みすると、ブロックされていた`, JSON.stringify(blockedImageHashes), '件数:', blockedImageHashes.length);
            GM_setValue(BLOCKED_HASHES_KEY, []);
            console.log(`[ブロッカー v0.画像が表示されるようになります。");
        }
    });

    GM_registerMenuCommand("■ 現在のブロックハッシュ数を確認", () => {
        let currentListFromVar = blockedImageHashes;
        let current4.4-debug HASH CLEAR] GM_setValue(${BLOCKED_HASHES_KEY}, []) 実行後ListFromStorage = GM_getValue(BLOCKED_HASHES_KEY, []);
        console.log(`[`);
            let _check_cleared = GM_getValue(BLOCKED_HASHES_KEY, []);
ブロッカー v0.4.4-debug COUNT] 変数内 blockedImageHashes:`, JSON.stringify            console.log(`[ブロッカー v0.4.4-debug HASH CLEAR] 直後のGM_(currentListFromVar), `件数: ${currentListFromVar.length}`);
        console.log(`getValue確認:`, JSON.stringify(_check_cleared), '件数:', _check_cleared.length[ブロッカー v0.4.4-debug COUNT] ストレージから (${BLOCKED_HASHES_KEY}):);
            // ▲▲▲ DEBUG LOG ▲▲▲
            alert("登録済みハッシュを全てクリアしました。\nページを再読み込みすると、ブロックされていた画像が表示されるようになります。");
        }
    });

`, JSON.stringify(currentListFromStorage), `件数: ${currentListFromStorage.length}`);
            GM_registerMenuCommand("■ 現在のブロックハッシュ数を確認", () => {
        // ▼▼alert(`現在メモリ上 ${currentListFromVar.length} 件 / ストレージ上 ${currentListFromStorage.length} 件のハッシュが登録されています。`);
    });

    console.log(`%c[不快画像ブロッカー▼ DEBUG LOG ▼▼▼
        const currentListFromVar_debug = blockedImageHashes;
        const currentListFromStorage_debug = GM_getValue(BLOCKED_HASHES_KEY, []);
        console.log(` (ふたばちゃんねる用 v0.4.4-debug)]%c が動作を開始しました。永続化テスト強化版。`, "color:orange;font-weight:bold;", "color:default;");[ブロッカー v0.4.4-debug HASH COUNT] 変数内 blockedImageHashes:`, JSON.stringify

})();