const express = require('express');
const router = express.Router();
const requireClient = require('../middleware/requireClient');
const db = require('../db/rezervari');

// Toate rutele pentru clienti sunt protejate
router.use(requireClient);

// GET /client
router.get('/', (req, res) => {
  req.session.views = (req.session.views || 0) + 1;
  const tema = req.cookies.tema || 'light';
  
  // Filtram rezervarile sa apara doar cele ale clientului autentificat
  const rezervari = db.getAll().filter(r => 
    r.numeOaspete.toLowerCase() === req.session.user.nume.toLowerCase()
  );

  res.render('client/dashboard', {
    user: req.session.user,
    views: req.session.views,
    rezervari,
    tema
  });
});

module.exports = router;
