// --- Importations des modules nécessaires ---
require('dotenv').config(); // Charge les variables d'environnement du fichier .env
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Joi = require('joi'); // Importation de Joi pour la validation des données
const multer = require('multer'); // Importation de Multer pour le téléchargement de fichiers
const path = require('path'); // Importation de 'path' pour gérer les chemins de fichiers
// const bcrypt = require('bcrypt'); // Décommentez si vous installez et utilisez bcrypt pour hacher les mots de passe

// --- Configuration de l'application Express ---
const app = express();
const PORT = 3000; // Le port sur lequel votre serveur va écouter

// Middleware pour analyser le JSON des requêtes (pour lire username/password)
app.use(express.json());

// --- La clé secrète pour signer et vérifier nos JWT ---
const JWT_SECRET = process.env.JWT_SECRET;

// Vérification de sécurité : si la clé n'est pas définie, on arrête l'application.
if (!JWT_SECRET) {
    console.error("ERREUR : La variable d'environnement JWT_SECRET n'est pas définie !");
    console.error("Veuillez créer un fichier .env à la racine avec JWT_SECRET=Votre_Cle_Secrete_Aleatoire");
    process.exit(1); // Arrête le processus Node.js si la clé manque
}

// --- Connexion à la base de données MongoDB ---
const DB_URI = process.env.DB_URI;

// Vérification de sécurité : si l'URI de la BDD n'est pas définie
if (!DB_URI) {
    console.error("ERREUR : La variable d'environnement DB_URI n'est pas définie !");
    console.error("Veuillez créer un fichier .env à la racine avec DB_URI=mongodb://...");
    process.exit(1);
}

mongoose.connect(DB_URI)
    .then(() => console.log('Connecté à la base de données MongoDB ! 🎉'))
    .catch(err => {
        console.error('Erreur de connexion à la base de données :', err);
        process.exit(1); // Arrête l'application si la connexion échoue
    });

// --- Définition du modèle d'utilisateur Mongoose ---
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Le nom d\'utilisateur est requis.'], // Message personnalisé pour 'required'
        unique: true,
        minlength: [3, 'Le nom d\'utilisateur doit avoir au moins 3 caractères.'], // Validateur minlength
        maxlength: [30, 'Le nom d\'utilisateur ne peut pas dépasser 30 caractères.'] // Validateur maxlength
        // Exemple de validateur 'match' pour un format spécifique (décommenter si besoin)
        // match: [/^[a-zA-Z0-9]+$/, 'Le nom d\'utilisateur ne peut contenir que des lettres et des chiffres.']
    },
    password: {
        type: String,
        required: [true, 'Le mot de passe est requis.'],
        minlength: [6, 'Le mot de passe doit avoir au moins 6 caractères.'] // Validateur minlength
    },
    // Exemple d'un champ 'role' avec validateur 'enum' (décommenter si besoin)
    // role: {
    //     type: String,
    //     enum: ['user', 'admin', 'moderator'], // Le rôle doit être l'une de ces valeurs
    //     default: 'user'
    // }
}, { timestamps: true }); // timestamps: true pour avoir createdAt et updatedAt

const User = mongoose.model('User', UserSchema);

// --- Schémas de validation Joi ---
const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(), // Doit être alphanumérique, entre 3 et 30 caractères, et requis
    password: Joi.string().min(6).required() // Doit être une chaîne d'au moins 6 caractères, et requis
    // Vous pouvez ajouter des règles plus complexes pour le mot de passe ici (ex: .pattern(/regexPourCaractereSpeciaux/))
});

const loginSchema = Joi.object({
    username: Joi.string().required(), // Le nom d'utilisateur doit être présent
    password: Joi.string().required() // Le mot de passe doit être présent
});

// Schéma de validation Joi pour la pagination et le tri
const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1), // Doit être un entier >= 1, par défaut 1
    limit: Joi.number().integer().min(1).max(100).default(10), // Doit être un entier >= 1 et <= 100, par défaut 10
    sortBy: Joi.string().valid('username', 'createdAt').default('createdAt'), // Tri par nom d'utilisateur ou date de création, par défaut 'createdAt'
    sortOrder: Joi.string().valid('asc', 'desc').default('asc') // Ordre de tri (ascendant ou descendant)
});

// --- Configuration de Multer pour le stockage des fichiers ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Le dossier où les fichiers téléchargés seront stockés
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Le nom du fichier sera : nom_original_du_fichier-timestamp.extension
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage }); // Initialisation de Multer avec la configuration de stockage

// --- Servir les fichiers statiques du dossier 'uploads' ---
// Cela rend les fichiers accessibles via http://localhost:3000/uploads/nom_du_fichier.ext
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// --- Endpoint pour ENREGISTRER un nouvel utilisateur (Register) ---
app.post('/register', async (req, res) => {
    // 1. Validation des données de la requête avec Joi (première ligne de défense)
    const { error } = registerSchema.validate(req.body);
    if (error) {
        // Si la validation échoue, renvoyer une erreur 400 Bad Request avec les détails du problème
        return res.status(400).json({ message: error.details[0].message });
    }

    const { username, password } = req.body; // Destructuring après la validation

    try {
        // Vérifier si l'utilisateur existe déjà (avant de tenter de sauvegarder)
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'Ce nom d\'utilisateur existe déjà.' });
        }

        // ATTENTION : Pour l'instant, le mot de passe est enregistré en clair.
        // La prochaine étape sera d'utiliser bcrypt pour le hacher !
        // const hashedPassword = await bcrypt.hash(password, 10); // Exemple avec bcrypt
        const newUser = new User({ username, password }); // Ou { username, password: hashedPassword } avec bcrypt

        // 2. Mongoose va automatiquement appliquer les validateurs du schéma ici lors de .save()
        await newUser.save();

        res.status(201).json({ message: 'Utilisateur enregistré avec succès !' });
    } catch (error) {
        // Gestion des erreurs de base de données non capturées par le unique:true de Mongoose
        if (error.code === 11000) { // Erreur de doublon (unique: true)
            return res.status(409).json({ message: 'Ce nom d\'utilisateur existe déjà.' });
        }
        // Si c'est une erreur de validation de Mongoose (par exemple, si Joi est contourné)
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        console.error('Erreur lors de l\'enregistrement de l\'utilisateur :', error);
        res.status(500).json({ message: 'Erreur interne du serveur lors de l\'enregistrement.' });
    }
});


