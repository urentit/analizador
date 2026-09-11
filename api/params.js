const { requireAuth } = require('../lib/auth');
const db = require('../lib/db');
const { PARAMS_DEFAULT } = require('../lib/prompt');

module.exports = async (req, res) => {
  if (!requireAuth(req, res)) return;
  try {
    if (req.method === 'GET') {
      let p = await db.getParams();
      if (!p) p = PARAMS_DEFAULT;
      res.status(200).json(p);
      return;
    }
    if (req.method === 'PUT' || req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const saved = await db.saveParams(body);
      res.status(200).json(saved);
      return;
    }
    res.status(405).json({ error: 'Método no permitido' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
