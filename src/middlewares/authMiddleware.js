function requireAuth(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ erro: true, mensagem: 'Usuário não autenticado' });
  }

  return next();
}

module.exports = requireAuth;