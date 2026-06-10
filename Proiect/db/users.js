const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

const filePath = path.join(__dirname, 'data', 'users.json');

// Utilizatori incarcati din JSON
let users = [];
try {
  if (fs.existsSync(filePath)) {
    users = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
} catch (err) {
  console.error("Eroare la citirea users.json:", err);
}

function saveUsers() {
  try {
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error("Eroare la salvarea users.json:", err);
  }
}

async function seedAdmin() {
  const adminExists = users.some(u => u.username === 'admin');
  if (!adminExists) {
    const hash = await bcrypt.hash('admin', SALT_ROUNDS);
    users.push({
      id: 'admin-id',
      username: 'admin',
      passwordHash: hash,
      nume: 'Administrator Pensiune',
      role: 'admin',
      createdAt: new Date().toISOString()
    });
    saveUsers();
    console.log("✅ Cont admin creat automat (user: admin, pass: admin)");
  }
}
seedAdmin();

async function findByUsername(username) {
  return users.find(u => u.username === username) || null;
}

async function create(username, password, nume, role = 'client') {
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = {
    id: Date.now().toString(),
    username,
    passwordHash: hash,
    nume,
    role, // Salvam rolul
    createdAt: new Date().toISOString()
  };
  users.push(user);
  saveUsers();
  return user;
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = { findByUsername, create, verifyPassword };
