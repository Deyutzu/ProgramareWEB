require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const logger = require('./middleware/logger');
const authRoutes = require('./routes/auth');
const pensiuneRoutes = require('./routes/pensiune');
const apiRoutes = require('./routes/api');
const clientRoutes = require('./routes/client');

const app = express();
const PORT = process.env.PORT || 3000;

// Creare server HTTP pentru a partaja portul cu WebSocket
const server = http.createServer(app);

// Configurare server WebSocket
const wss = new WebSocket.Server({ server });

const clients = new Map(); // ws -> { role, user, id }

const broadcast = (data) => {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
};

const broadcastToAdmins = (data) => {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    const info = clients.get(client);
    if (client.readyState === WebSocket.OPEN && info && info.role === 'admin') {
      client.send(msg);
    }
  });
};

const sendToClient = (clientId, data) => {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    const info = clients.get(client);
    if (client.readyState === WebSocket.OPEN && info && info.id === clientId) {
      client.send(msg);
    }
  });
};

app.set('wsBroadcast', broadcast);

const dbRezervari = require('./db/rezervari');

function processBotQuery(text) {
  const query = text.toLowerCase().trim();
  const dateRegex = /\d{4}-\d{2}-\d{2}/;
  const match = query.match(dateRegex);

  if (match) {
    const dataCautata = match[0];
    const toateCamerele = dbRezervari.getCamere();
    const toateRezervarile = dbRezervari.getAll();
    
    // O camera e ocupata pe dataCautata daca exista o rezervare confirmata care include acea data
    const camereOcupate = toateRezervarile
      .filter(r => r.status === 'confirmata' && r.checkIn <= dataCautata && r.checkOut > dataCautata)
      .map(r => r.camera);

    const camereLibere = toateCamerele.filter(c => !camereOcupate.includes(c.numar));

    if (camereLibere.length === 0) {
      return {
        text: `🤖 **Asistent**: Ne pare rău, dar pe data de **${dataCautata}** toate camerele noastre sunt ocupate. Încercați o altă dată.`
      };
    }

    let raspuns = `🤖 **Asistent**: Pe data de **${dataCautata}** avem următoarele camere disponibile:\n`;
    camereLibere.forEach(c => {
      raspuns += `• **Camera ${c.numar}** (${c.tip}) - **${c.pretNoapte} RON** / noapte (facilități: ${c.facilitati.join(', ')})\n`;
    });
    raspuns += `\nDoriți să faceți o rezervare?`;
    return { text: raspuns };
  }

  if (query.includes('pret') || query.includes('tarif') || query.includes('cost')) {
    return {
      text: `🤖 **Asistent**: Tarifele noastre pe noapte sunt:\n• **Single**: 150 RON / noapte\n• **Double**: 220 RON / noapte\n• **Suite (Apartament)**: 380 RON / noapte\n\nToate tarifele includ Wi-Fi, AC și parcare gratuită.`
    };
  }

  if (query.includes('contact') || query.includes('telefon') || query.includes('locat') || query.includes('adresa') || query.includes('unde')) {
    return {
      text: `🤖 **Asistent**: Ne găsiți în localitatea Bran, Str. Principală, Nr. 12. Puteți contacta recepția direct la telefon: **0722 111 222** sau e-mail: **contact@vilabradu.ro**.`
    };
  }

  if (query.includes('rezerv') || query.includes('cazez') || query.includes('cazare')) {
    return {
      text: `🤖 **Asistent**: Pentru a face o rezervare, apăsați butonul **"+ Rezervare Nouă"** din colțul de sus al acestei pagini, alegeți camera și datele dorite. Se va trimite asincron cererea!`
    };
  }

  if (query === 'buna' || query === 'salut' || query === 'salutare' || query === 'servus' || query === 'hello' || query === 'hi') {
    return {
      text: `🤖 **Asistent**: Salutare! Sunt asistentul virtual al pensiunii Vila Bradu. Cu ce vă pot ajuta? Puteți întreba despre prețuri, locație sau disponibilitatea camerelor (specificând o dată în formatul **YYYY-MM-DD**, de exemplu: \`2024-06-15\`).`
    };
  }

  return {
    text: `🤖 **Asistent**: Întrebarea dumneavoastră este mai specifică. Am înregistrat solicitarea și am alertat colegii din staff. Vă rugăm să așteptați un moment până când un coleg de la recepție vă va răspunde direct în acest chat.`
  };
}

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({
    type: 'system',
    text: 'Conexiune securizată la serverul Vila Bradu stabilită.'
  }));

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message);
      
      // 1. Initializare conexiune cu rol
      if (parsed.type === 'init') {
        clients.set(ws, { role: parsed.role, user: parsed.user, id: parsed.userId });
        console.log(`[WS Connection] ${parsed.user} s-a conectat ca ${parsed.role} (ID: ${parsed.userId})`);
        return;
      }

      const info = clients.get(ws);
      if (!info) return;

      // 2. Chat intre administrator (Staff Chat)
      if (parsed.type === 'chat') {
        broadcast({
          type: 'chat',
          user: info.user,
          text: parsed.text,
          timestamp: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
        });
      }

      // 3. Mesaj trimis de un client catre asistentul virtual / suport
      if (parsed.type === 'client_message') {
        const timestamp = new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });

        // Trimitere mesaj client catre admini
        const supportMsg = {
          type: 'support_message',
          clientName: info.user,
          clientSocketId: info.id,
          text: parsed.text,
          sender: 'client',
          timestamp
        };
        broadcastToAdmins(supportMsg);

        // Generare raspuns bot
        const botReply = processBotQuery(parsed.text);
        setTimeout(() => {
          const botMsg = {
            type: 'support_message',
            clientName: info.user,
            clientSocketId: info.id,
            text: botReply.text,
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
          };

          // Trimitem raspunsul inapoi la client
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(botMsg));
          }

          // Afisam raspunsul botului si adminilor
          broadcastToAdmins(botMsg);
        }, 800);
      }

      // 4. Raspuns admin catre un anumit client (Takeover)
      if (parsed.type === 'admin_reply') {
        const timestamp = new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
        const adminMsg = {
          type: 'support_message',
          clientName: parsed.targetClientName || 'Client',
          clientSocketId: parsed.targetClientId,
          text: parsed.text,
          sender: 'admin',
          adminName: info.user,
          timestamp
        };

        // Trimitem direct la clientul tinta
        sendToClient(parsed.targetClientId, adminMsg);

        // Trimitem tuturor adminilor (inclusiv celui care a scris) pentru sincronizare
        broadcastToAdmins(adminMsg);
      }

    } catch (err) {
      console.error("Eroare la procesarea mesajului WebSocket:", err);
    }
  });

  ws.on('close', () => {
    const info = clients.get(ws);
    if (info) {
      clients.delete(ws);
      console.log(`[WS Disconnect] ${info.user} s-a deconectat.`);
    }
  });
});

// ── View engine ────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Middleware globale ─────────────────────────────────────────
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  res.locals.tema = req.cookies.tema || 'light';
  next();
});
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
app.get('/', (req, res) => {
  const tema = req.cookies.tema || 'light';
  res.render('home', { user: req.session.user || null, tema });
});

app.use('/api', apiRoutes);
app.use('/client', clientRoutes);
app.use('/', authRoutes);
app.use('/pensiune', pensiuneRoutes);

// 404 fallback
app.use((req, res) => {
  const tema = req.cookies.tema || 'light';
  res.status(404).render('pensiune/404', { user: req.session.user || null, tema });
});

// ── Start ──────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`✅  Pensiune App pornită pe http://localhost:${PORT}`);
});
