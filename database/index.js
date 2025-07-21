const { MongoClient } = require(`mongodb`);

const url = "mongodb+srv://nenette:0A9HBu4zRBHpI8ok@stock.udpvl2u.mongodb.net/";

async function run() {
    const client = new MongoClient(url);

    try {

        await client.connect();
        console.log("Connexion réussie !");

        // Création de la premiere base

        const dataBase = client.db("test");

        // Création de la première collecion
        const collection = dataBase.collection("users");

        // Insertion dans le document
        const resultat = await collection.insertOne({
          firstName: "Diallo",
          lastName: "Nene",
          phone: "622561090"
        })

        console.log(`Document : ${resultat.insertedId}`)
    } catch(error) {
        console.error("Erreur de connexion :", error);
    } finally {
        await client.close();
        console.log("Connexion fermée après réussite.");
    }
}
run();