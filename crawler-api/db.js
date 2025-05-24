const mongoose = require('mongoose');
const logger = require('./services/logger');

const mongoDBConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crawler', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info("MongoDB connecté !");
    return conn.connection.db;
  } catch (error) {
    logger.error("Erreur de connexion à MongoDB :", error.message);
    process.exit(1);
  }
};

module.exports = mongoDBConnect;