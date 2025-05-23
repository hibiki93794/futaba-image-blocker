// ==UserScript==
// @name         画像ハッシュブロッカー・コア (ふたば v0.2)
// @namespace    http://tampermonkey.net/
// @version      0.2.0 // 設計図v0.2に基づいた再構築版
// @description  画像の知覚ハッシュを計算し、ブロックリストと照合して類似画像を含むレス全体を非表示にします。
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

    const SCRIPT_NAME = "画像ハッシュブロッカー・コア";
    const SCRIPT_VERSION = "0.2.0";
    const DEBUG_PREFIX = `[${SCRIPT_NAME} v${SCRIPT_VERSION}]`;

    // --- 設定値 ---
    const BLOCKED_HASHES_KEY = 'futabaHashBlocker_blockedHashes_v2'; // ストレージキー
    const SIMILARITY_THRESHOLD = 6; // この値以下のハミング距離なら類似と判定
    const DHASH_SIZE = 8;         // dHash計算時の画像縮小サイズ

    // --- 状態管理用クラス名/データ属性名 ---
    const ATTR_IMG_SCANNED = 'data-fblock-img-scanned';       // 画像がスキャン試行済みか
    const CLASS_POST_PROCESSING = 'fblock-post-processing';   // レスが現在処理中か
    const CLASS_POST_BLOCKED = 'fblock-post-blocked';         // レスがNGにより非表示処理されたか

    // --- グローバル変数 ---
    let blockedImageHashes = [];
    let processingImagesForHash = new Set(); // dHash計算中の画像URLを管理
    let lastHoveredImgElement = null;      // 右クリックメニュー用

    // --- 初期化処理 ---
    function initializeBlocker() {
        blockedImageHashes = GM_getValue(BLOCKED_HASHES_KEY, []);
        console.log(`${DEBUG_PREFIX} 初期化完了。NGハッシュ ${blockedImageHashes.length}件読み込み。`);
        scanAndProcessPage(document.body); // 初期スキャン
    }

    // --- ハッシュリストの保存 ---
    function saveBlockedHashes() {
        GM_setValue(BLOCKED_HASHES_KEY, blockedImageHashes);
        console.log(`${DEBUG_PREFIX} NGハッシュリスト保存完了。現在 ${blockedImageHashes.length}件。`, blockedImageHashes);
    }

    // --- dHash 計算関数 ---
    async function calculateDHash(imageUrl) {
        if (!imageUrl || (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))) {
            // console.log(`${DEBUG_PREFIX} dHash計算スキップ(非HTTP/HTTPS): ${imageUrl.substring(0,70)}`);
            return null;
        }
        if (processingImagesForHash.has(imageUrl)) return null;
        processingImagesForHash.add(imageUrl);

        try {
            return await new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET', url: imageUrl, responseType: 'blob', timeout: 15000,
                    onload: function(response) {
                        if (response.status !== 200 && response.status !== 0) { return reject(new Error(`画像取得失敗: ${response.status} ${imageUrl}`)); }
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
                            } catch (e) { reject(new Error(`dHash計算エラー: ${e.message} for ${imageUrl}`)); }
                            finally { if(img.src.startsWith('blob:')) URL.revokeObjectURL(img.src); }
                        };
                        img.onerror = () => { if(img.src.startsWith('blob:')) URL.revokeObjectURL(img.src); reject(new Error(`画像読み込み失敗(onerror): ${imageUrl}`)); };
                        if (response.response instanceof Blob && response.response.size > 0) img.src = URL.createObjectURL(response.response);
                        else { reject(new Error(`受信データ無効: ${imageUrl}`)); }
                    },
                    onerror: (err) => { reject(new Error(`GM_xmlhttpRequestエラー: ${err.statusText || '不明'} for ${imageUrl}`)); },
                    ontimeout: () => { reject(new Error(`GM_xmlhttpRequestタイムアウト: ${imageUrl}`)); }
                });
            });
        } finally {
            processingImagesForHash.delete(imageUrl); // 成功・失敗問わず削除
        }
    }

    // --- ハミング距離計算関数 ---
    function hammingDistance(hash1, hash2) {
        if (!hash1 || !h2 || hash1.length !== hash2.length) return Infinity;
        let distance = 0;
        for (let i = 0; i < hash1.length; i++) if (hash1[i] !== hash2[i]) distance++;
        return distance;
    }

    // --- レス行を処理する関数 ---
    async function processPostRow(postRowElement) {
        if (!postRowElement || !postRowElement.matches || !postRowElement.matches('tr') ||
            postRowElement.classList.contains(CLASS_POST_BLOCKED) ||    // 既にブロック済み
            postRowElement.classList.contains(CLASS_POST_PROCESSING) || // 現在処理中
            !postRowElement.closest('body')) {
            return;
        }
        if (postRowElement.style.display === 'none') { // 他の理由で非表示ならマークだけして終了
            postRowElement.classList.add(CLASS_POST_BLOCKED);
            return;
        }

        postRowElement.classList.add(CLASS_POST_PROCESSING);

        let ngReason = null;
        let ngDetails = "";

        const imgElement = postRowElement.querySelector(`img:not([${ATTR_IMG_SCANNED}="true"])`);
        if (imgElement && imgElement.src && (imgElement.src.startsWith('http://') || imgElement.src.startsWith('https://'))) {
            imgElement.setAttribute(ATTR_IMG_SCANNED, 'true');
            const imageUrl = imgElement.src;
            let effectiveImageUrl = imageUrl;

            if (imgElement.parentNode?.tagName === 'A' && imgElement.parentNode.href) {
                try {
                    const linkUrl = new URL(imgElement.parentNode.href, document.baseURI).href;
                    if (/\.(jpe?g|png|gif|webp)$/i.test(linkUrl) && (linkUrl.startsWith('http://') || linkUrl.startsWith('https://'))) {
                        effectiveImageUrl = linkUrl;
                    }
                } catch (e) { /* URL कंストラクタエラーは無視 */ }
            }

            try {
                const currentHash = await calculateDHash(effectiveImageUrl);
                if (currentHash) {
                    for (const blockedHash of blockedImageHashes) {
                        const distance = hammingDistance(currentHash, blockedHash);
                        if (distance <= SIMILARITY_THRESHOLD) {
                            ngReason = "不快な画像";
                            ngDetails = `類似度: ${distance}, URL: ${imageUrl.substring(0,70)}...`;
                            break;
                        }
                    }
                }
            } catch (error) {
                console.warn(`${DEBUG_PREFIX} 画像ハッシュ処理中エラー: ${error.message}`, `(対象URL: ${effectiveImageUrl})`, error);
            }
        } else if (imgElement) {
            imgElement.setAttribute(ATTR_IMG_SCANNED, 'true'); // HTTP/HTTPS以外でもスキャン済みにはする
        }


        if (ngReason) {
            postRowElement.style.display = 'none';
            postRowElement.classList.add(CLASS_POST_BLOCKED);

            let resNoText = "";
            const checkbox = postRowElement.querySelector('input[type="checkbox"]');
            if (checkbox?.name) resNoText = `レス ${checkbox.name} `;
            console.log(`%c${DEBUG_PREFIX}%c ${resNoText}の内容を非表示 (理由: ${ngReason})。詳細: ${ngDetails}`, "color:orange;font-weight:bold;", "color:default;");

            const placeholderRow = document.createElement('tr');
            placeholderRow.classList.add(CLASS_POST_BLOCKED);
            const placeholderCell = document.createElement('td');
            const originalCell = postRowElement.querySelector('td');
            if (originalCell) {
                 placeholderCell.className = originalCell.className;
                 let totalColspan = Array.from(postRowElement.cells).reduce((sum, cell) => sum + cell.colSpan, 0);
                 placeholderCell.colSpan = totalColspan > 0 ? totalColspan : 1;
            }
            placeholderText.textContent = ``; // 空のテキスト
            placeholderText.style.cssText = "color: gray; font-size: small; font-style: italic;";
            placeholderCell.appendChild(placeholderText);
            placeholderRow.appendChild(placeholderCell);
            if (postRowElement.parentNode) {
                postRowElement.parentNode.insertBefore(placeholderRow, postRowElement.nextSibling);
            }
        }
        postRowElement.classList.remove(CLASS_POST_PROCESSING);
    }

    // --- ページ/ノード内のレスをスキャンして処理する関数 ---
    function scanAndProcessPage(parentNode) {
        if (!parentNode || !parentNode.querySelectorAll) return;
        // ふたばのレス行はtdがあり、その中にcheckbox name="数字" を持つことが多い
        parentNode.querySelectorAll(`tr:not(.${CLASS_POST_BLOCKED}):not(.${CLASS_POST_PROCESSING})`).forEach(tr => {
            if (tr.querySelector('td input[type="checkbox"][name]')) {
                 setTimeout(() => processPostRow(tr), 0);
            }
        });
    }

    // --- DOM変更監視 ---
    function observeDOMChanges() {
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.ownerDocument === document) {
                            // 追加されたノード自体がレス行候補の場合
                            if (node.matches && node.matches(`tr:not(.${CLASS_POST_BLOCKED}):not(.${CLASS_POST_PROCESSING})`) && node.querySelector('td input[type="checkbox"][name]')) {
                                setTimeout(() => processPostRow(node), 0);
                            }
                            // 追加されたノードの子孫にレス行候補がある場合
                            else if (node.querySelectorAll) {
                                node.querySelectorAll(`tr:not(.${CLASS_POST_BLOCKED}):not(.${CLASS_POST_PROCESSING})`).forEach(potentialPostRow => {
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
        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                if (document.body) observer.observe(document.body, { childList: true, subtree: true });
            });
        }
    }

    // --- 右クリックメニュー関連 ---
    function setupMenuCommands() {
        document.addEventListener('mouseover', (event) => {
            if (event.target && event.target.ownerDocument === document && event.target.tagName === 'IMG') {
                lastHoveredImgElement = event.target;
            }
        }, true);

        GM_registerMenuCommand("■ この画像をハッシュでNG登録", async () => {
            if (!lastHoveredImgElement?.src || lastHoveredImageElement.ownerDocument !== document || !lastHoveredImageElement.closest('body')) {
                alert('NG登録する画像の上にカーソルを合わせてください。(異なるフレームの可能性あり)');
                lastHoveredImgElement = null; return;
            }
            const imgToBlock = lastHoveredImgElement;
            const originalSrc = imgToBlock.src;
            if (!originalSrc.startsWith('http://') && !originalSrc.startsWith('https://')) {
                alert("HTTP/HTTPSの画像のみNG登録できます。");
                lastHoveredImgElement = null; return;
            }

            alert(`以下の画像のハッシュを登録試行します:\n${originalSrc.substring(0,100)}...\n\n※サムネイルの場合、リンク先の元画像が優先されます。`);
            let imageToHashUrl = originalSrc;
            if (imgToBlock.parentNode?.tagName === 'A' && imgToBlock.parentNode.href) {
                try {
                    const linkUrl = new URL(imgToBlock.parentNode.href, document.baseURI).href;
                    if (/\.(jpe?g|png|gif|webp)$/i.test(linkUrl) && (linkUrl.startsWith('http://') || linkUrl.startsWith('https://'))) {
                        imageToHashUrl = linkUrl;
                    }
                } catch (e) { /* URL कंストラクタエラーは無視 */ }
            }
            console.log(`${DEBUG_PREFIX} NG登録 ハッシュ計算対象URL: ${imageToHashUrl}`);

            try {
                const hash = await calculateDHash(imageToHashUrl);
                if (hash) {
                    if (!blockedImageHashes.includes(hash)) {
                        blockedImageHashes.push(hash);
                        saveBlockedHashes(); // 保存
                        alert(`ハッシュ [${hash.substring(0,16)}...] を登録しました。`);

                        const postRowToProcess = imgToBlock.closest('tr');
                        if (postRowToProcess && postRowToProcess.ownerDocument === document) {
                            // 即時反映のため、マークを解除して再処理
                            postRowToProcess.classList.remove(CLASS_POST_PROCESSING, CLASS_POST_BLOCKED);
                            postRowToProcess.style.display = ''; // 表示を戻す
                            const placeholder = postRowToProcess.nextSibling; // 空のプレースホルダーを探す
                            if (placeholder && placeholder.nodeType === Node.ELEMENT_NODE && placeholder.classList.contains(CLASS_POST_BLOCKED) && placeholder.querySelector('span')?.textContent === '') {
                                placeholder.remove();
                            }
                            postRowToProcess.querySelectorAll(`img[${ATTR_IMG_SCANNED}]`).forEach(img => img.removeAttribute(ATTR_IMG_SCANNED));
                            await processPostRow(postRowToProcess);
                        }
                    } else {
                        alert(`この画像のハッシュ [${hash.substring(0,16)}...] は既にNG登録されています。`);
                    }
                } else {
                    alert(`画像のハッシュ計算に失敗しました。(${imageToHashUrl})`);
                }
            } catch (error) {
                alert(`ハッシュ登録中にエラーが発生しました: ${error.message}`);
                console.error(`${DEBUG_PREFIX} ハッシュ登録エラー:`, error);
            }
            lastHoveredImgElement = null;
        });

        GM_registerMenuCommand("■ NGハッシュリストを全てクリア", () => {
            if (confirm("本当にNGハッシュリストを全てクリアしますか？")) {
                blockedImageHashes = [];
                saveBlockedHashes();
                alert("NGハッシュリストをクリアしました。ページをリロードすると反映されます。");
            }
        });

        GM_registerMenuCommand("■ 現在のNGハッシュ数を確認", () => {
            const currentHashes = GM_getValue(BLOCKED_HASHES_KEY, []); // ストレージから最新を取得
            alert(`現在 ${currentHashes.length} 件の画像ハッシュがNG登録されています。`);
        });
    }

    // --- スクリプト実行開始 ---
    initializeBlocker();
    observeDOMChanges(); // DOM変更監視を開始
    setupMenuCommands(); // 右クリックメニューを設定

    console.log(`%c${DEBUG_PREFIX}%c が動作を開始しました。`, "color:orange;font-weight:bold;", "color:default;");

})();