// --- ENDPOINT DE CONNEXION (Login) ---
app.post('/login', async (req, res) => {
    // 1. Validation des données de la requête avec Joi
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { username, password } = req.body; // Destructuring après la validation

    try {
        // Chercher l'utilisateur dans la base de données
        const user = await User.findOne({ username: username });

        // Vérifier si l'utilisateur existe et si le mot de passe est correct
        // Toujours en clair pour le moment, sera amélioré avec bcrypt
        // const isPasswordValid = await bcrypt.compare(password, user.password); // Exemple avec bcrypt
        if (!user || user.password !== password) { // Ou !user || !isPasswordValid avec bcrypt
            return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect' });
        }

        // Si l'authentification est réussie, créer un JWT
        const payload = { id: user._id, username: user.username };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '3h' });

        res.json({ message: 'Connexion réussie', token: token });

    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

// --- MIDDLEWARE DE VÉRIFICATION JWT (Pour les routes protégées) ---
// Un middleware est une fonction qui s'exécute avant le traitement de la requête.
function authenticateToken(req, res, next) {
    // 1. Récupérer le token de l'en-tête Authorization
    // Le format attendu est "Bearer VOTRE_TOKEN_ICI"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Prend la partie après "Bearer "

    if (token == null) {
        return res.status(401).json({ message: 'Accès non autorisé : Aucun token fourni' });
    }

    // 2. Vérifier le token
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // Si le token est invalide ou expiré
            return res.status(403).json({ message: 'Token invalide ou expiré' });
        }
        // Si le token est valide, attacher les informations de l'utilisateur (du payload) à l'objet req
        req.user = user;
        // Passer au middleware/route suivant
        next();
    });
}

// --- ENDPOINT PROTÉGÉ (Exemple simple) ---
app.get('/protected', authenticateToken, (req, res) => {
    res.json({
        message: `Bienvenue , ${req.user.username}!`,
        userId: req.user.id,
        userRole: ' votre rôle ici'
    });
});

// --- Endpoint pour obtenir la liste des utilisateurs avec pagination et tri ---
app.get('/users', authenticateToken, async (req, res) => {
    // 1. Validation des paramètres de pagination avec Joi
    const { error, value } = paginationSchema.validate(req.query);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const page = value.page; // Page actuelle (par défaut 1)
    const limit = value.limit; // Nombre d'éléments par page (par défaut 10)
    const skip = (page - 1) * limit; // Calcul du nombre d'éléments à sauter
    const sortBy = value.sortBy; // Champ de tri (par défaut 'createdAt')
    const sortOrder = value.sortOrder === 'asc' ? 1 : -1; // Ordre de tri (1 pour asc, -1 pour desc)

    try {
        // 2. Obtenir le nombre total d'utilisateurs (pour calculer le nombre total de pages)
        const totalUsers = await User.countDocuments();

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder;

        // 3. Récupérer les utilisateurs pour la page actuelle
        // On exclut le mot de passe du résultat pour des raisons de sécurité !
        const users = await User.find({})
                                .skip(skip)
                                .limit(limit)
                                .select('-password') // IMPORTANT : N'envoyez jamais les mots de passe (même hachés) au client !
                                .sort(sortOptions); // Appliquer le tri

        const totalPages = Math.ceil(totalUsers / limit);

        res.json({
            message: 'Liste des utilisateurs paginée',
            users: users,
            pagination: {
                totalItems: totalUsers,
                totalPages: totalPages,
                currentPage: page,
                itemsPerPage: limit,
                sortBy: sortBy,
                sortOrder: sortOrder === 1 ? 'asc' : 'desc'
            }
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs :', error);
        res.status(500).json({ message: 'Erreur interne du serveur lors de la récupération des utilisateurs.' });
    }
});

// --- Nouvel endpoint pour télécharger un fichier ---
app.post('/upload', authenticateToken, upload.single('myFile'), (req, res) => {
    // 'myFile' est le nom du champ dans le formulaire qui contient le fichier
    if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier n\'a été téléchargé.' });
    }
    res.json({
        message: 'Fichier téléchargé avec succès !',
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}` // Chemin d'accès public au fichier
    });
});


// --- Démarrer le serveur ---
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
    console.log(`Endpoint pour enregistrer : POST http://localhost:${PORT}/register`);
    console.log(`Endpoint de connexion: POST http://localhost:${PORT}/login`);
    console.log(`Endpoint protégé (simple) : GET http://localhost:${PORT}/protected`);
    console.log(`Endpoint utilisateurs paginés et triés : GET http://localhost:${PORT}/users?page=1&limit=10&sortBy=createdAt&sortOrder=desc`);
    console.log(`Endpoint de téléchargement de fichier : POST http://localhost:${PORT}/upload`);
    console.log(`Les fichiers téléchargés sont accessibles via : http://localhost:${PORT}/uploads/nom_du_fichier.ext`);
});