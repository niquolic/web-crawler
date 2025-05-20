const express = require('express');
const router = express.Router();
const { sendToQueue } = require('../services/messaging');

router.post('/download', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: 'Un URL est requis.' });
  }

  try {
    await sendToQueue('crawl_jobs', { url });
    res.status(201).json({ message: 'Site envoyé au crawler !', url });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'envoi du site au crawler.", error: error.message });
  }
});

module.exports = router;