// Autenticación por cookie firmada (HMAC). Sin dependencias externas.
const crypto = require('crypto');

const COOKIE = 'urit_sesion';
const DIAS = 7;

function secret() {
  return process.env.AUTH_SECRET || 'cambia-esto-en-produccion';
}

function sign(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const h = crypto.createHmac('sha256', secret()).update(data).digest('base64url');
  return data + '.' + h;
}

function verify(token) {
  if (!token || token.indexOf('.') < 0) return null;
  const [data, h] = token.split('.');
  const h2 = crypto.createHmac('sha256', secret()).update(data).digest('base64url');
  const a = Buffer.from(h), b = Buffer.from(h2);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(data, 'base64url').toString());
    if (p.exp && Date.now() > p.exp) return null;
    return p;
  } catch { return null; }
}

function parseCookies(req) {
  const h = req.headers.cookie || '';
  const o = {};
  h.split(';').forEach(p => {
    const i = p.indexOf('=');
    if (i > 0) o[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return o;
}

function cookieSesion(payload) {
  const token = sign({ ...payload, exp: Date.now() + DIAS * 86400000 });
  return `${COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${DIAS * 86400}; SameSite=Lax; Secure`;
}
function cookieBorrar() {
  return `${COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure`;
}

function getSession(req) {
  return verify(parseCookies(req)[COOKIE]);
}

// Devuelve la sesión o responde 401 y devuelve null.
function requireAuth(req, res) {
  const s = getSession(req);
  if (!s) { res.status(401).json({ error: 'No autorizado. Inicia sesión.' }); return null; }
  return s;
}

module.exports = { COOKIE, sign, verify, parseCookies, cookieSesion, cookieBorrar, getSession, requireAuth };
