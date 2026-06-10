const express = require('express');
const router = express.Router();
const { users } = require('../db');

// GET /register
router.get('/register', (req, res) => {
  if (req.session.user) {
    const target = req.session.user.role === 'admin' ? '/pensiune' : '/client';
    return res.redirect(target);
  }
  res.render('register', { error: null, formData: {} });
});

// POST /register
router.post('/register', async (req, res) => {
  const { username, password, nume } = req.body;
  const userRole = 'client';

  // Validari simple
  if (!username || !password || !nume) {
    return res.render('register', {
      error: 'Toate câmpurile sunt obligatorii.',
      formData: { username, nume }
    });
  }
  if (password.length < 4) {
    return res.render('register', {
      error: 'Parola trebuie să aibă cel puțin 4 caractere.',
      formData: { username, nume }
    });
  }

  const existent = await users.findByUsername(username);
  if (existent) {
    return res.render('register', {
      error: 'Username-ul este deja folosit.',
      formData: { username, nume }
    });
  }

  const user = await users.create(username, password, nume, userRole);

  // Pornire sesiune
  req.session.user = { id: user.id, username: user.username, nume: user.nume, role: user.role };
  req.session.views = 0;

  // Cookie preferinta tema (default: light)
  res.cookie('tema', 'light', { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: false });

  const target = user.role === 'admin' ? '/pensiune' : '/client';
  res.redirect(target);
});

// GET /login
router.get('/login', (req, res) => {
  if (req.session.user) {
    const target = req.session.user.role === 'admin' ? '/pensiune' : '/client';
    return res.redirect(target);
  }
  res.render('login', { error: null, formData: {} });
});

// POST /login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render('login', {
      error: 'Completați username-ul și parola.',
      formData: { username }
    });
  }

  const user = await users.findByUsername(username);
  if (!user) {
    return res.render('login', {
      error: 'Username sau parolă incorecte.',
      formData: { username }
    });
  }

  const ok = await users.verifyPassword(password, user.passwordHash);
  if (!ok) {
    return res.render('login', {
      error: 'Username sau parolă incorecte.',
      formData: { username }
    });
  }

  // Sesiune
  req.session.user = { id: user.id, username: user.username, nume: user.nume, role: user.role || 'client' };
  req.session.views = 0;

  // Setăm cookie de tema dacă nu există deja
  if (!req.cookies.tema) {
    res.cookie('tema', 'light', { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: false });
  }

  const target = user.role === 'admin' ? '/pensiune' : '/client';
  const redirectTo = req.session.redirectTo || target;
  delete req.session.redirectTo;
  res.redirect(redirectTo);
});

// GET /logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

module.exports = router;
