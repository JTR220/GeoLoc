import mongoose from 'mongoose';
import Position from "./model/Positions.js";
import express from "express";
import res from "express/lib/response.js";


// Initialisation de l'application Express
const app = express();
const port = 3000;

// Connexion à MongoDB
mongoose.connect("mongodb://localhost:27017/DataSpehere")

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Erreur de connexion à MongoDB"));
mongoose.connection.once("open", async () => {
    console.log("Connexion réussie à MongoDB !");
    const db = mongoose.connection.db;  // Accès direct à la base de données
    const collections = await db.listCollections().toArray();  // Lister toutes les collections
    console.log('Collections disponibles :', collections.map((col)   => col.name));
});

// Création de l'index géospatial
Position.createIndexes([
    { location: "2dsphere" },
]).then(() => console.log("Index géospatial 2dsphere créé"));

// Route pour récupérer tous les lieux
app.get("/lieux", async (req, res) => {
    try {
        const lieux = await Position.find();
        res.json(lieux);
    } catch (err) {
        res.status(500).send("Erreur lors de la récupération des lieux");
    }
});

app.get("/lieuRandom", async (req, res) => {
    try {
        const lieux = await Position.find();
        const ind = Math.floor(Math.random() * lieux.length);
        res.json(lieux[ind]);
    } catch (err) {
        res.status(500).send("Erreur lors de la récupération des lieux");
    }
});


// Route pour récupérer un lieu par ville
app.get("/lieu/:ville", async (req, res) => {
    const { ville } = req.params;
    try {
        const lieu = await Position.findOne({ ville });
        if (!lieu) {
            return res.status(404).send("Lieu non trouvé");
        }
        res.json(lieu);
    } catch (err) {
        res.status(500).send("Erreur lors de la récupération du lieu");
    }
});

// Fonction pour trouver des lieux proches d'une position donnée
app.get("/lieux-proches", async (req, res) => {
    const { lat, lon, rayon } = req.query;  // Exemple : ?lat=41.6332836&lon=-72.7738706&rayon=10
    const maxDistanceInKm = parseFloat(rayon) || 10;  // Rayon par défaut 10 km
    try {
        const lieuxProches = await Position.find({
            location: {
                $geoWithin: {
                    $centerSphere: [
                        [parseFloat(lon), parseFloat(lat)],  // Longitude, Latitude
                        maxDistanceInKm / 6378.1  // Rayon en kilomètres converti en radians
                    ]
                }
            }
        });
        res.json(lieuxProches);
    } catch (err) {
        res.status(500).send("Erreur lors de la recherche géospatiale");
    }
});



// Route pour récupérer un lieu par ville
app.get("/lieu/adresse/:adresse", async (req, res) => {
    const { adresse } = req.params;
    try {
        console.log(adresse);
        const lieu = await Position.findOne({ quartier:adresse });
        if (!lieu) {
            return res.status(404).send("Lieu non trouvé");
        }
        console.log()
        const lieuxProches = await Position.find({
            location: {
                $geoWithin: {
                    $centerSphere: [
                        [parseFloat(lieu.location.coordinates[0]), parseFloat(lieu.location.coordinates[1])],  // Longitude, Latitude
                        2 / 6378.1  // Rayon en kilomètres converti en radians
                    ]
                }
            }
        });
        res.json(lieuxProches);
    } catch (err) {
        res.status(500).send(err+", Erreur lors de la récupération du lieu");
    }
});



// Démarrage du serveur
app.listen(port, () => console.log(`Serveur démarré sur le port ${port}`));
