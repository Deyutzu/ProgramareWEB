const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

// Utilizatori in-memory (se pot persista in JSON daca e nevoie)
const users = [];

async function findByUsername(username) {
  return users.find(u => u.username === username) || null;
}

async function create(username, password, nume) {
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = {
    id: Date.now().toString(),
    username,
    passwordHash: hash,
    nume,
    createdAt: new Date().toISOString()
  };
  users.push(user);
  return user;
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = { findByUsername, create, verifyPassword };
