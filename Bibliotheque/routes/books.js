// routes/books.js
const express = require('express');
const router = express.Router();
const Book = require('../models/book'); 

router.post('/', async (req, res) => {
    const { title, author, summary } = req.body;

    // Validation basique des champs
    if (!title || !author || !summary) {
        return res.status(400).json({ msg: 'Veuillez inclure le titre, l\'auteur et le résumé.' });
    }

    try {
        const newBook = new Book({
            title,
            author,
            summary
        });

        const book = await newBook.save(); // Sauvegarde le livre dans la base de données
        res.status(201).json({ message: 'Livre ajouté avec succès !', book });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur Serveur');
    }
});


router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Page actuelle, par défaut 1
        const limit = parseInt(req.query.limit) || 10; // Nombre de livres par page, par défaut 10

        const skipIndex = (page - 1) * limit; // Index de départ pour la requête

        const totalBooks = await Book.countDocuments(); // Compte le nombre total de livres
        const books = await Book.find()
                                .skip(skipIndex)
                                .limit(limit);

        const totalPages = Math.ceil(totalBooks / limit);

        // Gérer les cas où la page est hors limites
        if (page > totalPages && totalBooks > 0) {
            return res.status(404).json({ msg: 'Page introuvable.' });
        }
        if (page < 1 && totalBooks > 0) {
            return res.status(400).json({ msg: 'Le numéro de page ne peut pas être inférieur à 1.' });
        }


        res.json({
            books,
            pagination: {
                total_books: totalBooks,
                total_pages: totalPages,
                current_page: page,
                page_size: limit,
                next_page: page < totalPages ? `/api/books?page=${page + 1}&limit=${limit}` : null,
                previous_page: page > 1 ? `/api/books?page=${page - 1}&limit=${limit}` : null
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur Serveur');
    }
});

module.exports = router;