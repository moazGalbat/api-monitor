const mongoose = require('mongoose');

const { dbUrl } = require('../config');

module.exports = () => {
  mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }, (err) => {
    if (!err) console.log('connected to database');
    else {
      console.log('connection to database failed', err);
      process.exit(1);
    }
  });
};
