require('dotenv').config();
const mongoose = require ('mongoose')

const client = async () => {
try {
 const connexion = await mongoose.connect(`${process.env.MONGO_URI}`);
 console.log("connexion reussie")
  
} catch (error) {
  console.error("erreur de connexion ")
}
}
module.exports= client