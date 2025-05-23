// ==UserScript機能を損なわずに、テキストNG機能の準備の第一歩として、レス本文が正しく取得できるかを確認します。
==
// @name         不快画像ブロッカー (ふたばちゃんねる用)
// @namespace    http://tampermonkey.net/
// @version      0.4.5 // 本文取得テスト*   もし本文取得で問題が発生しても、画像ブロック機能への影響を最小限に抑えます。
*版
// @description  ふたばちゃんねる上の不快な画像を知覚ハッシュで判定し、その   コンソールログで、各画像処理時にどのレスの本文が取得されたかを確認できるようにします。

**レス全体を非表示にします。(本文取得テスト追加)
// @author       You // としあき
// @matchバージョン `0.4.5` (テキスト取得準備版) コード案**

```javascript
// ==User        http://*.2chan.net/*/futaba.htm*
// @match        https://*.2chanScript==
// @name         不快画像ブロッカー (ふたばちゃんねる用)
// @.net/*/futaba.htm*
// @match        http://*.2chan.net/*/res/*.htmnamespace    http://tampermonkey.net/
// @version      0.4.5 // テキスト取得準備*
// @match        https://*.2chan.net/*/res/*.htm*
// @grant        GM版
// @description  ふたばちゃんねる上の不快な画像を判定しレス全体を非表示。_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      *
// @downloadURL  https://raw.githubusercontent.レス本文取得テスト追加。
// @author       You // としあき
// @match        http://*.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/main/YOUR_SCRIPT_FILENAME.user.2chan.net/*/futaba.htm*
// @match        https://*.2chan.net/*/futjs
// @updateURL    https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_aba.htm*
// @match        http://*.2chan.net/*/res/*.htm*
// @REPOSITORY_NAME/main/YOUR_SCRIPT_FILENAME.user.js
// @license      MIT // ふたmatch        https://*.2chan.net/*/res/*.htm*
// @grant        GM_xmlhttpRequest
ば☆ちゃんねるのMAYで開発配布したものであり、としあきならコードの利用、変更、// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenu再配布、商用利用許可します。
// ==/UserScript==

(function() {
    'use strict';

    // --- 設定値 ---
    const BLOCKED_HASHES_KEY = 'futabaCommand
// @connect      *
// @downloadURL  https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/main/YOUR_SCRIPT_FILENAME.user.js
// @Chan_blockedImageHashes_v1_postBlock'; // v0.4.4と同じキー名
    constupdateURL    https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/ SIMILARITY_THRESHOLD = 6;
    const DHASH_SIZE = 8;

    let blockedmain/YOUR_SCRIPT_FILENAME.user.js
// @license      MIT // ふたば☆ちゃんねImageHashes = GM_getValue(BLOCKED_HASHES_KEY, []);
    let processingImages = newるのMAYで開発配布したものであり、としあきならコードの利用、変更、再配布、商 Set();

    // --- dHash 計算関数 (calculateDHash) ---
    async function calculateDHash(imageUrl) {用利用許可します。
// ==/UserScript==

(function() {
    'use strict';

 /* v0.4.4 と同じ */
        if (!imageUrl || imageUrl.startsWith('data:')) { return    // --- 設定値 ---
    const BLOCKED_HASHES_KEY = 'futabaChan_blockedImage null; }
        if (processingImages.has(imageUrl)) { return null; }
        processingImages.Hashes_v1_postBlock'; // v0.4.4 と同じキー名を使用
    const SIMadd(imageUrl);
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
ILARITY_THRESHOLD = 6;
    const DHASH_SIZE = 8;

    let blockedHas                method: 'GET', url: imageUrl, responseType: 'blob', timeout: 15000hes = GM_getValue(BLOCKED_HASHES_KEY, []);
    let processingImages = new Set();,
                onload: function(response) {
                    if (response.status !== 200 && response.status !== // v0.4.4 と同じ変数名

    // --- dHash 計算関数 (calculateDHash) ---
 0) { processingImages.delete(imageUrl); return reject(new Error(`画像の取得に失敗: ${response    async function calculateDHash(imageUrl) { /* v0.4.4 と同じ */
        if (!imageUrl.status} ${imageUrl}`)); }
                    const img = new Image(); img.crossOrigin = "anonymous";
                    img.onload = () => {
                        try {
                            const canvas = document.createElement('canvas'); const || imageUrl.startsWith('data:')) return null;
        if (processingImages.has(imageUrl)) return null;
 ctx = canvas.getContext('2d');
                            const width = DHASH_SIZE + 1; const height = DH        processingImages.add(imageUrl);
        return new Promise((resolve, reject) => {
            GM_ASH_SIZE; canvas.width = width; canvas.height = height;
                            ctx.drawImage(img,xmlhttpRequest({
                method: 'GET', url: imageUrl, responseType: 'blob', timeout: 15000,
                onload: function(response) {
                    if (response.status !== 2 0, 0, width, height);
                            const imageData = ctx.getImageData(0, 0, width,00 && response.status !== 0) { processingImages.delete(imageUrl); return reject(new Error(` height); const grayPixels = [];
                            for (let i = 0; i < imageData.data.length画像の取得に失敗: ${response.status} ${imageUrl}`)); }
                    const img = new Image(); img.; i += 4) { const r = imageData.data[i], g = imageData.data[i+1], b = imageData.data[i+2]; grayPixels.push(0.299 * rcrossOrigin = "anonymous";
                    img.onload = () => {
                        try {
                            const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
                            const width = DHASH_SIZE + + 0.587 * g + 0.114 * b); }
                            let hash 1; const height = DHASH_SIZE; canvas.width = width; canvas.height = height;
 = '';
                            for (let y = 0; y < height; y++) { for (let x =                            ctx.drawImage(img, 0, 0, width, height);
                            const imageData = ctx.getImageData 0; x < width - 1; x++) { const leftPixelIndex = y * width + x; const rightPixelIndex = y * width + x + 1; if (grayPixels[leftPixelIndex] >(0, 0, width, height); const grayPixels = [];
                            for (let i = 0; i < imageData.data.length; i += 4) { const r = imageData.data[i], grayPixels[rightPixelIndex]) { hash += '1'; } else { hash += '0'; } } } g = imageData.data[i+1], b = imageData.data[i+2]; grayPixels.push(0.299 * r + 0.587 * g + 0.114
                            resolve(hash); // deleteはfinallyで
                        } catch (e) { reject(new Error(`dHash計算中のエラー: ${e.message} for ${imageUrl}`)); }
                        finally { if(img.src. * b); }
                            let hash = '';
                            for (let y = 0; y < height; y++) { for (let x = 0; x < width - 1; x++) { const l =startsWith('blob:')) URL.revokeObjectURL(img.src); processingImages.delete(imageUrl); }
                     y * width + x, r_idx = y * width + x + 1; if (grayPixels[};
                    img.onerror = () => { if(img.src.startsWith('blob:')) URL.revokel] > grayPixels[r_idx]) hash += '1'; else hash += '0'; } }
ObjectURL(img.src); processingImages.delete(imageUrl); reject(new Error(`画像の読み込みに失敗 (img.onerror                            resolve(hash);
                        } catch (e) { reject(new Error(`dHash計算中のエラー: ${e): ${imageUrl}`)); };
                    if (response.response instanceof Blob && response.response.size > 0) { img..message} for ${imageUrl}`)); }
                        finally { if(img.src.startsWith('blob:')) URLsrc = URL.createObjectURL(response.response); }
                    else { processingImages.delete(imageUrl); reject.revokeObjectURL(img.src); processingImages.delete(imageUrl); }
                    };
                    img.onerror = ()(new Error(`受信した画像データが無効です (Blobでないかサイズ0): ${imageUrl}`)); }
                },
                 => { if(img.src.startsWith('blob:')) URL.revokeObjectURL(img.src); processingImages.delete(onerror: function(error) { processingImages.delete(imageUrl); reject(new Error(`GM_xmlhttpRequestエラー: ${errorimageUrl); reject(new Error(`画像の読み込みに失敗 (img.onerror): ${imageUrl}`)); };
                    if (response..statusText || '不明なネットワークエラー'} for ${imageUrl}`)); },
                ontimeout: function() { processingImages.response instanceof Blob && response.response.size > 0) img.src = URL.createObjectURL(response.response);delete(imageUrl); reject(new Error(`GM_xmlhttpRequestタイムアウト: ${imageUrl}`)); }
            });

                    else { processingImages.delete(imageUrl); reject(new Error(`受信した画像データが無効です:        });
    }

    // --- ハミング距離計算関数 (hammingDistance) ---
    function hammingDistance ${imageUrl}`)); }
                },
                onerror: (error) => { processingImages.delete(imageUrl); reject((hash1, hash2) { /* v0.4.4 と同じ */
        if (!hash1 || !hashnew Error(`GM_xmlhttpRequestエラー: ${error.statusText || '不明'} for ${imageUrl}`)); },
2 || hash1.length !== hash2.length) { return Infinity; }
        let distance = 0;                ontimeout: () => { processingImages.delete(imageUrl); reject(new Error(`GM_xmlhttpRequestタイムアウト
        for (let i = 0; i < hash1.length; i++) { if (hash1[: ${imageUrl}`)); }
            });
        });
    }

    // --- ハミング距離計算関数 (hammingDistance)i] !== hash2[i]) { distance++; } }
        return distance;
    }

    // ---
    function hammingDistance(hash1, hash2) { /* v0.4.4 と同じ */ if (! --- 画像処理関数 (processImageElement) ---
    async function processImageElement(imgElement) {
        if (!imgElement || !imgElement.src || imgElement.classList.contains('futaba-image-processed') ||h1 || !h2 || h1.length !== h2.length) return Infinity; let d = 0; for (let i = 0; i < h1.length; i++) if (h1[ !imgElement.closest('body')) {
            return;
        }

        // ▼▼▼ 本文i] !== h2[i]) d++; return d; }

    // --- 画像処理関数 (processImage取得テスト ▼▼▼
        const postRowForText = imgElement.closest('tr');
        if (postRowForElement) ---
    async function processImageElement(imgElement) {
        if (!imgElement || !imgText) {
            const blockquote = postRowForText.querySelector('blockquote');
            if (blockquote &&Element.src || imgElement.classList.contains('futaba-image-processed') || !imgElement.closest blockquote.textContent) {
                console.log(`[v0.4.5 本文取得テスト] レス本文('body')) {
            return;
        }

        // ▼▼▼ テキスト取得処理の追加 ▼▼▼
        const postRow = imgElement.closest('tr');
        if (postRow) {
            const候補:「${blockquote.textContent.substring(0, 50).replace(/\n/g, "↵ blockquote = postRow.querySelector('blockquote');
            if (blockquote) {
                const postText = (")}...」 (画像: ${imgElement.src.substring(imgElement.src.lastIndexOf('/')+1)})blockquote.textContent || "").trim();
                let resNoText = "";
                const checkbox = postRow.querySelector`);
            } else if (blockquote) {
                // console.log(`[v0.4.5 本('input[type="checkbox"]');
                if (checkbox && checkbox.name) {
                    resNoText = `レス ${checkbox.name} `;
                }
                console.log(`[ブロッカー v0.文取得テスト] blockquote発見、しかしtextContentなし (画像: ${imgElement.src.substring(imgElement4.5] ${resNoText}の本文(一部): 「${postText.substring(0, 50)}.src.lastIndexOf('/')+1)})`);
            }
        }
        // ▲▲▲ 本文取得テストここまで ▲▲▲

        const postProcessedClass = 'futaba-post-processed-by-blocker'; //...」`);
            }
        }
        // ▲▲▲ テキスト取得処理ここまで ▲▲▲

 v0.4.4と同じクラス名
        const parentPostElement = imgElement.closest('tr') || img        const postProcessedClass = 'futaba-post-processed-by-blocker'; // v0.4.Element.closest('td'); // v0.4.4と同じ
        if (parentPostElement && parentPost4 と同じクラス名
        const parentPostElement = imgElement.closest('tr') || imgElement.closest('Element.classList.contains(postProcessedClass)) {
            imgElement.classList.add('futaba-image-processed');
            return;
        }

        imgElement.classList.add('futaba-image-td'); // この行は postRow で代替できるが、安全のため残す
        if (parentPostElement && parentPostElement.classList.contains(postProcessedClass)) {
            imgElement.classList.add('futaba-imageprocessed');
        const imageUrl = imgElement.src;
        let effectiveImageUrl = imageUrl;

        if (imgElement.-processed');
            return;
        }

        imgElement.classList.add('futaba-image-parentNode && imgElement.parentNode.tagName === 'A' && imgElement.parentNode.href) {
            constprocessed');
        const imageUrl = imgElement.src;
        let effectiveImageUrl = imageUrl;

        if ( linkUrl = new URL(imgElement.parentNode.href, document.baseURI).href;
            if (imgElement.parentNode && imgElement.parentNode.tagName === 'A' && imgElement.parentNode.href) {/\.(jpe?g|png|gif|webp)$/i.test(linkUrl) && !linkUrl.includes('futaba.htm') && !linkUrl.includes('/res/')) {
                 effectiveImageUrl =
            const linkUrl = new URL(imgElement.parentNode.href, document.baseURI).href;
 linkUrl;
            }
        }

        try {
            const currentHash = await calculateDHash(            if (/\.(jpe?g|png|gif|webp)$/i.test(linkUrl) &&effectiveImageUrl);
            if (!currentHash) {
                imgElement.classList.remove('futaba-image !linkUrl.includes('futaba.htm') && !linkUrl.includes('/res/')) {
                 effectiveImageUrl = linkUrl;
            }
        }

        try {
            const currentHash = await calculate-processed');
                return;
            }

            for (const blockedHash of blockedHashes) {
                const distance = hammingDistance(currentHash, blockedHash);
                if (distance <= SIMILARITY_THRESHOLDDHash(effectiveImageUrl);
            if (!currentHash) {
                imgElement.classList.remove('futaba-) {
                    const postRow = imgElement.closest('tr'); // このpostRowは画像ブロック用
                    ifimage-processed');
                return;
            }

            for (const blockedHash of blockedHashes) { (postRow && !postRow.classList.contains(postProcessedClass)) {
                        postRow.style.
                const distance = hammingDistance(currentHash, blockedHash);
                if (distance <= SIMILARITY_display = 'none';
                        postRow.classList.add(postProcessedClass);

                        let resNoTextTHRESHOLD) {
                    // const postRow = imgElement.closest('tr'); // 上で取得済みなので再利用
                     = "";
                        const checkbox = postRow.querySelector('input[type="checkbox"]');
                        if (checkboxif (postRow && !postRow.classList.contains(postProcessedClass)) {
                        postRow.style && checkbox.name) {
                            resNoText = `レス ${checkbox.name} `;
                        }
                        console.display = 'none';
                        postRow.classList.add(postProcessedClass);

                        let resNo.log(`%c[不快画像ブロッカー v0.4.5]%c ${resNoText}Text = "";
                        const checkbox = postRow.querySelector('input[type="checkbox"]');
                        if (の内容を非表示 (不快画像を検出、距離: ${distance})。画像URL: ${imageUrl} (ハッシュ元checkbox && checkbox.name) {
                            resNoText = `レス ${checkbox.name} `;
                        }: ${effectiveImageUrl.substring(0,60)}...)`, "color:orange;font-weight:bold
                        console.log(`%c[ブロッカー v0.4.5]%c ${resNoText}の内容を;", "color:default;");

                        const placeholderRow = document.createElement('tr');
                        placeholderRow.classList.add非表示 (不快画像を検出、距離: ${distance})。画像URL: ${imageUrl} (ハッシュ元: ${(postProcessedClass);
                        const placeholderCell = document.createElement('td');
                        const originalCell = posteffectiveImageUrl.substring(0,60)}...)`, "color:orange;font-weight:bold;", "color:default;");

                        const placeholderRow = document.createElement('tr');
                        placeholderRow.classList.Row.querySelector('td');
                        if (originalCell) {
                             placeholderCell.className = originalCell.add(postProcessedClass);
                        const placeholderCell = document.createElement('td');
                        const originalCell =className;
                             let totalColspan = 0;
                             for(const cell of Array.from(post postRow.querySelector('td');
                        if (originalCell) {
                             placeholderCell.className = originalCellRow.cells)) { totalColspan += cell.colSpan; }
                             placeholderCell.colSpan = total.className;
                             let totalColspan = Array.from(postRow.cells).reduce((sum, cellColspan > 0 ? totalColspan : 1;
                        }
                        const placeholderText = document.) => sum + cell.colSpan, 0);
                             placeholderCell.colSpan = totalColspan >createElement('span');
                        placeholderText.textContent = ``; // あなたの改変
                        placeholderText.style.css 0 ? totalColspan : 1;
                        }
                        const placeholderText = document.createElement('spanText = "color: gray; font-size: small; font-style: italic;";
                        placeholderCell.');
                        placeholderText.textContent = ``;
                        placeholderText.style.cssText = "color: gray; font-appendChild(placeholderText);
                        placeholderRow.appendChild(placeholderCell);
                        if (postRow.parentNode) {
                            postRow.parentNode.insertBefore(placeholderRow, postRow.nextSibling);
                        }
                    size: small; font-style: italic;";
                        placeholderCell.appendChild(placeholderText);
                        placeholderRow} else if (!postRow) {
                        console.log(`%c[不快画像ブロッカー v0.4..appendChild(placeholderCell);
                        if (postRow.parentNode) {
                            postRow.parentNode.insertBefore5]%c 類似画像 (距離: ${distance}) を検出。画像のみ非表示: ${imageUrl} ((placeholderRow, postRow.nextSibling);
                        }
                    } else if (!postRow) {
                        consoletrが見つからず)`, "color:orange;font-weight:bold;", "color:default;");
.log(`%c[ブロッカー v0.4.5]%c 類似画像 (距離: ${distance                        imgElement.style.display = 'none';
                    }
                    return;
                }
            }}) を検出。画像のみ非表示: ${imageUrl} (trが見つからず)`, "color:orange;font-
        } catch (error) {
            console.warn(`[不快画像ブロッカー v0.4weight:bold;", "color:default;");
                        imgElement.style.display = 'none';
                    .5] 画像処理エラー: ${error.message}`, `(対象URL: ${effectiveImageUrl})`);
            img}
                    return;
                }
            }
        } catch (error) {
            console.warnElement.classList.remove('futaba-image-processed');
        }
    }

    // --- メ(`[ブロッカー v0.4.5] 画像処理エラー: ${error.message}`, `(対象URL:イン処理 (scanImagesInNode, Observerなど) ---
    // v0.4.4 と同じ
    function scan ${effectiveImageUrl})`);
            imgElement.classList.remove('futaba-image-processed');
        }
    }

    // --- メイン処理 (scanImagesInNode, Observerなど) ---
    // (ImagesInNode(parentNode) {
        if (!parentNode || !parentNode.querySelectorAll) return; // 念のため
        v0.4.4 と同じ)
    function scanImagesInNode(parentNode) {
        if (!parentNode || !parentNode.querySelectorAll('img:not(.futaba-image-processed)').forEach(img => {
            const parentparentNode.querySelectorAll) return;
        parentNode.querySelectorAll('img:not(.futaba-image-processed)').forEachPostElement = img.closest('tr') || img.closest('td');
            if (parentPostElement &&(img => {
            const parentPostElement = img.closest('tr') || img.closest('td'); parentPostElement.classList.contains('futaba-post-processed-by-blocker')) { // クラス名注意
            if (parentPostElement && parentPostElement.classList.contains('futaba-post-processed-by
                img.classList.add('futaba-image-processed');
                return;
            }
            -blocker')) { // クラス名確認
                img.classList.add('futaba-image-processed');
if (img.src && !img.closest('a[href*="javascript:void"]')) {
                                return;
            }
            if (img.src && !img.closest('a[href*="javascript:voidif (img.complete || img.naturalWidth > 0) {
                    setTimeout(() => processImageElement(img), 0);
                } else {
                    img.addEventListener('load', () => setTimeout(() => processImageElement("]')) {
                if (img.complete || img.naturalWidth > 0) {
                    setTimeout(() => processImageElement(img), 0);
                } else {
                    img.addEventListener('load', ()img), 0), { once: true });
                    img.addEventListener('error', () => img.classList. => setTimeout(() => processImageElement(img), 0), { once: true });
                    img.addEventListener('add('futaba-image-processed'), { once: true });
                }
            } else {
                imgerror', () => img.classList.add('futaba-image-processed'), { once: true });
                .classList.add('futaba-image-processed');
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { if(document.}
            } else {
                img.classList.add('futaba-image-processed');
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('body) scanImagesInNode(document.body); });
    } else {
        if(document.body) scanImagesInNode(document.body);
    }

    const observer = new MutationObserver((mutationsListDOMContentLoaded', () => {
            if (document.body) scanImagesInNode(document.body);
        });
    ) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'child} else {
        if (document.body) scanImagesInNode(document.body);
    }

List' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if ((node.tagName === {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) 'TR' || node.tagName === 'TD') && node.classList && node.classList.contains('futaba {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if ((node.tagName === 'TR' || node.tagName === 'TD') &&-post-processed-by-blocker')) { // クラス名注意
                            if (node.querySelectorAll) node.querySelectorAll node.classList && node.classList.contains('futaba-post-processed-by-blocker')) { //('img:not(.futaba-image-processed)').forEach(img => img.classList.add('futaba クラス名確認
                            if (node.querySelectorAll) node.querySelectorAll('img:not(.futaba-image-processed)').-image-processed'));
                            return;
                        }
                        if (node.querySelectorAll) scanImagesInNode(nodeforEach(img => img.classList.add('futaba-image-processed'));
                            return;
                        }); // node自体も含むように
                        else if (node.matches && node.matches('img:not(.
                        if (node.querySelectorAll) scanImagesInNode(node); // node自体がimgの場合も考慮されるfutaba-image-processed)')) scanImagesInNode(node.parentNode); // imgが直接追加された場合
                        else if (node.tagName === 'IMG') scanImagesInNode(node.parentNode); // imgが
                    }
                });
            }
        }
    });
    if (document.body) { observer直接追加された場合は親をスキャン
                    }
                });
            }
        }
    });
    if.observe(document.body, { childList: true, subtree: true }); }
    else { document.addEventListener('DOMContentLoaded (document.body) {
        observer.observe(document.body, { childList: true, subtree:', () => { if(document.body) observer.observe(document.body, { childList: true, true });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            if (document. subtree: true }); });}


    // --- 右クリックメニュー関連 ---
    // v0.4.4 と同じbody) observer.observe(document.body, { childList: true, subtree: true });
        });
 (processImageElement を呼び出す)
    let lastHoveredImageElement = null;
    document.addEventListener('    }

    // --- 右クリックメニュー関連 ---
    // (v0.4.4 と同じ。mouseover', function(event) { if (event.target && event.target.tagName === 'IMG') { lastHoveredImageprocessImageElement を呼び出す)
    let lastHoveredImageElement = null;
    document.addEventListener('Element = event.target; } }, true);

    GM_registerMenuCommand("■ この画像(カーソル直下)mouseover', function(event) { if (event.target && event.target.tagName === 'IMG') lastHoverを不快登録", async () => {
        if (lastHoveredImageElement && lastHoveredImageElement.src && lastHoveredImageElement.closest('body')) {
            const imgToBlock = lastHoveredImageElementedImageElement = event.target; }, true);
    GM_registerMenuCommand("■ この画像を不快登録", async () => { /* v0.4.4 と同じ */ if (lastHoveredImageElement && lastHover;
            const originalSrc = imgToBlock.src;
            alert(`以下の画像のハッシュを登録試行しますedImageElement.src && lastHoveredImageElement.closest('body')) { const imgToBlock = lastHover:\n${originalSrc.substring(0,100)}${originalSrc.length > 100edImageElement; const originalSrc = imgToBlock.src; alert(`以下の画像のハッシュを登録試行 ? '...' : ''}\n\n※サムネイルの場合、リンク先の元画像が優先。\n登録後、この画像します:\n${originalSrc.substring(0,100)}${originalSrc.length > 10を含むレス全体が非表示対象になります。`);
            let imageToHashUrl = originalSrc;
            if (imgTo0 ? '...' : ''}\n\n※サムネイルの場合、リンク先の元画像が優先。\n登録Block.parentNode && imgToBlock.parentNode.tagName === 'A' && imgToBlock.parentNode.href)後、この画像を含むレス全体が非表示対象になります。`); let imageToHashUrl = originalSrc; if ( {
                const linkUrl = new URL(imgToBlock.parentNode.href, document.baseURI).hrefimgToBlock.parentNode && imgToBlock.parentNode.tagName === 'A' && imgToBlock.parentNode.;
                if (/\.(jpe?g|png|gif|webp)$/i.test(linkUrlhref) { const linkUrl = new URL(imgToBlock.parentNode.href, document.baseURI).href) && !linkUrl.includes('futaba.htm') && !linkUrl.includes('/res/')) {; if (/\.(jpe?g|png|gif|webp)$/i.test(linkUrl) && imageToHashUrl = linkUrl; console.log(`%c[不快画像ブロッカー v0.4 !linkUrl.includes('futaba.htm') && !linkUrl.includes('/res/')) { imageToHashUrl =.5]%c 登録時: サムネイル ${originalSrc.substring(0,60)}... の linkUrl; console.log(`%c[ブロッカー v0.4.5]%c 登録時:代わりにリンク先 ${imageToHashUrl.substring(0,60)}... を使用`, "color:orange サムネイル ${originalSrc.substring(0,60)}... の代わりにリンク先 ${imageToHashUrl.substring(;font-weight:bold;", "color:default;"); }
            }
            try {
                const hash = await calculateDHash(imageToHashUrl);
                if (hash) {
                    if (!blocked0,60)}... を使用`, "color:orange;font-weight:bold;", "color:defaultImageHashes.includes(hash)) {
                        blockedImageHashes.push(hash); GM_setValue(;"); } } try { const hash = await calculateDHash(imageToHashUrl); if (hash) { if (!blockedImageHashes.includes(hash)) { blockedImageHashes.push(hash); GM_setValue(BLOCKEDBLOCKED_HASHES_KEY, blockedImageHashes);
                        alert(`ハッシュ [${hash.substring_HASHES_KEY, blockedImageHashes); alert(`ハッシュ [${hash.substring(0,1(0,16)}...] を登録しました。\nこの画像および類似画像を含むレスは今後非表示になります。\n(対象: ${imageToHashUrl.substring(0,80)}...)`);
                        const postRow6)}...] を登録しました。\nこの画像および類似画像を含むレスは今後非表示になります。\n(対象: ${imageToHashUrl.substring(0,80)}...)`); const postRowToProcess = imgToToProcess = imgToBlock.closest('tr');
                        if (postRowToProcess) { // postRowToProcess がBlock.closest('tr'); if (postRowToProcess && postRowToProcess.classList.contains('futaba null でないことを確認
                             if (postRowToProcess.classList.contains('futaba-post-processed-post-processed-by-blocker')) { postRowToProcess.classList.remove('futaba-post-processed-by-blocker'); postRowToProcess.style.display = ''; const nextSibling = postRow-by-blocker')) { // クラス名注意
                                 postRowToProcess.classList.remove('futaba-ToProcess.nextSibling; if (nextSibling && nextSibling.classList && nextSibling.classList.contains('futpost-processed-by-blocker'); // クラス名注意
                                 postRowToProcess.style.display = '';aba-post-processed-by-blocker')) { nextSibling.remove(); } } imgToBlock.classList
                                 const nextSibling = postRowToProcess.nextSibling;
                                 if (nextSibling && nextSibling.classList && nextSibling.classList.contains('futaba-post-processed-by-blocker')) {.remove('futaba-image-processed'); await processImageElement(imgToBlock); } else { alert(`この画像 (または類似画像) のハッシュ [${hash.substring(0,16)}...] は既に // クラス名注意
                                     nextSibling.remove();
                                 }
                             }
                             imgTo登録されています。`); } } else { alert('画像のハッシュ計算に失敗しました。'); } } catch (error) { alert('ハッシュ登録中にエラーが発生しました: ' + error.message); console.error("[ブロッカー vBlock.classList.remove('futaba-image-processed'); // 対象画像の処理済みマークを外す
                             0.4.5] ハッシュ登録エラー:", error); } } else { alert('画像の上にマウスカーソルawait processImageElement(imgToBlock); // 再処理
                        }
                    } else { alert(`この画像 (または類似画像) のハッシュ [${hash.substring(0,16)}...] は既に登録されています。`);を合わせてからメニューを選択してください。'); } lastHoveredImageElement = null; });
    GM_registerMenuCommand("■ 登録済み不快画像ハッシュを全てクリア", () => { /* v0.4. }
                } else { alert('画像のハッシュ計算に失敗しました。画像が読み込めないか、対応していない形式の可能性があります。'); }
            } catch (error) { alert('ハッシュ登録中にエラーが発生しました4と同じ */ if (confirm("本当に登録されている不快画像のハッシュを全てクリアしますか？\nこの操作は元に戻せません。")) { blockedImageHashes = []; GM_setValue(BLOCKED_HASHES: ' + error.message); console.error("[不快画像ブロッカー v0.4.5] ハッシュ登録エラー_KEY, []); alert("登録済みハッシュを全てクリアしました。\nページを再読み込みすると、ブロック:", error); }
        } else { alert('画像の上にマウスカーソルを合わせてから、Tampermonkeyのされていた画像が表示されるようになります。"); } });
    GM_registerMenuCommand("■ 現在のブロックハッシュ数を確認", () => { /* v0.4.4と同じ */ alert(`現在 ${blockedImageHashes.拡張機能アイコンをクリックし、このメニューを選択してください。'); }
        lastHoveredImageElement = null;
    });
    GM_registerMenuCommand("■ 登録済み不快画像ハッシュを全てクリア", ()length} 件のハッシュがブロックリストに登録されています。`); });

    console.log('%c[不 => { /* v0.4.4と同じ */ if (confirm("本当に登録されている不快画像のハッシュを全て快画像ブロッカー (ふたばちゃんねる用 v0.4.5)]%c が動作を開始。テキストクリアしますか？\nこの操作は元に戻せません。")) { blockedImageHashes = []; GM_取得準備版。', "color:orange;font-weight:bold;", "color:default;");

})();
setValue(BLOCKED_HASHES_KEY, []); alert("登録済みハッシュを全てクリアしました。\nページを再読み込みすると、ブロックされていた画像が表示されるようになります。"); } });
    GM_registerMenuCommand```

**ご確認いただきたいこと**:

1.  まず、この `v0.4.5` で("■ 現在のブロックハッシュ数を確認", () => { /* v0.4.4と同じ */ alert(`現在 ${blocked、従来の画像ブロック機能が `v0.4.4` と全く同じように動作するかをご確認ください。
2.  ImageHashes.length} 件のハッシュがブロックリストに登録されています。`); });

    console.log次に、開発者ツールのコンソールを開いた状態でページを表示し、**`[ブロッカー v0.4.5]('%c[不快画像ブロッカー (ふたばちゃんねる用 v0.4.5)]%c が動作を開始しました。本文取得テスト版。', "color:orange;font-weight:bold;", " レス XXX の本文(一部): 「YYYYY...」`** のようなログが、各画像処理のタイミングcolor:default;");

})();