module.exports = (app, passport) => {
  app.get('/login/google', passport.authenticate('google',
    { scope: ['email', 'profile'] }
  ));

  app.get('/login/google/callback',
    passport.authenticate('google', { failureRedirect: '/?fail=google' }),
    (req, res) => {
      try {
        const { returnTo } = JSON.parse(req.query.state);
        if (typeof(returnTo) === 'string' && returnTo.startsWith('/')) {
          return res.redirect(returnTo);
        }
      } catch {
        // Редиректим ниже
      }
      res.redirect('/');
    },
  );

  app.get('/login/facebook', passport.authenticate('facebook',
    { scope: ['email'] }
  ));

  app.get('/login/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/?fail=facebook' }),
    (req, res) => {
      try {
        const { returnTo } = JSON.parse(req.query.state);
        if (typeof(returnTo) === 'string' && returnTo.startsWith('/')) {
          return res.redirect(returnTo);
        }
      } catch {
        // Редиректим ниже
      }
      res.redirect('/');
    }
  );
}
