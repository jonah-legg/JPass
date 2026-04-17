const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/signup', async (req, res) => {
    res.json({ message: 'Signup endpoint' });
});

router.get('/login', async (req, res) => {
    res.json({ message: 'Login endpoint' });
});

module.exports = router;