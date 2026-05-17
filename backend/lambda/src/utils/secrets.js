const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const client = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' });

// Module-level cache — valid for the lifetime of the warm container (~15 min TTL).
const cache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1_000;

async function getSecret(secretArn) {
  const cached = cache.get(secretArn);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached.value;

  const response = await client.send(new GetSecretValueCommand({ SecretId: secretArn }));
  const value = JSON.parse(response.SecretString);

  cache.set(secretArn, { value, ts: Date.now() });
  return value;
}

module.exports = { getSecret };
