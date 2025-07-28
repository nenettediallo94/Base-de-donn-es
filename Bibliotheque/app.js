
const express = require('express');
const connectDB = require('./config/db');
const booksRoute = require('./routes/books');
require('dotenv').config(); 

const app = express();


connectDB();


app.use(express.json());

// Définition des routes
app.use('/api/books', booksRoute); // Toutes les routes définies dans books.js seront préfixées par /api/books

const PORT = process.env.PORT || 5000; // Utilise le port défini dans .env ou 5000 par défaut

app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));