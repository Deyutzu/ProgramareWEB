const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    // 1. String
    name: {
        type: String,
        required: [true, 'Numele dispozitivului este obligatoriu'],
        trim: true
    },
    // 2. Number + Validare Custom (min/max)
    price: {
        type: Number,
        required: [true, 'Prețul este obligatoriu'],
        min: [1, 'Prețul trebuie să fie mai mare de 0']
    },
    // 3. String cu validare Enum
    category: {
        type: String,
        enum: {
            values: ['Senzor', 'Actuator', 'Controler', 'Retea'],
            message: '{VALUE} nu este o categorie validă'
        },
        default: 'Senzor'
    },
    // 4. Boolean + Default
    isOnline: {
        type: Boolean,
        default: false
    },
    // 5. Date
    installationDate: {
        type: Date,
        default: Date.now
    },
    // Asociere cu utilizatorul (Exercițiul 3.3)
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { 
    timestamps: true // Adaugă automat createdAt și updatedAt
});

module.exports = mongoose.model('Device', deviceSchema);