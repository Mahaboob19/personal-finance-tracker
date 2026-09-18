/**
 * Higher-order function wrapping async route handlers.
 * Catches unhandled Promise rejections and passes them to Express next() error handler,
 * eliminating repetitive try/catch boilerplate in controllers.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
