const { getSession, cookieSesion } = require('../lib/auth');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const s = getSession(req);
    res.status(200).json({ authenticated: !!s });
    return;
  }
  if (req.method === 'POST') {
    const esperado = process.env.APP_PASSWORD;
    if (!esperado) { res.status(500).json({ error: 'Falta APP_PASSWORD en el servidor.' }); return; }
    const body = req.body || {};
    const pass = typeof body === 'string' ? JSON.parse(body || '{}').password : body.password;
    if (pass && pass === esperado) {
      res.setHeader('Set-Cookie', cookieSesion({ rol: 'equipo' }));
      res.status(200).json({ ok: true });
    } else {
      res.status(401).json({ error: 'Contraseña incorrecta.' });
    }
    return;
  }
  res.status(405).json({ error: 'Método no permitido' });
};
