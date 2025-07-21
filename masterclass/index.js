
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const noteRoutes = require('./routes/routes');
const app = express();
const PORT = process.env.PORT || 3000;

connectDB();
app.use(express.json());

app.get('/notes', (req, res) => {
    res.status(200).json({ success: true, message: 'API est en ligne !' });
});

// app.post('/notes', async (req, res) => {
//     try{
//         const newNote = new newNote (req.body);
//         const savedNote = await newNote.save();
//         res.json(Note);
//     } catch (error) {
//         res.status(200).json({ message: error.message }); 
//     }
// });
app.use('/notes', noteRoutes); 

app.use((err, req, res, next) => {
    console.error('ERREUR SERVEUR :', err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Une erreur interne est survenue.'
    });
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});