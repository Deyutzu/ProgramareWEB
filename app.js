require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const logger = require('./middleware/logger');
const authRoutes = require('./routes/auth');
const pensiuneRoutes = require('./routes/pensiune');

const app = express();
const PORT = process.env.PORT || 3000;

// ── View engine ────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Middleware globale ─────────────────────────────────────────
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Sesiune
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 2 * 60 * 60 * 1000 } // 2 ore
}));

// Logger propriu (dupa session, ca sa avem req.session disponibil)
app.use(logger);

// ── Rute ──────────────────────────────────────────────────────
// Pagina publica home
app.get('/', (req, res) => {
  const tema = req.cookies.tema || 'light';
  res.render('home', { user: req.session.user || null, tema });
});

app.use('/', authRoutes);
app.use('/pensiune', pensiuneRoutes);

// 404 fallback
app.use((req, res) => {
  const tema = req.cookies.tema || 'light';
  res.status(404).render('pensiune/404', { user: req.session.user || null, tema });
});

// ── Start ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Pensiune App pornită pe http://localhost:${PORT}`);
});
