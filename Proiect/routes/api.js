const express = require('express');
const router = express.Router();
const db = require('../db/rezervari');

function requireApiLogin(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ error: 'Neautorizat. Vă rugăm să vă autentificați.' });
}

// Toate rutele din API sunt protejate
router.use(requireApiLogin);

// GET /api/rezervari
router.get('/rezervari', (req, res) => {
  res.json(db.getAll());
});

// POST /api/rezervari
router.post('/rezervari', (req, res) => {
  const { numeOaspete, camera, checkIn, checkOut, nrNopti, telefon, observatii } = req.body;

  if (!numeOaspete || !camera || !checkIn || !checkOut) {
    return res.status(400).json({ error: 'Numele oaspetelui, camera, check-in și check-out sunt obligatorii.' });
  }

  const camereList = db.getCamere();
  const cameraValida = camereList.find(c => c.numar === camera);
  if (!cameraValida) {
    return res.status(400).json({ error: `Camera ${camera} nu este validă.` });
  }

  const tipCamera = cameraValida.tip;
  const computedPretNoapte = cameraValida.pretNoapte;

  const nouaRezervare = db.create({
    numeOaspete,
    camera,
    tipCamera,
    checkIn,
    checkOut,
    nrNopti: parseInt(nrNopti, 10) || 1,
    pretNoapte: computedPretNoapte,
    status: 'in_asteptare',
    telefon,
    observatii
  });

  // WebSocket broadcast
  const broadcast = req.app.get('wsBroadcast');
  if (broadcast) {
    broadcast({
      type: 'booking_created',
      data: nouaRezervare,
      user: req.session.user.nume,
      stats: {
        total: db.getAll().length,
        confirmate: db.getAll().filter(r => r.status === 'confirmata').length,
        inAsteptare: db.getAll().filter(r => r.status === 'in_asteptare').length,
        venit: db.getTotalVenit()
      }
    });
  }

  res.status(201).json(nouaRezervare);
});

// PATCH /api/rezervari/:id/status
router.patch('/rezervari/:id/status', (req, res) => {
  const { status } = req.body;
  const statusuriValide = ['in_asteptare', 'confirmata', 'finalizata'];

  if (!statusuriValide.includes(status)) {
    return res.status(400).json({ error: 'Status invalid.' });
  }

  const updated = db.updateStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Rezervarea nu a fost găsită.' });
  }

  // WebSocket broadcast
  const broadcast = req.app.get('wsBroadcast');
  if (broadcast) {
    broadcast({
      type: 'booking_updated',
      data: updated,
      user: req.session.user.nume,
      stats: {
        total: db.getAll().length,
        confirmate: db.getAll().filter(r => r.status === 'confirmata').length,
        inAsteptare: db.getAll().filter(r => r.status === 'in_asteptare').length,
        venit: db.getTotalVenit()
      }
    });
  }

  res.json(updated);
});

module.exports = router;
