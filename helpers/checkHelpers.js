const _ = require('lodash');
const https = require('https');
const mongoose = require('mongoose');
const Check = require('../models/Check');
const User = require('../models/User');
const axios = require('./axiosInstance');
const notificationMeans = require('./notificationMeans');
const { linkAvilabiltyMailBody } = require('../mail/mailTemplates');
const { logger } = require('../logger/logger');
const { checkForThreshold } = require('./helpersDependancies');

const updateCheckOnSuccess = async (checkInstance, responseTime) => Check.updateOne(
  { _id: checkInstance._id }, {
    $inc: {
      upTime: checkInstance.interval * 60,
    },
    $set: {
      currentStatus: 'up',
    },
    $push: {
      history: new Date(),
      responseTimes: responseTime,
    },
  },
);
const updateCheckOnFail = async (checkInstance, responseTime) => Check.updateOne(
  { _id: checkInstance._id }, {
    $inc: {
      alerts: 1,
      outages: 1,
      downTime: checkInstance.interval * 60,
    },
    $set: {
      currentStatus: 'down',
    },
    $push: {
      history: new Date(),
      responseTimes: responseTime,
    },
  },
);

const getReportBy = async ({ id, tag, userId }) => {
  const filter = id ? { _id: mongoose.Types.ObjectId(id) } : { tags: tag };
  return Check.aggregate([
    { $match: { ...filter, userId } },
    {
      $project: {
        name: 1,
        currentStatus: 1,
        outages: 1,
        upTime: 1,
        downTime: 1,
        history: 1,
        avgResponsetime: { $avg: '$responseTimes' },
        availability: { $multiply: [{ $divide: ['$upTime', { $add: ['$upTime', '$downTime'] }] }, 100] },
      },
    },
  ]);
};

const shouldSendNotification = async (checkInstance, newStatus) => {
  if (checkInstance.currentStatus !== newStatus) {
    return newStatus === 'up' ? true : checkForThreshold(checkInstance);
  }
  return newStatus === 'up' ? false : checkForThreshold(checkInstance);
};

const getUrlFromCheck = (checkInstance) => {
  const Url = new URL(`${checkInstance.protocol}://${checkInstance.url}`);
  Url.protocol = checkInstance.protocol || '';
  Url.pathname = checkInstance.path || '';
  Url.port = checkInstance.port;
  return Url.href;
};

const sendNotifications = async (checkInstance) => {
  const user = await User.findById(checkInstance.userId);
  logger.info(`mail should be sent: ${user.email}, status: ${checkInstance.currentStatus}`);
  notificationMeans.mail({ email: user.email, subject: 'Url Alert', body: linkAvilabiltyMailBody(checkInstance) });
  if (checkInstance.webHook) {
    logger.info(`post to webhook: ${checkInstance.webHook}, status: ${checkInstance.currentStatus}`);
    await notificationMeans.webhook({
      url: checkInstance.webHook,
      data: {
        name: checkInstance.name,
        url: getUrlFromCheck(checkInstance),
        currentStatus: checkInstance.currentStatus,
      },
    });
  }
};
const checkHandler = async (checkId) => {
  const checkInstance = await Check.findById(checkId);

  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  axios.get(getUrlFromCheck(checkInstance),
    {
      headers: checkInstance.httpHeaders,
      timeout: checkInstance.timeout * 1000,
      ...(checkInstance.ignoreSSL ? {} : { httpsAgent: agent }),
      ...(_.isEmpty(checkInstance.authentication) ? {} : {
        auth: {
          ...checkInstance.authentication,
        },
      }),
    }).then(async (response) => {
    if (_.get(checkInstance, 'assert.statusCode')) {
      if (response.status === _.get(checkInstance, 'assert.statusCode')) {
        await updateCheckOnSuccess(checkInstance, response.duration);
        logger.info(`url is up : ${checkInstance.id}, response status: ${response.status}`);
        if (await shouldSendNotification(checkInstance, 'up')) {
          sendNotifications(checkInstance);
        }
      } else {
        await updateCheckOnFail(checkInstance, response.duration);
        logger.info(`url is down : ${checkInstance.id}, response status: ${response.status}`);
        if (await shouldSendNotification(checkInstance, 'down')) {
          sendNotifications(checkInstance);
        }
      }
    } else {
      await updateCheckOnSuccess(checkInstance, response.duration);
      logger.info(`url is up : ${checkInstance.id}, response status: ${response.status}`);
      if (await shouldSendNotification(checkInstance, 'up')) {
        sendNotifications(checkInstance);
      }
    }
  }).catch(async (err) => {
    logger.error(err);
    await updateCheckOnFail(checkInstance, err.duration);
    logger.info(`url is down : ${checkInstance.id}, response status: ${err.status}`);
    if (await shouldSendNotification(checkInstance, 'down')) {
      sendNotifications(checkInstance);
    }
  });
};

const handleChecksOnServerBoot = async () => {
  try {
    const checks = await Check.find({ isStopped: false });
    checks.forEach(async (check) => {
      checkHandler(check._id);
      const handlerInterval = setInterval(checkHandler, check.interval * 60 * 1000, check._id);
      check.intervalId = handlerInterval;
      await check.save();
    });
  } catch (error) {
    logger.log(error);
  }
};

module.exports = {
  checkHandler,
  getReportBy,
  handleChecksOnServerBoot,
  getUrlFromCheck,
  shouldSendNotification,
};
