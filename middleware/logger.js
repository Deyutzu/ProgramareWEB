// Middleware de logging: METHOD URL - user: <username|anonim>
function logger(req, res, next) {
  const user = req.session && req.session.user
    ? req.session.user.username
    : 'anonim';
  const timestamp = new Date().toLocaleTimeString('ro-RO');
  console.log(`[${timestamp}] ${req.method} ${req.url} - user: ${user}`);
  next();
}

module.exports = logger;
