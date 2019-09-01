// Middleware для проверки роли пользователя
function authorize(...roles) {
  return async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect(302, '/?unauthorized=true');
      }

      const user = req.user;

      if (roles.length === 0) {
        return next();
      }

      if (user.roles.some(role => roles.includes(role))) {
        return next();
      }

      res.redirect(302, '/');
    }
    catch (err) {
      res.status(500).send({ message: 'Ошибка на сервере' });
    }
  }
}

export default authorize;
