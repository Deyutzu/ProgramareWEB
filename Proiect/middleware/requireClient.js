// Middleware de acces destinat exclusiv clientilor
function requireClient(req, res, next) {
  if (req.session && req.session.user) {
    if (req.session.user.role === 'client') {
      return next();
    }
    // Daca este administrator, il trimitem la dashboard admin
    return res.redirect('/pensiune');
  }

  req.session.redirectTo = req.originalUrl;
  res.redirect('/login');
}

module.exports = requireClient;
