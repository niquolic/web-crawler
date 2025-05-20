const mongoose = require('mongoose');

const mongoDBConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crawler', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connecté !");
    return conn.connection.db;
  } catch (error) {
    console.error("Erreur de connexion à MongoDB :", error.message);
    process.exit(1);
  }
};

module.exports = mongoDBConnect;