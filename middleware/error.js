module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  if (statusCode >= 500) {
    res.status(statusCode).json({
      message: 'INTERNAL SERVER ERROR',
      type: 'INTERNAL SERVER ERROR',
    });
  } else {
    res.status(statusCode).json({
      message: err.message,
      type: err.type,
      details: err.details,
    });
  }
};
