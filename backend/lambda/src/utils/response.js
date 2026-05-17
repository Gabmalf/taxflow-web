/**
 * Standard envelope for every API Gateway response.
 *
 * Success:  { status: 'success', data: <payload>,  error: null,    meta?: {...} }
 * Error:    { status: 'error',   data: null,        error: { code, message } }
 */

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
};

/**
 * @param {number}  statusCode  HTTP status code
 * @param {*}       data        Payload to return (null on error)
 * @param {object}  [meta]      Optional pagination / summary metadata
 */
function success(statusCode = 200, data, meta) {
  const body = { status: 'success', data, error: null };
  if (meta) body.meta = meta;

  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

/**
 * @param {number} statusCode  HTTP status code (4xx / 5xx)
 * @param {string} code        Machine-readable error code (e.g. 'NOT_FOUND')
 * @param {string} message     Human-readable description
 */
function error(statusCode = 500, code = 'INTERNAL_ERROR', message = 'An unexpected error occurred') {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      status: 'error',
      data: null,
      error: { code, message },
    }),
  };
}

/** Shorthand helpers for the most common cases */
const ok          = (data, meta)   => success(200, data, meta);
const created     = (data)         => success(201, data);
const noContent   = ()             => success(204, null);
const badRequest  = (msg)          => error(400, 'BAD_REQUEST', msg);
const unauthorized = (msg)         => error(401, 'UNAUTHORIZED', msg ?? 'Authentication required');
const forbidden   = (msg)          => error(403, 'FORBIDDEN', msg ?? 'Access denied');
const notFound    = (resource)     => error(404, 'NOT_FOUND', `${resource} not found`);
const conflict    = (msg)          => error(409, 'CONFLICT', msg);
const serverError = (msg)          => error(500, 'INTERNAL_ERROR', msg ?? 'An unexpected error occurred');

module.exports = { success, error, ok, created, noContent, badRequest, unauthorized, forbidden, notFound, conflict, serverError };
