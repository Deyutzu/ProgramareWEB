const express = require('express');
const router = express.Router();
const requireLogin = require('../middleware/requireLogin');
const db = require('../db/rezervari');

// Toate rutele din acest router sunt protejate
router.use(requireLogin);

// GET /pensiune — dashboard principal
router.get('/', (req, res) => {
  // Incrementam numarul de vizite din sesiune
  req.session.views = (req.session.views || 0) + 1;

  const rezervari = db.getAll();
  const tema = req.cookies.tema || 'light';

  // Statistici rapide pentru dashboard
  const stats = {
    total: rezervari.length,
    confirmate: rezervari.filter(r => r.status === 'confirmata').length,
    inAsteptare: rezervari.filter(r => r.status === 'in_asteptare').length,
    finalizate: rezervari.filter(r => r.status === 'finalizata').length,
    venit: db.getTotalVenit()
  };

  res.render('pensiune/dashboard', {
    user: req.session.user,
    views: req.session.views,
    rezervari,
    stats,
    tema
  });
});

// GET /pensiune/camere — lista camere cu status
router.get('/camere', (req, res) => {
  const camere = db.getCamere();
  const tema = req.cookies.tema || 'light';

  // Setam cookie cu ultima pagina vizitata din domeniu
  res.cookie('ultimaZona', 'camere', { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: false });

  res.render('pensiune/camere', {
    user: req.session.user,
    camere,
    tema
  });
});

// GET /pensiune/rezervari/:id — detaliu rezervare
router.get('/rezervari/:id', (req, res) => {
  const rezervare = db.getById(req.params.id);
  const tema = req.cookies.tema || 'light';

  if (!rezervare) {
    return res.status(404).render('pensiune/404', { user: req.session.user, tema });
  }

  // Salvam ultima rezervare vizualizata in cookie
  res.cookie('ultimaRezervare', rezervare.id, { maxAge: 24 * 60 * 60 * 1000, httpOnly: false });

  res.render('pensiune/rezervare-detaliu', {
    user: req.session.user,
    rezervare,
    totalPret: rezervare.nrNopti * rezervare.pretNoapte,
    tema
  });
});

// POST /pensiune/tema — schimba tema (light/dark)
router.post('/tema', (req, res) => {
  const { tema } = req.body;
  const temaValida = ['light', 'dark'].includes(tema) ? tema : 'light';
  res.cookie('tema', temaValida, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: false });
  res.redirect(req.headers.referer || '/pensiune');
});

module.exports = router;
