const pool = require('../db');

const getAllProducts = async (req, res) => {
    try {

        const {
            category, search, minPrice, maxPrice, sort = 'created_at',
            order = 'DESC', page = 1, limit = 12, featured
        } = req.query;
        let where = ['1=1'];
        let params = [];

        if (category) { where.push('c.slug = ?'); params.push(category); }
        if (search) { where.push('(p.name LIKE ? OR p.description LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
        if (minPrice) { where.push('p.price > ?'); params.push(parseFloat(minPrice)); }
        if (maxPrice) { where.push('p.price <= ?'); params.push(parseFloat(maxPrice)); }
        if (featured == 'true') { where.push('p.featured = TRUE'); }

        const validSorts = { price: 'p.price', name: 'p.name', rating: 'p.rating', created_at: 'p.created_at', review_count: 'p.review_count' };
        const sortCol = validSorts[sort] || 'p.created_at';
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const [rows] = await pool.query(`
            SELECT P.*, c.name as category_name, c.slug as category_slug
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE ${where.join(' AND ')}
            ORDER BY ${sortCol} ${sortOrder}
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), offset]);
    } catch (err) {
        res.status(500).json({ err: err.message });
        console.log(err);
    }
}

module.exports = {
    getAllProducts
}