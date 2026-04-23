// Date de demo pentru rezervarile pensiunii
const rezervari = [
  {
    id: '1',
    numeOaspete: 'Anton Mihai',
    camera: '101',
    tipCamera: 'Single',
    checkIn: '2024-06-15',
    checkOut: '2024-06-18',
    nrNopti: 3,
    pretNoapte: 150,
    status: 'confirmata',
    telefon: '0722 111 222',
    observatii: 'Preferinta etaj 1'
  },
  {
    id: '2',
    numeOaspete: 'Demian Vasile',
    camera: '205',
    tipCamera: 'Double',
    checkIn: '2024-06-17',
    checkOut: '2024-06-20',
    nrNopti: 3,
    pretNoapte: 220,
    status: 'in_asteptare',
    telefon: '0733 444 555',
    observatii: 'Aniversare nunta'
  },
  {
    id: '3',
    numeOaspete: 'Alex Tomai',
    camera: '302',
    tipCamera: 'Suite',
    checkIn: '2024-06-20',
    checkOut: '2024-06-25',
    nrNopti: 5,
    pretNoapte: 380,
    status: 'confirmata',
    telefon: '0744 777 888',
    observatii: 'Mic dejun inclus'
  },
  {
    id: '4',
    numeOaspete: 'Aurel Craciun',
    camera: '104',
    tipCamera: 'Double',
    checkIn: '2024-06-10',
    checkOut: '2024-06-13',
    nrNopti: 3,
    pretNoapte: 220,
    status: 'finalizata',
    telefon: '0755 999 000',
    observatii: ''
  },
  {
    id: '5',
    numeOaspete: 'Rusu Raul',
    camera: '201',
    tipCamera: 'Single',
    checkIn: '2024-06-22',
    checkOut: '2024-06-24',
    nrNopti: 2,
    pretNoapte: 150,
    status: 'confirmata',
    telefon: '0766 123 456',
    observatii: 'Sosire tarzie ~22:00'
  }
];

const camere = [
  { numar: '101', tip: 'Single', etaj: 1, pretNoapte: 150, status: 'ocupata', facilitati: ['TV', 'AC', 'WiFi'] },
  { numar: '102', tip: 'Single', etaj: 1, pretNoapte: 150, status: 'libera', facilitati: ['TV', 'AC', 'WiFi'] },
  { numar: '104', tip: 'Double', etaj: 1, pretNoapte: 220, status: 'libera', facilitati: ['TV', 'AC', 'WiFi', 'Cada'] },
  { numar: '201', tip: 'Single', etaj: 2, pretNoapte: 150, status: 'ocupata', facilitati: ['TV', 'AC', 'WiFi', 'Vedere munte'] },
  { numar: '205', tip: 'Double', etaj: 2, pretNoapte: 220, status: 'ocupata', facilitati: ['TV', 'AC', 'WiFi', 'Balcon'] },
  { numar: '302', tip: 'Suite', etaj: 3, pretNoapte: 380, status: 'ocupata', facilitati: ['TV', 'AC', 'WiFi', 'Jacuzzi', 'Vedere panoramica'] },
  { numar: '303', tip: 'Suite', etaj: 3, pretNoapte: 380, status: 'libera', facilitati: ['TV', 'AC', 'WiFi', 'Jacuzzi', 'Vedere panoramica'] },
];

function getAll() {
  return rezervari;
}

function getById(id) {
  return rezervari.find(r => r.id === id) || null;
}

function getByStatus(status) {
  return rezervari.filter(r => r.status === status);
}

function getCamere() {
  return camere;
}

function getTotalVenit() {
  return rezervari
    .filter(r => r.status === 'finalizata' || r.status === 'confirmata')
    .reduce((sum, r) => sum + r.nrNopti * r.pretNoapte, 0);
}

module.exports = { getAll, getById, getByStatus, getCamere, getTotalVenit };
