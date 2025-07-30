// Optimized Universal Content Script - Enhanced Performance & Memory Management
// Version 2.0 - Highly Optimized

console.log('🚀 Optimized Universal Price Comparator v2.0 Loaded:', window.location.href);

// === PERFORMANCE OPTIMIZATIONS ===

// Debounce utility for expensive operations
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle utility for high-frequency events
const throttle = (func, limit) => {
    let lastFunc;
    let lastRan;
    return function(...args) {
        if (!lastRan) {
            func.apply(this, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(() => {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(this, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
};

// Efficient DOM cache
class DOMCache {
    constructor() {
        this.cache = new Map();
    }
    
    get(selector) {
        if (!this.cache.has(selector)) {
            this.cache.set(selector, document.querySelectorAll(selector));
        }
        return this.cache.get(selector);
    }
    
    clear() {
        this.cache.clear();
    }
    
    invalidate(selector) {
        this.cache.delete(selector);
    }
}

// === GLOBAL STATE MANAGEMENT ===
class ExtensionState {
    constructor() {
        this.currentPageType = null;
        this.lastUrl = window.location.href;
        this.isInitialized = false;
        this.urlChangeCount = 0;
        
        // Navigation monitoring
        this.navigationInterval = null;
        
        // Page-specific state
        this.comparisonData = {};
        this.vendorInfo = {};
        this.pairedVendors = new Set();
        this.processedVendors = new Set();
        this.allProductElements = new WeakSet(); // Use WeakSet for better memory management
        this.activeObservers = [];
        
        // Performance tracking
        this.performanceMetrics = {
            initTime: 0,
            processTime: 0,
            apiCalls: 0
        };
        
        // DOM cache
        this.domCache = new DOMCache();
    }
    
    reset() {
        this.comparisonData = {};
        this.vendorInfo = {};
        this.pairedVendors = new Set();
        this.processedVendors = new Set();
        this.allProductElements = new WeakSet();
        this.domCache.clear();
    }
    
    cleanup() {
        this.activeObservers.forEach(observer => observer.disconnect());
        this.activeObservers = [];
        this.domCache.clear();
        if (this.navigationInterval) {
            clearInterval(this.navigationInterval);
        }
    }
}

const state = new ExtensionState();

// === SEARCH STATE ===
const SEARCH_HISTORY_KEY = 'spVsTpSearchHistory';
const FAVORITES_KEY = 'spVsTpFavorites';

let searchHistory = loadFromStorage(SEARCH_HISTORY_KEY);
let favoriteProducts = loadFromStorage(FAVORITES_KEY);

// === OPTIMIZED PAGE TYPE DETECTION ===
const PAGE_PATTERNS = {
    'snappfood-menu': /snappfood\.ir\/restaurant\/menu\//,
    'tapsifood-menu': /tapsi\.food\/vendor\//,
    'snappfood-service': /snappfood\.ir\/service\/.+\/city\//,
    'snappfood-homepage': /^https?:\/\/(www\.)?snappfood\.ir\/?(\?.*)?$/
};

function detectPageType(url = window.location.href) {
    for (const [type, pattern] of Object.entries(PAGE_PATTERNS)) {
        if (pattern.test(url)) return type;
    }
    return 'unknown';
}

// === MEMORY-EFFICIENT CLEANUP ===
function cleanupAll() {
    console.log('🧹 Optimized cleanup starting...');
    const startTime = performance.now();
    
    // Batch DOM operations for better performance
    const elementsToRemove = [
        '.sp-vs-tp-comparison-text',
        '#sp-vs-tp-widget-container', 
        '#sp-vs-tp-widget-icon', 
        '.sp-vs-tp-paired-vendor-textbox', 
        '.sp-vs-tp-paired-vendor-badge',
        '.sp-vs-tp-high-rating-textbox', 
        '.sp-vs-tp-recommendation-textbox',
        '.sp-vs-tp-recommendation-badge',
        '.sp-vs-tp-star-badge'
    ];
    
    // Single query for all elements to remove
    const selector = elementsToRemove.join(', ');
    document.querySelectorAll(selector).forEach(el => el.remove());
    
    // Batch class removal
    const classesToRemove = [
        'sp-vs-tp-cheaper', 'sp-vs-tp-expensive', 'sp-vs-tp-same-price',
        'sp-vs-tp-same-price-gray', 'sp-vs-tp-unpaired',
        'sp-vs-tp-vendor-paired', 'sp-vs-tp-vendor-high-rating', 'sp-vs-tp-vendor-hot-recommendation'
    ];
    
    const classSelector = classesToRemove.map(cls => `.${cls}`).join(', ');
    document.querySelectorAll(classSelector).forEach(el => {
        el.classList.remove(...classesToRemove);
    });
    
    // Clean up state
    state.reset();
    
    const cleanupTime = performance.now() - startTime;
    console.log(`✅ Optimized cleanup completed in ${cleanupTime.toFixed(2)}ms`);
}

// === OPTIMIZED HELPER FUNCTIONS ===

// Cached regex patterns for better performance
const VENDOR_CODE_PATTERNS = {
    snappfood: /-r-([a-zA-Z0-9]+)\/?/,
    tapsifood: /tapsi\.food\/vendor\/([a-zA-Z0-9]+)/
};

function extractVendorCodeFromUrl(url, platform) {
    const pattern = VENDOR_CODE_PATTERNS[platform];
    const match = url.match(pattern);
    return match ? match[1] : null;
}

// Optimized Persian number conversion with caching
const PERSIAN_TO_WESTERN_MAP = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
};

const persianToWesternCache = new Map();

function persianToWestern(str) {
    if (persianToWesternCache.has(str)) {
        return persianToWesternCache.get(str);
    }
    
    let result = str;
    for (const [persian, western] of Object.entries(PERSIAN_TO_WESTERN_MAP)) {
        result = result.replace(new RegExp(persian, 'g'), western);
    }
    
    persianToWesternCache.set(str, result);
    return result;
}

// Optimized rating extraction with early returns
function extractRatingFromElement(element) {
    if (!element) return null;
    
    const textContent = element.textContent;
    if (!textContent.trim()) return null;
    
    const westernText = persianToWestern(textContent);
    
    // Early return patterns (most common first)
    const patterns = [
        /(\d+\.?\d*)\s*(?:\(.*امتیاز\)|★|⭐)/, // Star ratings (most common)
        /(\d+\.?\d*)\s*(?:از\s*\d+|\/\d+)/,    // Fraction ratings
        /امتیاز[:\s]*(\d+\.?\d*)/i              // Persian ratings
    ];
    
    for (const pattern of patterns) {
        const match = westernText.match(pattern);
        if (match) {
            const rating = parseFloat(match[1]);
            if (rating >= 0 && rating <= 10) return rating;
        }
    }
    
    // Fallback to element-specific search (more expensive)
    const ratingElements = element.querySelectorAll('.sc-hKgILt.jsaCNc, [class*="rating"]');
    for (const ratingEl of ratingElements) {
        const ratingText = persianToWestern(ratingEl.textContent.trim());
        const rating = parseFloat(ratingText);
        if (rating && !isNaN(rating) && rating >= 0 && rating <= 10) {
            return rating;
        }
    }
    
    return null;
}

// === OPTIMIZED TEXT BOX CREATION ===

// Professional badge factory matching SnappFood's design
const TEXT_BOX_TEMPLATES = {
    paired: {
        className: 'sp-vs-tp-paired-vendor-badge',
        text: 'ارسال رایگان از تپسی‌فود',
        backgroundColor: '#28a745'
    },
    recommendation: {
        className: 'sp-vs-tp-recommendation-badge',
        text: 'پیشنهاد ویژه',
        backgroundColor: '#ffc107',
        color: '#212529'
    }
};

function createProfessionalBadge(type) {
    const template = TEXT_BOX_TEMPLATES[type];
    const badge = document.createElement('div');
    badge.className = template.className;
    
    if (type === 'paired') {
        // Create professional badge matching SnappFood's style
        badge.innerHTML = `
            <span class="sp-vs-tp-badge-icon">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.5832 9.58325C14.1229 9.58325 13.7498 9.95635 13.7498 10.4166C13.7498 10.8768 14.1229 11.2499 14.5832 11.2499C15.0434 11.2499 15.4165 10.8768 15.4165 10.4166C15.4165 9.95635 15.0434 9.58325 14.5832 9.58325Z"></path>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.55167 17.6256C5.58545 18.4597 3.42815 17.2569 2.99477 15.2849L2.80188 15.3599C2.54548 15.4596 2.25639 15.4264 2.02933 15.2711C1.80228 15.1157 1.6665 14.8584 1.6665 14.5833L1.6665 9.16659C1.6665 6.62223 2.7184 4.66703 4.31719 3.36431C5.89569 2.07812 7.96582 1.45825 9.99984 1.45825C12.0339 1.45825 14.104 2.07812 15.6825 3.36431C17.2813 4.66703 18.3332 6.62223 18.3332 9.16659V12.4999C18.3332 12.8344 18.1332 13.1364 17.8253 13.2671L7.55167 17.6256Z"></path>
                </svg>
            </span>
            <span class="sp-vs-tp-badge-text">${template.text}</span>
        `;
        
        // Apply professional styling matching SnappFood's badges
        Object.assign(badge.style, {
            display: 'flex !important',
            alignItems: 'center !important',
            gap: '6px !important',
            backgroundColor: template.backgroundColor + ' !important',
            color: 'white !important',
            padding: '8px 12px !important',
            marginTop: '8px !important',
            borderRadius: '8px !important',
            fontSize: '12px !important',
            fontWeight: '500 !important',
            fontFamily: "'IRANSansMobile', 'Vazirmatn', sans-serif !important",
            direction: 'rtl !important',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1) !important',
            border: '1px solid rgba(255,255,255,0.2) !important',
            lineHeight: '1.3 !important'
        });
        
    } else if (type === 'recommendation') {
        // Star badge for top-left positioning
        badge.innerHTML = '⭐ ' + template.text;
        
        Object.assign(badge.style, {
            position: 'absolute !important',
            top: '8px !important',
            left: '8px !important',
            backgroundColor: template.backgroundColor + ' !important',
            color: template.color + ' !important',
            padding: '4px 8px !important',
            borderRadius: '12px !important',
            fontSize: '10px !important',
            fontWeight: 'bold !important',
            fontFamily: "'IRANSansMobile', 'Vazirmatn', sans-serif !important",
            direction: 'rtl !important',
            textAlign: 'center !important',
            whiteSpace: 'nowrap !important',
            zIndex: '10 !important',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15) !important',
            border: '1px solid rgba(255,255,255,0.3) !important'
        });
    }
    
    return badge;
}

// Legacy function for backward compatibility
function createTextBox(type, rating = null) {
    return createProfessionalBadge(type);
}

// Create compact star badge for top-left positioning
function createStarBadge() {
    return createProfessionalBadge('recommendation');
}

// === OPTIMIZED MENU PAGE LOGIC ===

// Memoized product processing
const processedProducts = new WeakMap();

// === SEARCH WIDGET ===
function loadFromStorage(key) {
    try {
        return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {
        return [];
    }
}

function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function addToHistory(query) {
    if (!query) return;
    const idx = searchHistory.indexOf(query);
    if (idx !== -1) searchHistory.splice(idx, 1);
    searchHistory.unshift(query);
    if (searchHistory.length > 10) searchHistory.pop();
    saveToStorage(SEARCH_HISTORY_KEY, searchHistory);
}

function toggleFavorite(name) {
    const idx = favoriteProducts.indexOf(name);
    if (idx !== -1) {
        favoriteProducts.splice(idx, 1);
    } else {
        favoriteProducts.push(name);
    }
    saveToStorage(FAVORITES_KEY, favoriteProducts);
}

function isFavorite(name) {
    return favoriteProducts.includes(name);
}

function openCounterpartVendor() {
    if (state.currentPageType.startsWith('snappfood') && state.vendorInfo.tf_code) {
        window.open(`https://tapsi.food/vendor/${state.vendorInfo.tf_code}`, '_blank');
    } else if (state.currentPageType.startsWith('tapsifood') && state.vendorInfo.sf_code) {
        window.open(`https://snappfood.ir/restaurant/menu/${state.vendorInfo.sf_code}`, '_blank');
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('fa-IR').format(price);
}

function renderHistory(list, input) {
    list.innerHTML = '';
    searchHistory.forEach(q => {
        const li = document.createElement('li');
        li.textContent = q;
        li.addEventListener('click', () => {
            input.value = q;
            performSearch(q, list, input);
        });
        list.appendChild(li);
    });
}

function renderResults(results, list) {
    list.innerHTML = '';
    results.forEach(item => {
        const li = document.createElement('li');
        li.className = 'result-item';
        const baseIsSf = state.currentPageType.startsWith('snappfood');
        const baseLabel = baseIsSf ? 'اسنپ‌فود' : 'تپسی‌فود';
        const counterLabel = baseIsSf ? 'تپسی‌فود' : 'اسنپ‌فود';
        const baseClass = baseIsSf ? 'sf' : 'tf';
        const counterClass = baseIsSf ? 'tf' : 'sf';
        li.innerHTML = `
            <p><span class="price-source ${baseClass}">${baseLabel}</span> ${item.baseProduct.name} - ${formatPrice(item.baseProduct.price)} تومان</p>
            <p><span class="price-source ${counterClass}">${counterLabel}</span> ${item.counterpartProduct.name} - ${formatPrice(item.counterpartProduct.price)} تومان</p>
        `;
        const fav = document.createElement('span');
        fav.className = 'favorite-icon';
        fav.textContent = isFavorite(item.baseProduct.name) ? '★' : '☆';
        fav.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(item.baseProduct.name);
            fav.textContent = isFavorite(item.baseProduct.name) ? '★' : '☆';
        });
        li.appendChild(fav);
        li.addEventListener('click', openCounterpartVendor);
        list.appendChild(li);
    });
}

function performSearch(query, list, input) {
    const categorySelect = document.getElementById('sp-vs-tp-category');
    const category = categorySelect ? categorySelect.value : 'all';

    let results = Object.values(state.comparisonData);

    if (query) {
        const lower = query.toLowerCase();
        results = results.filter(item =>
            item.baseProduct.name.toLowerCase().includes(lower) ||
            item.counterpartProduct.name.toLowerCase().includes(lower)
        );
        addToHistory(query);
    } else if (category !== 'favorites') {
        renderHistory(list, input);
    }

    if (category === 'tf-cheaper') {
        results = results.filter(r => r.priceDiff > 0);
    } else if (category === 'sf-cheaper') {
        results = results.filter(r => r.priceDiff < 0);
    } else if (category === 'same-price') {
        results = results.filter(r => r.priceDiff === 0);
    } else if (category === 'favorites') {
        results = results.filter(r => isFavorite(r.baseProduct.name));
    }

    renderResults(results, list);
}

function toggleWidget() {
    const container = document.getElementById('sp-vs-tp-widget-container');
    if (container) {
        container.classList.toggle('show');
    }
}

function createSearchWidget() {
    if (document.getElementById('sp-vs-tp-widget-icon')) return;

    const icon = document.createElement('div');
    icon.id = 'sp-vs-tp-widget-icon';
    icon.textContent = '🔍';
    icon.addEventListener('click', toggleWidget);
    document.body.appendChild(icon);

    const container = document.createElement('div');
    container.id = 'sp-vs-tp-widget-container';
    container.innerHTML = `
        <div id="sp-vs-tp-widget-header">جستجوی محصول</div>
        <div id="sp-vs-tp-widget-body">
            <select id="sp-vs-tp-category">
                <option value="all">همه</option>
                <option value="tf-cheaper">ارزان‌تر در تپسی‌فود</option>
                <option value="sf-cheaper">ارزان‌تر در اسنپ‌فود</option>
                <option value="same-price">قیمت مشابه</option>
                <option value="favorites">محبوب‌ها</option>
            </select>
            <input id="sp-vs-tp-search-input" placeholder="نام محصول..." />
            <ul id="sp-vs-tp-search-results"></ul>
        </div>`;
    document.body.appendChild(container);

    const input = container.querySelector('#sp-vs-tp-search-input');
    const list = container.querySelector('#sp-vs-tp-search-results');
    const categorySelect = container.querySelector('#sp-vs-tp-category');

    input.addEventListener('input', () => performSearch(input.value.trim(), list, input));
    categorySelect.addEventListener('change', () => performSearch(input.value.trim(), list, input));
    renderHistory(list, input);
}

function injectSnappFoodComparisons() {
    const productCards = state.domCache.get('section.ProductCard__Box-sc-1wfx2e0-0');
    console.log(`🔄 Processing ${productCards.length} SnappFood products`);
    
    // Use requestIdleCallback for non-blocking processing
    function processChunk(startIndex) {
        const endIndex = Math.min(startIndex + 10, productCards.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            const productCard = productCards[i];
            if (!processedProducts.has(productCard)) {
                injectSnappFoodComparison(productCard);
                processedProducts.set(productCard, true);
            }
        }
        
        if (endIndex < productCards.length) {
            requestIdleCallback(() => processChunk(endIndex));
        }
    }
    
    requestIdleCallback(() => processChunk(0));
}

function injectSnappFoodComparison(productCard) {
    const titleElement = productCard.querySelector('h2.sc-hKgILt.esHHju');
    if (!titleElement) return;
    
    const cardTitle = titleElement.textContent.trim();
    
    // Optimized product matching
    const matchedProduct = Object.values(state.comparisonData)
        .find(p => p.baseProduct.name.trim() === cardTitle);
    
    if (!matchedProduct) {
        productCard.classList.add('sp-vs-tp-unpaired');
        return;
    }
    
    // Check if already processed
    if (productCard.querySelector('.sp-vs-tp-comparison-text')) return;
    
    const priceElement = productCard.querySelector('span.sc-hKgILt.hxREoh');
    if (!priceElement) return;
    
    // Create comparison element efficiently
    const { text, className } = getComparisonText(matchedProduct);
    
    const comparisonDiv = document.createElement('div');
    comparisonDiv.className = `sp-vs-tp-comparison-text ${className}`;
    comparisonDiv.textContent = text;
    comparisonDiv.style.fontFamily = "'IRANSansMobile', 'Vazirmatn', sans-serif";
    
    // Add click handler
    comparisonDiv.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (state.vendorInfo.tf_code) {
            window.open(`https://tapsi.food/vendor/${state.vendorInfo.tf_code}`, '_blank');
        }
    }, { passive: false });
    
    productCard.classList.add(className);
    priceElement.parentElement.insertBefore(comparisonDiv, priceElement);
}

// Optimized comparison text generation
function getComparisonText(data) {
    const absDiff = new Intl.NumberFormat('fa-IR').format(Math.abs(data.priceDiff));
    
    if (data.priceDiff === 0) {
        return { text: 'سفارش از تپسی‌فود (پیک رایگان)', className: 'sp-vs-tp-same-price' };
    } else if (data.priceDiff > 0) {
        return { 
            text: `${data.percentDiff}% ارزان‌تر در تپسی‌فود (${absDiff} تومان کمتر)`, 
            className: 'sp-vs-tp-cheaper' 
        };
    } else {
        return { 
            text: `${data.percentDiff}% گران‌تر در تپسی‌فود (${absDiff} تومان بیشتر)`, 
            className: 'sp-vs-tp-expensive' 
        };
    }
}

// === OPTIMIZED VENDOR HIGHLIGHTING ===

function processVendorElements() {
    const startTime = performance.now();
    console.log('🔄 Optimized vendor processing starting...');
    
    // Batch query for all restaurant links
    const restaurantLinks = state.domCache.get('a[href*="/restaurant/menu/"]');
    console.log(`📍 Found ${restaurantLinks.length} restaurant menu links`);
    
    if (restaurantLinks.length === 0) {
        console.log('❌ No restaurant links found - page might not be loaded yet');
        return;
    }
    
    let totalHighlighted = 0;
    const processedCodes = new Set();
    
    // Process in chunks for better performance
    const processChunk = (links, startIndex, chunkSize = 20) => {
        const endIndex = Math.min(startIndex + chunkSize, links.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            const link = links[i];
            const vendorCode = extractVendorCodeFromUrl(link.href, 'snappfood');
            
            if (vendorCode && !processedCodes.has(vendorCode)) {
                processedCodes.add(vendorCode);
                
                if (state.pairedVendors.has(vendorCode)) {
                    const container = findBestContainer(link);
                    if (container) {
                        const rating = extractRatingFromElement(container);
                        highlightVendor(container, vendorCode, rating);
                        totalHighlighted++;
                    }
                }
            }
        }
        
        // Continue processing if there are more items
        if (endIndex < links.length) {
            requestIdleCallback(() => processChunk(links, endIndex, chunkSize));
        } else {
            const processTime = performance.now() - startTime;
            console.log(`✅ Optimized processing complete. Highlighted: ${totalHighlighted}, Time: ${processTime.toFixed(2)}ms`);
        }
    };
    
    // Start processing
    requestIdleCallback(() => processChunk(restaurantLinks, 0));
}

// Optimized container finding with caching
const containerCache = new WeakMap();

function findBestContainer(link) {
    if (containerCache.has(link)) {
        return containerCache.get(link);
    }
    
    const candidates = [
        link.closest('[class*="card"], [class*="Card"]'),
        link.closest('article'),
        link.closest('li'),
        link.closest('[class*="vendor"], [class*="restaurant"]'),
        link.parentElement
    ];
    
    const container = candidates.find(candidate => 
        candidate && candidate !== document.body && candidate !== document.documentElement
    ) || link.parentElement;
    
    containerCache.set(link, container);
    return container;
}

// Optimized vendor highlighting with professional badges
function highlightVendor(vendorElement, vendorCode, rating) {
    const uniqueId = `${vendorCode}-${rating || 'no-rating'}`;
    if (!vendorElement || state.processedVendors.has(uniqueId)) return;
    
    const isPaired = state.pairedVendors.has(vendorCode);
    const isVeryHighRating = rating && rating > 4.5; // Only check for 4.5+ (hot recommendations)
    
    console.log(`🔍 Processing vendor ${vendorCode}:`, { isPaired, rating, isVeryHighRating });
    
    // Find the actual card box for border highlighting
    const cardBox = vendorElement.querySelector('.VendorCard__VendorBox-sc-6qaz7-0');
    
    // Handle very high rating (4.5+) - Star badge on top-left + yellow border
    if (isVeryHighRating) {
        // Ensure element can contain absolutely positioned badge
        if (vendorElement.style.position !== 'relative' && vendorElement.style.position !== 'absolute') {
            vendorElement.style.position = 'relative';
        }
        
        // Apply border to the card box
        if (cardBox) {
            cardBox.classList.add('sp-vs-tp-vendor-hot-recommendation');
        }
        
        // Add star badge to top-left
        const starBadge = createStarBadge();
        vendorElement.appendChild(starBadge);
        
        console.log(`⭐ Added star badge for high-rated vendor ${vendorCode} (${rating})`);
        
        // If also paired, add professional badge to image wrapper area
        if (isPaired) {
            const imageWrapper = vendorElement.querySelector('.VendorCard__ImgWrapper-sc-6qaz7-2');
            if (imageWrapper) {
                const pairedBadge = createProfessionalBadge('paired');
                // Position it closer to SnappFood's badge
                pairedBadge.style.position = 'absolute';
                pairedBadge.style.bottom = '70px'; // Move up from 8px to 40px to be closer to SnappFood badge
                pairedBadge.style.left = '8px';
                pairedBadge.style.right = '8px';
                pairedBadge.style.zIndex = '5';
                imageWrapper.style.position = 'relative';
                imageWrapper.appendChild(pairedBadge);
                console.log(`🔗 Added paired badge for high-rated vendor ${vendorCode}`);
            }
        }
    }
    // Handle just paired vendors (no special rating) - Green border + professional badge
    else if (isPaired) {
        // Apply border to the card box
        if (cardBox) {
            cardBox.classList.add('sp-vs-tp-vendor-paired');
        }
        
        // Find the image wrapper to add the professional badge
        const imageWrapper = vendorElement.querySelector('.VendorCard__ImgWrapper-sc-6qaz7-2');
        if (imageWrapper) {
            const pairedBadge = createProfessionalBadge('paired');
            // Position it closer to SnappFood's badge
            pairedBadge.style.position = 'absolute';
            pairedBadge.style.bottom = '70px'; // Move up from 8px to 40px to be closer to SnappFood badge
            pairedBadge.style.left = '8px';
            pairedBadge.style.right = '8px';
            pairedBadge.style.zIndex = '5';
            imageWrapper.style.position = 'relative';
            imageWrapper.appendChild(pairedBadge);
            console.log(`🔗 Added professional paired badge for vendor ${vendorCode}`);
        } else {
            console.log(`❌ No image wrapper found for paired vendor ${vendorCode}`);
        }
    }
    else {
        console.log(`⚪ No highlighting for vendor ${vendorCode} - rating: ${rating || 'N/A'}, paired: ${isPaired}`);
    }
    
    state.processedVendors.add(uniqueId);
}

// === OPTIMIZED OBSERVERS ===

// Debounced mutation observer
const debouncedProcessVendors = debounce(processVendorElements, 500);
const debouncedProcessProducts = debounce(injectSnappFoodComparisons, 300);

function setupOptimizedObserver(targetFunction, targetElements) {
    const observer = new MutationObserver((mutations) => {
        const hasRelevantChanges = mutations.some(mutation => {
            return mutation.type === 'childList' && 
                   mutation.addedNodes.length > 0 &&
                   Array.from(mutation.addedNodes).some(node => 
                       node.nodeType === Node.ELEMENT_NODE &&
                       targetElements.some(selector => node.matches?.(selector) || node.querySelector?.(selector))
                   );
        });
        
        if (hasRelevantChanges) {
            state.domCache.clear(); // Invalidate cache
            targetFunction();
        }
    });
    
    const targetNode = document.getElementById('__next') || document.body;
    observer.observe(targetNode, {
        childList: true,
        subtree: true,
        attributeFilter: [] // Don't watch attributes for better performance
    });
    
    state.activeObservers.push(observer);
    return observer;
}

// === OPTIMIZED INITIALIZATION ===

function initSnappFoodMenu() {
    console.log('🍕 Optimized SnappFood Menu initialization');
    const startTime = performance.now();

    const isSnappFood = window.location.href.includes('snappfood.ir');
    const vendorCode = extractVendorCodeFromUrl(
        window.location.href,
        isSnappFood ? 'snappfood' : 'tapsifood'
    );
    if (!vendorCode) return;

    state.performanceMetrics.apiCalls++;
    const msg = {
        action: "fetchPrices",
        sourcePlatform: isSnappFood ? "snappfood" : "tapsifood"
    };
    if (isSnappFood) msg.sfVendorCode = vendorCode; else msg.tfVendorCode = vendorCode;

    chrome.runtime.sendMessage(msg, (response) => {
        if (chrome.runtime.lastError || !response?.success) return;
        
        state.comparisonData = response.data;
        state.vendorInfo = response.vendorInfo || {};

        createSearchWidget();
        
        // Setup optimized processing
        injectSnappFoodComparisons();
        setupOptimizedObserver(debouncedProcessProducts, ['section[class*="ProductCard"]']);
        
        const initTime = performance.now() - startTime;
        state.performanceMetrics.initTime = initTime;
        console.log(`✅ SnappFood initialization completed in ${initTime.toFixed(2)}ms`);
    });
}

function initVendorHighlighting() {
    console.log('🏠 Optimized vendor highlighting initialization');
    const startTime = performance.now();
    
    state.performanceMetrics.apiCalls++;
    chrome.runtime.sendMessage({ action: "getVendorList" }, (response) => {
        if (chrome.runtime.lastError || !response?.success) return;
        
        if (response.vendors?.length) {
            response.vendors.forEach(vendor => {
                if (vendor.sf_code) state.pairedVendors.add(vendor.sf_code);
            });
        }
        
        console.log(`✅ Loaded ${state.pairedVendors.size} paired vendors`);

        // Setup optimized processing
        processVendorElements();
        setupOptimizedObserver(debouncedProcessVendors, ['a[href*="/restaurant/menu/"]', '[class*="vendor"]']);

        createSearchWidget();
        
        const initTime = performance.now() - startTime;
        console.log(`✅ Vendor highlighting completed in ${initTime.toFixed(2)}ms`);
    });
}

// === OPTIMIZED NAVIGATION ===

const throttledNavigationCheck = throttle(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== state.lastUrl) {
        state.urlChangeCount++;
        console.log(`🔄 URL changed (#${state.urlChangeCount}): ${state.lastUrl} → ${currentUrl}`);
        state.lastUrl = currentUrl;
        
        // Debounced reinitialization
        clearTimeout(window.universalReinitTimer);
        window.universalReinitTimer = setTimeout(reinitialize, 800);
    }
}, 1000);

