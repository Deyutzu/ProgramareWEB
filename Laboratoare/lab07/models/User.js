const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Index unic
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // Index unic
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Te rog introdu un email valid']
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'Parola trebuie să aibă minim 6 caractere']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, { timestamps: true });

// Pre-save hook pentru hash-uirea parolei (Versiunea modernă async/await)
userSchema.pre('save', async function() {
    // Dacă parola nu a fost modificată, oprim execuția hook-ului aici
    if (!this.isModified('password')) return;

    // Generăm salt-ul și criptăm parola automat
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);