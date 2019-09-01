import cookieSession from 'cookie-session';
import bcrypt from 'bcrypt';
import Strategy from 'passport-local/lib';
import GoogleStrategy from 'passport-google-oauth2';
import FacebookStrategy from 'passport-facebook';
import { User, UserRole } from './models/index';
import { createUserWithThirdParty } from './methods/user';

module.exports = (app, passport) => {
  const newCookieSession = cookieSession({
    secret: process.env.PRODUCTION_SECRET || 'welp',
    resave: true,
    saveUninitialized: true
  });

  app.use(newCookieSession);
  
  // Middleware для опции "запомнить меня"
  app.use((req, res, next) => {
    if (req.body.rememberMe) {
      req.sessionOptions.maxAge = 14 * 24 * 60 * 60 * 1000;
    }
    return next();
  });

  app.use(passport.initialize());
  app.use(passport.session());

  const newLocalStrategyOptions = {
    usernameField: 'email',
    passwordField: 'password',
    session: true
  };

  const newLocalStrategy = new Strategy(
    newLocalStrategyOptions,
    async (email, password, done) => {
      try {
        const user = await User.findOne({
          attributes: [ 'user_id', 'password' ],
          where: { email: email }
        });

        if (!user) {
          return done(null, false, {
            message: 'Неверные данные'
          });
        }

        if (bcrypt.compareSync(password, user.password)) {
          return done(null, user);
        }

        return done(null, false, {
          message: 'Неверные данные'
        });
      } catch (err) {
        done(null, false, {
          message: 'Ошибка'
        });
      }
    }
  );

  passport.use(newLocalStrategy);

  passport.serializeUser((user, done) => {
    return done(null, user.user_id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findOne({
        attributes: [ 'user_id' ],
        where: { user_id: id }
      });

      if (!user) {
        return done(null, false, { message: 'Пользователь не существует' });
      }

      const userRoles = await UserRole.findAll({
        attributes: [ 'role_id' ],
        where: { user_id: user.user_id }
      });

      let rolesArr = [];
      userRoles.forEach(r => rolesArr.push(r.role_id));

      user.roles = rolesArr;

      return done(null, user);
    } catch (err) {
      return done(null, false, { message: 'Ошибка на сервере' });
    }
  });

  const newGoogleStrategyOptions = {
    clientID: process.env.PRODUCTION_GOOGLE_CLIENT_ID || process.env.DEV_GOOGLE_CLIENT_ID,
    clientSecret: process.env.PRODUCTION_GOOGLE_SECRET || process.env.DEV_GOOGLE_SECRET,
    callbackURL: process.env.PRODUCTION_GOOGLE_CALLBACK || '/login/google/callback',
    passReqToCallback: true
  };

  passport.use(new GoogleStrategy(
    newGoogleStrategyOptions,
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        if (req.user) {
          let user = await User.findOne({
            attributes: [ 'user_id', 'google_id' ],
            where: { google_id: profile.id }
          });
          
          if (user) {
            return done(null, false, {
              message: 'Аккаунт Google уже привязан к другой учетной записи'
            });
          }

          user = await User.update({
            google_id: profile.id
          }, {
            where: { user_id: req.user.user_id },
            returning: true
          });

          // Так как будучи авторизованным привязать аккаунт можно
          // Только на странице настроек, то редиректим туда
          req.query.state = JSON.stringify({ returnTo: '/dashboard/settings' });

          return done(null, user[1][0].toJSON());
        }
        else {
          let user = await User.findOne({
            attributes: [ 'user_id', 'google_id' ],
            where: { google_id: profile.id }
          });
          
          if (!user) {
            if (profile.emails) {
              user = await User.findOne({
                attributes: [ 'user_id', 'email' ],
                where: { email: profile.emails[0].value }
              });
            }
            else {
              return done(null, false, {
                message: 'Необходим доступ к адресу электронной почты Google'
              });
            }

            if (user) {
              await User.update({
                google_id: profile.id
              },{
                where: { email: profile.emails[0].value }
              });
            }
          }

          if (!user) {
            user = await createUserWithThirdParty({
              google_id: profile.id,
              email: profile.emails[0].value,
              first_name: profile.given_name,
              last_name: profile.family_name
            });

            if (!user) {
              return done(null, false, { message: 'Ошибка авторизации Google' });
            }
          }

          return done(null, user);
        }
      }
      catch (err) {
        return done(null, false, { message: 'Ошибка на сервере' });
      }
    }
  ));

  const newFacebookStrategyOptions = {
    clientID: process.env.PRODUCTION_FACEBOOK_CLIENT_ID || process.env.DEV_FACEBOOK_CLIENT_ID,
    clientSecret: process.env.PRODUCTION_FACEBOOK_SECRET || process.env.DEV_FACEBOOK_SECRET,
    callbackURL: process.env.PRODUCTION_FACEBOOK_CALLBACK || '/login/facebook/callback',
    profileFields: [ 'id', 'name', 'emails' ],
    passReqToCallback: true
  }

  passport.use(new FacebookStrategy(
    newFacebookStrategyOptions,
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        if (req.user) {
          let user = await User.findOne({
            attributes: [ 'user_id', 'facebook_id' ],
            where: { facebook_id: profile.id }
          });

          if (user) {
            return done(null, false, {
              message: 'Аккаунт Facebook уже привязан к другой учетной записи'
            });
          }

          user = await User.update({
            facebook_id: profile.id
          }, {
            where: { user_id: req.user.user_id },
            returning: true
          });

          // Так как будучи авторизованным привязать аккаунт можно
          // Только на странице настроек, то редиректим туда
          req.query.state = JSON.stringify({ returnTo: '/dashboard/settings' });

          return done(null, user[1][0].toJSON());
        }
        else {
          let user = await User.findOne({
            attributes: [ 'user_id', 'facebook_id' ],
            where: { facebook_id: profile.id }
          });

          if (!user) {
            if (profile.emails.length !== 0) {
              user = await User.findOne({
                attributes: [ 'user_id', 'email' ],
                where: { email: profile.emails[0].value }
              });
            }
            else {
              return done(null, false, {
                message: 'Необходим доступ к адресу электронной почты на Facebook'
              });
            }

            if (user) {
              await User.update({
                facebook_id: profile.id
              },{
                where: { email: profile.emails[0].value }
              });
            }
          }

          if (!user) {
            user = await createUserWithThirdParty({
              facebook_id: profile.id,
              email: profile.emails[0].value,
              first_name: profile.name.givenName,
              last_name: profile.name.familyName
            });

            if (!user) {
              return done(null, false, { message: 'Ошибка авторизации Facebook' });
            }
          }

          return done(null, user);
        }
      }
      catch (err) {
        return done(null, false, { message: 'Ошибка на сервере' });
      }
    }
  ));
};
