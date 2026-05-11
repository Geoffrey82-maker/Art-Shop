const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const handleAuth = async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password) return res.status(400).json({ message: "All fields are required" });

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: "Invalid credentials" });

        const refreshToken = jwt.sign({ id: user.id, username: user.username, email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        const accessToken = jwt.sign({ id: user.id, username: user.username, email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.json({ accessToken, user: { id: user.id, username: user.username, email } });
    } catch (err) {
        console.error('Error during authentication:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { handleAuth };