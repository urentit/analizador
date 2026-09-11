const { requireAuth } = require('../../lib/auth');
const db = require('../../lib/db');

module.exports = async (req, res) => {
  if (!requireAuth(req, res)) return;
  try {
    if (req.method === 'GET') {
      const lista = await db.listExpedientes();
      res.status(200).json(lista);
      return;
    }
    if (req.method === 'POST') {
      const e = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      if (!e.id) { res.status(400).json({ error: 'Falta el folio (id) del expediente.' }); return; }
      const saved = await db.upsertExpediente(e);
      res.status(200).json(saved);
      return;
    }
    res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
