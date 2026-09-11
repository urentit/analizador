// Capa de datos sobre Vercel Postgres (Neon). Expedientes y parámetros como JSONB.
const { sql } = require('@vercel/postgres');

let inited = false;
async function ensure() {
  if (inited) return;
  await sql`CREATE TABLE IF NOT EXISTS expedientes (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS config (
    id INT PRIMARY KEY,
    data JSONB NOT NULL
  )`;
  inited = true;
}

async function listExpedientes() {
  await ensure();
  const { rows } = await sql`SELECT data FROM expedientes ORDER BY created_at DESC`;
  return rows.map(r => r.data);
}

async function getExpediente(id) {
  await ensure();
  const { rows } = await sql`SELECT data FROM expedientes WHERE id = ${id}`;
  return rows[0] ? rows[0].data : null;
}

async function upsertExpediente(e) {
  await ensure();
  await sql`INSERT INTO expedientes (id, data) VALUES (${e.id}, ${JSON.stringify(e)}::jsonb)
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`;
  return e;
}

async function deleteExpediente(id) {
  await ensure();
  await sql`DELETE FROM expedientes WHERE id = ${id}`;
}

async function getParams() {
  await ensure();
  const { rows } = await sql`SELECT data FROM config WHERE id = 1`;
  return rows[0] ? rows[0].data : null;
}

async function saveParams(p) {
  await ensure();
  await sql`INSERT INTO config (id, data) VALUES (1, ${JSON.stringify(p)}::jsonb)
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`;
  return p;
}

module.exports = { ensure, listExpedientes, getExpediente, upsertExpediente, deleteExpediente, getParams, saveParams };
