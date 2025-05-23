// ==UserScript==
// @name         不快コンテンツブロッカー (ふたばちゃんねる用)
// @namespace    http://tampermonkey.net/
// @version      0.5.0 // テキストNG & 指定ワードNG 準備
// @description  ふたばちゃんねる上の不快な画像、迷惑テキスト、指定ワードを判定し、そのレス全体を非表示にします。
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
    const SIMILARITY_THRESHOLD = 6; // 画像類似度の閾値
    const DHASH_SIZE = 8;         // 画像dHashのサイズ

    // ▼▼▼ ユーザー指定NGワードリスト (ここにNGにしたい単語を文字列で追加してください) ▼▼▼
    // 例: const USER_SPECIFIED_NG_WORDS = ["迷惑単語A", "いやな言葉B", "特定のスラング"];
    const USER_SPECIFIED_NG_WORDS = [
        // "糞口",
        // "ここにワードを入れていく1",
        // "大文字小文字を区別せずにNGにしたい場合は、登録時に小文字で統一し、判定時も小文字に変換するなど工夫が必要"
    ]; // 空の配列から始めてください

    // ▼▼▼ テキストNGルール用設定 (ランダム文字列などの判定用) ▼▼▼
    const TEXT_NG_RULES = {
        MIN_TEXT_LENGTH_FOR_PATTERNS: 10, // この文字数以下のテキストはパターン判定対象外
        MAX_DIGITS_SEQUENCE: 30,
        MAX_SYMBOLS_SEQUENCE: 20,
        MAX_UNICODE_SYMBOLS_SEQUENCE: 15,
        MAX_ALPHABET_ONLY_SEQUENCE: 35,
        EMOJI_PERCENTAGE_THRESHOLD: 0.6
    };

    let blockedImageHashes = GM_getValue(BLOCKED_HASHES_KEY, []);
    let processingImagesForHash = new Set(); // calculateDHash関数内で使う変数名を変更

    // --- dHash 計算関数 (calculateDHash) ---
    async function calculateDHash(imageUrl) {
        if (!imageUrl || imageUrl.startsWith('data:')) return null;
        if (processingImagesForHash.has(imageUrl)) return null; // 変数名変更
        processingImagesForHash.add(imageUrl); // 変数名変更

        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET', url: imageUrl, responseType: 'blob', timeout: 15000,
                onload: function(response) {
                    // ... (中身はv0.4.4と同じなので省略、ただし processingImages を processingImagesForHash に変更)
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
                            resolve(hash); // processingImagesForHash.delete は finally で
                        } catch (e) { reject(new Error(`dHash計算中のエラー: ${e.message} for ${imageUrl}`)); }
                        finally { if(img.src.startsWith('blob:')) URL.revokeObjectURL(img.src); processingImagesForHash.delete(imageUrl); } // 変数名変更
                    };
                    img.onerror = () => { if(img.src.startsWith('blob:')) URL.revokeObjectURL(img.src); processingImagesForHash.delete(imageUrl); reject(new Error(`画像の読み込みに失敗 (img.onerror): ${imageUrl}`)); };  // 変数名変更
                    if (response.response instanceof Blob && response.response.size > 0) img.src = URL.createObjectURL(response.response);
                    else { processingImagesForHash.delete(imageUrl); reject(new Error(`受信した画像データが無効です: ${imageUrl}`)); } // 変数名変更
                },
                onerror: (err) => { processingImagesForHash.delete(imageUrl); reject(new Error(`GM_xmlhttpRequestエラー: ${err.statusText || '不明'} for ${imageUrl}`)); }, // 変数名変更
                ontimeout: () => { processingImagesForHash.delete(imageUrl); reject(new Error(`GM_xmlhttpRequestタイムアウト: ${imageUrl}`)); } // 変数名変更
            });
        });
    }

    // --- ハミング距離計算関数 (hammingDistance) ---
    function hammingDistance(hash1, hash2) { /* v0.4.4と同じ */ if (!h1 || !h2 || h1.length !== h2.length) return Infinity; let d = 0; for (let i = 0; i < h1.length; i++) if (h1[i] !== h2[i]) d++; return d; }

    // --- テキストNG判定ヘルパー関数群 (ひな形) ---
    function isTooLongDigits(text) { return new RegExp(`\\d{${TEXT_NG_RULES.MAX_DIGITS_SEQUENCE},}}`).test(text); }
    function hasTooManySpamSymbols(text) { if (new RegExp(`[!"#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~]{${TEXT_NG_RULES.MAX_SYMBOLS_SEQUENCE},}`, 'u').test(text)) return true; if (new RegExp(`[\u2000-\u2BFF\u2E00-\u2E7F]{${TEXT_NG_RULES.MAX_UNICODE_SYMBOLS_SEQUENCE},}`, 'u').test(text)) return true; return false; }
    function countEmojis(str) { const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu; const matches = str.match(emojiRegex); return matches ? matches.length : 0; }
    function isMostlyEmojis(text) { if (text.length < 5) return false; const emojiCount = countEmojis(text); return emojiCount > 0 && (emojiCount / text.length) >= TEXT_NG_RULES.EMOJI_PERCENTAGE_THRESHOLD; }
    function isRandomAlphabetSpam(text) { return new RegExp(`^[a-zA-Z]{${TEXT_NG_RULES.MAX_ALPHABET_ONLY_SEQUENCE},}}$`).test(text); }

    function containsUserNGWord(text) {
        if (USER_SPECIFIED_NG_WORDS.length === 0) return false;
        const lowerText = text.toLowerCase(); // 判定時は小文字に統一 (NGワードも小文字で登録推奨)
        for (const ngWord of USER_SPECIFIED_NG_WORDS) {
            if (lowerText.includes(ngWord.toLowerCase())) { // NGワードも小文字にして比較
                return ngWord; // 一致したNGワードを返す (ログ表示用)
            }
        }
        return false;
    }

    // --- レス全体を処理する関数 (旧processImageElement) ---
    async function processPostRow(postRowElement) {
        if (!postRowElement || postRowElement.classList.contains('futaba-content-processed') || !postRowElement.closest('body')) {
            return;
        }
        postRowElement.classList.add('futaba-content-processed'); // 処理済みマーク

        let ngReason = null;
        let ngDetails = "";

        // 1. テキストベースのNG判定 (指定ワードNGとパターンNG)
        const blockquote = postRowElement.querySelector('blockquote');
        if (blockquote) {
            const postText = (blockquote.textContent || "").trim();
            if (postText.length > 0) { // テキストがあれば判定
                const matchedUserNGWord = containsUserNGWord(postText);
                if (matchedUserNGWord) {
                    ngReason = "指定NGワード";
                    ngDetails = `「${matchedUserNGWord}」`;
                } else if (postText.length >= TEXT_NG_RULES.MIN_TEXT_LENGTH_FOR_PATTERNS) {
                    // パターンベースのNG判定 (指定NGワードに一致しなかった場合のみ)
                    if (isTooLongDigits(postText)) ngReason = "長すぎる数字列";
                    else if (hasTooManySpamSymbols(postText)) ngReason = "迷惑な記号が多すぎ";
                    else if (isMostlyEmojis(postText)) ngReason = "絵文字が多すぎ";
                    else if (isRandomAlphabetSpam(postText)) ngReason = "ランダム風英字";
                    if (ngReason) ngDetails = `テキスト「${postText.substring(0, 30)}...」`;
                }
            }
        }

        // 2. 画像NG判定 (テキストNGでブロックされていない場合のみ)
        if (!ngReason) {
            const imgElement = postRowElement.querySelector('img:not(.futaba-image-scan-attempted)'); // スキャン試行済みでない画像を探す
            if (imgElement && imgElement.src) {
                imgElement.classList.add('futaba-image-scan-attempted'); // スキャン試行マーク
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
                                ngDetails = `画像URL: ${imageUrl.substring(0,60)}...`;
                                break;
                            }
                        }
                    }
                } catch (error) {
                    console.warn(`[不快コンテンツブロッカー] 画像ハッシュ計算エラー: ${error.message}`, `(対象URL: ${effectiveImageUrl})`);
                }
            }
        }

        // NG理由があればレスを非表示にする (v0.4.4 のロジックを流用)
        if (ngReason) {
            postRowElement.style.display = 'none';

            let resNoText = "";
            const checkbox = postRowElement.querySelector('input[type="checkbox"]');
            if (checkbox && checkbox.name) resNoText = `レス ${checkbox.name} `;

            console.log(`%c[不快コンテンツブロッカー]%c ${resNoText}の内容を非表示 (理由: ${ngReason})。詳細: ${ngDetails}`, "color:crimson;font-weight:bold;", "color:default;");

            // プレースホルダー行の作成と挿入 (v0.4.4 のままで、空のテキスト)
            const placeholderRow = document.createElement('tr');
            placeholderRow.classList.add('futaba-content-processed'); // こちらも処理済みマーク
            const placeholderCell = document.createElement('td');
            const originalCell = postRowElement.querySelector('td');
            if (originalCell) {
                 placeholderCell.className = originalCell.className;
                 let totalColspan = 0;
                 for(const cell of Array.from(postRowElement.cells)) { totalColspan += cell.colSpan; }
                 placeholderCell.colSpan = totalColspan > 0 ? totalColspan : 1;
            }
            const placeholderText = document.createElement('span');
            placeholderText.textContent = ``; // 空のテキスト (v0.4.4での変更点)
            placeholderText.style.cssText = "color: gray; font-size: small; font-style: italic;";
            placeholderCell.appendChild(placeholderText);
            placeholderRow.appendChild(placeholderCell);
            if (postRowElement.parentNode) {
                postRowElement.parentNode.insertBefore(placeholderRow, postRowElement.nextSibling);
            }
        }
    }

    // --- メイン処理 (スキャンと監視) ---
    // (旧 scanImagesInNode を変更し、レス行(tr)を対象にする)
    function scanAndProcessPosts(parentNode) {
        // ふたばのレスはtdがあり、その中にcheckbox name="数字" があるtrを探す
        parentNode.querySelectorAll('tr:not(.futaba-content-processed)').forEach(tr => {
            if (tr.querySelector('td input[type="checkbox"][name]')) {
                 setTimeout(() => processPostRow(tr), 0); // 各レス行を処理
            } else {
                // レス行ではないものは処理済みとしてマークしておく (ヘッダーやスレタイなど)
                // ただし、このままだとレス以外のtrも全て処理済みマークがついてしまうので、
                // もし問題があれば、より厳密なレス行の判定が必要
                tr.classList.add('futaba-content-processed');
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
                        // 追加されたノード自体がレス行(TR)で、まだ処理されていなければ処理
                        if (node.tagName === 'TR' && node.querySelector('td input[type="checkbox"][name]') && !node.classList.contains('futaba-content-processed')) {
                            setTimeout(() => processPostRow(node), 0);
                        }
                        // 追加されたノードの子孫にレス行が含まれる場合もスキャン
                        else if (node.querySelectorAll) { // querySelectorAll が使えるか確認
                            node.querySelectorAll('tr:not(.futaba-content-processed)').forEach(potentialPostRow => {
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
    // (v0.4.4のまま。ただし、即時反映はprocessPostRowを呼び出すようにする)
    let lastHoveredImageElement = null;
    document.addEventListener('mouseover', function(event) { if (event.target.tagName === 'IMG') lastHoveredImageElement = event.target; }, true);

    GM_registerMenuCommand("■ この画像を不快登録", async () => { /* v0.4.4のロジックをベースに、最後にprocessPostRowを呼び出す */
        if (lastHoveredImageElement && lastHoveredImageElement.src && lastHoveredImageElement.closest('body')) {
            const imgToBlock = lastHoveredImageElement;
            const originalSrc = imgToBlock.src;
            alert(`以下の画像のハッシュを登録試行します:\n${originalSrc.substring(0,100)}${originalSrc.length > 100 ? '...' : ''}\n\n※サムネイルの場合、リンク先の元画像が優先。\n登録後、この画像を含むレス全体が非表示対象になります。`);
            let imageToHashUrl = originalSrc;
            if (imgToBlock.parentNode && imgToBlock.parentNode.tagName === 'A' && imgToBlock.parentNode.href) {
                const linkUrl = new URL(imgToBlock.parentNode.href, document.baseURI).href;
                if (/\.(jpe?g|png|gif|webp)$/i.test(linkUrl) && !linkUrl.includes('futaba.htm') && !linkUrl.includes('/res/')) { imageToHashUrl = linkUrl; console.log(`%c[不快コンテンツブロッカー]%c 登録時: サムネイル ${originalSrc.substring(0,60)}... の代わりにリンク先 ${imageToHashUrl.substring(0,60)}... を使用`, "color:orange;font-weight:bold;", "color:default;"); }
            }
            try {
                const hash = await calculateDHash(imageToHashUrl);
                if (hash) {
                    if (!blockedImageHashes.includes(hash)) {
                        blockedImageHashes.push(hash); GM_setValue(BLOCKED_HASHES_KEY, blockedImageHashes);
                        alert(`ハッシュ [${hash.substring(0,16)}...] を登録しました。\nこの画像および類似画像を含むレスは今後非表示になります。\n(対象: ${imageToHashUrl.substring(0,80)}...)`);
                        const postRowToProcess = imgToBlock.closest('tr'); // 画像を含むレス行を取得
                        if (postRowToProcess) {
                            // 即時反映のために、処理済みマークを一時的に解除して再処理
                            postRowToProcess.classList.remove('futaba-content-processed');
                            // プレースホルダーがもしあれば削除 (空なので実質不要かもだが念のため)
                            const nextSibling = postRowToProcess.nextSibling;
                            if (nextSibling && nextSibling.classList && nextSibling.classList.contains('futaba-content-processed') && nextSibling.querySelector('span')?.textContent === '') {
                                 nextSibling.remove();
                            }
                            // 画像自体のスキャン試行マークも解除
                            const imagesInPost = postRowToProcess.querySelectorAll('img.futaba-image-scan-attempted');
                            imagesInPost.forEach(img => img.classList.remove('futaba-image-scan-attempted'));

                            await processPostRow(postRowToProcess); // レス行全体を再処理
                        }
                    } else { alert(`この画像 (または類似画像) のハッシュ [${hash.substring(0,16)}...] は既に登録されています。`); }
                } else { alert('画像のハッシュ計算に失敗しました。画像が読み込めないか、対応していない形式の可能性があります。'); }
            } catch (error) { alert('ハッシュ登録中にエラーが発生しました: ' + error.message); console.error("[不快コンテンツブロッカー] ハッシュ登録エラー:", error); }
        } else { alert('画像の上にマウスカーソルを合わせてから、Tampermonkeyの拡張機能アイコンをクリックし、このメニューを選択してください。'); }
        lastHoveredImageElement = null;
    });
    GM_registerMenuCommand("■ 登録済み不快画像ハッシュを全てクリア", () => { /* v0.4.4と同じ */ if (confirm("本当に登録されている不快画像のハッシュを全てクリアしますか？\nこの操作は元に戻せません。")) { blockedImageHashes = []; GM_setValue(BLOCKED_HASHES_KEY, []); alert("登録済みハッシュを全てクリアしました。\nページを再読み込みすると、ブロックされていた画像が表示されるようになります。"); } });
    GM_registerMenuCommand("■ 現在のブロックハッシュ数を確認", () => { /* v0.4.4と同じ */ alert(`現在 ${blockedImageHashes.length} 件のハッシュがブロックリストに登録されています。`); });

    console.log('%c[不快コンテンツブロッカー (ふたばちゃんねる用 v0.5.0)]%c が動作を開始。テキストNG・指定ワードNG準備。', "color:orange;font-weight:bold;", "color:default;");

})();