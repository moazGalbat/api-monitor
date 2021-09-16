const {
  describe, expect, beforeAll, afterAll, beforeEach,
} = require('@jest/globals');
const { shouldSendNotification, getUrlFromCheck } = require('../helpers/checkHelpers');
const helpers2 = require('../helpers/helpersDependancies');

jest.mock('../helpers/helpers2', () => ({
  checkForThreshold: jest.fn(),
}));

describe('shouldSendNotification function testing', () => {
  test('should return true if current status is down and new status is up', async () => {
    const checkInstance = {};
    checkInstance.currentStatus = 'down';
    const newStatus = 'up';
    expect(await shouldSendNotification(checkInstance, newStatus)).toBe(true);
  });

  test('should return false if current status is up and new status is up', async () => {
    const checkInstance = {};
    checkInstance.currentStatus = 'up';
    const newStatus = 'up';
    expect(await shouldSendNotification(checkInstance, newStatus)).toBe(false);
  });

  test('should call checkForThreshold if current status is down and new status is down', async () => {
    const checkInstance = {};
    checkInstance.currentStatus = 'down';
    const newStatus = 'down';
    await shouldSendNotification(checkInstance, newStatus);
    expect(helpers2.checkForThreshold).toHaveBeenCalled();
  });

  test('should call checkForThreshold if current status is up and new status is down', () => {
    const checkInstance = {};
    checkInstance.currentStatus = 'up';
    const newStatus = 'down';
    shouldSendNotification(checkInstance, newStatus);
    expect(helpers2.checkForThreshold).toHaveBeenCalledWith(checkInstance);
  });
});

describe('testing getUrlFromCheck', () => {
  test('should return right url from check instance', () => {
    const checkInstance = {
      url: 'moaz.net',
      protocol: 'https',
      port: 1234,
      path: '/galbat',
    };
    expect(getUrlFromCheck(checkInstance)).toBe('https://moaz.net:1234/galbat');
  });
});
