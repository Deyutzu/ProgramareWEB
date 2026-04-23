# Pensiunea Vila Bradu — Aplicație Web de Gestiune

Aplicație Node.js + Express + EJS pentru gestionarea unei pensiuni turistice.
Permite autentificarea personalului și accesul la un dashboard cu rezervări și camere.

## Stack tehnologic

- **Node.js + Express 4.x** — server web
- **EJS** — view engine cu template-uri
- **express-session** — gestionarea sesiunilor utilizatorilor
- **cookie-parser** — citire/scriere cookie-uri proprii
- **bcrypt** — hash parole (bonus +0.5p)
- **dotenv** — variabile de mediu

## Structura proiectului

```
pensiune/
├── app.js                      # Punct de intrare
├── package.json
├── .env.example                # Variabile de mediu (copiați în .env)
├── .gitignore
├── README.md
├── db/
│   ├── index.js                # Export module DB
│   ├── users.js                # Utilizatori in-memory + bcrypt
│   └── rezervari.js            # Rezervări și camere in-memory
├── middleware/
│   ├── logger.js               # Logger: METHOD URL - user: <username>
│   └── requireLogin.js         # Protecție rute private
├── routes/
│   ├── auth.js                 # GET/POST /register, /login, /logout
│   └── pensiune.js             # Rute protejate /pensiune/*
├── views/
│   ├── home.ejs                # Pagină publică
│   ├── login.ejs               # Formular autentificare
│   ├── register.ejs            # Formular înregistrare
│   └── pensiune/
│       ├── dashboard.ejs       # Dashboard principal (protejat)
│       ├── camere.ejs          # Lista camere (a 2-a pagină protejată)
│       ├── rezervare-detaliu.ejs  # Detaliu rezervare /:id
│       └── 404.ejs
└── public/
    └── css/style.css
```

## Rute

| Metodă | Path | Rol |
|--------|------|-----|
| GET | `/` | Pagină publică cu link-uri Login/Register |
| GET | `/register` | Formular înregistrare |
| POST | `/register` | Creare cont, pornire sesiune, redirect `/pensiune` |
| GET | `/login` | Formular autentificare |
| POST | `/login` | Validare credențiale, pornire sesiune, redirect `/pensiune` |
| GET | `/logout` | Distrugere sesiune, redirect `/` |
| GET | `/pensiune` | Dashboard protejat (rezervări + statistici) |
| GET | `/pensiune/camere` | Lista camere cu status (a 2-a pagină protejată) |
| GET | `/pensiune/rezervari/:id` | Detaliu rezervare specifică |
| POST | `/pensiune/tema` | Schimbare temă (cookie) |

## Middleware proprii

1. **`middleware/logger.js`** — afișează în consolă `[HH:MM:SS] METHOD /url - user: <username|anonim>`
2. **`middleware/requireLogin.js`** — redirecționează la `/login` dacă sesiunea nu există

## Cookie-uri

- **`connect.sid`** — cookie de sesiune (express-session)
- **`tema`** — preferință temă `light`/`dark`, 30 zile, citit în toate view-urile EJS cu `<% if (tema === 'dark') { %>`
- **`ultimaRezervare`** — ID-ul ultimei rezervări vizualizate, 24h
- **`ultimaZona`** — ultima secțiune vizitată (`camere`), 7 zile

## Instalare și rulare

```bash
# 1. Clonați/copiați proiectul
cd pensiune

# 2. Instalați dependențele
npm install

# 3. Creați fișierul .env
cp .env.example .env
# editați .env după nevoie

# 4. Porniți aplicația
npm start
# sau pentru dezvoltare cu auto-reload:
npm run dev
```

Aplicația va fi disponibilă la: **http://localhost:3000**

## Variabile de mediu (.env)

```
PORT=3000
SESSION_SECRET=pensiune_secret_super_sigur_2024
```

> **Important:** Nu comiteți fișierul `.env` în repository! Acesta este exclus prin `.gitignore`.

## Cerințe îndeplinite

- ✅ Înregistrare și autentificare cu POST form
- ✅ Sesiuni cu `express-session` (2h durata)
- ✅ Zonă protejată `/pensiune/*` cu `requireLogin`
- ✅ Middleware de logging propriu
- ✅ Cookie propriu `tema` (light/dark) + folosit în UI cu `<% if %>`
- ✅ Lista 3+ elemente cu `forEach` în EJS
- ✅ `req.session.views` — număr vizite sesiune
- ✅ Salut personalizat cu `user.nume` din sesiune
- ✅ A doua pagină protejată: `/pensiune/camere` + detaliu `/pensiune/rezervari/:id`
- ✅ bcrypt pentru hash parole (bonus 0.5p)
- ✅ dotenv pentru PORT și SESSION_SECRET
- ✅ .gitignore corect
