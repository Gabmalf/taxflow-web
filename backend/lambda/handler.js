/**
 * TAXFLOW — Generic Lambda Handler
 *
 * Single entry point for API Gateway (HTTP API or REST API).
 * Routes are dispatched by METHOD + resource path.
 *
 * Pattern: POST /ingresos  →  routes/ingresos.create(event, pool)
 *
 * Add a new resource by:
 *  1. Create backend/lambda/src/routes/<resource>.js
 *  2. Register it in the ROUTES map below.
 */

'use strict';

const { getPool } = require('./src/db/connection');
const R = require('./src/utils/response');

// ── Route registry ───────────────────────────────────────────────────────────
// Key format: "<METHOD> <resourcePath>"
// resourcePath matches API Gateway event.resource (e.g. "/ingresos/{id}")
const ROUTES = {
  // ── Ingresos ────────────────────────────────────────────────────────────
  'GET /ingresos':         () => require('./src/routes/ingresos').list,
  'GET /ingresos/{id}':    () => require('./src/routes/ingresos').getById,
  'POST /ingresos':        () => require('./src/routes/ingresos').create,
  'PUT /ingresos/{id}':    () => require('./src/routes/ingresos').update,
  'DELETE /ingresos/{id}': () => require('./src/routes/ingresos').remove,

  // ── Gastos deducibles ───────────────────────────────────────────────────
  'GET /gastos':           () => require('./src/routes/gastos').list,
  'GET /gastos/{id}':      () => require('./src/routes/gastos').getById,
  'POST /gastos':          () => require('./src/routes/gastos').create,
  'PUT /gastos/{id}':      () => require('./src/routes/gastos').update,

  // ── Notificaciones ──────────────────────────────────────────────────────
  'GET /notificaciones':           () => require('./src/routes/notificaciones').list,
  'PATCH /notificaciones/{id}':    () => require('./src/routes/notificaciones').markRead,

  // ── Calendario SUNAT ────────────────────────────────────────────────────
  'GET /calendario':       () => require('./src/routes/calendario').list,

  // ── Normativas ──────────────────────────────────────────────────────────
  'GET /normativas':       () => require('./src/routes/normativas').list,
  'GET /normativas/{id}':  () => require('./src/routes/normativas').getById,

  // ── Catálogos ───────────────────────────────────────────────────────────
  'GET /monedas':          () => require('./src/routes/catalogos').monedas,
  'GET /tipos-ingreso':    () => require('./src/routes/catalogos').tiposIngreso,
  'GET /categorias-gasto': () => require('./src/routes/catalogos').categoriasGasto,
  'GET /tipos-comprobante':() => require('./src/routes/catalogos').tiposComprobante,
};
// ── End route registry ───────────────────────────────────────────────────────

/**
 * Main Lambda handler.
 * API Gateway wraps every request in an event object.
 */
exports.handler = async (event) => {
  // Handle CORS preflight without hitting the DB
  if (event.httpMethod === 'OPTIONS') {
    return R.ok(null);
  }

  const routeKey = `${event.httpMethod} ${event.resource}`;

  const routeFactory = ROUTES[routeKey];
  if (!routeFactory) {
    return R.notFound(`Route ${routeKey}`);
  }

  let pool;
  try {
    pool = await getPool();
  } catch (dbErr) {
    console.error('[handler] DB connection failed:', dbErr.message);
    return R.serverError('Database connection failed');
  }

  try {
    const routeFn = routeFactory(); // lazy require — avoids loading unused modules
    return await routeFn(event, pool);
  } catch (err) {
    console.error('[handler] Unhandled route error:', err);

    // Expose constraint violations as 409, everything else as 500
    if (err.number === 2627 || err.number === 547) {
      return R.conflict(err.message);
    }
    return R.serverError();
  }
};
