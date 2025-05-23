// ==UserScript==
// @name         不快画像ブロッカー (ふたばちゃんねる用)
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  ふたばちゃんねる上の不快な画像を知覚ハッシュで判定し、そのレス全体を非表示にします
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
    const BLOCKED_HASHES_KEY = 'futabaChan_blockedImageHashes_v1_postBlock';
    const SIMILARITY_THRESHOLD = 6;
    const DHASH_SIZE = 8;

    let blockedHashes = GM_getValue(BLOCKED_HASHES_KEY, []);
    let processingImages = new Set();

    // --- dHash 計算関数 (calculateDHash) ---
    async function calculateDHash(imageUrl) {
        if (!imageUrl || imageUrl.startsWith('data:')) {
            return null;
        }
        if (processingImages.has(imageUrl)) {
            return null;
        }
        processingImages.add(imageUrl);

        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: imageUrl,
                responseType: 'blob',
                timeout: 15000,
                onload: function(response) {
                    if (response.status !== 200 && response.status !== 0) {
                        processingImages.delete(imageUrl);
                        return reject(new Error(`画像の取得に失敗: ${response.status} ${imageUrl}`));
                    }
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    img.onload = () => {
                        try {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            const width = DHASH_SIZE + 1;
                            const height = DHASH_SIZE;
                            canvas.width = width;
                            canvas.height = height;

                            ctx.drawImage(img, 0, 0, width, height);
                            const imageData = ctx.getImageData(0, 0, width, height);
                            const grayPixels = [];
                            for (let i = 0; i < imageData.data.length; i += 4) {
                                const r = imageData.data[i];
                                const g = imageData.data[i+1];
                                const b = imageData.data[i+2];
                                grayPixels.push(0.299 * r + 0.587 * g + 0.114 * b);
                            }

                            let hash = '';
                            for (let y = 0; y < height; y++) {
                                for (let x = 0; x < width - 1; x++) {
                                    const leftPixelIndex = y * width + x;
                                    const rightPixelIndex = y * width + x + 1;
                                    if (grayPixels[leftPixelIndex] > grayPixels[rightPixelIndex]) {
                                        hash += '1';
                                    } else {
                                        hash += '0';
                                    }
                                }
                            }
                            processingImages.delete(imageUrl);
                            resolve(hash);
                        } catch (e) {
                            processingImages.delete(imageUrl);
                            reject(new Error(`dHash計算中のエラー: ${e.message} for ${imageUrl}`));
                        } finally {
                             URL.revokeObjectURL(img.src);
                        }
                    };
                    img.onerror = () => {
                        processingImages.delete(imageUrl);
                        URL.revokeObjectURL(img.src);
                        reject(new Error(`画像の読み込みに失敗 (img.onerror): ${imageUrl}`));
                    };
                     if (response.response instanceof Blob && response.response.size > 0) {
                        img.src = URL.createObjectURL(response.response);
                    } else {
                        processingImages.delete(imageUrl);
                        reject(new Error(`受信した画像データが無効です (Blobでないかサイズ0): ${imageUrl}`));
                    }
                },
                onerror: function(error) {
                    processingImages.delete(imageUrl);
                    reject(new Error(`GM_xmlhttpRequestエラー: ${error.statusText || '不明なネットワークエラー'} for ${imageUrl}`));
                },
                ontimeout: function() {
                    processingImages.delete(imageUrl);
                    reject(new Error(`GM_xmlhttpRequestタイムアウト: ${imageUrl}`));
                }
            });
        });
    }

    // --- ハミング距離計算関数 (hammingDistance) ---
    function hammingDistance(hash1, hash2) {
        if (!hash1 || !hash2 || hash1.length !== hash2.length) {
            return Infinity;
        }
        let distance = 0;
        for (let i = 0; i < hash1.length; i++) {
            if (hash1[i] !== hash2[i]) {
                distance++;
            }
        }
        return distance;
    }

    // --- 画像処理関数 (processImageElement) ---
    async function processImageElement(imgElement) {
        if (!imgElement || !imgElement.src || imgElement.classList.contains('futaba-image-processed') || !imgElement.closest('body')) {
            return;
        }
        const postProcessedClass = 'futaba-post-processed-by-blocker';
        const parentPostElement = imgElement.closest('tr') || imgElement.closest('td');
        if (parentPostElement && parentPostElement.classList.contains(postProcessedClass)) {
            imgElement.classList.add('futaba-image-processed');
            return;
        }

        imgElement.classList.add('futaba-image-processed');
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
            if (!currentHash) {
                imgElement.classList.remove('futaba-image-processed');
                return;
            }

            for (const blockedHash of blockedHashes) {
                const distance = hammingDistance(currentHash, blockedHash);
                if (distance <= SIMILARITY_THRESHOLD) {
                    const postRow = imgElement.closest('tr');
                    if (postRow && !postRow.classList.contains(postProcessedClass)) {
                        postRow.style.display = 'none';
                        postRow.classList.add(postProcessedClass);

                        let resNoText = "";
                        const checkbox = postRow.querySelector('input[type="checkbox"]');
                        if (checkbox && checkbox.name) {
                            resNoText = `レス ${checkbox.name} `;
                        }
                        console.log(`%c[不快画像ブロッカー]%c ${resNoText}の内容を非表示 (不快画像を検出、距離: ${distance})。画像URL: ${imageUrl} (ハッシュ元: ${effectiveImageUrl.substring(0,60)}...)`, "color:orange;font-weight:bold;", "color:default;");

                        const placeholderRow = document.createElement('tr');
                        placeholderRow.classList.add(postProcessedClass);
                        const placeholderCell = document.createElement('td');
                        const originalCell = postRow.querySelector('td');
                        if (originalCell) {
                             placeholderCell.className = originalCell.className;
                             let totalColspan = 0;
                             for(const cell of Array.from(postRow.cells)) { totalColspan += cell.colSpan; }
                             placeholderCell.colSpan = totalColspan > 0 ? totalColspan : 1;
                        }
                        const placeholderText = document.createElement('span');
                        placeholderText.textContent = ``;
                        placeholderText.style.cssText = "color: gray; font-size: small; font-style: italic;";
                        placeholderCell.appendChild(placeholderText);
                        placeholderRow.appendChild(placeholderCell);
                        if (postRow.parentNode) {
                            postRow.parentNode.insertBefore(placeholderRow, postRow.nextSibling);
                        }
                    } else if (!postRow) {
                        console.log(`%c[不快画像ブロッカー]%c 類似画像 (距離: ${distance}) を検出。画像のみ非表示: ${imageUrl} (trが見つからず)`, "color:orange;font-weight:bold;", "color:default;");
                        imgElement.style.display = 'none';
                    }
                    return;
                }
            }
        } catch (error) {
            console.warn(`[不快画像ブロッカー] 画像処理エラー: ${error.message}`, `(対象URL: ${effectiveImageUrl})`);
            imgElement.classList.remove('futaba-image-processed');
        }
    }

    // --- メイン処理 (scanImagesInNode, Observerなど) ---
    function scanImagesInNode(parentNode) {
        parentNode.querySelectorAll('img:not(.futaba-image-processed)').forEach(img => {
            const parentPostElement = img.closest('tr') || img.closest('td');
            if (parentPostElement && parentPostElement.classList.contains('futaba-post-processed-by-blocker')) {
                img.classList.add('futaba-image-processed');
                return;
            }
            if (img.src && !img.closest('a[href*="javascript:void"]')) {
                if (img.complete || img.naturalWidth > 0) {
                    setTimeout(() => processImageElement(img), 0);
                } else {
                    img.addEventListener('load', () => setTimeout(() => processImageElement(img), 0), { once: true });
                    img.addEventListener('error', () => img.classList.add('futaba-image-processed'), { once: true });
                }
            } else {
                img.classList.add('futaba-image-processed');
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => scanImagesInNode(document.body));
    } else {
        scanImagesInNode(document.body);
    }

    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if ((node.tagName === 'TR' || node.tagName === 'TD') && node.classList.contains('futaba-post-processed-by-blocker')) {
                            node.querySelectorAll('img:not(.futaba-image-processed)').forEach(img => img.classList.add('futaba-image-processed'));
                            return;
                        }
                        scanImagesInNode(node);
                    }
                });
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // --- 右クリックメニュー関連 ---
    let lastHoveredImageElement = null;
    document.addEventListener('mouseover', function(event) {
        if (event.target.tagName === 'IMG') {
            lastHoveredImageElement = event.target;
        }
    }, true);

    GM_registerMenuCommand("■ この画像(カーソル直下)を不快登録", async () => {
        if (lastHoveredImageElement && lastHoveredImageElement.src && lastHoveredImageElement.closest('body')) {
            const imgToBlock = lastHoveredImageElement;
            const originalSrc = imgToBlock.src;
            alert(`以下の画像のハッシュを登録試行します:\n${originalSrc.substring(0,100)}${originalSrc.length > 100 ? '...' : ''}\n\n※サムネイルの場合、リンク先の元画像が優先。\n登録後、この画像を含むレス全体が非表示対象になります。`);

            let imageToHashUrl = originalSrc;
            if (imgToBlock.parentNode && imgToBlock.parentNode.tagName === 'A' && imgToBlock.parentNode.href) {
                const linkUrl = new URL(imgToBlock.parentNode.href, document.baseURI).href;
                if (/\.(jpe?g|png|gif|webp)$/i.test(linkUrl) && !linkUrl.includes('futaba.htm') && !linkUrl.includes('/res/')) {
                    imageToHashUrl = linkUrl;
                    console.log(`%c[不快画像ブロッカー]%c 登録時: サムネイル ${originalSrc.substring(0,60)}... の代わりにリンク先 ${imageToHashUrl.substring(0,60)}... を使用`, "color:orange;font-weight:bold;", "color:default;");
                }
            }

            try {
                const hash = await calculateDHash(imageToHashUrl);
                if (hash) {
                    if (!blockedHashes.includes(hash)) {
                        blockedHashes.push(hash);
                        GM_setValue(BLOCKED_HASHES_KEY, blockedHashes);
                        alert(`ハッシュ [${hash.substring(0,16)}...] を登録しました。\nこの画像および類似画像を含むレスは今後非表示になります。\n(対象: ${imageToHashUrl.substring(0,80)}...)`);
                        const postRowToProcess = imgToBlock.closest('tr');
                        if (postRowToProcess && postRowToProcess.classList.contains('futaba-post-processed-by-blocker')) {
                             postRowToProcess.classList.remove('futaba-post-processed-by-blocker');
                             postRowToProcess.style.display = '';
                             const nextSibling = postRowToProcess.nextSibling;
                             if (nextSibling && nextSibling.classList && nextSibling.classList.contains('futaba-post-processed-by-blocker')) {
                                 nextSibling.remove();
                             }
                        }
                        imgToBlock.classList.remove('futaba-image-processed');
                        await processImageElement(imgToBlock);
                    } else {
                        alert(`この画像 (または類似画像) のハッシュ [${hash.substring(0,16)}...] は既に登録されています。`);
                    }
                } else {
                    alert('画像のハッシュ計算に失敗しました。画像が読み込めないか、対応していない形式の可能性があります。');
                }
            } catch (error) {
                alert('ハッシュ登録中にエラーが発生しました: ' + error.message);
                console.error("[不快画像ブロッカー] ハッシュ登録エラー:", error);
            }
        } else {
            alert('画像の上にマウスカーソルを合わせてから、Tampermonkeyの拡張機能アイコンをクリックし、このメニューを選択してください。');
        }
        lastHoveredImageElement = null;
    });

    GM_registerMenuCommand("■ 登録済み不快画像ハッシュを全てクリア", () => {
        if (confirm("本当に登録されている不快画像のハッシュを全てクリアしますか？\nこの操作は元に戻せません。")) {
            blockedHashes = [];
            GM_setValue(BLOCKED_HASHES_KEY, []);
            alert("登録済みハッシュを全てクリアしました。\nページを再読み込みすると、ブロックされていた画像が表示されるようになります。");
        }
    });

    GM_registerMenuCommand("■ 現在のブロックハッシュ数を確認", () => {
        alert(`現在 ${blockedHashes.length} 件のハッシュがブロックリストに登録されています。`);
    });

    // --- ここから追加 ---
    GM_registerMenuCommand("📥 ハッシュリストをエクスポート", () => {
        const hashesToExport = GM_getValue(BLOCKED_HASHES_KEY, []);
        if (hashesToExport.length === 0) {
            alert("エクスポートするブロックハッシュがありません。");
            return;
        }
        try {
            const jsonString = JSON.stringify(hashesToExport, null, 2); // 人が読みやすいように整形
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'futaba_blocked_hashes.json'; // ダウンロードするファイル名
            document.body.appendChild(a); // Firefoxでclick()を発火させるために必要
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert(`${hashesToExport.length} 件のハッシュを 'futaba_blocked_hashes.json' としてエクスポートしました。`);
        } catch (error) {
            alert(`エクスポート中にエラーが発生しました: ${error.message}`);
            console.error("[不快画像ブロッカー] ハッシュエクスポートエラー:", error);
        }
    });

    GM_registerMenuCommand("📤 ハッシュリストをインポート", () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,text/json'; // .json ファイルを期待

        input.onchange = e => {
            const file = e.target.files[0];
            if (!file) {
                alert("ファイルが選択されませんでした。");
                return;
            }

            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const importedHashesRaw = JSON.parse(event.target.result);

                    if (!Array.isArray(importedHashesRaw)) {
                        throw new Error("インポートされたデータが正しい形式 (配列) ではありません。");
                    }

                    // 有効なハッシュ文字列のみをフィルタリング (空文字や不正な型を除外)
                    const importedHashes = importedHashesRaw.filter(h => typeof h === 'string' && h.trim().length > 0);

                    if (importedHashes.length === 0) {
                        alert("インポートファイルに有効なハッシュが見つかりませんでした。");
                        return;
                    }

                    let currentBlockedHashes = GM_getValue(BLOCKED_HASHES_KEY, []);
                    const initialCount = currentBlockedHashes.length;

                    // Setを使って重複を排除しながらマージ
                    const combinedHashesSet = new Set([...currentBlockedHashes, ...importedHashes]);
                    const newBlockedHashes = Array.from(combinedHashesSet);

                    GM_setValue(BLOCKED_HASHES_KEY, newBlockedHashes);
                    // グローバル変数も更新して即時性を高める（スクリプト内で直接参照しているため）
                    blockedHashes = newBlockedHashes;

                    const addedCount = newBlockedHashes.length - initialCount;
                    const importedValidCount = importedHashes.length;
                    const duplicateCount = importedValidCount - addedCount;

                    let message = `ハッシュリストをインポートしました。\n`;
                    message += `ファイルから ${importedValidCount} 件の有効なハッシュを読み込みました。\n`;
                    message += `そのうち ${addedCount} 件をブロックリストに新規追加しました。\n`;
                    if (duplicateCount > 0) {
                        message += `(${duplicateCount} 件は既に登録済みだったためスキップされました。)\n`;
                    }
                    message += `現在の総登録ハッシュ数: ${newBlockedHashes.length} 件\n\n`;
                    message += `ページを再読み込みすると、新しいブロック設定が完全に適用されます。`;
                    alert(message);

                } catch (error) {
                    alert(`インポート処理中にエラーが発生しました: ${error.message}\nファイル形式が正しいか確認してください。`);
                    console.error("[不快画像ブロッカー] ハッシュインポートエラー:", error);
                } finally {
                    // input要素を削除 (連続で同じファイルを選択できるようにするため)
                    if (input.parentNode) {
                        input.parentNode.removeChild(input);
                    }
                }
            };
            reader.onerror = () => {
                alert("ファイルの読み込みに失敗しました。");
                console.error("[不快画像ブロッカー] ファイル読み込みエラー:", reader.error);
            };
            reader.readAsText(file); // ファイルをテキストとして読み込む
        };

        // input要素をクリックしてファイル選択ダイアログを開く
        // Firefoxではbodyに追加しないと発火しないことがあるので一時的に追加
        input.style.display = 'none';
        document.body.appendChild(input);
        input.click();
        // document.body.removeChild(input); // onchange の後で削除した方が安全
    });
    // --- ここまで追加 ---

    console.log('%c[不快画像ブロッカー (ふたばちゃんねる用 v0.4)]%c が動作を開始しました。レス全体を非表示にします。', "color:orange;font-weight:bold;", "color:default;");

})();