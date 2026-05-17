/**
 * Route handlers for /ingresos
 * Each function receives (event, pool) and returns an API Gateway response.
 */
'use strict';

const { sql }    = require('../db/connection');
const R          = require('../utils/response');

/** GET /ingresos — list all incomes for the authenticated user */
async function list(event, pool) {
  const usuarioId = event.requestContext.authorizer?.claims?.sub;
  if (!usuarioId) return R.unauthorized();

  const { anio, mes, tipo_ingreso_id } = event.queryStringParameters || {};

  const request = pool.request();
  request.input('usuario_id', sql.Int, parseInt(usuarioId, 10));

  let query = `
    SELECT
      i.id,
      i.monto,
      i.fecha_ingreso,
      i.descripcion,
      i.retencion_aplicada,
      ti.nombre          AS tipo_ingreso,
      tr.nombre          AS tipo_renta,
      m.codigo           AS moneda_codigo,
      m.simbolo          AS moneda_simbolo
    FROM   ingresos       i
    JOIN   tipos_ingreso  ti ON ti.id = i.tipo_ingreso_id
    JOIN   tipos_renta    tr ON tr.id = ti.tipo_renta_id
    JOIN   monedas        m  ON m.id  = i.moneda_id
    WHERE  i.usuario_id = @usuario_id
  `;

  if (anio) {
    request.input('anio', sql.Int, parseInt(anio, 10));
    query += ' AND YEAR(i.fecha_ingreso) = @anio';
  }
  if (mes) {
    request.input('mes', sql.Int, parseInt(mes, 10));
    query += ' AND MONTH(i.fecha_ingreso) = @mes';
  }
  if (tipo_ingreso_id) {
    request.input('tipo_ingreso_id', sql.Int, parseInt(tipo_ingreso_id, 10));
    query += ' AND i.tipo_ingreso_id = @tipo_ingreso_id';
  }

  query += ' ORDER BY i.fecha_ingreso DESC';

  const result = await request.query(query);
  return R.ok(result.recordset, { total: result.recordset.length });
}

/** GET /ingresos/{id} */
async function getById(event, pool) {
  const usuarioId = event.requestContext.authorizer?.claims?.sub;
  if (!usuarioId) return R.unauthorized();

  const { id } = event.pathParameters;

  const result = await pool.request()
    .input('id',          sql.Int, parseInt(id, 10))
    .input('usuario_id',  sql.Int, parseInt(usuarioId, 10))
    .query(`
      SELECT i.*, ti.nombre AS tipo_ingreso, m.codigo AS moneda_codigo
      FROM   ingresos i
      JOIN   tipos_ingreso ti ON ti.id = i.tipo_ingreso_id
      JOIN   monedas       m  ON m.id  = i.moneda_id
      WHERE  i.id = @id AND i.usuario_id = @usuario_id
    `);

  if (!result.recordset.length) return R.notFound('Ingreso');
  return R.ok(result.recordset[0]);
}

/** POST /ingresos */
async function create(event, pool) {
  const usuarioId = event.requestContext.authorizer?.claims?.sub;
  if (!usuarioId) return R.unauthorized();

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return R.badRequest('Invalid JSON body');
  }

  const { tipo_ingreso_id, moneda_id, monto, fecha_ingreso, descripcion, retencion_aplicada } = body;

  if (!tipo_ingreso_id || !moneda_id || monto == null || !fecha_ingreso) {
    return R.badRequest('Missing required fields: tipo_ingreso_id, moneda_id, monto, fecha_ingreso');
  }

  const result = await pool.request()
    .input('usuario_id',        sql.Int,          parseInt(usuarioId, 10))
    .input('tipo_ingreso_id',   sql.Int,          tipo_ingreso_id)
    .input('moneda_id',         sql.Int,          moneda_id)
    .input('monto',             sql.Decimal(12,2), monto)
    .input('fecha_ingreso',     sql.Date,         fecha_ingreso)
    .input('descripcion',       sql.VarChar(255), descripcion ?? null)
    .input('retencion_aplicada',sql.Decimal(12,2), retencion_aplicada ?? 0)
    .query(`
      INSERT INTO ingresos
        (usuario_id, tipo_ingreso_id, moneda_id, monto, fecha_ingreso, descripcion, retencion_aplicada)
      OUTPUT INSERTED.id, INSERTED.fecha_creacion
      VALUES
        (@usuario_id, @tipo_ingreso_id, @moneda_id, @monto, @fecha_ingreso, @descripcion, @retencion_aplicada)
    `);

  return R.created(result.recordset[0]);
}

/** PUT /ingresos/{id} */
async function update(event, pool) {
  const usuarioId = event.requestContext.authorizer?.claims?.sub;
  if (!usuarioId) return R.unauthorized();

  const { id } = event.pathParameters;
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return R.badRequest('Invalid JSON body');
  }

  const { monto, fecha_ingreso, descripcion, retencion_aplicada } = body;

  const result = await pool.request()
    .input('id',                sql.Int,          parseInt(id, 10))
    .input('usuario_id',        sql.Int,          parseInt(usuarioId, 10))
    .input('monto',             sql.Decimal(12,2), monto)
    .input('fecha_ingreso',     sql.Date,         fecha_ingreso)
    .input('descripcion',       sql.VarChar(255), descripcion ?? null)
    .input('retencion_aplicada',sql.Decimal(12,2), retencion_aplicada ?? 0)
    .query(`
      UPDATE ingresos
      SET    monto = @monto,
             fecha_ingreso = @fecha_ingreso,
             descripcion = @descripcion,
             retencion_aplicada = @retencion_aplicada,
             fecha_actualizacion = GETDATE()
      WHERE  id = @id AND usuario_id = @usuario_id
    `);

  if (result.rowsAffected[0] === 0) return R.notFound('Ingreso');
  return R.ok({ updated: true });
}

/** DELETE /ingresos/{id} */
async function remove(event, pool) {
  const usuarioId = event.requestContext.authorizer?.claims?.sub;
  if (!usuarioId) return R.unauthorized();

  const { id } = event.pathParameters;

  const result = await pool.request()
    .input('id',         sql.Int, parseInt(id, 10))
    .input('usuario_id', sql.Int, parseInt(usuarioId, 10))
    .query(`DELETE FROM ingresos WHERE id = @id AND usuario_id = @usuario_id`);

  if (result.rowsAffected[0] === 0) return R.notFound('Ingreso');
  return R.noContent();
}

module.exports = { list, getById, create, update, remove };
