const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const handleRegister = async(req, res) => {
    const {username, email, password} = req.body;
    
    if(!username || !email || !password) res.status(400).json({ message : "All fields are required"});

    try {
        const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if(existingUser.length > 0) return res.status(409).json({ message : "Email already exists" });

        const hashedPwd = await bcrypt.hash(password, 10);

        const [result] = await pool.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPwd]);

        const refreshToken = jwt.sign({ id: result.insertId, username, email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        const accessToken = jwt.sign({ id: result.insertId, username, email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        res.status(201).json({ refreshToken, accessToken, user: {id: result.insertId, username, email} });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { handleRegister };