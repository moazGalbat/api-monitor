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

module.exports = {
  checkForThreshold,
};
