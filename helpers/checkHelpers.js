const _ = require('lodash');
const https = require('https');
const mongoose = require('mongoose');
const Check = require('../models/Check');
const User = require('../models/User');
const axios = require('./axiosInstance');
const notificationMeans = require('./notificationMeans');
const { linkAvilabiltyMailBody } = require('../mail/mailTemplates');

const updateCheckOnSuccess = async (checkInstance, responseTime) => Check.updateOne(
  { _id: checkInstance._id }, {
    $inc: {
      upTime: checkInstance.interval * 60,
    },
    $set: {
      currentStatus: 'up',
    },
    $push: {
      histroy: new Date(),
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
      histroy: new Date(),
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

const checkForThreshold = async (checkInstance) => {
  if (checkInstance.threshold === 1) return true;
  if (checkInstance.threshold === checkInstance.alerts) {
    checkInstance.alerts = 1;
    await checkInstance.save();
    return true;
  }
  checkInstance.alerts += 1;
  await checkInstance.save();
  return false;
};

const shouldSendNotification = async (checkInstance, newStatus) => {
  if (checkInstance.currentStatus !== newStatus) {
    return newStatus === 'up' ? true : checkForThreshold(checkInstance);
  }
  return newStatus === 'up' ? false : checkForThreshold(checkInstance);
};

const getUrlFromCheck = (checkInstance) => {
  const Url = new URL(`${checkInstance.url}`);
  Url.protocol = checkInstance.protocol;
  Url.pathname = checkInstance.path || '';
  Url.port = checkInstance.port;
  return Url.href;
};

const sendNotifications = async (checkInstance) => {
  const user = await User.findById(checkInstance.userId);
  notificationMeans.mail({ email: user.email, subject: 'Url Alert', body: linkAvilabiltyMailBody(checkInstance) });
  if (checkInstance.webhook) {
    await notificationMeans.webhook({
      url: getUrlFromCheck(checkInstance),
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
        if (await shouldSendNotification(checkInstance, 'up')) {
          sendNotifications(checkInstance);
        }
      } else {
        await updateCheckOnFail(checkInstance, response.duration);
        if (await shouldSendNotification(checkInstance, 'down')) {
          sendNotifications(checkInstance);
        }
      }
    } else {
      await updateCheckOnSuccess(checkInstance, response.duration);
      console.info(checkInstance.currentStatus, response.status);
      if (await shouldSendNotification(checkInstance, 'up')) {
        sendNotifications(checkInstance);
      }
    }
  }).catch(async (err) => {
    console.error(err);
    console.info(checkInstance.currentStatus, err.status);
    await updateCheckOnFail(checkInstance, err.duration);
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
    console.log(error);
  }
};

module.exports = {
  checkHandler,
  getReportBy,
  handleChecksOnServerBoot,
};
