class Enum {
  constructor(enumObj) {
    const handler = {
      get(target, name) {
        if (typeof target[name] != 'undefined') {
          return target[name];
        }
        throw new Error(`${name} не существует`);
      },
      set() {
        throw new Error('Невозможно изменить Enum объект, когда он уже был определён');
      }
    };

    return new Proxy(enumObj, handler);
  }
}

const ROLES = new Enum ({
  ADMIN: 1,
  AUTHOR: 2,
  SECRETARY: 3,
  EDITOR: 4,
  REVIEWER: 5,
  EDITORIAL_BOARD_MEMBER: 6
});

const ISSUE_STATUS = new Enum({
  CREATED: 1,
  CONSIDERATION_EDITORIAL_BOARD: 2,
  REJECTED_EDITORIAL_BOARD: 3,
  ACCEPTED_EDITORIAL_BOARD: 4,
  CONSIDERATION_EDITOR: 5,
  REJECTED_EDITOR: 6,
  ACCEPTED_EDITOR: 7,
  IN_DEVELOPMENT: 8,
  PUBLISHED: 9,
  PUBLISHED_ON_SITE: true
});

const REVIEW_STATUS = new Enum({
  PENDING: 1,
  ACCEPTED: 2,
  REJECTED: 3,
  REVIEW_SENT: 4,
  SENT_TO_AUTHOR: 5
});

const SUBMISSION_STATUS = new Enum({
  UNDER_CONSIDERATION: 1,
  UNDER_REVIEWING: 2,
  UNDER_REVISION: 3,
  RECOMMENDED_FOR_PUBLISHING: 4,
  ACCEPTED_IN_CURRENT_ISSUE: 5,
  PUBLISHED: 6,
  REJECTED: 7
});

const SUBMISSION_RECOMMENDATION = new Enum({
  ACCEPT: 1,
  REJECT: 2,
  SEND_FOR_REVISION_WITHOUT_REVIEWING: 3,
  SEND_FOR_REVISION_WITH_REVIEWING: 4
});

const FILE_TYPE = new Enum({
  ARTICLE: 1,
  OPEN_PUBLICATION_CONCLUSION: 2,
  IDENTIFICATION_CONCLUSION: 3,
  EXPERT_CONCLUSION: 4,
  OTHER: 5
});

const LANGUAGE = new Enum({
  RUSSIAN: 1,
  ENGLISH: 2
});

const SUBSCRIPTION = new Enum({
  NEW_ISSUES: 1,
  AUTHOR_SECRETARY_SUBMISSION_STATUS_CHANGE: 2,
  AUTHOR_SECRETARY_NEW_SUBMISSION_MESSAGE: 3,
  SECRETARY_NEW_ISSUE_STATUS: 4,
  SECRETARY_NEW_SUBMISSION: 5,
  SECRETARY_REVIEW_STATUS_CHANGE: 6,
  REVIEWER_NEW_REVIEW: 7,
  EDITOR_EBM_NEW_ISSUE: 8,
});

module.exports = {
  ROLES,
  ISSUE_STATUS,
  REVIEW_STATUS,
  SUBMISSION_STATUS,
  SUBMISSION_RECOMMENDATION,
  FILE_TYPE,
  LANGUAGE,
  SUBSCRIPTION
};
