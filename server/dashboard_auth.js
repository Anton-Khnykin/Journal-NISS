import authorize from './methods/auth';
import { ROLES } from 'middleware/enums';

function dashboardAuth(server) {
  server.get('/dashboard', (req, res) => {
    let path = '/';
    if (req.isAuthenticated()) {
      const roles = req.user.roles;
      if (roles.includes(ROLES.AUTHOR)) {
        path = '/dashboard/my-submissions';
      }
      else if (roles.includes(ROLES.SECRETARY)) {
        path = '/dashboard/submissions';
      }
      else if (roles.includes(ROLES.REVIEWER)) {
        path = '/dashboard/reviews';
      }
      else if (roles.includes(ROLES.EDITORIAL_BOARD_MEMBER)) {
        path = '/dashboard/board-issues';
      }
      else if (roles.includes(ROLES.EDITOR)) {
        path = '/dashboard/editor-issues';
      }
      else if (roles.includes(ROLES.ADMIN)) {
        path = '/dashboard/users';
      }
    }

    res.redirect(302, path);
  });
  
  server.use('/dashboard/my-submissions', authorize(ROLES.AUTHOR));
  server.use('/dashboard/submissions', authorize(ROLES.SECRETARY));
  server.use('/dashboard/issues', authorize(ROLES.SECRETARY));
  server.use('/dashboard/templates', authorize(ROLES.SECRETARY));
  server.use('/dashboard/reviews', authorize(ROLES.REVIEWER));
  server.use('/dashboard/board-issues', authorize(ROLES.EDITORIAL_BOARD_MEMBER));
  server.use('/dashboard/editor-issues', authorize(ROLES.EDITOR));
  server.use('/dashboard/users', authorize(ROLES.ADMIN)); 
  server.use('/dashboard/account', authorize());
  server.use('/dashboard/settings', authorize());
}

module.exports = dashboardAuth;
