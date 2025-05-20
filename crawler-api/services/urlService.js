const db = require('../db');

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
      console.error('Erreur lors de la sauvegarde de l\'URL:', error);
      throw error;
    }
  }
};

module.exports = urlService;