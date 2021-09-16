const { describe } = require('@jest/globals');
const { checkForThreshold } = require('../helpers/helpersDependancies');

describe('test checkForThreshold', () => {
  test('should return true if checkInstance.threshold === 1', async () => {
    const checkInstance = {};
    checkInstance.threshold = 1;
    expect(await checkForThreshold(checkInstance)).toBe(true);
  });

  test('should return true if checkInstance.threshold === checkInstance.alerts', async () => {
    const checkInstance = {};
    checkInstance.threshold = 2;
    checkInstance.alerts = 2;
    checkInstance.save = jest.fn();
    expect(await checkForThreshold(checkInstance)).toBe(true);
  });

  test('should return false if checkInstance.threshold !== checkInstance.alerts', async () => {
    const checkInstance = {};
    checkInstance.threshold = 2;
    checkInstance.alerts = 1;
    checkInstance.save = jest.fn();
    expect(await checkForThreshold(checkInstance)).toBe(false);
  });
});
