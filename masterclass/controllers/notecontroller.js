const Note = require('../models/note'); 
const getNotes = async (req, res, next) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: notes.length,
            data: notes,
            message: 'Notes récupérées avec succès'
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des notes :', error);
        next(error);
    }
};

const createNote = async (req, res, next) => {
    try {
        const { titre, contenue } = req.body;
        if (!titre || !contenue) {
            return res.status(400).json({
                success: false,
                message: 'Le titre et le contenu sont obligatoires pour créer une note.'
            });
        }
        const newNote = new Note({
            titre,
            contenue
        });
        const savedNote = await newNote.save();
        res.status(201).json({ 
            success: true,
            data: savedNote,
            message: 'Note créée avec succès'
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ 
                success: false,
                message: 'Une note avec ce titre existe déjà. Le titre doit être unique.'
            });
        }
        console.error('Erreur lors de la création de la note :', error);
        next(error);
    }
};

const updateNote = async (req, res, next) => {
    try {
        const noteId = req.params.id;
        const updates = req.body; 

        // // Optionnel: Vous pourriez ajouter une validation ici si le corps est vide
        // if (Object.keys(updates).length === 0) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Veuillez fournir des champs à mettre à jour.'
        //     });
        // }

        const updatedNote = await Note.findByIdAndUpdate(
            noteId,
            updates, 
            { new: true, runValidators: true }
        );

        if (!updatedNote) {
            return res.status(404).json({
                success: false,
                message: 'Note non trouvée pour la mise à jour.'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedNote,
            message: 'Note mise à jour avec succès'
        });

    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Format d\'ID de note invalide.'
            });
        }
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Une autre note avec ce titre existe déjà. Le titre doit être unique.'
            });
        }
        console.error('Erreur lors de la mise à jour de la note :', error);
        next(error);
    }
};

const deleteNote = async (req, res, next) => {
    try {
        const noteId = req.params.id;
        const deletedNote = await Note.findByIdAndDelete(noteId);

        if (!deletedNote) {
            return res.status(404).json({ 
                success: false,
                message: 'Note non trouvée pour la suppression.'
            });
        }

        res.status(204).json({
            success: true,
            data: {}, 
            message: 'Note supprimée avec succès'
        });

    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                success: false,
                message: 'Format d\'ID de note invalide.'
            });
        }
        console.error('Erreur lors de la suppression de la note :', error);
        next(error); 
    }
};

const patchNote = async (req, res, next) => {
    try {
        const noteId = req.params.id;
        const updates = req.body; 

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Veuillez fournir au moins un champ pour la mise à jour partielle.'
            });
        }

        const patchedNote = await Note.findByIdAndUpdate(
            noteId,
            updates, 
            { new: true, runValidators: true } 
        );

        if (!patchedNote) {
            return res.status(404).json({
                success: false,
                message: 'Note non trouvée pour la mise à jour partielle.'
            });
        }

        res.status(200).json({
            success: true,
            data: patchedNote,
            message: 'Note mise à jour partiellement avec succès'
        });

    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Format d\'ID de note invalide.'
            });
        }
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Une autre note avec ce titre existe déjà. Le titre doit être unique.'
            });
        }
        console.error('Erreur lors de la mise à jour partielle de la note :', error);
        next(error);
    }
};

module.exports = {
    getNotes,
    createNote, 
    updateNote,
    deleteNote,
    patchNote,

};