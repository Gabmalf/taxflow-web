/**
 * SQL Server connection pool — module-level singleton.
 * On Lambda warm invocations the pool is reused; cold starts create it fresh.
 * Credentials are pulled from AWS Secrets Manager (never plain env vars in prod).
 */
const sql = require('mssql');
const { getSecret } = require('../utils/secrets');

let pool = null;

async function buildConfig() {
  const secret = await getSecret(process.env.DB_SECRET_ARN);

  return {
    server: secret.host,
    database: secret.dbname,
    user: secret.username,
    password: secret.password,
    port: parseInt(secret.port || '1433', 10),
    options: {
      encrypt: true,               // required for AWS RDS SQL Server
      trustServerCertificate: false,
      enableArithAbort: true,
    },
    pool: {
      max: 10,
      min: 2,
      idleTimeoutMillis: 30_000,
      acquireTimeoutMillis: 15_000,
    },
    requestTimeout: 15_000,
    connectionTimeout: 15_000,
  };
}

/**
 * Returns the shared pool, creating it on first call.
 * Safe to call on every invocation — subsequent calls are no-ops.
 */
async function getPool() {
  if (pool && pool.connected) return pool;

  const config = await buildConfig();
  pool = await new sql.ConnectionPool(config).connect();

  pool.on('error', (err) => {
    console.error('[DB] Pool error, resetting:', err.message);
    pool = null; // force reconnect on next invocation
  });

  return pool;
}

module.exports = { getPool, sql };
