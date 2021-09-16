const MAILER_CONFIG = JSON.parse(process.env.MAILER_CONFIG || '{}');

const config = {
  port: process.env.PORT || '3030',
  dbUrl: process.env.MONGO_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  mailUsername: MAILER_CONFIG.username,
  mailPassword: MAILER_CONFIG.password,
};

module.exports = config;
