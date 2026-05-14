const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Device = require('../models/Device');

// Middleware de protecție: verifică dacă userul este logat
const isAuthenticated = (req, res, next) => {
    if (req.session.user) return next();
    res.redirect('/login');
};

// 2.2 READ - Listare + Căutare + Sortare + Populate (Ex 4.2)
router.get('/devices', async (req, res) => {
    try {
        let query = {};
        
        // Filtru de căutare după nume
        if (req.query.search) {
            query.name = { $regex: req.query.search, $options: 'i' }; // case-insensitive
        }

        // Configurare sortare (ex: ?sort=price sau ?sort=-price)
        let sortOption = { createdAt: -1 }; // implicit descrescător după dată
        if (req.query.sort) {
            sortOption = {};
            sortOption[req.query.sort] = 1; 
        }

        const devices = await Device.find(query)
            .sort(sortOption)
            .populate('createdBy', 'username email'); // Exercițiul 4.2

        res.render('devices/index', { devices, searchQuery: req.query.search || '' });
    } catch (error) {
        res.status(500).send('Eroare la preluarea datelor');
    }
});

// 2.1 CREATE - Afișare Formular
router.get('/devices/new', isAuthenticated, (req, res) => {
    res.render('devices/new', { error: null });
});

// 2.1 CREATE - Salvare în MongoDB + Asociere user (Ex 3.3)
router.post('/devices', isAuthenticated, async (req, res) => {
    try {
        const { name, price, category, isOnline } = req.body;
        
        const newDevice = new Device({
            name,
            price,
            category,
            isOnline: isOnline === 'true',
            createdBy: req.session.user._id // Exercițiul 3.3 - preluare automată din sesiune
        });

        await newDevice.save();
        res.redirect('/devices');
    } catch (error) {
        // Tratarea erorilor de validare Mongoose
        let errorMessage = 'Eroare la salvare.';
        if (error.name === 'ValidationError') {
            errorMessage = Object.values(error.errors).map(val => val.message).join(', ');
        }
        res.render('devices/new', { error: errorMessage });
    }
});

// 2.2 READ - Detalii entitate
router.get('/devices/:id', async (req, res) => {
    const { id } = req.params;

    // Tratare eroare pentru ID invalid
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).render('404', { message: 'ID-ul nu este valid.' });
    }

    try {
        const device = await Device.findById(id).populate('createdBy', 'username email'); // Ex 4.2
        if (!device) {
            return res.status(404).render('404', { message: 'Dispozitivul nu a fost găsit.' });
        }
        res.render('devices/show', { device });
    } catch (error) {
        res.status(500).send('Eroare server');
    }
});

// 2.3 UPDATE - Afișare Formular pre-populat
router.get('/devices/:id/edit', isAuthenticated, async (req, res) => {
    try {
        const device = await Device.findById(req.params.id);
        if (!device) return res.status(404).send('Nu a fost găsit');
        
        // Opțional: verificare dacă userul curent este cel care a creat entitatea sau e admin
        res.render('devices/edit', { device, error: null });
    } catch (error) {
        res.status(500).send('Eroare');
    }
});

// 2.3 UPDATE - Procesare Actualizare
router.post('/devices/:id/edit', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    try {
        const { name, price, category, isOnline } = req.body;
        
        // Actualizare cu runValidators activat
        await Device.findByIdAndUpdate(id, {
            name,
            price,
            category,
            isOnline: isOnline === 'true'
        }, { runValidators: true });

        res.redirect(`/devices/${id}`);
    } catch (error) {
        let errorMessage = 'Eroare la editare.';
        if (error.name === 'ValidationError') {
            errorMessage = Object.values(error.errors).map(val => val.message).join(', ');
        }
        // Reîncărcăm datele vechi pentru a randa formularul
        const device = await Device.findById(id);
        res.render('devices/edit', { device, error: errorMessage });
    }
});

// 2.4 DELETE - Ștergere entitate
router.post('/devices/:id/delete', isAuthenticated, async (req, res) => {
    try {
        await Device.findByIdAndDelete(req.params.id);
        res.redirect('/devices');
    } catch (error) {
        res.status(500).send('Eroare la ștergere');
    }
});

module.exports = router;