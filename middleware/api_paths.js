const ADMIN_BASE_PATH = '/api/admin';
const ADMIN_USERS = '/users';
const ADMIN_USER = '/user/:slug';
const ADMIN_NEW_USER = '/user';

const AUTHOR_BASE_PATH = '/api/author';
const AUTHOR_SUBMISSIONS = '/submissions';
const AUTHOR_SUBMISSIONS_ARCHIVED = '/submissions/archived';
const AUTHOR_SUBMISSION = '/submission/:slug';
const AUTHOR_NEW_SUBMISSION = '/submission';

const SECRETARY_BASE_PATH = '/api/secretary';
const SECRETARY_SUBMISSIONS = '/submissions';
const SECRETARY_RECOMMENDED_SUBMISSIONS = '/submissions/recommended';
const SECRETARY_SUBMISSIONS_ARCHIVED = '/submissions/archived';
const SECRETARY_SUBMISSION = '/submission/:slug';
const SECRETARY_SUBMISSION_REVIEWS = '/submission/:slug/reviews';
const SECRETARY_REVIEW = '/review/:slug';
const SECRETARY_REVIEWERS = '/submission/:slug/reviewers';
const SECRETARY_ISSUES = '/issues';
const SECRETARY_ISSUE = '/issue/:slug';
const SECRETARY_ISSUE_PUBLISHED = '/issue/:slug/published';
const SECRETARY_ISSUE_DATA = '/issue/:slug/data';
const SECRETARY_NEW_ISSUE = '/issue';
const SECRETARY_VOLUMES = '/volumes';
const SECRETARY_NEW_VOLUME = '/volume';
const SECRETARY_VOLUME = '/volume/:slug';
const SECRETARY_TEMPLATES = '/templates';
const SECRETARY_TEMPLATE = '/template/:slug';
const SECRETARY_NEW_TEMPLATE = '/template';

const REVIEWER_BASE_PATH = '/api/reviewer';
const REVIEWER_REVIEWS = '/reviews';
const REVIEWER_REVIEWS_ARCHIVED = '/reviews/archived';
const REVIEWER_REVIEW = '/review/:slug';
const REVIEWER_REVIEW_FORMED = '/review/:slug/formed';
const REVIEWER_TEMPLATES = '/templates';

const EDITORIAL_BOARD_MEMBER_BASE_PATH = '/api/board';
const EDITORIAL_BOARD_MEMBER_ISSUES = '/issues';
const EDITORIAL_BOARD_MEMBER_ISSUE = '/issue/:slug';

const EDITOR_BASE_PATH = '/api/editor';
const EDITOR_ISSUES = '/issues';
const EDITOR_ISSUE = '/issue/:slug';

const PUBLIC_BASE_PATH = '/api/public';
const PUBLIC_ISSUES = '/issues';
const PUBLIC_ISSUE = '/issue/:slug';
const PUBLIC_CURRENT_ISSUE = '/issue/current';
const PUBLIC_ARTICLE = '/article/:slug';
const PUBLIC_LOGOUT = '/logout';
const PUBLIC_REGISTRATION = '/registration';
const PUBLIC_LOGIN = '/login';
const PUBLIC_SEARCH = '/search';
const PUBLIC_FILE = '/file/:slug';
const PUBLIC_FILE_PREVIEW = '/file/:slug/preview';                          // ?????????

const ACCOUNT_BASE_PATH = '/api/account';
const ACCOUNT = '/';
const ACCOUNT_CREDENTIALS = '/credentials';
const ACCOUNT_EMAIL = '/email';
const ACCOUNT_PASSWORD = '/password';
const ACCOUNT_SETTINGS = '/settings';

const COMMON_BASE_PATH = '/api/common';
const COMMON_MESSAGES = '/submission/:slug/messages';
const COMMON_MESSAGE = '/submission/:slug/message';
const COMMON_SUBMISSION_HISTORY = '/submission/:slug/history';

module.exports = {
  ADMIN_BASE_PATH,
  ADMIN_USERS,
  ADMIN_USER,
  ADMIN_NEW_USER,

  AUTHOR_BASE_PATH,
  AUTHOR_SUBMISSIONS,
  AUTHOR_SUBMISSIONS_ARCHIVED,
  AUTHOR_SUBMISSION,
  AUTHOR_NEW_SUBMISSION,

  SECRETARY_BASE_PATH,
  SECRETARY_SUBMISSIONS,
  SECRETARY_RECOMMENDED_SUBMISSIONS,
  SECRETARY_SUBMISSIONS_ARCHIVED,
  SECRETARY_SUBMISSION,
  SECRETARY_REVIEWERS,
  SECRETARY_SUBMISSION_REVIEWS,
  SECRETARY_REVIEW,
  SECRETARY_ISSUES,
  SECRETARY_ISSUE,
  SECRETARY_ISSUE_PUBLISHED,
  SECRETARY_ISSUE_DATA,
  SECRETARY_NEW_ISSUE,
  SECRETARY_VOLUMES,
  SECRETARY_NEW_VOLUME,
  SECRETARY_VOLUME,
  SECRETARY_TEMPLATES,
  SECRETARY_TEMPLATE,
  SECRETARY_NEW_TEMPLATE,
  
  REVIEWER_BASE_PATH,
  REVIEWER_REVIEWS,
  REVIEWER_REVIEWS_ARCHIVED,
  REVIEWER_REVIEW,
  REVIEWER_REVIEW_FORMED,
  REVIEWER_TEMPLATES,

  EDITORIAL_BOARD_MEMBER_BASE_PATH,
  EDITORIAL_BOARD_MEMBER_ISSUES,
  EDITORIAL_BOARD_MEMBER_ISSUE,

  EDITOR_BASE_PATH,
  EDITOR_ISSUES,
  EDITOR_ISSUE,

  PUBLIC_BASE_PATH,
  PUBLIC_ISSUES,
  PUBLIC_ISSUE,
  PUBLIC_CURRENT_ISSUE,
  PUBLIC_ARTICLE,
  PUBLIC_LOGOUT,
  PUBLIC_REGISTRATION,
  PUBLIC_LOGIN,
  PUBLIC_SEARCH,
  PUBLIC_FILE,
  PUBLIC_FILE_PREVIEW,

  ACCOUNT_BASE_PATH,
  ACCOUNT,
  ACCOUNT_CREDENTIALS,
  ACCOUNT_EMAIL,
  ACCOUNT_PASSWORD,
  ACCOUNT_SETTINGS,

  COMMON_BASE_PATH,
  COMMON_MESSAGES,
  COMMON_MESSAGE,
  COMMON_SUBMISSION_HISTORY
};
