require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./db');
const serviceRoutes = require('./routes/router');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/crawler', serviceRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Gateway démarrée sur http://0.0.0.0:${PORT}`);
});