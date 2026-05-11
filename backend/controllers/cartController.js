const pool = require('../db');

const getCart = async (req, res) => {
    const userId = req.user.id;
    try {
        const [cartItems] = await pool.query(
            `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price, p.image_url
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.user_id = ?`, [userId]
        );
        res.json(cartItems);
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({ error: 'Failed to fetch cart items' });
    }
};

const addToCart = async (req, res) => {
    const userId = req.user.id;
    const { productId, quantity } = req.body;
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
                'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [userId, productId, quantity]
            );
        }
        res.status(200).json({ message: 'Item added to cart' });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
};

const removeFromCart = async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;
    try {
        await pool.query(
            'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );
        res.status(200).json({ message: 'Item removed from cart' });
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ error: 'Failed to remove item from cart' });
    }
};

module.exports = {
    getCart,
    addToCart,
    removeFromCart
};