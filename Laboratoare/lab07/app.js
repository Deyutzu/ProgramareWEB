const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

// Importăm rutele
const authRoutes = require('./routes/auth');
const deviceRoutes = require('./routes/devices');

const app = express();

// 1. Conectarea la Baza de Date
// Folosim direct string-ul care ți-a funcționat la seed.js ca să evităm problemele cu .env
const MONGODB_URI = "mongodb+srv://laborator_pw:unjTOlXweVLExEYa@cluster0.fkmghly.mongodb.net/lab07?appName=Cluster0";
mongoose.connect(MONGODB_URI)
    .then(() => console.log(' App: Conectat la MongoDB!'))
    .catch(err => console.error('Eroare la conectare:', err));

// 2. Setări Express și View Engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware pentru procesarea datelor din formulare
app.use(express.urlencoded({ extended: true }));

// 3. Configurare Sesiune (pentru Login/Register)
app.use(session({
    secret: 'cheie_secreta_laborator',
    resave: false,
    saveUninitialized: false
}));

// Middleware global: trimitem datele utilizatorului logat către toate view-urile EJS
app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    next();
});

// 4. Înregistrare Rute
app.use('/', authRoutes);
app.use('/', deviceRoutes);

// Ruta principală redirecționează către lista de dispozitive
app.get('/', (req, res) => {
    res.redirect('/devices');
});

// 5. Tratare eroare 404 (Pagina nu a fost găsită)
app.use((req, res) => {
    res.status(404).render('404', { message: 'Pagina pe care o cauți nu există.' });
});

// Pornire server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(` Serverul rulează: accesează http://localhost:${PORT}`);
});