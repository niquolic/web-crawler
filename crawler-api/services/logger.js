const winston = require('winston');
const Elasticsearch = require('winston-elasticsearch');
require('dotenv').config();

const esTransportOpts = {
  level: 'info',
  clientOpts: { node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' },
  indexPrefix: 'node-logs',
};

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new Elasticsearch.ElasticsearchTransport(esTransportOpts)
  ]
});

module.exports = logger;
