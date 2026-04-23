// Middleware de autentificare — protejează rutele private
function requireLogin(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  // Salvăm URL-ul dorit pentru redirect după login
  req.session.redirectTo = req.originalUrl;
  res.redirect('/login');
}

module.exports = requireLogin;
