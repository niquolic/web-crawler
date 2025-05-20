const express = require('express');
const router = express.Router();
const { sendToQueue } = require('../services/messaging');
const urlService = require('../services/urlService');
const amqplib = require('amqplib');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

// Map pour stocker les promesses de résultats
const pendingResults = new Map();

// Fonction pour consommer les résultats du crawler
async function consumeResults() {
  const conn = await amqplib.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  const channel = await conn.createChannel();
  await channel.assertQueue('crawl_results', { durable: true });
  
  channel.consume('crawl_results', (msg) => {
    if (msg !== null) {
      const result = JSON.parse(msg.content.toString());
      const resolve = pendingResults.get(result.url);
      if (resolve) {
        resolve(result);
        pendingResults.delete(result.url);
      }
      channel.ack(msg);
    }
  });
}

// Démarrer la consommation des résultats
consumeResults().catch(console.error);

router.post('/download', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: 'Un URL est requis.' });
  }

  try {
    // Sauvegarder l'URL dans la base de données
    await urlService.saveUrl(url);

    // Créer une promesse pour ce téléchargement
    const resultPromise = new Promise((resolve) => {
      pendingResults.set(url, resolve);
    });

    // Envoyer l'URL au crawler
    await sendToQueue('crawl_jobs', { url });

    // Attendre le résultat avec un timeout de 5 minutes
    const result = await Promise.race([
      resultPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 300000)
      )
    ]);

    if (result.status === 'error') {
      return res.status(500).json({ 
        message: "Erreur lors du téléchargement du site.",
        error: result.error 
      });
    }

    res.status(201).json({ 
      message: 'Site téléchargé avec succès !',
      url,
      folderName: result.folderName
    });
  } catch (error) {
    pendingResults.delete(url);
    res.status(500).json({ 
      message: "Erreur lors de l'envoi du site au crawler.",
      error: error.message 
    });
  }
});

// Route pour télécharger le dossier en zip
router.get('/download/:folderName', (req, res) => {
  const { folderName } = req.params;
  const folderPath = path.join(__dirname, '../../websites', folderName);

  if (!fs.existsSync(folderPath)) {
    return res.status(404).json({ message: 'Dossier non trouvé' });
  }

  const archive = archiver('zip', {
    zlib: { level: 9 } // Compression maximale
  });

  res.attachment(`${folderName}.zip`);
  archive.pipe(res);

  archive.directory(folderPath, false);
  archive.finalize();
});

module.exports = router;