const { requireAuth } = require('../lib/auth');
const db = require('../lib/db');
const { PARAMS_DEFAULT, buildSystemPrompt, buildUserText } = require('../lib/prompt');
const { analizar } = require('../lib/ia');

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Método no permitido' }); return; }
  if (!requireAuth(req, res)) return;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const archivos = body.archivos || [];
    if (!archivos.length) { res.status(400).json({ error: 'No hay archivos para analizar.' }); return; }

    let params = null;
    try { params = await db.getParams(); } catch (e) { /* si aún no hay DB, usar defaults */ }
    if (!params) params = PARAMS_DEFAULT;

    const systemPrompt = buildSystemPrompt(params);
    const userText = buildUserText(body);
    const result = await analizar(archivos, systemPrompt, userText);
    res.status(200).json(result); // { texto, truncado }
  } catch (e) {
    res.status(502).json({ error: e.message || 'Error al analizar con IA.' });
  }
};
