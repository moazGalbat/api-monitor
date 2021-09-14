const axios = require('axios');
const { sendMail } = require('../mail/nodmaile');

const sendToWebhook = ({ url, data }) => axios.post(url, { ...data })
  .then((res) => console.info(`sent to webhook${url}`))
  .catch((err) => console.error(err));

const notificationMeans = {
  mail: sendMail,
  webhook: sendToWebhook,
};

module.exports = notificationMeans;
