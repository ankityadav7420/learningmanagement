// Single helper to standardize all API responses
// Always returns: { success, message, data, error }
// - For success=true, set data and usually leave error null
// - For success=false, set message + error, data is usually null

exports.sendJsonResponse = (
  res,
  statusCode,
  success,
  message,
  data = null,
  error = null
) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
    error: error?.message || error || null
  });
};

