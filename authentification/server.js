require('dotenv').config(); 
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 3000;

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("ERREUR : La variable d'environnement JWT_SECRET n'est pas définie !");
    console.error("Veuillez créer un fichier .env à la racine avec JWT_SECRET=Votre_Cle_Secrete_Aleatoire");
    process.exit(1); 
}

const users = [
    { id: 1, username: 'utilisateur1', password: 'password123' },
    { id: 2, username: 'admin', password: 'adminpassword' }
];


app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect' });
    }
    const payload = { id: user.id, username: user.username };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Connexion réussie', token: token });
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (token == null) {
        return res.status(401).json({ message: 'Accès non autorisé : Aucun token fourni' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide ou expiré' });
        }
       
        req.user = user;
   
        next();
    });
}

app.get('/protected', authenticateToken, (req, res) => {

    res.json({
        message: `Bienvenue sur la ressource protégée, ${req.user.username}!`,
        userId: req.user.id,
        userRole: 'Hypothétiquement votre rôle ici' 
    });
});


app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
    console.log(`Endpoint de connexion: POST http://localhost:${PORT}/login`);
    console.log(`Endpoint protégé: GET http://localhost:${PORT}/protected`);
});