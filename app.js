// ============================================
// グローバル変数
// ============================================
let currentLanguage = 'ja'; // 'ja' または 'ne'
let currentMenuIndex = 0;
let searchTerm = '';
let showAllUpdates = false;

// 運用ルール:
// 新しい「変更のお知らせ」は必ず先頭に追加し、date は更新日を 'YYYY-MM-DD' で直接記入してください。
// これにより、アプリを開いた日ではなく「実際に変更した日」が常に表示されます。
const updateNotices = [
    {
        date: '2026-03-23',
        ja: '苺×蜜柑のシャーベットのレシピを修正しました。（ver.3）',
        ne: 'स्ट्रबेरी र मन्दारिन जुसको शरबतको रेसिपी संशोधन गरिएको छ। (Ver.3)'
    },
    {
        date: '2026-03-10',
        ja: '鯛茶漬けの胡麻醤油のレシピを修正しました。',
        ne: 'मादाइ चाजुकेको तिल-सोया सस रेसिपी संशोधन गरिएको छ।'
    },
    {
        date: '2026-03-10',
        ja: '苺と蜜柑のシャーベットのレシピを修正しました。',
        ne: 'स्ट्रबेरी र सुन्तलाको शरबत रेसिपी संशोधन गरिएको छ।'
    }
];

// ============================================
// 初期化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('キッチンマニュアルアプリを起動します...');
    
    // イベントリスナーの設定
    setupEventListeners();
    
    // 初期表示
    renderUpdateNotices();
    renderUpdateBanner();
    displayMenu(0);
    displayRecipeGrid();
    displayFoodSafety();
});

// ============================================
// イベントリスナーの設定
// ============================================
function setupEventListeners() {
    // タブの切り替え
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });
    
    // 言語切り替え
    document.getElementById('languageToggle').addEventListener('click', toggleLanguage);
    
    // 検索機能
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', handleSearch);
    
    document.getElementById('clearSearch').addEventListener('click', clearSearch);

    const updateNoticeToggle = document.getElementById('updateNoticeToggle');
    if (updateNoticeToggle) {
        updateNoticeToggle.addEventListener('click', () => {
            showAllUpdates = !showAllUpdates;
            renderUpdateNotices();
        });
    }
    
    // モーダルを閉じる
    document.getElementById('closeModal').addEventListener('click', closeModal);
    
    // モーダルの背景をクリックしたら閉じる
    document.getElementById('recipeModal').addEventListener('click', (e) => {
        if (e.target.id === 'recipeModal') {
            closeModal();
        }
    });

    const closeFoodSafetyLightbox = document.getElementById('closeFoodSafetyLightbox');
    if (closeFoodSafetyLightbox) {
        closeFoodSafetyLightbox.addEventListener('click', closeFoodSafetyLightboxModal);
    }

    const foodSafetyLightbox = document.getElementById('foodSafetyLightbox');
    if (foodSafetyLightbox) {
        foodSafetyLightbox.addEventListener('click', (e) => {
            if (e.target.id === 'foodSafetyLightbox') {
                closeFoodSafetyLightboxModal();
            }
        });
    }

    const updateBanner = document.getElementById('updateBanner');
    if (updateBanner) {
        updateBanner.addEventListener('click', () => {
            switchTab('updates');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // 上に戻るボタン
    const scrollToTopBtn = document.getElementById('scrollToTop');
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // スムーズにスクロール
        });
    });
    
    // スクロールで上に戻るボタンの表示/非表示
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });
}


