const mongoose = require('mongoose');

const { dbUrl } = require('../config');
const { logger } = require('../logger/logger');

module.exports = () => {
  mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }, (err) => {
    if (!err) logger.info('connected to database');
    else {
      logger.error('connection to database failed', err);
      process.exit(1);
    }
  });
};
