const _ = require('lodash');
const UserModel = require('../models/User');
const CustomError = require('../helpers/CustomError');

module.exports = async (req, res, next) => {
  try {
    const token = _.get(req, 'headers.authorization');
    if (!token) throw new CustomError({ statusCode: 401, code: 'UNATHORIZED', message: 'Authorization header is missing' });
    const currentUser = await UserModel.getVerifiedUser(token);
    req.user = currentUser;
    next();
  } catch (err) {
    err.statusCode = 401;
    next(err);
  }
};
