// middleware/errorHandler.js
function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const errorType = err.type || 'Internal Server Error';

  console.error(`[${errorType}] ${err.message}`);

  res.status(statusCode).json({
    timestamp: new Date().toISOString(),
    status: statusCode,
    error: errorType,
    message: err.message
  });
}

module.exports = errorHandler;
