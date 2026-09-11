const { requireAuth } = require('../../lib/auth');
const db = require('../../lib/db');

module.exports = async (req, res) => {
  if (!requireAuth(req, res)) return;
  const id = req.query.id;
  try {
    if (req.method === 'GET') {
      const e = await db.getExpediente(id);
      if (!e) { res.status(404).json({ error: 'Expediente no encontrado.' }); return; }
      res.status(200).json(e);
      return;
    }
    if (req.method === 'PUT') {
      const e = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      e.id = id;
      const saved = await db.upsertExpediente(e);
      res.status(200).json(saved);
      return;
    }
    if (req.method === 'DELETE') {
      await db.deleteExpediente(id);
      res.status(200).json({ ok: true });
      return;
    }
    res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
