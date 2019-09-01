/* eslint-disable no-console */
import express from 'express';
import next from 'next';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import passport from 'passport';

import api from './server/controllers';
import passportAuth from './server/passport';
import dashboardAuth from './server/dashboard_auth';
import thirdPartyAuth from './server/third_party_auth';

// import morgan from 'morgan';
// import enforce from 'express-sslify';

const dev       = process.env.NODE_ENV !== 'production';
const nextApp   = next({ dev });
const handle    = nextApp.getRequestHandler();
const port      = process.env.PORT || '3000';

const dynamicPages = [
  '/dashboard/submission/:slug',
  '/dashboard/issue/:slug',
  '/dashboard/editor-issue/:slug',
  '/dashboard/board-issue/:slug',
  '/dashboard/my-submission/:slug',
  '/issue/:slug',
  '/issue/article/:slug'
];

nextApp.prepare().then(() => {
  const server = express();

  if (!dev) {
    server.use(compression());
  }

  server.set('port', port);
  server.disable('x-powered-by');
  server.use(cookieParser());
  server.use(cors({ credentials: true, origin: true }));
  server.use(express.json());
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }))
  server.use(express.static(__dirname + '/server/public', { redirect : false }));
  
  //server.use(morgan('dev'));
  // server.use(enforce.HTTPS({ trustProtoHeader: true }));
  
  server.get('/_next/*', (req, res) => {
    handle(req, res);
  });

  // Обрезаем ненужную '/' и т.п.
  server.get('\\S+/$', (req, res) => {
    return res.redirect(301, req.path.slice(0, -1) + req.url.slice(req.path.length));
  });

  passportAuth(server, passport);
  api(server);
  dashboardAuth(server);
  thirdPartyAuth(server, passport);

  server.get(dynamicPages, (req, res) => {
    const actualPage = req.originalUrl.split('/').slice(0, -1).join('/');
    const queryParams = { slug: req.params.slug };
    nextApp.render(req, res, actualPage, queryParams);
  });

  server.get('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, err => {
    if (err) {
      throw err;
    }
    if (dev) {
      console.log(`> Хорошо пошло на http://localhost:${port}`);
    }
  });
})
.catch(ex => {
  console.error(ex.stack);
  process.exit(1);
});
