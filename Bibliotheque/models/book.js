// models/Book.js
const mongoose = require('mongoose');

const BookSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true // Supprime les espaces blancs au début et à la fin
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    summary: {
        type: String,
        required: true
    },
    publishedDate: {
        type: Date,
        default: Date.now // Définit la date actuelle par défaut
    }
});

module.exports = mongoose.model('Book', BookSchema);