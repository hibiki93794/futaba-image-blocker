// ==UserScript==
// @name         不快コンテンツブロッカー (ふたばちゃんねる用)
// @namespace    http://tampermonkey.net/
// @version      0.5.0 // 指定NGワード機能追加
// @description  ふたばちゃんねる上の不快な画像や指定NGワードを含むレスを判定し、そのレス全体を非表示にします。
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
    const SIMILARITY_THRESHOLD = 6;
    const DHASH_SIZE = 8;

    // ▼▼▼ ユーザー指定NGワードリスト (ここにNGにしたい単語を文字列で追加してください) ▼▼▼
    // 例: const USER_SPECIFIED_NG_WORDS = ["迷惑単語A", "いやな言葉B"];
    // NGワードは基本的に小文字で登録し、判定時も小文字で比較することを推奨します。
    const USER_SPECIFIED_NG_WORDS = [
        // "ここにngワード1",
        // "ここにngワード2",
    ]; // 初期状態は空

    let blockedImageHashes = GM_getValue(BLOCKED_HASHES_KEY, []);
    let processingImagesForHash = new Set(); // dHash計算中の画像URLを管理

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

    // --- 指定NGワード判定関数 ---
    function getMatchedUserNGWord(text) {
        if (USER_SPECIFIED_NG_WORDS.length === 0 || !text) return null;
        const lowerText = text.toLowerCase(); // 本文を小文字に
        for (const ngWord of USER_SPECIFIED_NG_WORDS) {
            if (ngWord && lowerText.includes(ngWord.toLowerCase())) { // NGワードも小文字にして比較
                return ngWord; // 一致した元のNGワード(大文字小文字区別なしで登録されたもの)を返す
            }
        }
        return null;
    }

    // --- レス全体を処理する関数 (旧processImageElement) ---
    async function processPostRow(postRowElement) {
        if (!postRowElement || postRowElement.classList.contains('futaba-content-processed') || !postRowElement.closest('body')) {
            return;
        }
        // このレスが既に他の理由で非表示にされていれば何もしない (マークは共通)
        if (postRowElement.style.display === 'none' && postRowElement.classList.contains('futaba-post-processed-by-blocker')) {
            return;
        }

        postRowElement.classList.add('futaba-content-processed'); // この関数での処理試行マーク

        let ngReason = null;
        let ngDetails = "";

        // 1. テキストNG判定 (指定ワード)
        const blockquote = postRowElement.querySelector('blockquote');
        if (blockquote) {
            const postText = (blockquote.textContent || "").trim();
            if (postText) {
                const matchedWord = getMatchedUserNGWord(postText);
                if (matchedWord) {
                    ngReason = "指定NGワード";
                    ngDetails = `「${matchedWord}」`;
                }
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
                            if (hammingDistance(currentHash, blockedHash) <= SIMILARITY_THRESHOLD) {
                                ngReason = "不快な画像";
                                ngDetails = `類似度: ${hammingDistance(currentHash, blockedHash)}, URL: ${imageUrl.substring(0,30)}...`;
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
            postRowElement.classList.add('futaba-post-processed-by-blocker'); // 最終的なブロックマーク

            let resNoText = "";
            const checkbox = postRowElement.querySelector('input[type="checkbox"]');
            if (checkbox && checkbox.name) resNoText = `レス ${checkbox.name} `;

            console.log(`%c[ブロッカー]%c ${resNoText}を非表示 (理由: ${ngReason})。詳細: ${ngDetails}`, "color:crimson;font-weight:bold;", "color:default;");

            // プレースホルダー行の作成と挿入 (v0.4.4でのあなたの改変を維持)
            const placeholderRow = document.createElement('tr');
            placeholderRow.classList.add('futaba-post-processed-by-blocker'); // こちらもマーク
            const placeholderCell = document.createElement('td');
            const originalCell = postRowElement.querySelector('td');
            if (originalCell) {
                 placeholderCell.className = originalCell.className;
                 let totalColspan = 0;
                 for(const cell of Array.from(postRowElement.cells)) { totalColspan += cell.colSpan; }
                 placeholderCell.colSpan = totalColspan > 0 ? totalColspan : 1;
            }
            const placeholderText = document.createElement('span');
            placeholderText.textContent = ``; // 空のテキスト
            placeholderText.style.cssText = "color: gray; font-size: small; font-style: italic;"; // スタイルは残す
            placeholderCell.appendChild(placeholderText);
            placeholderRow.appendChild(placeholderCell);
            if (postRowElement.parentNode) {
                postRowElement.parentNode.insertBefore(placeholderRow, postRowElement.nextSibling);
            }
        } else {
            // NGではなかった場合は、一時的な処理試行マークを削除して、他のスクリプトや将来の再スキャンで処理できるようにする
            // (ただし、画像スキャン試行マークは残す。画像がない場合は何もしない)
            postRowElement.classList.remove('futaba-content-processed');
        }
    }

    // --- メイン処理 (スキャンと監視) ---
    function scanAndProcessPosts(parentNode) {
        parentNode.querySelectorAll('tr:not(.futaba-content-processed):not(.futaba-post-processed-by-blocker)').forEach(tr => {
            // ふたばのレス行か簡易判定 (tdがあり、その中にcheckbox name="数字" がある)
            if (tr.querySelector('td input[type="checkbox"][name]')) {
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
                        if (node.tagName === 'TR' && node.querySelector('td input[type="checkbox"][name]') &&
                            !node.classList.contains('futaba-content-processed') &&
                            !node.classList.contains('futaba-post-processed-by-blocker')) {
                            setTimeout(() => processPostRow(node), 0);
                        } else if (node.querySelectorAll) {
                            node.querySelectorAll('tr:not(.futaba-content-processed):not(.futaba-post-processed-by-blocker)').forEach(potentialPostRow => {
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
    observer.observe(document.body, { childList: true, subtree: true });

    // --- 右クリックメニュー関連 ---
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
                            postRowToProcess.classList.remove('futaba-content-processed', 'futaba-post-processed-by-blocker'); // マーク解除
                            postRowToProcess.style.display = ''; // 表示を戻す
                            const placeholder = postRowToProcess.nextSibling; // 空のプレースホルダーを探す
                            if (placeholder && placeholder.classList && placeholder.classList.contains('futaba-post-processed-by-blocker') && placeholder.querySelector('span')?.textContent === '') {
                                placeholder.remove();
                            }
                            const imagesInPost = postRowToProcess.querySelectorAll('img.futaba-image-scan-attempted');
                            imagesInPost.forEach(img => img.classList.remove('futaba-image-scan-attempted'));
                            await processPostRow(postRowToProcess);
                        }
                    } else { alert(`この画像 (または類似画像) のハッシュ [${hash.substring(0,16)}...] は既に登録されています。`); }
                } else { alert('画像のハッシュ計算に失敗しました。'); }
            } catch (error) { alert('ハッシュ登録中にエラーが発生しました: ' + error.message); console.error("[ブロッカー] ハッシュ登録エラー:", error); }
        } else { alert('画像の上にマウスカーソルを合わせてからメニューを選択してください。'); }
        lastHoveredImageElement = null;
    });
    GM_registerMenuCommand("■ 登録済み不快画像ハッシュを全てクリア", () => { /* v0.4.4と同じ */ });
    GM_registerMenuCommand("■ 現在のブロックハッシュ数を確認", () => { /* v0.4.4と同じ */ });

    console.log('%c[不快コンテンツブロッカー (ふたばちゃんねる用 v0.5.0)]%c が動作を開始。指定NGワード機能追加。', "color:orange;font-weight:bold;", "color:default;");

})();