const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Afișare formular Register
router.get('/register', (req, res) => res.render('register', { error: null }));

// 3.1 Procesare Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        await User.create({ username, email, password });
        res.redirect('/login');
    } catch (error) {
        // Verificare cod eroare duplicat MongoDB (11000)
        if (error.code === 11000) {
            return res.render('register', { error: 'Email-ul sau Username-ul există deja!' });
        }
        // Erori de validare Mongoose
        res.render('register', { error: error.message });
    }
});

// Afișare formular Login
router.get('/login', (req, res) => res.render('login', { error: null }));

// 3.2 Procesare Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { error: 'Email sau parolă incorecte.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { error: 'Email sau parolă incorecte.' });
        }

        // Salvare date în sesiune
        req.session.user = {
            _id: user._id,
            username: user.username,
            role: user.role
        };
        res.redirect('/devices');
    } catch (error) {
        res.render('login', { error: 'A apărut o eroare.' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;