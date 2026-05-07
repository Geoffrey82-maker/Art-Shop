// Cart state management
let cart = {
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0
};

// Tax rate (8%)
const TAX_RATE = 0.08;

// Load product data
let productsData = [];

async function loadProductsData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Failed to load data.json');
        }
        productsData = await response.json();
        console.log('Products data loaded:', productsData.length, 'products');
    } catch (error) {
        console.error('Error loading products data:', error);
        productsData = [];
    }
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadProductsData();

    // Load cart from localStorage if available
    loadCartFromStorage();

    // Update cart UI
    updateCartUI();

    // Initialize cart button event listener
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', toggleCart);
    }
});

// Toggle cart drawer
function toggleCart() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');

    if (drawer && overlay) {
        drawer.classList.toggle('open');
        overlay.classList.toggle('open');

        // Prevent body scroll when cart is open
        document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
    }
}

// Add item to cart
function addToCart(product, quantity = 1) {
    if (!product) return;

    const existingItem = cart.items.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.items.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            quantity: quantity
        });
    }

    updateCartCalculations();
    updateCartUI();
    saveCartToStorage();

    // Show cart drawer briefly to indicate item was added
    const drawer = document.getElementById('cartDrawer');
    if (drawer && !drawer.classList.contains('open')) {
        toggleCart();
        setTimeout(() => toggleCart(), 2000);
    }
}

// Remove item from cart
function removeFromCart(productId) {
    cart.items = cart.items.filter(item => item.id !== productId);
    updateCartCalculations();
    updateCartUI();
    saveCartToStorage();
}

// Update item quantity
function updateItemQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    const item = cart.items.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        updateCartCalculations();
        updateCartUI();
        saveCartToStorage();
    }
}

// Update cart calculations
function updateCartCalculations() {
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.tax = cart.subtotal * TAX_RATE;
    cart.total = cart.subtotal + cart.tax;
}

// Update cart UI
function updateCartUI() {
    updateCartCount();
    renderCartItems();
    updateCartTotals();
}

// Update cart count in header
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'inline-flex' : 'none';
    }
}

// Render cart items
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    if (!cartItemsContainer) return;

    if (cart.items.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                <p>Your cart is empty</p>
            </div>
        `;
        return;
    }

    cartItemsContainer.innerHTML = cart.items.map(item => `
        <div class="cart-item" data-product-id="${item.id}">
            <img src="${item.image_url}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="updateItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span class="qty-val">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})">×</button>
        </div>
    `).join('');
}

// Update cart totals
function updateCartTotals() {
    const subtotalEl = document.getElementById('cartSubtotal');
    const taxEl = document.getElementById('cartTax');
    const totalEl = document.getElementById('cartTotal');

    if (subtotalEl) subtotalEl.textContent = `$${cart.subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${cart.tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${cart.total.toFixed(2)}`;
}

// Save cart to localStorage
function saveCartToStorage() {
    try {
        localStorage.setItem('artmo_cart', JSON.stringify(cart.items));
    } catch (error) {
        console.error('Error saving cart to storage:', error);
    }
}

// Load cart from localStorage
function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('artmo_cart');
        if (savedCart) {
            cart.items = JSON.parse(savedCart);
            updateCartCalculations();
        }
    } catch (error) {
        console.error('Error loading cart from storage:', error);
        cart.items = [];
    }
}

// Checkout function
function checkout() {
    if (cart.items.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Close cart drawer
    toggleCart();

    // Show checkout message (you can replace this with actual checkout logic)
    alert(`Checkout functionality would be implemented here.\n\nTotal: $${cart.total.toFixed(2)}\nItems: ${cart.items.length}`);

    // For now, just clear the cart after "checkout"
    // cart.items = [];
    // updateCartCalculations();
    // updateCartUI();
    // saveCartToStorage();
}

// Clear cart
function clearCart() {
    cart.items = [];
    updateCartCalculations();
    updateCartUI();
    saveCartToStorage();
}

// Get cart item count
function getCartItemCount() {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

// Get cart total
function getCartTotal() {
    return cart.total;
}

// Export functions for global use
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateItemQuantity = updateItemQuantity;
window.toggleCart = toggleCart;
window.checkout = checkout;
window.clearCart = clearCart;
window.getCartItemCount = getCartItemCount;
window.getCartTotal = getCartTotal;