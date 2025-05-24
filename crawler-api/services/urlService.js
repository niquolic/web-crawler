const db = require('../db');
const logger = require('./logger');

const urlService = {
  async saveUrl(url) {
    try {
      const database = await db();
      const urls = database.collection('urls');
      const urlToSave = {
        url,
        createdAt: new Date()
      };
      await urls.insertOne(urlToSave);
      return urlToSave;
    } catch (error) {
      logger.error('Erreur lors de la sauvegarde de l\'URL:', error);
      throw error;
    }
  }
};

module.exports = urlService;