const Check = require('../models/Check');
const { checkHandler, getReportBy } = require('../helpers/checkHelpers');
const { NOT_FOUND_ERR } = require('../helpers/commonErrors');
const { checkSchema } = require('../schemas/checkSchema');
const CustomError = require('../helpers/CustomError');
const { logger } = require('../logger/logger');

const createCheck = async (req, res, next) => {
  try {
    const { value, error } = checkSchema.validate(req.body);
    if (error) throw new CustomError({ statusCode: 422, code: 'VALIDATION_ERROR', details: error });
    const { _id: userId } = req.user;
    const check = await Check.create({
      ...value,
      userId,
    });
    checkHandler(check._id);
    const handlerInterval = setInterval(checkHandler, check.interval * 60 * 1000, check._id);
    check.intervalId = handlerInterval;
    await check.save();

    logger.info(`new check creation: ${check}`);

    res.json({ message: 'Check created and monitoring started', checkId: check._id });
  } catch (error) {
    next(error);
  }
};

const getChecks = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const checks = await Check.find({ userId }, 'name url protocol path port webhook timout interval threshold authentication httpHeaders assert tags ignoreSSL isStopped').exec();
    res.status(200).json(checks);
  } catch (error) {
    next(error);
  }
};

const updateCheck = async (req, res, next) => {
  try {
    const { id: checkId } = req.params;
    const { _id: userId } = req.user;
    const foundCheck = await Check.findOne({ _id: checkId, userId });
    if (!foundCheck) throw NOT_FOUND_ERR;
    const { value, error } = checkSchema.validate(req.body);
    if (error) throw new CustomError({ statusCode: 422, code: 'VALIDATION_ERROR', details: error });
    const check = await Check.findOneAndUpdate({ _id: checkId }, {
      ...value,
    }, { new: true });

    clearInterval(check.intervalId);
    if (!check.isStopped) {
      checkHandler(check._id);
      const handlerInterval = setInterval(checkHandler, check.interval * 60 * 1000, check._id);
      check.intervalId = handlerInterval;
      await check.save();
    }
    res.json({ message: 'check updated' });
  } catch (error) {
    next(error);
  }
};

const deleteCheck = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { _id: userId } = req.user;
    const check = await Check.findOne({ _id: id, userId });
    if (!check) throw NOT_FOUND_ERR;
    clearInterval(check.intervalId);
    await Check.deleteOne({ _id: id });
    res.json({ message: 'deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const pauseCheck = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { _id: userId } = req.user;
    const check = await Check.findOne({ _id: id, userId });
    if (!check) throw NOT_FOUND_ERR;
    clearInterval(check.intervalId);
    check.isStopped = true;
    await check.save();
    res.json({ message: `check: ${id} paused successfully` });
  } catch (error) {
    next(error);
  }
};

const report = async (req, res, next) => {
  try {
    const { id, tag } = req.query;
    const { _id: userId } = req.user;
    const reports = await getReportBy({ id, tag, userId });
    res.json({ reports });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCheck,
  getChecks,
  updateCheck,
  deleteCheck,
  pauseCheck,
  report,
};
