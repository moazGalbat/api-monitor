const nodemailer = require('nodemailer');
const { mailUsername, mailPassword } = require('../config');
const { logger } = require('../logger/logger');

const transport = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: mailUsername,
    pass: mailPassword,
  },
});

const sendMail = ({
  email, subject, body,
}) => {
  transport.sendMail({
    from: mailUsername,
    to: email,
    subject,
    html: body,
    dsn: {
      id: `${email} + ${Date().now}`,
      return: 'headers',
      notify: ['failure', 'delay'],
      recipient: mailUsername,
    },
  }).catch((err) => {
    // TODO: retryLogic
    logger.error();
  });
};

module.exports = { sendMail };
