const mongoose = require('mongoose');

const UrlsSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: false },
})

module.exports = mongoose.model('Url', UrlSchema);