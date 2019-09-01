import editorialBoardMemberApi from './editorial_board_member';
import authorApi      from './author';
import secretaryApi   from './secretary';
import reviewrApi     from './reviewer';
import editorApi      from './editor';
import publicApi      from './public';
import adminApi       from './admin';
import accountApi     from './account';
import commonApi      from './common';

import {  AUTHOR_BASE_PATH, 
          SECRETARY_BASE_PATH, 
          REVIEWER_BASE_PATH, 
          EDITORIAL_BOARD_MEMBER_BASE_PATH,
          EDITOR_BASE_PATH,
          PUBLIC_BASE_PATH,
          ADMIN_BASE_PATH,
          ACCOUNT_BASE_PATH,
          COMMON_BASE_PATH } from 'middleware/api_paths';
          
import authorize from '../methods/auth';
import { ROLES } from 'middleware/enums';

function api(server) {
  server.use(PUBLIC_BASE_PATH, publicApi);
  server.use(ADMIN_BASE_PATH, authorize(ROLES.ADMIN), adminApi);
  server.use(AUTHOR_BASE_PATH, authorize(ROLES.AUTHOR) ,authorApi);
  server.use(SECRETARY_BASE_PATH, authorize(ROLES.SECRETARY), secretaryApi);
  server.use(EDITOR_BASE_PATH, authorize(ROLES.EDITOR), editorApi);
  server.use(REVIEWER_BASE_PATH, authorize(ROLES.REVIEWER), reviewrApi);
  server.use(EDITORIAL_BOARD_MEMBER_BASE_PATH, authorize(ROLES.EDITORIAL_BOARD_MEMBER), editorialBoardMemberApi);
  server.use(ACCOUNT_BASE_PATH, authorize(), accountApi);
  server.use(COMMON_BASE_PATH, authorize(ROLES.SECRETARY, ROLES.AUTHOR, ROLES.REVIEWER), commonApi);
}

module.exports = api;
