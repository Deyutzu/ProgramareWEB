// Middleware de acces destinat exclusiv administratorilor
function requireAdmin(req, res, next) {
  if (req.session && req.session.user) {
    if (req.session.user.role === 'admin') {
      return next();
    }
    // Daca este client, il redirectam spre portalul de clienti
    return res.redirect('/client');
  }

  // Salvare URL
  req.session.redirectTo = req.originalUrl;
  res.redirect('/login');
}

module.exports = requireAdmin;
