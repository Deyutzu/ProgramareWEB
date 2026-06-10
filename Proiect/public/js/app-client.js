// ── Utility Cookie Functions ─────────────────────────────────────
function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function eraseCookie(name) {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

// ── Toast Notification System ────────────────────────────────────
function showToast(title, message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-text">${message}</div>
    </div>
    <button class="toast-close">×</button>
  `;

  container.appendChild(toast);

  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  });

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
}

// ── Cookie Companion Logic ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const companion = document.getElementById('cookie-companion');
  const customizeBtn = document.getElementById('cookie-customize-btn');
  const detailsPanel = document.getElementById('cookie-details-panel');
  const btnAcceptAll = document.getElementById('cookie-btn-accept-all');
  const btnReject = document.getElementById('cookie-btn-reject');
  const btnSave = document.getElementById('cookie-btn-save');
  const prefCheckbox = document.getElementById('cookie-opt-preferences');
  const expCheckbox = document.getElementById('cookie-opt-experience');

  const consent = getCookie('cookieConsent');

  if (!consent && companion) {
    companion.classList.remove('hidden');
  }

  if (customizeBtn) {
    customizeBtn.addEventListener('click', () => {
      customizeBtn.classList.toggle('open');
      detailsPanel.classList.toggle('hidden');
      btnAcceptAll.classList.add('hidden');
      btnReject.classList.add('hidden');
      btnSave.classList.remove('hidden');
    });
  }

  if (btnAcceptAll) {
    btnAcceptAll.addEventListener('click', () => {
      setCookie('cookieConsent', 'all', 30);
      setCookie('cookie_pref_theme', 'true', 30);
      setCookie('cookie_pref_experience', 'true', 30);
      companion.classList.add('hidden');
      showToast('Setări cookies salvate', 'Mulțumim! Ați acceptat toate cookie-urile.');
      location.reload();
    });
  }

  if (btnReject) {
    btnReject.addEventListener('click', () => {
      setCookie('cookieConsent', 'essential', 30);
      setCookie('cookie_pref_theme', 'false', 30);
      setCookie('cookie_pref_experience', 'false', 30);
      eraseCookie('tema');
      eraseCookie('recentRezervari');
      companion.classList.add('hidden');
      showToast('Setări cookies salvate', 'Ați respins cookie-urile opționale.');
      setTimeout(() => location.reload(), 1000);
    });
  }

  if (btnSave) {
    btnSave.addEventListener('click', () => {
      const prefChecked = prefCheckbox.checked;
      const expChecked = expCheckbox.checked;

      setCookie('cookieConsent', 'custom', 30);
      setCookie('cookie_pref_theme', prefChecked ? 'true' : 'false', 30);
      setCookie('cookie_pref_experience', expChecked ? 'true' : 'false', 30);

      if (!prefChecked) eraseCookie('tema');
      if (!expChecked) eraseCookie('recentRezervari');

      companion.classList.add('hidden');
      showToast('Setări cookies salvate', 'Preferințele dvs. au fost înregistrate.');
      setTimeout(() => location.reload(), 1000);
    });
  }

  // ── Client-side Theme Toggle ───────────────────────────────────
  const themeToggles = document.querySelectorAll('.tema-toggle form');
  themeToggles.forEach(form => {
    form.addEventListener('submit', (e) => {
      const allowedPref = getCookie('cookie_pref_theme') !== 'false';
      if (!allowedPref) {
        e.preventDefault();
        showToast('Cookies dezactivate', 'Trebuie să acceptați cookie-urile de "Preferințe Aspect" pentru a schimba tema permanent.');
        return;
      }

      e.preventDefault();
      const html = document.documentElement;
      const currentTheme = html.getAttribute('data-tema') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      html.setAttribute('data-tema', newTheme);
      setCookie('tema', newTheme, 30);

      const btns = document.querySelectorAll('.tema-btn');
      btns.forEach(btn => {
        btn.innerHTML = newTheme === 'dark' ? '☀ Luminos' : '☾ Întunecat';
      });

      const inputs = document.querySelectorAll('.tema-toggle input[name="tema"]');
      inputs.forEach(input => {
        input.value = newTheme === 'dark' ? 'light' : 'dark';
      });

      showToast('Temă schimbată', `Modul ${newTheme === 'dark' ? 'întunecat' : 'luminos'} a fost activat.`);
    });
  });

  // ── WebSockets & Real-Time Chat & Support ───────────────────────
  const isExpAllowed = getCookie('cookie_pref_experience') !== 'false';
  let ws;

  const activeUser = window.currentUserNume || 'Anonim';
  const activeRole = window.currentUserRole || 'client';
  const activeUserId = window.currentUserId || 'guest';

  if (isExpAllowed && (document.getElementById('chat-widget-box') || document.querySelector('.stats-grid') || document.querySelector('.camere-grid') || table)) {
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const wsUrl = protocol + window.location.host;
    
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('✅ Conexiune WebSocket stabilită.');
      
      // Trimitem init payload pentru a inregistra socket-ul cu rolul si utilizatorul corect pe server
      ws.send(JSON.stringify({
        type: 'init',
        role: activeRole,
        user: activeUser,
        userId: activeUserId
      }));

      const indicator = document.querySelector('.chat-status');
      if (indicator) {
        indicator.innerHTML = '<span class="pulse-dot"></span> Staff Online / Conectat';
        indicator.style.color = '#27ae60';
      }
    };

    ws.onclose = () => {
      console.log('🔴 Conexiune WebSocket închisă.');
      const indicator = document.querySelector('.chat-status');
      if (indicator) {
        indicator.innerHTML = '● Deconectat';
        indicator.style.color = 'var(--text-light)';
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        
        // A. Mesaj de sistem
        if (msg.type === 'system') {
          addChatMessage('Sistem', msg.text, 'system');
        } 
        // B. Mesaj in chatul administrativ (intre admini)
        else if (msg.type === 'chat') {
          if (activeRole === 'admin') {
            const type = msg.user === activeUser ? 'sent' : 'received';
            addChatMessage(msg.user, msg.text, type, msg.timestamp);
          }
        }
        // C. Mesaj suport (chatbot / client takeover)
        else if (msg.type === 'support_message') {
          if (activeRole === 'admin') {
            // Un admin primeste toate mesajele suport pentru monitorizare si interactiune
            
            // 1. Asigura-te ca clientul e in select dropdown-ul de destinatari
            const select = document.getElementById('admin-chat-target');
            if (select) {
              const exists = Array.from(select.options).some(opt => opt.value === msg.clientSocketId);
              if (!exists) {
                const opt = document.createElement('option');
                opt.value = msg.clientSocketId;
                opt.textContent = `💬 Client: ${msg.clientName}`;
                select.appendChild(opt);
                // Daca adminul vrea sa raspunda rapid, il putem lasa sa selecteze
              }
            }

            // 2. Afisam in chat cu un format specific
            if (msg.sender === 'client') {
              addChatMessage(`[Client] ${msg.clientName}`, msg.text, 'received', msg.timestamp);
              // Alerta admin si toast pop-up
              showToast('Suport Client Live', `Clientul <strong>${msg.clientName}</strong> trimite mesaje.`);
              const badge = document.getElementById('chat-alert-badge');
              if (badge) {
                badge.classList.remove('hidden');
                badge.textContent = `🚨 Suport: ${msg.clientName}`;
              }
            } else if (msg.sender === 'bot') {
              addChatMessage(`[Asistent ➔ ${msg.clientName}]`, msg.text, 'system', msg.timestamp);
            } else if (msg.sender === 'admin') {
              const type = msg.adminName === activeUser ? 'sent' : 'received';
              addChatMessage(`[Staff ➔ ${msg.clientName}] ${msg.adminName}`, msg.text, type, msg.timestamp);
            }
          } 
          else if (activeRole === 'client') {
            // Clientul primeste doar mesajele care ii sunt adresate lui (id-ul lui e socket id-ul tinta)
            if (msg.clientSocketId === activeUserId) {
              if (msg.sender === 'client') {
                // Deja adaugat local, ignoram pentru a evita duplicatele
              } else if (msg.sender === 'bot') {
                addChatMessage('Asistent Virtual', msg.text, 'received', msg.timestamp);
              } else if (msg.sender === 'admin') {
                addChatMessage(`👩‍💼 Staff (${msg.adminName})`, msg.text, 'received', msg.timestamp);
              }
            }
          }
        }
        // D. Eveniment adaugare rezervare de catre cineva
        else if (msg.type === 'booking_created') {
          if (activeRole === 'admin') {
            showToast('Rezervare Nouă', `Utilizatorul ${msg.user} a adăugat o rezervare pentru <strong>${msg.data.numeOaspete}</strong> (Camera ${msg.data.camera}).`);
            updateStats(msg.stats);
            addBookingRowToTable(msg.data);
            updateRoomCardStatus(msg.data.camera, 'ocupata');
          } else {
            // Daca e client, ii actualizam doar camerele daca se afla in portalul de camere
            updateRoomCardStatus(msg.data.camera, 'ocupata');
          }
        }
        // E. Eveniment schimbare status rezervare
        else if (msg.type === 'booking_updated') {
          if (activeRole === 'admin') {
            showToast('Actualizare Rezervare', `Rezervarea lui <strong>${msg.data.numeOaspete}</strong> a fost modificată la statusul <strong>${msg.data.status}</strong> de către ${msg.user}.`);
            updateStats(msg.stats);
            updateBookingRowInTable(msg.data);
            if (msg.data.status === 'confirmata') {
              updateRoomCardStatus(msg.data.camera, 'ocupata');
            } else {
              updateRoomCardStatus(msg.data.camera, 'libera');
            }
          } else {
            // Daca e client, dar e rezervarea lui, o actualizam si in tabelul lui!
            if (msg.data.numeOaspete.toLowerCase() === activeUser.toLowerCase()) {
              updateBookingRowInTable(msg.data);
            }
            if (msg.data.status === 'confirmata') {
              updateRoomCardStatus(msg.data.camera, 'ocupata');
            } else {
              updateRoomCardStatus(msg.data.camera, 'libera');
            }
          }
        }
      } catch (err) {
        console.error("Eroare la parsarea mesajului WS:", err);
      }
    };
  }

  // ── Logica Trimitere Mesaje Chat ─────────────────────────────────
  const chatInput = document.getElementById('chat-msg-input');
  const chatSendBtn = document.getElementById('chat-msg-send');

  function sendChatMessage() {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      showToast('Eroare chat', 'Nu sunteți conectat la serverul live chat.');
      return;
    }
    const text = chatInput.value.trim();
    if (!text) return;

    if (activeRole === 'admin') {
      const select = document.getElementById('admin-chat-target');
      const target = select ? select.value : 'staff';
      
      if (target === 'staff') {
        // Staff Chat normal
        ws.send(JSON.stringify({
          type: 'chat',
          text: text
        }));
      } else {
        // Raspuns live catre un client specific (Takeover)
        const selectedOption = select.options[select.selectedIndex];
        const targetName = selectedOption.textContent.replace('💬 Client: ', '');
        
        ws.send(JSON.stringify({
          type: 'admin_reply',
          targetClientId: target,
          targetClientName: targetName,
          text: text
        }));

        // Adaugam si in logul propriu local ca fiind trimis catre client
        addChatMessage(`Tu ➔ ${targetName}`, text, 'sent');
      }
    } 
    else if (activeRole === 'client') {
      // Clientul trimite catre chatbot/suport
      ws.send(JSON.stringify({
        type: 'client_message',
        text: text
      }));

      // Adaugam mesajul local instantaneu
      addChatMessage('Tu', text, 'sent');
    }

    chatInput.value = '';
  }

  if (chatSendBtn && chatInput) {
    chatSendBtn.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendChatMessage();
    });
  }

  // Ascundere alerta cand adminul schimba canalul / raspunde
  const selectTarget = document.getElementById('admin-chat-target');
  if (selectTarget) {
    selectTarget.addEventListener('change', () => {
      const badge = document.getElementById('chat-alert-badge');
      if (badge) {
        badge.classList.add('hidden');
      }
    });
  }

  function addChatMessage(user, text, type, time = '') {
    const msgContainer = document.getElementById('chat-messages-container');
    if (!msgContainer) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${type}`;
    
    if (type === 'system') {
      // Formateaza markdown bold simplu (cum ar fi bot reply)
      const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      msgDiv.innerHTML = `<div class="chat-msg-bubble" style="background:#e8f4fd;color:#1e40af;border:1px solid #bfdbfe;">${formattedText}</div>`;
    } else {
      const timeStr = time || new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
      // Formatare text pentru a suporta bold-ul din raspunsul chatbotului
      const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
      msgDiv.innerHTML = `
        <div class="chat-msg-meta">${user} · ${timeStr}</div>
        <div class="chat-msg-bubble">${formattedText}</div>
      `;
    }

    msgContainer.appendChild(msgDiv);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  // ── AJAX: Schimbare Status Rezervare (Doar Admin) ───────────────
  const table = document.querySelector('table');
  if (table && activeRole === 'admin') {
    table.addEventListener('change', async (e) => {
      if (e.target.classList.contains('table-select')) {
        const select = e.target;
        const id = select.getAttribute('data-id');
        const status = select.value;

        select.disabled = true;

        try {
          const res = await fetch(`/api/rezervari/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Eroare la actualizarea statusului');
          }

          const data = await res.json();
          showToast('Status actualizat', `Rezervarea oaspetelui ${data.numeOaspete} este acum "${status}".`);
        } catch (err) {
          showToast('Eroare actualizare', err.message);
          setTimeout(() => location.reload(), 1000);
        } finally {
          select.disabled = false;
        }
      }
    });
  }

  // ── AJAX: Modal Noua Rezervare (Ambele roluri) ──────────────────
  const modal = document.getElementById('add-booking-modal');
  const openModalBtn = document.getElementById('btn-open-modal');
  const closeModalBtn = document.getElementById('btn-close-modal');
  const cancelModalBtn = document.getElementById('btn-cancel-modal');
  const bookingForm = document.getElementById('add-booking-form');
  const submitBtn = document.getElementById('btn-submit-booking');

  if (openModalBtn && modal) {
    openModalBtn.addEventListener('click', () => {
      const checkInInput = modal.querySelector('#checkIn');
      const checkOutInput = modal.querySelector('#checkOut');
      if (checkInInput && checkOutInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1;
        let dd = today.getDate();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        checkInInput.value = `${yyyy}-${mm}-${dd}`;

        const checkOut = new Date(today);
        checkOut.setDate(today.getDate() + 3);
        const co_yyyy = checkOut.getFullYear();
        let co_mm = checkOut.getMonth() + 1;
        let co_dd = checkOut.getDate();

        if (co_dd < 10) co_dd = '0' + co_dd;
        if (co_mm < 10) co_mm = '0' + co_mm;

        checkOutInput.value = `${co_yyyy}-${co_mm}-${co_dd}`;
      }
      modal.classList.add('open');
    });
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('open');
      bookingForm.reset();
    }
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(bookingForm);
      const payload = {};
      formData.forEach((value, key) => {
        payload[key] = value;
      });

      submitBtn.classList.add('btn-loading');
      submitBtn.disabled = true;
      const initialText = submitBtn.textContent;
      submitBtn.innerHTML = '<span class="spinner"></span>Se salvează...';

      try {
        const res = await fetch('/api/rezervari', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Eroare la salvarea rezervării');
        }

        const data = await res.json();
        showToast('Rezervare adăugată', `Rezervarea pentru ${data.numeOaspete} a fost creată cu succes.`);
        closeModal();
        
        // Daca suntem client, adaugam randul simplu cu badge static
        if (activeRole === 'client') {
          addBookingRowToTable(data);
        }
      } catch (err) {
        showToast('Eroare salvare', err.message);
      } finally {
        submitBtn.classList.remove('btn-loading');
        submitBtn.disabled = false;
        submitBtn.innerHTML = initialText;
      }
    });
  }

  // ── Live Table Search & Filtering ────────────────────────────────
  const searchInput = document.getElementById('dashboard-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      const rows = document.querySelectorAll('tbody tr');

      rows.forEach(row => {
        const textContent = row.textContent.toLowerCase();
        if (textContent.includes(query)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  // ── Vizualizate Recent Widget Helper ─────────────────────────────
  renderRecentBookings();
});

// ── WebSocket Helper Functions to Update DOM ───────────────────────
function updateStats(stats) {
  if (!stats) return;
  const cards = document.querySelectorAll('.stat-card');
  if (cards.length >= 4) {
    cards[0].querySelector('.stat-value').textContent = stats.total;
    cards[1].querySelector('.stat-value').textContent = stats.confirmate;
    cards[2].querySelector('.stat-value').textContent = stats.inAsteptare;
    cards[3].querySelector('.stat-value').textContent = stats.venit.toLocaleString('ro-RO');
  }
}

function addBookingRowToTable(booking) {
  const tbody = document.querySelector('tbody');
  const wrap = document.querySelector('.table-header span');
  if (!tbody) return;

  if (wrap) {
    const currentCount = parseInt(wrap.textContent) || 0;
    wrap.textContent = `${currentCount + 1} înregistrări`;
  }

  // Stergem randul gol daca exista (pe client dashboard)
  const noBookingsRow = Array.from(tbody.querySelectorAll('tr')).find(r => r.textContent.includes('Nu ai nicio rezervare'));
  if (noBookingsRow) {
    noBookingsRow.remove();
  }

  const row = document.createElement('tr');
  row.setAttribute('data-id', booking.id);
  
  const statusLabels = {
    'in_asteptare': 'În așteptare',
    'confirmata': 'Confirmata',
    'finalizata': 'Finalizata'
  };

  const isClient = window.currentUserRole !== 'admin';

  let statusCell = '';
  if (isClient) {
    const badgeLabel = booking.status === 'in_asteptare' ? 'În așteptare' : booking.status.charAt(0).toUpperCase() + booking.status.slice(1);
    statusCell = `<span class="badge badge-${booking.status}">${badgeLabel}</span>`;
  } else {
    statusCell = `
      <select class="table-select" data-id="${booking.id}">
        <option value="in_asteptare" ${booking.status === 'in_asteptare' ? 'selected' : ''}>În așteptare</option>
        <option value="confirmata" ${booking.status === 'confirmata' ? 'selected' : ''}>Confirmata</option>
        <option value="finalizata" ${booking.status === 'finalizata' ? 'selected' : ''}>Finalizata</option>
      </select>
    `;
  }

  // Preț Total (pentru tabelul de client, daca are coloana asta)
  const totalPretCell = isClient ? `<td><strong>${(booking.nrNopti * booking.pretNoapte).toLocaleString('ro-RO')} RON</strong></td>` : '';

  row.innerHTML = `
    <td><strong>${booking.numeOaspete}</strong></td>
    <td>${booking.camera}</td>
    <td>${booking.tipCamera}</td>
    <td>${booking.checkIn}</td>
    <td>${booking.checkOut}</td>
    <td>${booking.nrNopti}</td>
    ${totalPretCell}
    <td>
      ${statusCell}
    </td>
    <td>
      <a href="/pensiune/rezervari/${booking.id}">Vezi →</a>
    </td>
  `;

  tbody.insertBefore(row, tbody.firstChild);
}

function updateBookingRowInTable(booking) {
  const row = document.querySelector(`tbody tr[data-id="${booking.id}"]`) || 
                Array.from(document.querySelectorAll('tbody tr')).find(r => r.textContent.includes(booking.numeOaspete) && r.textContent.includes(booking.camera));

  if (row) {
    if (booking.id && !row.hasAttribute('data-id')) {
      row.setAttribute('data-id', booking.id);
    }
    
    const isClient = window.currentUserRole !== 'admin';

    if (isClient) {
      const statusContainer = row.cells[7]; // status column on client is 7 (0-indexed)
      if (statusContainer) {
        const badgeLabel = booking.status === 'in_asteptare' ? 'În așteptare' : booking.status.charAt(0).toUpperCase() + booking.status.slice(1);
        statusContainer.innerHTML = `<span class="badge badge-${booking.status}">${badgeLabel}</span>`;
      }
    } else {
      const select = row.querySelector('.table-select');
      if (select) {
        select.value = booking.status;
      }
    }
  }
}

function updateRoomCardStatus(roomNumber, newStatus) {
  const cards = document.querySelectorAll('.camera-card');
  cards.forEach(card => {
    const numEl = card.querySelector('.camera-numar');
    if (numEl && numEl.textContent.trim() === roomNumber.toString()) {
      const badge = card.querySelector('.badge');
      if (badge) {
        badge.className = `badge badge-${newStatus}`;
        badge.textContent = newStatus === 'libera' ? 'Liberă' : 'Ocupată';
      }
    }
  });

  const availableStats = document.querySelectorAll('.stat-card .stat-value');
  if (availableStats.length >= 3) {
    const totalCamere = parseInt(availableStats[0].textContent) || 7;
    const cardsList = Array.from(document.querySelectorAll('.camera-card'));
    const freeCount = cardsList.filter(c => c.querySelector('.badge').classList.contains('badge-libera')).length;
    const occupiedCount = totalCamere - freeCount;

    availableStats[1].textContent = freeCount;
    availableStats[2].textContent = occupiedCount;
  }
}

// ── Render Recent Bookings from Cookie ────────────────────────────
function renderRecentBookings() {
  const listContainer = document.getElementById('recent-bookings-list');
  if (!listContainer) return;

  const cookieVal = getCookie('recentRezervari');
  if (!cookieVal) {
    listContainer.innerHTML = '<li class="recent-item" style="color:var(--text-light);padding:0.5rem;font-size:0.75rem;">Nicio rezervare vizualizată recent.</li>';
    return;
  }

  try {
    const items = JSON.parse(decodeURIComponent(cookieVal));
    if (!Array.isArray(items) || items.length === 0) {
      listContainer.innerHTML = '<li class="recent-item" style="color:var(--text-light);padding:0.5rem;font-size:0.75rem;">Nicio rezervare vizualizată recent.</li>';
      return;
    }

    listContainer.innerHTML = '';
    items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'recent-item';
      li.innerHTML = `
        <a href="/pensiune/rezervari/${item.id}">
          <span>${item.nume}</span>
          <span class="recent-item-room">Cam. ${item.camera}</span>
        </a>
      `;
      listContainer.appendChild(li);
    });
  } catch (err) {
    console.error("Eroare la citirea recentRezervari cookie:", err);
    listContainer.innerHTML = '<li class="recent-item" style="color:var(--text-light);padding:0.5rem;font-size:0.75rem;">Eroare citire istoric.</li>';
  }
}
