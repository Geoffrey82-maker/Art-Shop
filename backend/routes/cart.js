const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController');
const { authenticateToken, optionalAuthenticateToken, requireAdmin } = require('../middleware/verify');

router.route('/')
    .get(cartController.getCart)
    .post(cartController.addToCart)
    .put(cartController.updateCartItem)
    .delete(cartController.removeFromCart);

module.exports = router;