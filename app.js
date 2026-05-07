// Global variables
let allProducts = [];
let filteredProducts = [];
let currentFilters = {
    category: 'all',
    priceRange: 'all',
    sortBy: 'featured'
};

// Load data from data.json
async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Failed to load data.json');
        }
        const data = await response.json();
        console.log('Data loaded successfully:', data);
        return data;
    } catch (error) {
        console.error('Error loading data:', error);
        return [];
    }
}

// Create product card HTML
function createProductCard(product) {
    const discount = product.compare_price ?
        Math.round(((product.compare_price - product.price) / product.compare_price) * 100) : 0;

    return `
        <article class="product-card scroll-reveal" data-category="${product.category_slug}" data-price="${product.price}">
            <div class="product-image">
                <img src="${product.image_url}" alt="${product.name}" loading="lazy">
                ${product.featured ? '<span class="product-badge featured">Featured</span>' : ''}
                ${discount > 0 ? `<span class="product-badge sale">${discount}% OFF</span>` : ''}
                <div class="product-actions">
                    <button class="product-action-btn wishlist-btn" data-product-id="${product.id}" aria-label="Add to wishlist">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                    </button>
                    <button class="product-action-btn cart-btn" data-product-id="${product.id}" aria-label="Add to cart">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category_name}</div>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-rating">
                    <div class="stars">
                        ${generateStars(product.rating)}
                    </div>
                    <span class="rating-count">(${product.review_count})</span>
                </div>
                <div class="product-price">
                    <span class="current-price">$${product.price.toFixed(2)}</span>
                    ${product.compare_price ? `<span class="compare-price">$${product.compare_price.toFixed(2)}</span>` : ''}
                </div>
                <p class="product-description">${product.description}</p>
                <div class="product-tags">
                    ${product.tags.map(tag => `<span class="product-tag">${tag}</span>`).join('')}
                </div>
            </div>
        </article>
    `;
}

// Generate star rating HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHTML = '';

    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    }

    // Half star
    if (hasHalfStar) {
        starsHTML += '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77V2z"/><path d="M12 2v15.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke="currentColor" stroke-width="1"/></svg>';
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    }

    return starsHTML;
}

// Filter products based on current filters
function filterProducts() {
    filteredProducts = allProducts.filter(product => {
        // Category filter
        if (currentFilters.category !== 'all' && product.category_slug !== currentFilters.category) {
            return false;
        }

        // Price range filter
        if (currentFilters.priceRange !== 'all') {
            const [min, max] = currentFilters.priceRange.split('-').map(p => p === '+' ? Infinity : parseFloat(p));
            if (product.price < min || (max !== Infinity && product.price > max)) {
                return false;
            }
        }

        return true;
    });

    // Sort products
    sortProducts();
}

// Sort products based on current sort option
function sortProducts() {
    filteredProducts.sort((a, b) => {
        switch (currentFilters.sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'rating':
                return b.rating - a.rating;
            case 'newest':
                return b.id - a.id; // Assuming higher ID means newer
            case 'featured':
            default:
                return b.featured - a.featured || b.rating - a.rating;
        }
    });
}

// Render products to the grid
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const productCount = document.getElementById('productCount');

    if (!productsGrid) return;

    productsGrid.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
    productCount.textContent = filteredProducts.length;

    // Re-initialize scroll reveal for new elements
    if (typeof initScrollReveal === 'function') {
        initScrollReveal();
    }
}

// Initialize filters
function initFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    const sortFilter = document.getElementById('sortFilter');

    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            currentFilters.category = e.target.value;
            filterProducts();
            renderProducts();
        });
    }

    if (priceFilter) {
        priceFilter.addEventListener('change', (e) => {
            currentFilters.priceRange = e.target.value;
            filterProducts();
            renderProducts();
        });
    }

    if (sortFilter) {
        sortFilter.addEventListener('change', (e) => {
            currentFilters.sortBy = e.target.value;
            filterProducts();
            renderProducts();
        });
    }
}

// Initialize product interactions
function initProductInteractions() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.wishlist-btn')) {
            const productId = e.target.closest('.wishlist-btn').dataset.productId;
            // Add to wishlist functionality
            console.log('Add to wishlist:', productId);
            e.target.closest('.wishlist-btn').classList.toggle('active');
        }

        if (e.target.closest('.product-action-btn.cart-btn')) {
            const productId = e.target.closest('.product-action-btn').dataset.productId;
            const product = allProducts.find(p => p.id == productId);
            if (product && typeof addToCart === 'function') {
                addToCart(product);
            }
        }
    });
}

// Main initialization for main.html
async function initMainPage() {
    // Check if we're on main.html
    if (!document.getElementById('productsGrid')) return;

    allProducts = await loadData();
    filteredProducts = [...allProducts];

    initFilters();
    initProductInteractions();
    renderProducts();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize loader
    if (typeof initLoader === 'function') {
        initLoader();
    }

    // Initialize nav
    if (typeof initNav === 'function') {
        initNav();
    }

    // Initialize scroll to top
    if (typeof initScrollToTop === 'function') {
        initScrollToTop();
    }

    // Initialize main page functionality
    await initMainPage();
});

// Export functions for use in other scripts
window.loadData = loadData;
window.createProductCard = createProductCard;