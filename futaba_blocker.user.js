// ==UserScript==
// @name         不快画像ブロッカー (ふたばちゃんねる用)
// @namespace    http://tampermonkey.net/
// @version      0.3 // バージョンを少し更新
// @description  ふたばちゃんねる上の不快な画像を知覚ハッシュで判定し非表示にします
// @author       You
// @match        http://*.2chan.net/*/futaba.htm*
// @match        https://*.2chan.net/*/futaba.htm*
// @match        http://*.2chan.net/*/res/*.htm*
// @match        https://*.2chan.net/*/res/*.htm*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      *
// ==/UserScript==

(function() {
    'use strict';

    // --- 設定値 ---
    const BLOCKED_HASHES_KEY = 'futabaChan_blockedImageHashes_v1'; // 保存キー名
    const SIMILARITY_THRESHOLD = 6; // ハミング距離の閾値 (64bitハッシュで6bitの違いまで類似とみなす。約90%一致)
    const DHASH_SIZE = 8; // dHashの生成サイズ (N x N ピクセルから (N*N) ビットのハッシュを生成、ここでは8x8->64bit)

    let blockedHashes = GM_getValue(BLOCKED_HASHES_KEY, []);
    let processingImages = new Set(); // 現在処理中の画像URLを管理（二重処理防止）

    // --- dHash (Difference Hash) 計算関数 ---
    async function calculateDHash(imageUrl) {
        if (!imageUrl || imageUrl.startsWith('data:')) {
            return null;
        }
        // 既に処理中または過去に試行して失敗したURLはスキップ（成功時はハッシュが返るのでここは通らない）
        if (processingImages.has(imageUrl)) {
            // console.log(`Skipping already processing/failed: ${imageUrl}`);
            return null;
        }
        processingImages.add(imageUrl); // 処理開始または試行をマーク

        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: imageUrl,
                responseType: 'blob',
                timeout: 15000, // 15秒でタイムアウト
                onload: function(response) {
                    if (response.status !== 200 && response.status !== 0) { // status 0 はローカルファイルなどでありえるが、通常はエラー
                        processingImages.delete(imageUrl); // 失敗したのでマーク解除
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
                            // 成功したら processingImages から削除 (次回同じURLでも再計算可能にするため、または別用途のマーキングに使うなら残す)
                            // 今回は一度計算したらその結果を信じるので、消さなくても良いかもしれないが、メモリリークを避けるため一時的なものとして扱う
                            processingImages.delete(imageUrl);
                            resolve(hash);
                        } catch (e) {
                            processingImages.delete(imageUrl);
                            reject(new Error(`dHash計算中のエラー: ${e.message} for ${imageUrl}`));
                        } finally {
                             URL.revokeObjectURL(img.src); // Blob URLを解放
                        }
                    };
                    img.onerror = () => {
                        processingImages.delete(imageUrl);
                        URL.revokeObjectURL(img.src); // Blob URLを解放
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

    // --- ハミング距離計算関数 ---
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

    // --- 画像処理関数 ---
    async function processImageElement(imgElement) {
        if (!imgElement || !imgElement.src || imgElement.classList.contains('futaba-image-processed') || !imgElement.closest('body')) {
             // DOMから切り離されている要素も無視
            return;
        }
        imgElement.classList.add('futaba-image-processed');

        const imageUrl = imgElement.src;
        let effectiveImageUrl = imageUrl;

        if (imgElement.parentNode && imgElement.parentNode.tagName === 'A' && imgElement.parentNode.href) {
            const linkUrl = new URL(imgElement.parentNode.href, document.baseURI).href; // 絶対URLに正規化
            if (/\.(jpe?g|png|gif|webp)$/i.test(linkUrl) && !linkUrl.includes('futaba.htm') && !linkUrl.includes('/res/')) {
                 effectiveImageUrl = linkUrl;
            }
        }

        try {
            const currentHash = await calculateDHash(effectiveImageUrl);
            if (!currentHash) {
                imgElement.classList.remove('futaba-image-processed');
                // processingImages.delete(effectiveImageUrl); // calculateDHash内で失敗時に削除されるはず
                return;
            }

            for (const blockedHash of blockedHashes) {
                const distance = hammingDistance(currentHash, blockedHash);
                if (distance <= SIMILARITY_THRESHOLD) {
                    console.log(`%c[不快画像ブロッカー]%c 類似画像 (距離: ${distance}) を検出。非表示: ${imageUrl} (ハッシュ元: ${effectiveImageUrl.substring(0,60)}...)`, "color:orange;font-weight:bold;", "color:default;");
                    imgElement.style.display = 'none';
                    imgElement.style.width = '0px'; // 完全に消すため
                    imgElement.style.height = '0px';
                    imgElement.alt = `[非表示:${distance}]`;


                    const placeholder = document.createElement('span');
                    placeholder.textContent = `[画像非表示(類:${distance})]`;
                    placeholder.style.cssText = "color: gray; font-size: x-small; border: 1px dotted gray; padding: 1px 3px; margin: 2px;";
                    if (imgElement.parentNode) {
                        imgElement.parentNode.insertBefore(placeholder, imgElement.nextSibling);
                    }
                    return;
                }
            }
        } catch (error) {
            console.warn(`[不快画像ブロッカー] 画像処理エラー: ${error.message}`, `(対象URL: ${effectiveImageUrl})`);
            imgElement.classList.remove('futaba-image-processed');
            // processingImages.delete(effectiveImageUrl); // calculateDHash内で失敗時に削除されるはず
        }
    }

    // --- メイン処理 ---
    function scanImagesInNode(parentNode) {
        parentNode.querySelectorAll('img:not(.futaba-image-processed)').forEach(img => {
            if (img.src && !img.closest('a[href*="javascript:void"]')) { // 簡易的な広告除外など
                 // 描画されてから処理したいので少し遅延
                if (img.complete || img.naturalWidth > 0) { // 画像が既に読み込まれているか
                    setTimeout(() => processImageElement(img), 0);
                } else {
                    img.addEventListener('load', () => setTimeout(() => processImageElement(img), 0), { once: true });
                    img.addEventListener('error', () => img.classList.add('futaba-image-processed'), { once: true }); // エラー時も処理済み扱い
                }
            } else {
                img.classList.add('futaba-image-processed'); // srcがないものは処理済み扱い
            }
        });
    }

    // 初期スキャン
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => scanImagesInNode(document.body));
    } else {
        scanImagesInNode(document.body);
    }

    // 動的コンテンツ対応 (MutationObserver)
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        scanImagesInNode(node);
                    }
                });
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // --- 右クリックメニュー (Tampermonkeyのアイコンメニュー内) ---
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
            alert(`以下の画像のハッシュを登録試行します:\n${originalSrc.substring(0,100)}${originalSrc.length > 100 ? '...' : ''}\n\n※サムネイルの場合、リンク先の元画像が優先されることがあります。`);

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
                        alert(`ハッシュ [${hash.substring(0,16)}...] を登録しました。\nこの画像および類似画像は今後非表示になります。\n(対象: ${imageToHashUrl.substring(0,80)}...)`);
                        await processImageElement(imgToBlock); // 即時適用
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

    console.log('%c[不快画像ブロッカー (ふたばちゃんねる用)]%c が動作を開始しました。', "color:orange;font-weight:bold;", "color:default;");

})();