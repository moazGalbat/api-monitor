const CustomError = require('./CustomError');

const LOGIN_ERR = new CustomError(
  {
    statusCode: 401,
    code: 'LOGIN_FAILED',
    message: 'Invalid credentials',
  },
);

const SERVER_ERR = new CustomError(
  {
    statusCode: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
  },
);

const NOT_FOUND_ERR = (resource) => new CustomError(
  {
    statusCode: 404,
    code: 'NOT_FOUND',
    message: `${resource} Not Found`,
  },
);

module.exports = {
  SERVER_ERR,
  LOGIN_ERR,
  NOT_FOUND_ERR,
};
