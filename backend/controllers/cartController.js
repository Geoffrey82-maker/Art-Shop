const pool = require('../db');

function getCartKey(req) {
    if(req.user) return { field: 'user_id', value: req.user_id };
    const sessionId = req.headers['x-session-id'] || req.query.session_id;
    return { field: 'session_id', value: sessionId };
}

// Get Cart
const getCart = async (req, res) => {
    const { field, value } = getCartKey(req);

    if(!value) return res.json({ items: [], total: 0 });

    try {
        const [items] = await pool.query(`
            SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.image_url, p.stock, p.slug
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.${field} = ?
        `, [value]);
        const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        res.json({ items, total: parseFloat(total.toFixed(2)) });

    }catch(err) {
        res.status(500).json({ message: err.message });
        console.log(err);
    }
};

const addToCart = async (req, res) => {
    const { product_id, quantity = 1} = req.body;
    const { field, value } = getCartKey(req);

    if(!value || !product_id) return res.status(400).json({ error : "Missing required fields" });
    try {
        // Check if the product is already in the cart
        const [existingItem] = await pool.query(
            'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );
        if (existingItem.length > 0) {
            // Update quantity if item already exists
            const newQuantity = existingItem[0].quantity + quantity;
            await pool.query(
                'UPDATE cart_items SET quantity = ? WHERE id = ?',
                [newQuantity, existingItem[0].id]
            );
        } else {
            // Add new item to cart
            await pool.query(
                `INSERT INTO cart_items (${field}, product_id, quantity) VALUES (?, ?, ?)`,
                [value, product_id, quantity]
            );
        }
        res.status(200).json({ message: 'Item added to cart' });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
};

const updateCartItem = async (req, res) => {
    const { quantiy } = req.body;
    const { field, value } = getCartKey();

    if (!productId || typeof quantity !== 'number') {
        return res.status(400).json({ error: 'Invalid payload' });
    }

    try {
        await pool.query(
            'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
            [quantity, userId, productId]
        );
        res.status(200).json({ message: 'Cart item updated' });
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ error: 'Failed to update cart item' });
    }
};

const removeFromCart = async (req, res) => {
    const {field, value } = getCartKey(req);
    if(!value) return res.json({ success : true });
    try {
        if(req.params.itemId) {
            await pool.query(
                `DELETE FROM cart_items WHERE id = ? AND ${field} = ?`,
                [req.params.itemId, value]
            );
        }else {
            await pool.query(`DELETE FROM cart_items WHERE ${field} = ?`, [value]
            );
        } 
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ error: 'Failed to remove item from cart' });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart
};