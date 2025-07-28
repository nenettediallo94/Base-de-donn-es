// config/db.js
const mongoose = require('mongoose');
require('dotenv').config(); // Charge les variables d'environnement

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            // Options recommandées pour éviter les warnings
            // useNewUrlParser: true,  // Déprécié dans Mongoose 6+
            // useUnifiedTopology: true // Déprécié dans Mongoose 6+
        });
        console.log('Connexion à MongoDB réussie !');
    } catch (err) {
        console.error('Erreur de connexion à MongoDB :', err.message);
        // Quitter le processus en cas d'échec de connexion
        process.exit(1);
    }
};

module.exports = connectDB;