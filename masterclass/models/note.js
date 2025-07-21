const mongoose = require('mongoose')
const noteSchema = mongoose.Schema({
    titre: {
        type: String,
        require: [true, 'Le titre est requis'],
        trim: true,
        maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
    },
    contenue: {
        type: String,
        require: [true, 'Le contenu est requis'],
        maxlength: [1000, 'Le contenu ne peut pas dépasser 1000 caractères']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})
/*Middleware pour mettre à jour updatedAt avant chaque sauvegarde*/
noteSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});
module.exports = mongoose.model('note', noteSchema)