function startNavigationMonitoring() {
    console.log('🔍 Starting optimized navigation monitoring');
    
    // Use throttled checking for better performance
    state.navigationInterval = setInterval(throttledNavigationCheck, 1000);
}

// === MAIN INITIALIZATION ===

function reinitialize() {
    const newPageType = detectPageType();
    console.log(`🔄 Optimized reinitializing - Page Type: ${newPageType}`);
    
    // Cleanup previous state
    cleanupAll();
    
    // Initialize based on page type with appropriate delays
    const initFunctions = {
        'snappfood-menu': () => setTimeout(initSnappFoodMenu, 300),
        'tapsifood-menu': () => setTimeout(initSnappFoodMenu, 300), // Reuse same logic
        'snappfood-homepage': () => setTimeout(initVendorHighlighting, 500),
        'snappfood-service': () => setTimeout(initVendorHighlighting, 500)
    };
    
    const initFunction = initFunctions[newPageType];
    if (initFunction) {
        initFunction();
    } else {
        console.log('🤷 Unknown page type, skipping initialization');
    }
    
    state.currentPageType = newPageType;
}

function initialize() {
    if (state.isInitialized) return;
    
    console.log('🚀 Optimized Universal Content Script Initializing');
    console.log('📍 URL:', window.location.href);
    console.log('📄 Page Type:', detectPageType());
    
    startNavigationMonitoring();
    reinitialize();
    
    state.isInitialized = true;
    
    // Performance monitoring
    if (window.performance && window.performance.mark) {
        window.performance.mark('extension-initialized');
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    state.cleanup();
});

// Start the optimized script
requestIdleCallback ? requestIdleCallback(initialize) : setTimeout(initialize, 0);