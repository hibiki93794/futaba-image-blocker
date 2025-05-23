// ==UserScript==
// @name         不快コンテンツブロッカー (ふたばちゃんねる用)
// @namespace    http://tampermonkey.net/
// @version      0.5.0 // ランダム文字列NG機能追加
// @description  ふたばちゃんねる上の不快な画像や迷惑な文字列パターンを含むレスを判定し、そのレス全体を非表示にします。
// @author       You // としあき
// @match        http://*.2chan.net/*/futaba.htm*
// @match        https://*.2chan.net/*/futaba.htm*
// @match        http://*.2chan.net/*/res/*.htm*
// @match        https://*.2chan.net/*/res/*.htm*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      *
// @downloadURL  https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/main/YOUR_SCRIPT_FILENAME.user.js
// @updateURL    https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/main/YOUR_SCRIPT_FILENAME.user.js
// @license      MIT // ふたば☆ちゃんねるのMAYで開発配布したものであり、としあきならコードの利用、変更、再配布、商用利用許可します。
// ==/UserScript==

(function() {
    'use strict';

    // --- 設定値 ---
    const BLOCKED_HASHES_KEY = 'futabaChan_blockedImageHashes_v1_postBlock'; // 画像ハッシュ用
    const SIMILARITY_THRESHOLD = 6; // 画像類似度の閾値
    const DHASH_SIZE = 8;         // 画像dHashのサイズ

    // ▼▼▼ テキストNGルール用設定 (ランダム文字列などの判定用) ▼▼▼
    const TEXT_NG_RULES = {
        MIN_TEXT_LENGTH_FOR_PATTERNS: 10, // この文字数以下のテキストはパターン判定対象外
        MAX_DIGITS_SEQUENCE: 50,          // これ以上の連続数字はNG
        MAX_ASCII_SYMBOLS_SEQUENCE: 30,   // これ以上の連続ASCII記号はNG
        MAX_SINGLE_CHAR_SEQUENCE: 30,     // これ以上の単一文字連続はNG
        MIN_LENGTH_FOR_EMOJI_RULE: 10,    // 絵文字ルール適用のための最小レス長
        EMOJI_PERCENTAGE_THRESHOLD: 0.8,  // レス長に対する絵文字の割合の閾値 (80%)
        MAX_ALPHABET_ONLY_SEQUENCE: 70    // これ以上の英字のみの連続はNG (オプション的)
    };

    let blockedImageHashes = GM_getValue(BLOCKED_HASHES_KEY, []);
    let processingImagesForHash = new Set(); // dHash計算中の画像URLを管理 (旧 processingImages)

    // --- dHash 計算関数 (calculateDHash) ---
    async function calculateDHash(imageUrl) { /* v0.4.4 とほぼ同じ、変数名修正 */
        if (!imageUrl || imageUrl.startsWith('data:')) return null;
        if (processingImagesForHash.has(imageUrl)) return null;
        processingImagesForHash.add(imageUrl);
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET', url: imageUrl, responseType: 'blob', timeout: 15000,
                onload: function(response) {
                    if (response.status !== 200 && response.status !== 0) { processingImagesForHash.delete(imageUrl); return reject(new Error(`画像の取得に失敗: ${response.status} ${imageUrl}`)); }
                    const img = new Image(); img.crossOrigin = "anonymous";
                    img.onload = () => {
                        try {
                            const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
                            const width = DHASH_SIZE + 1; const height = DHASH_SIZE; canvas.width = width; canvas.height = height;
                            ctx.drawImage(img, 0, 0, width, height);
                            const imageData = ctx.getImageData(0, 0, width, height); const grayPixels = [];
                            for (let i = 0; i < imageData.data.length; i += 4) { const r = imageData.data[i], g = imageData.data[i+1], b = imageData.data[i+2]; grayPixels.push(0.299 * r + 0.587 * g + 0.114 * b); }
                            let hash = '';
                            for (let y = 0; y < height; y++) { for (let x = 0; x < width - 1; x++) { const l = y * width + x, r_idx = y * width + x + 1; if (grayPixels[l] > grayPixels[r_idx]) hash += '1'; else hash += '0'; } }
                            resolve(hash);
                        } catch (e) { reject(new Error(`dHash計算中のエラー: ${e.message} for ${imageUrl}`)); }
                        finally { if(img.src.startsWith('blob:')) URL.revokeObjectURL(img.src); processingImagesForHash.delete(imageUrl); }
                    };
                    img.onerror = () => { if(img.src.startsWith('blob:')) URL.revokeObjectURL(img.src); processingImagesForHash.delete(imageUrl); reject(new Error(`画像の読み込みに失敗 (img.onerror): ${imageUrl}`)); };
                    if (response.response instanceof Blob && response.response.size > 0) img.src = URL.createObjectURL(response.response);
                    else { processingImagesForHash.delete(imageUrl); reject(new Error(`受信した画像データが無効です: ${imageUrl}`)); }
                },
                onerror: (err) => { processingImagesForHash.delete(imageUrl); reject(new Error(`GM_xmlhttpRequestエラー: ${err.statusText || '不明'} for ${imageUrl}`)); },
                ontimeout: () => { processingImagesForHash.delete(imageUrl); reject(new Error(`GM_xmlhttpRequestタイムアウト: ${imageUrl}`)); }
            });
        });
    }

    // --- ハミング距離計算関数 (hammingDistance) ---
    function hammingDistance(hash1, hash2) { /* v0.4.4と同じ */ if (!h1 || !h2 || h1.length !== h2.length) return Infinity; let d = 0; for (let i = 0; i < h1.length; i++) if (h1[i] !== h2[i]) d++; return d; }

    // --- テキストNGパターン判定ヘルパー関数群 ---
    function isTooLongDigits(text) { return new RegExp(`\\d{${TEXT_NG_RULES.MAX_DIGITS_SEQUENCE},}}`).test(text); }
    function hasTooManyAsciiSymbols(text) { return new RegExp(`[!"#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~]{${TEXT_NG_RULES.MAX_ASCII_SYMBOLS_SEQUENCE},}}`, 'u').test(text); }
    function isSingleCharTooLong(text) { return new RegExp(`(.)\\1{${TEXT_NG_RULES.MAX_SINGLE_CHAR_SEQUENCE - 1},}}`, 'u').test(text); } // N-1を指定
    function countEmojis(str) { const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu; const matches = str.match(emojiRegex); return matches ? matches.length : 0; }
    function isMostlyEmojis(text) { if (text.length < TEXT_NG_RULES.MIN_LENGTH_FOR_EMOJI_RULE) return false; const emojiCount = countEmojis(text); return emojiCount > 0 && (emojiCount / text.length) >= TEXT_NG_RULES.EMOJI_PERCENTAGE_THRESHOLD; }
    function isLongAlphabetOnly(text) { return new RegExp(`^[a-zA-Z]{${TEXT_NG_RULES.MAX_ALPHABET_ONLY_SEQUENCE},}}$`).test(text); }

    // --- レス全体を処理する関数 (旧processImageElement) ---
    async function processPostRow(postRowElement) {
        if (!postRowElement || !postRowElement.matches || !postRowElement.matches('tr') || // TR要素か確認
            postRowElement.classList.contains('futaba-content-processed-final') || // 最終処理済みか
            !postRowElement.closest('body')) {
            return;
        }
        // このレスが既に他の理由で非表示にされていれば何もしない
        if (postRowElement.style.display === 'none') {
            postRowElement.classList.add('futaba-content-processed-final'); // 念のためマーク
            return;
        }

        postRowElement.classList.add('futaba-content-processing'); // 現在処理中マーク

        let ngReason = null;
        let ngDetails = "";

        // 1. テキストNG判定 (パターンNG)
        const blockquote = postRowElement.querySelector('blockquote');
        if (blockquote) {
            const postText = (blockquote.textContent || "").trim();
            if (postText.length >= TEXT_NG_RULES.MIN_TEXT_LENGTH_FOR_PATTERNS) {
                if (isTooLongDigits(postText)) ngReason = "長すぎる数字列";
                else if (hasTooManyAsciiSymbols(postText)) ngReason = "迷惑なASCII記号列";
                else if (isSingleCharTooLong(postText)) ngReason = "単一文字の超長連続";
                else if (isMostlyEmojis(postText)) ngReason = "絵文字が大部分";
                else if (isLongAlphabetOnly(postText)) ngReason = "長すぎる英字のみの文字列";
                // 他のパターンNGルールもここに追加可能

                if (ngReason) ngDetails = `テキスト「${postText.substring(0, 30)}...」`;
            }
        }

        // 2. 画像NG判定 (テキストNGでブロックされていない場合のみ)
        if (!ngReason) {
            const imgElement = postRowElement.querySelector('img:not(.futaba-image-scan-attempted)');
            if (imgElement && imgElement.src) {
                imgElement.classList.add('futaba-image-scan-attempted');
                const imageUrl = imgElement.src;
                let effectiveImageUrl = imageUrl;
                if (imgElement.parentNode && imgElement.parentNode.tagName === 'A' && imgElement.parentNode.href) {
                    const linkUrl = new URL(imgElement.parentNode.href, document.baseURI).href;
                    if (/\.(jpe?g|png|gif|webp)$/i.test(linkUrl) && !linkUrl.includes('futaba.htm') && !linkUrl.includes('/res/')) {
                        effectiveImageUrl = linkUrl;
                    }
                }
                try {
                    const currentHash = await calculateDHash(effectiveImageUrl);
                    if (currentHash) {
                        for (const blockedHash of blockedImageHashes) {
                            const distance = hammingDistance(currentHash, blockedHash);
                            if (distance <= SIMILARITY_THRESHOLD) {
                                ngReason = "不快な画像";
                                ngDetails = `類似度: ${distance}, URL: ${imageUrl.substring(0,30)}...`;
                                break;
                            }
                        }
                    }
                } catch (error) {
                    console.warn(`[ブロッカー] 画像ハッシュ計算エラー: ${error.message}`, `(対象URL: ${effectiveImageUrl})`);
                }
            }
        }

        // NG理由があればレスを非表示にする
        if (ngReason) {
            postRowElement.style.display = 'none';
            postRowElement.classList.add('futaba-content-processed-final'); // 最終的なブロックマーク

            let resNoText = "";
            const checkbox = postRowElement.querySelector('input[type="checkbox"]');
            if (checkbox && checkbox.name) resNoText = `レス ${checkbox.name} `;

            console.log(`%c[ブロッカー]%c ${resNoText}を非表示 (理由: ${ngReason})。詳細: ${ngDetails}`, "color:crimson;font-weight:bold;", "color:default;");

            // プレースホルダー行の作成と挿入 (v0.4.4でのあなたの改変を維持)
            const placeholderRow = document.createElement('tr');
            placeholderRow.classList.add('futaba-content-processed-final'); // こちらもマーク
            const placeholderCell = document.createElement('td');
            const originalCell = postRowElement.querySelector('td');
            if (originalCell) {
                 placeholderCell.className = originalCell.className;
                 let totalColspan = Array.from(postRowElement.cells).reduce((sum, cell) => sum + cell.colSpan, 0);
                 placeholderCell.colSpan = totalColspan > 0 ? totalColspan : 1;
            }
            const placeholderText = document.createElement('span');
            placeholderText.textContent = ``; // 空のテキスト
            placeholderText.style.cssText = "color: gray; font-size: small; font-style: italic;";
            placeholderCell.appendChild(placeholderText);
            placeholderRow.appendChild(placeholderCell);
            if (postRowElement.parentNode) {
                postRowElement.parentNode.insertBefore(placeholderRow, postRowElement.nextSibling);
            }
        }
        postRowElement.classList.remove('futaba-content-processing'); // 処理中マーク解除
    }

    // --- メイン処理 (スキャンと監視) ---
    function scanAndProcessPosts(parentNode) {
        // futaba-content-processed-final が付いていないレス行(TR)のみを対象にする
        parentNode.querySelectorAll('tr:not(.futaba-content-processed-final)').forEach(tr => {
            if (tr.querySelector('td input[type="checkbox"][name]') && !tr.classList.contains('futaba-content-processing')) { // 処理中でないか確認
                 setTimeout(() => processPostRow(tr), 0);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => scanAndProcessPosts(document.body));
    } else {
        scanAndProcessPosts(document.body);
    }

    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.matches && node.matches('tr') && node.querySelector('td input[type="checkbox"][name]') &&
                            !node.classList.contains('futaba-content-processed-final') &&
                            !node.classList.contains('futaba-content-processing')) {
                            setTimeout(() => processPostRow(node), 0);
                        } else if (node.querySelectorAll) {
                            node.querySelectorAll('tr:not(.futaba-content-processed-final):not(.futaba-content-processing)').forEach(potentialPostRow => {
                                if (potentialPostRow.querySelector('td input[type="checkbox"][name]')) {
                                    setTimeout(() => processPostRow(potentialPostRow), 0);
                                }
                            });
                        }
                    }
                });
            }
        }
    });
    if (document.body) observer.observe(document.body, { childList: true, subtree: true });


    // --- 右クリックメニュー関連 ---
    // (processPostRow を呼び出すように変更)
    let lastHoveredImageElement = null;
    document.addEventListener('mouseover', function(event) { if (event.target.tagName === 'IMG') lastHoveredImageElement = event.target; }, true);

    GM_registerMenuCommand("■ この画像を不快登録", async () => {
        if (lastHoveredImageElement && lastHoveredImageElement.src && lastHoveredImageElement.closest('body')) {
            const imgToBlock = lastHoveredImageElement;
            const originalSrc = imgToBlock.src;
            alert(`以下の画像のハッシュを登録試行します:\n${originalSrc.substring(0,100)}${originalSrc.length > 100 ? '...' : ''}\n\n※サムネイルの場合、リンク先の元画像が優先。\n登録後、この画像を含むレス全体が非表示対象になります。`);
            let imageToHashUrl = originalSrc;
            if (imgToBlock.parentNode && imgToBlock.parentNode.tagName === 'A' && imgToBlock.parentNode.href) {
                const linkUrl = new URL(imgToBlock.parentNode.href, document.baseURI).href;
                if (/\.(jpe?g|png|gif|webp)$/i.test(linkUrl) && !linkUrl.includes('futaba.htm') && !linkUrl.includes('/res/')) { imageToHashUrl = linkUrl; console.log(`%c[ブロッカー]%c 登録時: サムネイル ${originalSrc.substring(0,60)}... の代わりにリンク先 ${imageToHashUrl.substring(0,60)}... を使用`, "color:orange;font-weight:bold;", "color:default;"); }
            }
            try {
                const hash = await calculateDHash(imageToHashUrl);
                if (hash) {
                    if (!blockedImageHashes.includes(hash)) {
                        blockedImageHashes.push(hash); GM_setValue(BLOCKED_HASHES_KEY, blockedImageHashes);
                        alert(`ハッシュ [${hash.substring(0,16)}...] を登録しました。\nこの画像および類似画像を含むレスは今後非表示になります。\n(対象: ${imageToHashUrl.substring(0,80)}...)`);
                        const postRowToProcess = imgToBlock.closest('tr');
                        if (postRowToProcess) {
                            postRowToProcess.classList.remove('futaba-content-processing', 'futaba-content-processed-final'); // マーク解除
                            postRowToProcess.style.display = '';
                            const placeholder = postRowToProcess.nextSibling;
                            if (placeholder && placeholder.classList && placeholder.classList.contains('futaba-content-processed-final') && placeholder.querySelector('span')?.textContent === '') {
                                placeholder.remove();
                            }
                            const imagesInPost = postRowToProcess.querySelectorAll('img.futaba-image-scan-attempted');
                            imagesInPost.forEach(img => img.classList.remove('futaba-image-scan-attempted'));
                            await processPostRow(postRowToProcess); // レス行全体を再処理
                        }
                    } else { alert(`この画像 (または類似画像) のハッシュ [${hash.substring(0,16)}...] は既に登録されています。`); }
                } else { alert('画像のハッシュ計算に失敗しました。'); }
            } catch (error) { alert('ハッシュ登録中にエラーが発生しました: ' + error.message); console.error("[ブロッカー] ハッシュ登録エラー:", error); }
        } else { alert('画像の上にマウスカーソルを合わせてからメニューを選択してください。'); }
        lastHoveredImageElement = null;
    });
    GM_registerMenuCommand("■ 登録済み不快画像ハッシュを全てクリア", () => { /* v0.4.4と同じ */ if (confirm("本当に登録されている不快画像のハッシュを全てクリアしますか？\nこの操作は元に戻せません。")) { blockedImageHashes = []; GM_setValue(BLOCKED_HASHES_KEY, []); alert("登録済みハッシュを全てクリアしました。\nページを再読み込みすると、ブロックされていた画像が表示されるようになります。"); } });
    GM_registerMenuCommand("■ 現在のブロックハッシュ数を確認", () => { /* v0.4.4と同じ */ alert(`現在 ${blockedImageHashes.length} 件のハッシュがブロックリストに登録されています。`); });

    console.log('%c[不快コンテンツブロッカー (ふたばちゃんねる用 v0.5.0)]%c が動作を開始。ランダム文字列NG機能追加。', "color:orange;font-weight:bold;", "color:default;");

})();