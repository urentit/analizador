const { cookieBorrar } = require('../lib/auth');

module.exports = async (req, res) => {
  res.setHeader('Set-Cookie', cookieBorrar());
  res.status(200).json({ ok: true });
};
