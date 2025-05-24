import winston from 'winston';
import Elasticsearch from 'winston-elasticsearch';
import 'dotenv/config';

const esTransportOpts = {
  level: 'info',
  clientOpts: { 
    node: process.env.ELASTICSEARCH_URL || 'http://elasticsearch.elastic.svc.cluster.local:9200',
    maxRetries: 5,
    requestTimeout: 10000,
    sniffOnStart: true
  },
  indexPrefix: 'node-logs',
};

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new Elasticsearch.ElasticsearchTransport(esTransportOpts)
  ]
});

export default logger;
