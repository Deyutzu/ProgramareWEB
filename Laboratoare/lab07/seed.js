const mongoose = require('mongoose');
const User = require('./models/User');
const Device = require('./models/Device');
require('dotenv').config();

const seedDB = async () => {
    try {
        // Am pus link-ul direct in functia connect, cu ghilimele
        await mongoose.connect("mongodb+srv://x:y@cluster0.fkmghly.mongodb.net/lab07?appName=Cluster0");
        
        console.log('Seed: Conectat la MongoDB...');

        // Ștergem datele existente
        await Device.deleteMany({});
        await User.deleteMany({});
        console.log('Datele vechi au fost șterse.');

        // Creare 2 Utilizatori
        const adminUser = await User.create({
            username: 'admin',
            email: 'admin@site.com',
            password: 'password123', // va fi criptată de pre-save hook
            role: 'admin'
        });

        const normalUser = await User.create({
            username: 'deyutzu',
            email: 'user@site.com',
            password: 'password123',
            role: 'user'
        });

        console.log('Utilizatorii au fost creați.');

        // Creare minim 5 entități
        const sampleDevices = [
            { name: 'Senzor Temperatura', price: 150, category: 'Senzor', isOnline: true, createdBy: adminUser._id },
            { name: 'Releu Inteligent', price: 80, category: 'Actuator', isOnline: false, createdBy: normalUser._id },
            { name: 'Placa de dezvoltare', price: 250, category: 'Controler', isOnline: true, createdBy: normalUser._id },
            { name: 'Modul Wi-Fi', price: 45, category: 'Retea', isOnline: true, createdBy: adminUser._id },
            { name: 'Senzor Umiditate', price: 120, category: 'Senzor', isOnline: false, createdBy: normalUser._id }
        ];

        await Device.insertMany(sampleDevices);
        console.log('5 dispozitive au fost inserate cu succes!');

        // Închidem conexiunea
        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Eroare la popularea DB:', error);
        process.exit(1);
    }
};

seedDB();