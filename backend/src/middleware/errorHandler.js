// src/middleware/errorHandler.js

export function errorHandler(err, req, res, next) {
  // Customize error response structure if needed
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  // Optionally log error here
  res.status(status).json({ error: message });
}
