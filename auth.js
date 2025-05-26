const express = require('express');
const router = express.Router();
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO Users (username, email, password_hash) VALUES (?, ?, ?)', [username, email, hashed]);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ user_id: user.user_id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, username: user.username });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
