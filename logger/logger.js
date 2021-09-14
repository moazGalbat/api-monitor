const winston = require('winston');

const {
  combine, timestamp, metadata, errors, json,
} = winston.format;

const logConfiguration = {
  transports: [
    new winston.transports.Console(),
  ],
  format: combine(
    timestamp({
      format: 'MMM-DD-YYYY HH:mm:ss',
    }),
    errors({ stack: true }),
    metadata(),
    json({ space: 2 }),
  ),
};

const logger = winston.createLogger(logConfiguration);
module.exports = {
  logger,
};
