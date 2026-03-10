// ============================================
// グローバル変数
// ============================================
let currentLanguage = 'ja'; // 'ja' または 'ne'
let currentMenuIndex = 0;
let searchTerm = '';

// 運用ルール:
// 新しい「変更のお知らせ」は必ず先頭に追加し、date は更新日を 'YYYY-MM-DD' で直接記入してください。
// これにより、アプリを開いた日ではなく「実際に変更した日」が常に表示されます。
const updateNotices = [
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
    displayMenu(0);
    displayRecipeGrid();
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
    
    // モーダルを閉じる
    document.getElementById('closeModal').addEventListener('click', closeModal);
    
    // モーダルの背景をクリックしたら閉じる
    document.getElementById('recipeModal').addEventListener('click', (e) => {
        if (e.target.id === 'recipeModal') {
            closeModal();
        }
    });
    
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

    if (!updateNoticeTitle || !updateNoticeList) return;

    updateNoticeTitle.textContent = currentLanguage === 'ja'
        ? '変更のお知らせ / परिवर्तन सूचना'
        : 'परिवर्तन सूचना / 変更のお知らせ';

    const notices = updateNotices.slice(0, 3);

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

// ============================================
// 献立の表示
// ============================================
function displayMenu(index) {
    const menu = menuData.menus[index];
    const menuContent = document.getElementById('menuContent');
    
    // タイトルを作成
    let html = `<h2 class="menu-title">${currentLanguage === 'ja' ? menu.title_ja : menu.title_ne || menu.title_ja}</h2>`;
    
    // カテゴリーごとにグループ化
    const categories = {};
    menu.items.forEach(item => {
        const categoryKey = item.category_ja;
        if (!categories[categoryKey]) {
            categories[categoryKey] = {
                name_ja: item.category_ja,
                name_ne: item.category_ne,
                items: []
            };
        }
        categories[categoryKey].items.push(item);
    });
    
    // カテゴリーごとに表示
    Object.values(categories).forEach(category => {
        const categoryName = currentLanguage === 'ja' ? category.name_ja : category.name_ne || category.name_ja;
        
        html += `
            <div class="menu-category">
                <div class="category-header">
                    <span>${categoryName}</span>
                </div>
                <div class="category-items">
        `;
        
        category.items.forEach(item => {
            const isVisible = searchTerm === '' || 
                              item.name_ja.toLowerCase().includes(searchTerm) || 
                              item.name_ne.toLowerCase().includes(searchTerm) ||
                              item.category_ja.toLowerCase().includes(searchTerm);
            
            if (isVisible) {
                html += `
                    <div class="menu-item">
                        <div class="item-name-ja">${highlightText(item.name_ja)}</div>
                        ${item.name_ne ? `<div class="item-name-ne">${highlightText(item.name_ne)}</div>` : ''}
                    </div>
                `;
            }
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    menuContent.innerHTML = html;
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
                    <div class="recipe-card-info">
                        <span>${currentLanguage === 'ja' ? '材料' : 'सामग्री'}: ${recipe.ingredients.length}</span>
                        <span>${currentLanguage === 'ja' ? '手順' : 'विधि'}: ${recipe.instructions.length}</span>
                    </div>
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
    modal.scrollTop = 0;
}

// モーダルを閉じる
function closeModal() {
    document.getElementById('recipeModal').classList.remove('active');
}

// 言語切り替え
function toggleLanguage() {
    currentLanguage = currentLanguage === 'ja' ? 'ne' : 'ja';
    document.getElementById('currentLanguage').textContent = currentLanguage === 'ja' ? '日本語' : 'नेपाली';
    document.getElementById('otherLanguage').textContent = currentLanguage === 'ja' ? 'नेपाली' : '日本語';
    
    if (currentLanguage === 'ne') {
        document.body.classList.add('lang-ne');
    } else {
        document.body.classList.remove('lang-ne');
    }
    
    displayMenu(currentMenuIndex);
    displayRecipeGrid();
}

// 検索機能
function handleSearch(e) {
    searchTerm = e.target.value.toLowerCase().trim();
    const clearButton = document.getElementById('clearSearch');
    clearButton.style.display = searchTerm ? 'block' : 'none';
    
    const activeTab = document.querySelector('.tab-content.active').id;
    if (activeTab === 'menus') {
        displayMenu(currentMenuIndex);
    } else {
        displayRecipeGrid();
    }
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    searchTerm = '';
    document.getElementById('clearSearch').style.display = 'none';
    const activeTab = document.querySelector('.tab-content.active').id;
    if (activeTab === 'menus') {
        displayMenu(currentMenuIndex);
    } else {
        displayRecipeGrid();
    }
}

// ハイライト機能
function highlightText(text) {
    if (!searchTerm || !text) return text;
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

// キーボード操作
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
});

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
            title: "2026年 春の献立マニュアル",
            tabMenus: "献立",
            tabRecipes: "レシピ",
            menu0: "春の極上懐石",
            menu1: "連泊献立",
            menu2: "リピーター献立",
            search: "料理名やカテゴリーで検索..."
        },
        ne: {
            title: "सन् २०२६ वसन्तकालीन मेनु म्यानुअल",
            tabMenus: "मेनु",
            tabRecipes: "रेसिपी",
            menu0: "विशेष काइसेकी",
            menu1: "लगातार बसाई",
            menu2: "पुनरावर्ती",
            search: "परिकारको नाम वा श्रेणी खोज्नुहोस्..."
        }
    };

    const lang = ui[currentLanguage];
    document.getElementById('mainTitle').textContent = lang.title;
    document.getElementById('tabMenus').textContent = lang.tabMenus;
    document.getElementById('tabRecipes').textContent = lang.tabRecipes;
    document.getElementById('menuBtn0').textContent = lang.menu0;
    document.getElementById('menuBtn1').textContent = lang.menu1;
    document.getElementById('menuBtn2').textContent = lang.menu2;
    document.getElementById('searchInput').placeholder = lang.search;
    renderUpdateNotices();
    
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
    } else {
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
    } else {
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
