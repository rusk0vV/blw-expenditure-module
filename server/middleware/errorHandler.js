const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Server error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.stack || err.message
  });
};

module.exports = errorHandler;
