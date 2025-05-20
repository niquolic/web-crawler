const mongoose = require('mongoose');

const UrlsSchema = new mongoose.Schema({
  url: { type: String, required: true },
})

module.exports = mongoose.model('Url', UrlSchema);