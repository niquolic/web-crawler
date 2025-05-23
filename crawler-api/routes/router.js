const express = require('express');
const router = express.Router();
const { sendToQueue } = require('../services/messaging');
const urlService = require('../services/urlService');
const cacheService = require('../services/cacheService');
const amqplib = require('amqplib');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

const pendingResults = new Map();

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

consumeResults().catch(console.error);

router.post('/download', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: 'Un URL est requis.' });
  }

  try {
    // Vérifier si l'URL est valide
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ message: 'URL invalide.' });
    }

    await urlService.saveUrl(url);

    const resultPromise = new Promise((resolve) => {
      pendingResults.set(url, resolve);
    });

    await sendToQueue('crawl_jobs', { url });

    const result = await Promise.race([
      resultPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Le crawler n\'a pas répondu dans le délai imparti')), 3000000)
      )
    ]);

    if (result.status === 'error') {
      console.error('Erreur du crawler:', result.error);
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
    console.error('Erreur lors du traitement de la requête:', error);
    pendingResults.delete(url);
    res.status(500).json({ 
      message: "Erreur lors de l'envoi du site au crawler.",
      error: error.message 
    });
  }
});

router.get('/download/:folderName', (req, res) => {
  const { folderName } = req.params;
  const websitesPath = process.env.WEBSITES_PATH || '../websites';
  const folderPath = path.join(websitesPath, folderName);

  if (!fs.existsSync(folderPath)) {
    return res.status(404).json({ message: 'Dossier non trouvé' });
  }

  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  res.attachment(`${folderName}.zip`);
  archive.pipe(res);

  archive.directory(folderPath, false);
  archive.finalize();
});

module.exports = router;