function formatNoticeDate(dateValue) {
    if (!dateValue) return '';

    let date;

    // YYYY-MM-DD はローカル日付として扱い、タイムゾーン差で日付がズレるのを防ぐ
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        const [year, month, day] = dateValue.split('-').map(Number);
        date = new Date(year, month - 1, day);
    } else {
        date = new Date(dateValue);
    }

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString(currentLanguage === 'ja' ? 'ja-JP' : 'ne-NP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}


function renderUpdateNotices() {
    const updateNoticeTitle = document.getElementById('updateNoticeTitle');
    const updateNoticeList = document.getElementById('updateNoticeList');
    const updateNoticeToggle = document.getElementById('updateNoticeToggle');

    if (!updateNoticeTitle || !updateNoticeList) return;

    updateNoticeTitle.textContent = currentLanguage === 'ja'
        ? '変更のお知らせ / परिवर्तन सूचना'
        : 'परिवर्तन सूचना / 変更のお知らせ';

    const visibleCount = showAllUpdates ? updateNotices.length : 3;
    const notices = updateNotices.slice(0, visibleCount);

    updateNoticeList.innerHTML = notices.map((notice, idx) => {
        const dateLabel = formatNoticeDate(notice.date);

        return `
            <li>
                ${dateLabel ? `<div class="update-date">${dateLabel}</div>` : ''}
                <div class="update-ja">${idx + 1}. ${notice.ja}</div>
                <div class="update-ne">${notice.ne}</div>
            </li>
        `;
    }).join('');

    if (!updateNoticeToggle) return;

    if (updateNotices.length <= 3) {
        updateNoticeToggle.hidden = true;
        return;
    }

    updateNoticeToggle.hidden = false;
    updateNoticeToggle.textContent = showAllUpdates
        ? (currentLanguage === 'ja' ? '閉じる' : 'Close')
        : (currentLanguage === 'ja' ? 'もっと見る' : 'View more');
}

function renderUpdateBanner() {
    const updateBanner = document.getElementById('updateBanner');
    const updateBannerLabel = document.getElementById('updateBannerLabel');
    const updateBannerDate = document.getElementById('updateBannerDate');
    const updateBannerText = document.getElementById('updateBannerText');
    const updateBannerAction = document.getElementById('updateBannerAction');

    if (!updateBanner || !updateBannerLabel || !updateBannerDate || !updateBannerText || !updateBannerAction) return;

    const latestNotice = updateNotices[0];

    if (!latestNotice) {
        updateBanner.hidden = true;
        return;
    }

    updateBanner.hidden = false;
    updateBannerLabel.textContent = currentLanguage === 'ja' ? '更新' : 'UPDATE';
    updateBannerDate.textContent = formatNoticeDate(latestNotice.date);
    updateBannerText.textContent = currentLanguage === 'ja' ? latestNotice.ja : latestNotice.ne;
    updateBannerAction.textContent = currentLanguage === 'ja' ? '一覧を見る' : 'View all';
}

// ============================================
// タブ切り替え
// ============================================
function switchTab(tabName) {
    // すべてのタブボタンとコンテンツから active クラスを削除
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 選択されたタブに active クラスを追加
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
    // 検索をクリア
    clearSearch();
}

function displayFoodSafety() {
    const container = document.getElementById('foodSafetyContent');
    const page = menuData.foodSafety;

    if (!container || !page) return;

    const title = currentLanguage === 'ja' ? page.title_ja : page.title_ne || page.title_ja;
    const intro = currentLanguage === 'ja' ? page.intro_ja : page.intro_ne || page.intro_ja;
    const closingTitle = currentLanguage === 'ja' ? page.closing_title_ja : page.closing_title_ne || page.closing_title_ja;
    const closingMessage = currentLanguage === 'ja' ? page.closing_message_ja : page.closing_message_ne || page.closing_message_ja;

    let html = `
        <section class="food-safety-hero content-area">
            <span class="food-safety-eyebrow">${currentLanguage === 'ja' ? 'Kitchen Safety' : 'Kitchen Safety'}</span>
            <h2 class="food-safety-title">${title}</h2>
            ${intro ? `<p class="food-safety-intro">${intro}</p>` : ''}
        </section>
        <div class="food-safety-rules">
    `;

    page.rules.forEach((rule, index) => {
        const heading = currentLanguage === 'ja' ? rule.heading_ja : rule.heading_ne || rule.heading_ja;
        const items = currentLanguage === 'ja' ? (rule.items_ja || []) : (rule.items_ne || []);
        const reason = currentLanguage === 'ja' ? rule.reason_ja : rule.reason_ne || rule.reason_ja;
        const warning = currentLanguage === 'ja' ? rule.warning_ja : rule.warning_ne || rule.warning_ja;
        const action = currentLanguage === 'ja' ? rule.action_ja : rule.action_ne || rule.action_ja;
        const subheading = currentLanguage === 'ja' ? rule.subheading_ja : rule.subheading_ne || rule.subheading_ja;
        const substeps = currentLanguage === 'ja' ? (rule.substeps_ja || []) : (rule.substeps_ne || []);
        const imageSrc = rule.image_src || '';
        const imageAlt = currentLanguage === 'ja' ? rule.image_alt_ja : rule.image_alt_ne || rule.image_alt_ja;
        const imageCaption = currentLanguage === 'ja' ? rule.image_caption_ja : rule.image_caption_ne || rule.image_caption_ja;

        html += `
            <article class="food-rule-card">
                <div class="food-rule-number">${String(index + 1).padStart(2, '0')}</div>
                <div class="food-rule-body">
                    <h3 class="food-rule-heading">${heading}</h3>
                    ${items.length ? `
                        <ul class="food-rule-list">
                            ${items.map((item) => `<li>${item}</li>`).join('')}
                        </ul>
                    ` : ''}
                    ${subheading ? `
                        <section class="food-rule-subsection">
                            <h4 class="food-rule-subheading">${subheading}</h4>
                            ${substeps.length ? `
                                <ul class="food-rule-list compact">
                                    ${substeps.map((item) => `<li>${item}</li>`).join('')}
                                </ul>
                            ` : ''}
                        </section>
                    ` : ''}
                    ${imageSrc ? `
                        <button
                            class="food-safety-image-button"
                            type="button"
                            data-image-src="${imageSrc}"
                            data-image-alt="${escapeHtmlAttribute(imageAlt || '')}"
                            data-image-caption="${escapeHtmlAttribute(imageCaption || '')}"
                        >
                            <figure class="food-safety-image-card">
                                <img src="${imageSrc}" alt="${escapeHtmlAttribute(imageAlt || '')}" class="food-safety-inline-image">
                                ${imageCaption ? `<figcaption class="food-safety-inline-caption">${imageCaption}</figcaption>` : ''}
                            </figure>
                        </button>
                    ` : ''}
                    ${warning ? `<div class="food-rule-warning">${warning}</div>` : ''}
                    ${action ? `<div class="food-rule-action">${action}</div>` : ''}
                    ${reason ? `<div class="food-rule-reason">${reason}</div>` : ''}
                </div>
            </article>
        `;
    });

    html += `
        </div>
        <section class="food-safety-closing">
            <h3 class="food-safety-closing-title">${closingTitle}</h3>
            <p class="food-safety-closing-message">${closingMessage}</p>
        </section>
    `;

    container.innerHTML = html;
    bindFoodSafetyImageButtons();
}

function bindFoodSafetyImageButtons() {
    document.querySelectorAll('.food-safety-image-button').forEach((button) => {
        button.addEventListener('click', () => {
            openFoodSafetyLightbox({
                src: button.dataset.imageSrc,
                alt: button.dataset.imageAlt || '',
                caption: button.dataset.imageCaption || ''
            });
        });
    });
}

function openFoodSafetyLightbox({ src, alt, caption }) {
    const lightbox = document.getElementById('foodSafetyLightbox');
    const image = document.getElementById('foodSafetyLightboxImage');
    const captionElement = document.getElementById('foodSafetyLightboxCaption');

    if (!lightbox || !image || !captionElement || !src) return;

    image.src = src;
    image.alt = alt || '';
    captionElement.textContent = caption || '';
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
}

function closeFoodSafetyLightboxModal() {
    const lightbox = document.getElementById('foodSafetyLightbox');
    const image = document.getElementById('foodSafetyLightboxImage');
    const captionElement = document.getElementById('foodSafetyLightboxCaption');

    if (!lightbox || !image || !captionElement) return;

    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    image.removeAttribute('src');
    image.alt = '';
    captionElement.textContent = '';
    document.body.classList.remove('lightbox-open');
}

function escapeHtmlAttribute(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// ============================================
// 献立の表示
// ============================================
function displayMenu(index) {
    const menu = menuData.menus[index];
    const menuContent = document.getElementById('menuContent');

    let html = `<h2 class="menu-title">${currentLanguage === 'ja' ? menu.title_ja : menu.title_ne || menu.title_ja}</h2>`;

    // カテゴリーごとにグループ化（順序を保持）
    const categories = {};
    const categoryOrder = [];
    menu.items.forEach(item => {
        const key = item.category_ja;
        if (!categories[key]) {
            categories[key] = { name_ja: item.category_ja, name_ne: item.category_ne, items: [] };
            categoryOrder.push(key);
        }
        categories[key].items.push(item);
    });

    // 「親キー・サブ名」パターンで親子関係を検出
    function findParentKey(key) {
        return categoryOrder.find(k => k !== key && key.startsWith(k + '・')) || null;
    }

    const processedKeys = new Set();

    categoryOrder.forEach(key => {
        if (processedKeys.has(key)) return;
        processedKeys.add(key);

        if (findParentKey(key)) return; // 子カテゴリーは親の中で処理

        // 子カテゴリーを収集（例：お造り・付け合せ、お造り・調味料）
        const childKeys = categoryOrder.filter(k => k !== key && k.startsWith(key + '・'));
        childKeys.forEach(k => processedKeys.add(k));

        const categoryName = currentLanguage === 'ja' ? categories[key].name_ja : categories[key].name_ne || categories[key].name_ja;

        html += `<div class="menu-category">
            <div class="category-header collapsible" onclick="toggleCategory(this)">
                <span>${categoryName}</span>
                <span class="category-toggle-icon">▾</span>
            </div>
            <div class="category-items">`;

        categories[key].items.forEach(item => {
            if (isMenuItemVisible(item)) {
                html += renderMenuItemHtml(item);
            }
        });

        // 子カテゴリーをサブグループとして表示
        childKeys.forEach(childKey => {
            const child = categories[childKey];
            const subLabel = currentLanguage === 'ja'
                ? childKey.slice(key.length + 1)
                : child.name_ne || childKey.slice(key.length + 1);

            const visibleSubItems = child.items.filter(item => isMenuItemVisible(item));
            if (visibleSubItems.length === 0 && searchTerm) return;

            html += `<div class="menu-sub-group">
                <div class="sub-group-label">${subLabel}</div>`;

            child.items.forEach(item => {
                if (isMenuItemVisible(item)) {
                    html += renderMenuItemHtml(item, true);
                }
            });

            html += `</div>`;
        });

        html += `</div></div>`;
    });

    menuContent.innerHTML = html;
}

function isMenuItemVisible(item) {
    if (searchTerm === '') return true;
    return item.name_ja.toLowerCase().includes(searchTerm) ||
           (item.name_ne && item.name_ne.toLowerCase().includes(searchTerm)) ||
           item.category_ja.toLowerCase().includes(searchTerm);
}

function renderMenuItemHtml(item, isSub = false) {
    return `<div class="menu-item${isSub ? ' sub-item' : ''}">
        <div class="item-name-ja">${highlightText(item.name_ja)}</div>
        ${item.name_ne ? `<div class="item-name-ne">${highlightText(item.name_ne)}</div>` : ''}
    </div>`;
}

function toggleCategory(header) {
    const items = header.nextElementSibling;
    const icon = header.querySelector('.category-toggle-icon');
    const isOpen = !items.classList.contains('collapsed');
    items.classList.toggle('collapsed', isOpen);
    icon.textContent = isOpen ? '▸' : '▾';
}

// ============================================
// レシピグリッドの表示
// ============================================
function displayRecipeGrid() {
    const recipeGrid = document.getElementById('recipeGrid');
    let html = '';
    
    menuData.recipes.forEach((recipe, index) => {
        const isVisible = searchTerm === '' || 
                          recipe.title_ja.toLowerCase().includes(searchTerm) ||
                          recipe.title_ne.toLowerCase().includes(searchTerm) ||
                          recipe.name.toLowerCase().includes(searchTerm);
        
        if (isVisible) {
            const title = currentLanguage === 'ja' ? recipe.title_ja : recipe.title_ne || recipe.title_ja;
            
            html += `
                <div class="recipe-card" onclick="showRecipeDetail(${index})">
                    <div class="recipe-card-title">${highlightText(title)}</div>
                </div>
            `;
        }
    });
    
    recipeGrid.innerHTML = html || '<p style="text-align: center; color: #999;">検索結果がありません</p>';
}

// ============================================
// レシピ詳細の表示
// ============================================
// --- ここから一番下まで貼り付け ---

// レシピ詳細の表示（ここからファイルの最後までを貼り替え）
function showRecipeDetail(index) {
    const recipe = menuData.recipes[index];
    const modal = document.getElementById('recipeModal');
    const detailDiv = document.getElementById('recipeDetail');
    
    const title = currentLanguage === 'ja' ? recipe.title_ja : recipe.title_ne || recipe.title_ja;
    
    let html = `<h2 class="recipe-detail-title">${title}</h2>`;
    
    // ⚖️ 計算ベースがある場合だけ、入力欄を表示
    if (recipe.calc_base_label_ja) {
        const label = currentLanguage === 'ja' ? recipe.calc_base_label_ja : recipe.calc_base_label_ne;
        html += `
            <div class="calc-section" style="background: #f0f7ff; padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #3498db;">
                <label style="font-weight: bold; display: block; margin-bottom: 5px;">${label}</label>
                <input type="number" id="baseWeight" placeholder="例: 1000" style="width: 100%; padding: 10px; font-size: 1.2rem; border-radius: 5px; border: 1px solid #ccc;" oninput="updateCalculations(${index})">
            </div>
        `;
    }

    // 📝 材料セクション
    if (recipe.ingredients && recipe.ingredients.length > 0) {
        html += `
            <div class="recipe-section">
                <h3 class="recipe-section-title">${currentLanguage === 'ja' ? '材料' : 'सामग्री'}</h3>
                <ul class="recipe-list">
        `;
        
        recipe.ingredients.forEach((item, i) => {
            // 計算ラベルがあるレシピの時だけ、計算用の赤文字スペースを作る
            const hasCalc = !!recipe.calc_base_label_ja;

            html += `
                <li style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div class="recipe-text-ja">${item.text_ja}</div>
                        ${item.text_ne ? `<div class="recipe-text-ne">${item.text_ne}</div>` : ''}
                    </div>
                    ${hasCalc ? `<div class="calc-result" id="res-${i}" style="font-weight: bold; color: #e74c3c; font-size: 1.2rem;">- g</div>` : ''}
                </li>
            `;
        });
        html += `</ul></div>`;
    }
    
    // 👨‍🍳 作り方セクション
    if (recipe.instructions && recipe.instructions.length > 0) {
        html += `
            <div class="recipe-section">
                <h3 class="recipe-section-title">${currentLanguage === 'ja' ? '作り方' : 'विधि'}</h3>
                <ul class="recipe-list">
        `;
        recipe.instructions.forEach(item => {
            html += `
                <li>
                    <div class="recipe-text-ja">${item.text_ja}</div>
                    <div class="recipe-text-ne">${item.text_ne}</div>
                </li>
            `;
        });
        html += `</ul></div>`;
    }

    // ⚠️ 補足・備考セクション
    if (recipe.notes && recipe.notes.length > 0) {
        html += `
            <div class="recipe-section" style="background: #fff5f5; padding: 10px; border-radius: 10px;">
                <h3 class="recipe-section-title" style="color: #7f3428; border-bottom-color: #bda38c;">${currentLanguage === 'ja' ? '補足' : 'नोट'}</h3>
                <ul class="recipe-list">
        `;
        recipe.notes.forEach(item => {
            html += `
                <li>
                    <div class="recipe-text-ja">${item.text_ja}</div>
                    <div class="recipe-text-ne">${item.text_ne}</div>
                </li>
            `;
        });
        html += `</ul></div>`;
    }
    
    detailDiv.innerHTML = html;
    modal.classList.add('active');
    document.querySelector('.modal-content').scrollTop = 0;
}

// 計算を実行する命令
function updateCalculations(index) {
    const weightInput = document.getElementById('baseWeight');
    if (!weightInput) return;

    const weight = weightInput.value;
    const recipe = menuData.recipes[index];
    
    recipe.ingredients.forEach((item, i) => {
        const resultElement = document.getElementById(`res-${i}`);
        if (resultElement) {
            if (weight > 0 && item.ratio) {
                const calc = weight * item.ratio;
                resultElement.innerText = calc.toFixed(1) + ' g';
            } else {
                resultElement.innerText = '- g';
            }
        }
    });
}

// ============================================
// モーダルを閉じる
// ============================================
function closeModal() {
    const modal = document.getElementById('recipeModal');
    modal.classList.remove('active');
}

// ============================================
// 言語切り替え
// ============================================
// app.js の toggleLanguage 関数をパワーアップ！
function toggleLanguage() {
    currentLanguage = currentLanguage === 'ja' ? 'ne' : 'ja';
    
    // ボタンのテキスト更新
    document.getElementById('currentLanguage').textContent = currentLanguage === 'ja' ? '日本語' : 'नेपाली';
    document.getElementById('otherLanguage').textContent = currentLanguage === 'ja' ? 'नेपाली' : '日本語';
    
    // UIパーツの翻訳
    const ui = {
        ja: {
            title: "キッチンマニュアル",
            tabMenus: "2026春の献立",
            tabRecipes: "2026春のレシピ",
            tabFoodSafety: "食品衛生",
            menu0: "春の極上懐石",
            menu1: "連泊献立",
            menu2: "リピーター献立",
            search: "料理名やカテゴリーで検索..."
        },
        ne: {
            title: "सन् २०२६ वसन्तकालीन मेनु म्यानुअल",
            tabMenus: "मेनु",
            tabRecipes: "रेसिपी",
            tabFoodSafety: "खाद्य स्वच्छता",
            menu0: "विशेष काइसेकी",
            menu1: "लगातार बसाई",
            menu2: "पुनरावर्ती",
            search: "परिकारको नाम वा श्रेणी खोज्नुहोस्..."
        }
    };

    const lang = ui[currentLanguage];
    const tabUpdatesLabel = currentLanguage === 'ja' ? '変更のお知らせ' : 'परिवर्तन सूचना';
    document.getElementById('mainTitle').textContent = lang.title;
    document.getElementById('tabMenus').textContent = lang.tabMenus;
    document.getElementById('tabRecipes').textContent = lang.tabRecipes;
    document.getElementById('tabFoodSafety').textContent = lang.tabFoodSafety;
    document.getElementById('tabUpdates').textContent = tabUpdatesLabel;
    document.getElementById('menuBtn0').textContent = lang.menu0;
    document.getElementById('menuBtn1').textContent = lang.menu1;
    document.getElementById('menuBtn2').textContent = lang.menu2;
    document.getElementById('searchInput').placeholder = lang.search;
    renderUpdateNotices();
    renderUpdateBanner();
    displayFoodSafety();
    
    // bodyクラスの切り替え
    if (currentLanguage === 'ne') {
        document.body.classList.add('lang-ne');
    } else {
        document.body.classList.remove('lang-ne');
    }
    
    displayMenu(currentMenuIndex);
    displayRecipeGrid();
}
// ============================================
// 検索機能
// ============================================
function handleSearch(e) {
    searchTerm = e.target.value.toLowerCase().trim();
    
    // クリアボタンの表示/非表示
    const clearButton = document.getElementById('clearSearch');
    if (searchTerm) {
        clearButton.style.display = 'block';
    } else {
        clearButton.style.display = 'none';
    }
    
    // 表示を更新
    const activeTab = document.querySelector('.tab-content.active').id;
    if (activeTab === 'menus') {
        displayMenu(currentMenuIndex);
    } else if (activeTab === 'recipes') {
        displayRecipeGrid();
    }
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    searchTerm = '';
    document.getElementById('clearSearch').style.display = 'none';
    
    // 表示を更新
    const activeTab = document.querySelector('.tab-content.active').id;
    if (activeTab === 'menus') {
        displayMenu(currentMenuIndex);
    } else if (activeTab === 'recipes') {
        displayRecipeGrid();
    }
}

// ============================================
// テキストのハイライト
// ============================================
function highlightText(text) {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================
// キーボードショートカット
// ============================================
document.addEventListener('keydown', (e) => {
    // Escキーでモーダルを閉じる
    if (e.key === 'Escape') {
        closeModal();
        closeFoodSafetyLightboxModal();
    }
    
    // Ctrl + F で検索にフォーカス
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
});

console.log('✅ キッチンマニュアルアプリが正常に起動しました！');

// app.js に以下を追加・修正

// 献立を切り替える関数
function switchMenu(index) {
    currentMenuIndex = index;
    
    // ボタンのactiveクラスを更新
    document.querySelectorAll('.menu-select-btn').forEach((btn, idx) => {
        if (idx === index) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // 表示を更新
    displayMenu(index);
}

// 既存の toggleLanguage 関数内でも displayMenu(currentMenuIndex) が
// 呼ばれているため、連動して正しく切り替わります。
