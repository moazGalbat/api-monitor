const axios = require('axios');
const { sendMail } = require('../mail/nodmaile');
const { logger } = require('../logger/logger');

const sendToWebhook = ({ url, data }) => axios.post(url, { ...data })
  .then((res) => logger.info(`sent to webhook: ${url}`))
  .catch((err) => logger.error(`webhook error: ${err}`));

const notificationMeans = {
  mail: sendMail,
  webhook: sendToWebhook,
};

module.exports = notificationMeans;
