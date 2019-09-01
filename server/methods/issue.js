import { AuthorSubmission,
         User,
         UserRole,
         UserOrganization,
         Credentials,
         AcademicDegree,
         AcademicTitle,
         Issue,
         IssueDecision,
         IssueStatus,
         IssueSubmission,
         SubmissionKeyword,
         Keyword,
         Submission,
         SubmissionHistory,
         SubmissionFile,
         Volume } from '../models/index';
import Sequelize from 'sequelize';
import { getPlainData } from 'utils/data_parser';
import { ROLES,
         ISSUE_STATUS,
         SUBMISSION_STATUS,
         LANGUAGE,
         FILE_TYPE } from 'middleware/enums';
import { EDITORIAL_BOARD_MEMBER_BASE_PATH,
         EDITOR_BASE_PATH,
         SECRETARY_BASE_PATH } from 'middleware/api_paths';
import { isEmpty, isEmptyOrNull } from 'utils/validation';
import { createFile } from './file';
import { getSubmissionForExport } from './submission';
import JSZip from 'jszip';

const Op = Sequelize.Op;

async function checkOwnership(userId, issueId) {
  const result = await IssueDecision.findOne({
    where: {
      user_id: userId,
      issue_id: issueId
    }
  });
  return result !== null;
}

const getKeywords = submission => {
  submission.keywords_ru = [];
  submission.keywords_en = [];
  submission.submission_keywords.forEach(item => {
    if (item.keyword.language_id === LANGUAGE.RUSSIAN) {
      submission.keywords_ru.push(item.keyword.word);
    }
    else if (item.keyword.language_id === LANGUAGE.ENGLISH) {
      submission.keywords_en.push(item.keyword.word);
    }
  });
  delete submission.submission_keywords;
}

const getUrl = object => {
  let mime;
  const bytes = new Uint8Array(object);
  if (bytes[0] === 0x89 && bytes[1] === 0x50) {
    mime = 'image/png';
  }
  else if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    mime = 'image/jpeg';
  }
  else {
    mime = '';
  }
  const base64 = Buffer.from(object).toString('base64');
  const url = 'data:' + mime + ';base64,' + base64;
  return url;
}

async function getIssues(baseUrl, userId) {
  if (baseUrl === SECRETARY_BASE_PATH) {
    return await Issue.findAll({
      attributes: { 
        exclude: [ 
          'volume_id',
          'file_id',
          'issue_status_id'
        ],
        include: [
          [ 'issue_status_id', 'status' ]
        ]
      },
      include: [ 
        { 
          model: Volume,
          attributes: {
            exclude: [ 'volume_id' ] 
          }
        }
      ],
      order: [[ 'creation_date', 'DESC' ]]
    });
  }
  else if (baseUrl === EDITOR_BASE_PATH) {
    var issues = await Issue.findAll({
      attributes: [
        'issue_id',
        'number',
        'number_general',
        'creation_date',
        'publication_date',
        'issue_status_id'
      ],
      where: {
        issue_status_id: {
          [Op.gte]: ISSUE_STATUS.CONSIDERATION_EDITOR
        }
      },
      include: [ 
        { 
          model: Volume,
          attributes: {
            exclude: [ 'volume_id' ] 
          }
        }
      ],
      order: [['creation_date', 'DESC']]
    });

    if (issues.length === 0) {
      return [];
    }

    issues = getPlainData(issues);

    for (const item of issues) {
      item.status = {
        id: '',
        name: ''
      };
      if (item.issue_status_id === ISSUE_STATUS.REJECTED_EDITOR) {
        item.status.id = ISSUE_STATUS.REJECTED_EDITOR;
        item.status.name = 'Отклонено';
      }
      else if (item.issue_status_id >= ISSUE_STATUS.ACCEPTED_EDITOR) {
        item.status.id = ISSUE_STATUS.ACCEPTED_EDITOR;
        item.status.name = 'Принято';
      }
      else if (item.issue_status_id === ISSUE_STATUS.CONSIDERATION_EDITOR) {
        item.status.id = ISSUE_STATUS.CONSIDERATION_EDITOR;
        item.status.name = 'На рассмотрении';
      }
      delete item.issue_status_id;
    }

    return issues;
  }
  else if (baseUrl === EDITORIAL_BOARD_MEMBER_BASE_PATH) {
    let issues = await IssueDecision.findAll({
      attributes: [ 'is_accepted' ],
      include: [
        {
          model: Issue,
          attributes: [
            'issue_id',
            'number',
            'number_general',
            'creation_date',
            'publication_date'
          ],
          include: [
            { 
              model: Volume,
              attributes: {
                exclude: [ 'volume_id' ] 
              }
            }
          ]
        }
      ],
      where: { user_id: userId },
      order: [[ Issue, 'creation_date', 'DESC' ]],
    });

    if (issues.length === 0) {
      return [];
    }

    issues = getPlainData(issues);

    for (const item of issues) {
      item.issue.status = {
        id: '',
        name: ''
      };
      if (item.is_accepted === null) {
        item.issue.status.id = ISSUE_STATUS.CONSIDERATION_EDITORIAL_BOARD;
        item.issue.status.name = 'На рассмотрении';
      }
      else if (item.is_accepted) {
        item.issue.status.id = ISSUE_STATUS.ACCEPTED_EDITORIAL_BOARD;
        item.issue.status.name = 'Принято';
      }
      else if (!item.is_accepted) {
        item.issue.status.id = ISSUE_STATUS.REJECTED_EDITORIAL_BOARD;
        item.issue.status.name = 'Отклонено';
      }
    }
    return issues;
  }

  return [];
}

async function getIssue(issueId, baseUrl, userId) {
  let query = {
    attributes: {
      exclude: [
        'volume_id',
        'issue_status_id',
        'cover',
        'file_id'
      ],
      include: [
        [ 'file_id', 'file' ]
      ]
    },
    where: { issue_id: issueId },
    include: [
      {
        model: Volume,
        attributes: [ [ 'volume_id', 'id' ], 'number', 'year' ]
      },
      {
        model: IssueStatus,
        attributes: [
          [ 'issue_status_id', 'id' ],
          [ 'issue_status', 'name' ]
        ]
      }
    ]
  };

  if (baseUrl === SECRETARY_BASE_PATH) {
    query.include.push(
      {
        model: IssueSubmission,
        attributes: [
          'issue_submission_id',
          [ 'file_id', 'file' ]
        ],
        include: [
          {
            model: Submission,
            attributes: [
              'submission_id',
              'title_ru'
            ]
          }
        ]
      }
    );
  }
  else if (baseUrl === EDITORIAL_BOARD_MEMBER_BASE_PATH || baseUrl === EDITOR_BASE_PATH) {
    query.include.push(
      {
        model: IssueSubmission,
        attributes: [ 'issue_submission_id' ],
        include: [
          {
            model: Submission,
            attributes: {
              exclude: [
                'submission_date',
                'submission_status_id'
              ]
            },
            include: [
              {
                model: SubmissionFile,
                attributes: [ [ 'file_id', 'file' ] ],
                where: { file_type_id: FILE_TYPE.ARTICLE }
              }
            ]
          }
        ]
      }
    );
  }

  let issue = await Issue.findOne(query);
  if (isEmpty(issue)) {
    return {};
  }
  issue = getPlainData(issue);

  if (issue.issue_status.id >= ISSUE_STATUS.CONSIDERATION_EDITORIAL_BOARD) {
    issue.decisions = [];
    let decisions = await IssueDecision.findAll({
      attributes: [
        'is_accepted',
        'commentary'
      ],
      include: [
        {
          model: User,
          attributes: [ 'user_id' ],
          include: [
            {
              model: Credentials,
              attributes: [
                'first_name_ru',
                'middle_name_ru',
                'last_name_ru'
              ]
            }
          ]
        }
      ],
      where: userId ?
        {
          user_id: userId,
          issue_id: issueId
        } :
        {
          issue_id: issueId
        }
    });

    for (const item of decisions) {
      issue.decisions.push({
        is_accepted: item.is_accepted,
        commentary: item.commentary,
        ...getPlainData(item.user.credential)
      });  
    }
  }

  issue.submissions = [];

  for (const item of issue.issue_submissions) {
    if (item.submission.submission_files) {
      item.submission.file = item.submission.submission_files[0].file;
      delete item.submission.submission_files;
    }
    issue.submissions.push({
      file: item.file,
      ...item.submission
    });
  }
  delete issue.issue_submissions;

  for (const submission of issue.submissions) {
    submission.authors = [];
    const authors = await AuthorSubmission.findAll({
      include: [
        {
          model: Credentials,
          attributes: [
            'first_name_ru',
            'middle_name_ru',
            'last_name_ru'
          ]
        }
      ],
      where: { submission_id: submission.submission_id },
      order: [[ 'author_position_in_credits', 'ASC' ]]
    });
    submission.authors = authors.map(item => item.credential);
  }


  if (baseUrl === EDITOR_BASE_PATH) {
    issue.status = {};
    if (issue.issue_status.id === ISSUE_STATUS.REJECTED_EDITOR) {
      issue.status.id = ISSUE_STATUS.REJECTED_EDITOR;
      issue.status.name = 'Отклонено';
    }
    else if (issue.issue_status.id >= ISSUE_STATUS.ACCEPTED_EDITOR) {
      issue.status.id = ISSUE_STATUS.ACCEPTED_EDITOR;
      issue.status.name = 'Принято';
    }
    else if (issue.issue_status.id === ISSUE_STATUS.CONSIDERATION_EDITOR) {
      issue.status.id = ISSUE_STATUS.CONSIDERATION_EDITOR;
      issue.status.name = 'На рассмотрении';
    }
    delete issue.issue_status;
  }

  if (baseUrl === EDITORIAL_BOARD_MEMBER_BASE_PATH) {
    issue.status = {};
    if (issue.decisions[0].is_accepted === null) {
      issue.status.id = ISSUE_STATUS.CONSIDERATION_EDITORIAL_BOARD;
      issue.status.name = 'На рассмотрении';
    }
    else if (issue.decisions[0].is_accepted) {
      issue.status.id = ISSUE_STATUS.ACCEPTED_EDITORIAL_BOARD;
      issue.status.name = 'Принято';
    }
    else if (!issue.decisions[0].is_accepted) {
      issue.status.id = ISSUE_STATUS.REJECTED_EDITORIAL_BOARD;
      issue.status.name = 'Отклонено';
    }
    delete issue.issue_status;
    delete issue.decisions;
  }

  return issue;
}

async function getPublicIssues() {
  let volumes = await Volume.findAll({
    attributes: [
      'number',
      'year'
    ],
    include: [
      {
        model: Issue, 
        attributes: [
          'issue_id',
          'number',
          'number_general',
          'publication_date',
          'cover'
        ],
        where: { 
          issue_status_id: ISSUE_STATUS.PUBLISHED,
          is_published_on_site: ISSUE_STATUS.PUBLISHED_ON_SITE
        },
        order: [[ 'publication_date', 'DESC' ]]
      }
    ],
    order: [[ 'number', 'DESC' ]]
  });

  if (volumes.length === 0) {
    return [];
  }

  volumes = getPlainData(volumes);

  for (const volume of volumes) {
    for (const issue of volume.issues) {
      if (issue.cover) {
        issue.cover = getUrl(issue.cover);
      }
    }
  }

  return volumes;
}

async function getPublicIssue(isCurrent = false, issueId) {
  let query = {
    attributes: [
      'number',
      'number_general',
      'volume_id',
      'publication_date',
      ['file_id', 'file'],
      'cover'
    ],
    include: [
      {
        model: Volume,
        attributes: [
          'number',
          'year'
        ]
      },
      {
        model: IssueSubmission,
        attributes: [
          ['issue_submission_id', 'article_id'],
          'pages',
          'file_id'
        ],
        include: [
          {
            model: Submission,
            attributes: [
              'submission_id',
              'title_ru',
              'title_en'
            ]
          }
      ] }
    ],
    order: [[ 'publication_date', 'DESC' ]],
    where: isCurrent ?
      {
        issue_status_id: ISSUE_STATUS.PUBLISHED,
        is_published_on_site: ISSUE_STATUS.PUBLISHED_ON_SITE
      } :
      {
        issue_id: issueId
      }
  }

  let issue = await Issue.findOne(query);

  if (isEmpty(issue)) {
    return {};
  }
  
  issue = getPlainData(issue);

  for (const submission of issue.issue_submissions) {
    submission.authors = [];
    let authors = await AuthorSubmission.findAll({
      where: { submission_id: submission.submission.submission_id },
      attributes: [],
      include: [
        {
          model: Credentials,
          attributes: [
            'first_name_ru',
            'middle_name_ru',
            'last_name_ru',
            'first_name_en',
            'middle_name_en',
            'last_name_en'
          ],
        }
      ],
      order: [[ 'author_position_in_credits', 'ASC' ]]
    });

    authors = getPlainData(authors);
    authors.forEach(author => submission.authors.push(author.credential));
  }

  if (issue.cover) {
    issue.cover = getUrl(issue.cover);
  }

  issue.articles = [];

  for (const item of issue.issue_submissions) {
    issue.articles.push({
      article_id: item.article_id,
      pages: item.pages,
      file: item.file_id,
      title_ru: item.submission.title_ru,
      title_en: item.submission.title_en,
      authors: item.authors
    });
  }

  delete issue.issue_submissions;

  return issue;
}

async function getArticle(articleId) {
  let article = await IssueSubmission.findOne({
    attributes: [
      [ 'file_id', 'file' ],
      'pages'
    ],
    include: [
      {
        model: Submission,
        attributes: { 
          exclude: [
            'submission_date',
            'submission_status_id',
            'keywords_ru',
            'keywords_ru'
          ] 
        },
        include: [
          {
            model: SubmissionKeyword,
            include: [ Keyword ]
          }
        ]
      },
      {
        model: Issue,
        attributes: [
          'issue_id',
          'number',
          'number_general',
          'publication_date'
        ],
        include: [ 
          {
            model: Volume,
            attributes: [
              'number',
              'year'
            ]
          }
        ]
      }
    ],
    where: { issue_submission_id: articleId }
  });

  if (isEmpty(article)) {
    return {};
  }

  article = getPlainData(article);
  getKeywords(article.submission);

  article.authors = [];
  let authors = await AuthorSubmission.findAll({
    where: { submission_id: article.submission.submission_id },
    attributes: [ 'is_primary_contact' ],
    include: [
      {
        model: Credentials, 
        attributes: [
          'first_name_ru',
          'middle_name_ru',
          'last_name_ru',
          'first_name_en',
          'middle_name_en',
          'last_name_en',
          'contact_email'
        ],
        include: [
          {
            model: UserOrganization,
            as: 'organizations',
            attributes: [
              'organization_name_ru',
              'organization_name_en'
            ] 
          },
          {
            model: AcademicDegree,
            attributes: [
            'name_ru',
            'name_en'
            ]
          },
          {
            model: AcademicTitle,
            attributes: [
            'name_ru',
            'name_en'
            ]
          }
        ]
      }
    ],
    order: [[ 'author_position_in_credits', 'ASC' ]]
  });

  for (const author of authors) {
    article.authors.push({
       is_primary_contact: author.is_primary_contact,
      ...getPlainData(author.credential),
    });
  }

  return article;
}

async function createIssue(data) {
  if (isEmpty(data) || data.submissions.length === 0 ||
      isEmptyOrNull(data.volume_id.toString()) || isEmptyOrNull(data.number.toString())) {
    throw ({ 
      message: 'Пожалуйста, заполните все поля',
      status: 500
    });
  }

  let generalNumber = 1;
  const issuesCount = await Issue.findAll({
    attributes: [ [ Sequelize.fn('COUNT', Sequelize.col('number_general')), 'count' ] ],
    where: {
      [Op.or]: [ 
        { issue_status_id: ISSUE_STATUS.IN_DEVELOPMENT }, 
        { issue_status_id: ISSUE_STATUS.PUBLISHED } 
      ]
    }
  });
  generalNumber += Number(issuesCount[0].dataValues.count);

  const issue = await Issue.create({
    volume_id:            data.volume_id,
    number:               data.number,
    issue_status_id:      ISSUE_STATUS.CREATED,
    number_general:       generalNumber
  });

  for (const submission of data.submissions) {
    await IssueSubmission.create({
      issue_id:       issue.issue_id,
      submission_id:  submission
    });
  }

  return { status: 200 };
}

async function editIssue({ issue, submissions }, issueId) {
  if (!isEmpty(issue)) {
    await Issue.update(issue, {
      where: { issue_id: issueId },
      individualHooks: true
    });
  } 

  if (submissions.length !== 0) {
    for (const submission of submissions) {
      if (submission.action === 'delete') {
        await IssueSubmission.destroy({
          where: { 
            issue_id:       issueId,
            submission_id:  submission.submission_id 
          }
        });
      }
      else if (submission.action === 'create') {
        await IssueSubmission.create({
          issue_id:       issueId,
          submission_id:  submission.submission_id
        });
      }
    }
  }

  return { status: 200 };
}

async function sendIssueToEditorialBoard(issueId) {
  await Issue.update({
    issue_status_id: ISSUE_STATUS.CONSIDERATION_EDITORIAL_BOARD
  }, {
    where: { issue_id: issueId }
  });

  const editorialBoardMembers = await UserRole.findAll({
    attributes: [ 'user_id' ],
    where: { role_id: ROLES.EDITORIAL_BOARD_MEMBER }
  });

  for (const member of editorialBoardMembers) {
    await IssueDecision.create({
      issue_id:       issueId,
      user_id:        member.user_id
    });
  }

  return { status: 200 };
}

async function sendIssueToEditor(issueId) {
  await Issue.update({
    issue_status_id: ISSUE_STATUS.CONSIDERATION_EDITOR
  }, {
    where: { issue_id: issueId }
  });
  
  return { status: 200 };
}

async function publishIssueOnSite(issueId) {
  await Issue.update({
    is_published_on_site: ISSUE_STATUS.PUBLISHED_ON_SITE
  }, {
    where: { issue_id: issueId }
  });

  return { status: 200 };
}

async function unpublishIssueOnSite(issueId) {
  await Issue.update({
    is_published_on_site: !ISSUE_STATUS.PUBLISHED_ON_SITE
  }, {
    where: { issue_id: issueId },
    individualHooks: true
  });

  return { status: 200 };
}

async function deleteIssue(issueId) {
  const issue = await Issue.findOne({
    attributes: [ 'issue_status_id' ],
    where: { issue_id: issueId }
  });
  if (issue.issue_status_id !== ISSUE_STATUS.CREATED) {
    throw ({
      message: 'Выпуск не может быть удален',
      status: 500
    });
  }
  await Issue.destroy({
    where: { issue_id: issueId }
  });
  
  return { status: 200 };
}

async function acceptIssue({ user_id, roles }, issueId, data, baseUrl) {
  if (roles.includes(ROLES.EDITOR) && baseUrl === EDITOR_BASE_PATH) {
    await Issue.update({
      issue_status_id: ISSUE_STATUS.ACCEPTED_EDITOR
    }, {
      where: { issue_id: issueId }
    });

    const submissions = await IssueSubmission.findAll({
      attributes: [ 'submission_id' ],
      where: { issue_id: issueId }
    });

    for (const item of submissions) {
      await Submission.update({
        submission_status_id: SUBMISSION_STATUS.ACCEPTED_IN_CURRENT_ISSUE
      }, {
        where: { submission_id: item.submission_id }
      });
      await SubmissionHistory.create({
        submission_id: item.submission_id,
        submission_status_id: SUBMISSION_STATUS.ACCEPTED_IN_CURRENT_ISSUE
      });
    }
  } 
  else if (roles.includes(ROLES.EDITORIAL_BOARD_MEMBER) && baseUrl === EDITORIAL_BOARD_MEMBER_BASE_PATH) {
    if (!(await checkOwnership(user_id, issueId))) {
      throw ({ 
        message: 'У вас недостаточно прав на эту операцию',
        status: 403
      });
    }
    await IssueDecision.update({
      is_accepted: true,
      commentary: data.commentary
    }, {
      where: {
        issue_id: issueId,
        user_id: user_id
      }
    });
  }
  
  return { status: 200 };
}

async function rejectIssue({ user_id, roles }, issueId, data, baseUrl) {
  if (roles.includes(ROLES.EDITOR) && baseUrl === EDITOR_BASE_PATH) {
    await Issue.update({
      issue_status_id: ISSUE_STATUS.REJECTED_EDITOR
    }, {
      where: { issue_id: issueId }
    });
  }
  else if (roles.includes(ROLES.EDITORIAL_BOARD_MEMBER) && baseUrl === EDITORIAL_BOARD_MEMBER_BASE_PATH) {
    if (!(await checkOwnership(user_id, issueId))) {
      throw ({ 
        message: 'У вас недостаточно прав на эту операцию',
        status: 403
      });
    }
    await IssueDecision.update({
      is_accepted: false,
      commentary: data.commentary
    }, {
      where: {
        issue_id: issueId,
        user_id: user_id
      }
    });
  }
  
  return { status: 200 };
}

async function uploadPublishedIssue(issueId, data, issueFile, issueCover, submissionFiles) {
  const createdIssueFile = await createFile(issueFile);
  await Issue.update({
    publication_date:   data.publication_date,
    issue_status_id:    ISSUE_STATUS.PUBLISHED,
    file_id:            createdIssueFile,
    cover:              issueCover.buffer
  }, {
    where: { issue_id: issueId },
    individualHooks: true
  });

  const storeKeywords = async (submissionId, keywords, language) => {
    keywords = keywords.split(',');
    for (const word of keywords) {
      const keyword = await Keyword.findOne({
        where: Sequelize.where(
          Sequelize.fn('lower', Sequelize.col('word')),
          word.toLowerCase()
        )
      });
      if (isEmpty(keyword)) {
        const newKeyword = await Keyword.create({
          word: word,
          language_id: language
        });
        await SubmissionKeyword.create({
          submission_id: submissionId,
          keyword_id: newKeyword.keyword_id
        })
      }
      else {
        await SubmissionKeyword.create({
          submission_id: submissionId,
          keyword_id: keyword.keyword_id
        })
      }
    }
  }

  for (const file of submissionFiles) {
    const submissionId = data.pages[submissionFiles.indexOf(file)].submission_id;
    const createdFile = await createFile(file);
    await IssueSubmission.update({
      file_id: createdFile,
      pages: data.pages.find(item => item.submission_id === submissionId).pages
    }, {
      where: {
        issue_id: issueId,
        submission_id: submissionId
      }
    });
    await Submission.update({
      submission_status_id: SUBMISSION_STATUS.PUBLISHED
    }, {
      where: { submission_id: submissionId }
    });
    await SubmissionHistory.create({
      submission_id: submissionId,
      submission_status_id: SUBMISSION_STATUS.PUBLISHED
    });
    const submission = await Submission.findOne({
      attributes: [
        'keywords_ru',
        'keywords_en'
      ],
      where: { submission_id: submissionId }
    });
    storeKeywords(submissionId, submission.keywords_ru, LANGUAGE.RUSSIAN);
    storeKeywords(submissionId, submission.keywords_en, LANGUAGE.ENGLISH);
  }

  return { status: 200 };
}

async function getIssueData(issueId) {
  let issue = await Issue.findOne({
    attributes: [
      [ 'number', 'Номер' ],
      [ 'number_general', 'Сквозной номер' ]
    ],
    include: [
      {
        model: Volume,
        attributes: [
          [ 'number', 'Номер' ],
          [ 'year', 'Год' ]
        ]
      }
    ],
    where: { issue_id: issueId }
  });
  issue = getPlainData(issue);

  let issueSubmissions = await IssueSubmission.findAll({
    attributes: [ 'submission_id' ],
    where: { issue_id: issueId }
  });
  issueSubmissions = getPlainData(issueSubmissions);

  let zipName = `Выпуск\xa0№${issue['Номер']}\xa0(${issue['Сквозной номер']})\xa0` + 
                `Том\xa0${issue.volume['Номер']}\xa0(${issue.volume['Год']}).zip`

  issue['Том'] = issue.volume;
  delete issue.volume;

  let zip = new JSZip();
  
  zip.file("Данные о выпуске.json", JSON.stringify(issue, null, '\t'));

  for (const item of issueSubmissions) {
    let submission = await getSubmissionForExport(item.submission_id);
    
    let submissionFolder = zip.folder(submission['Название статьи']);
    
    let fileExrention = submission.file.file_name.split('.').pop();
    submissionFolder.file(`Текст статьи.${fileExrention}`, submission.file.file_data);
    delete submission.file;
    
    submissionFolder.file("Метаданные.json", JSON.stringify(submission, null, '\t'));
  }

  const zipData = zip.generate({
    type: "nodebuffer",
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9
    }
  });

  return { zipName, zipData };
}

module.exports = {
  getIssues,
  getIssue,
  getPublicIssues,
  getPublicIssue,
  getArticle,
  createIssue,
  editIssue,
  sendIssueToEditorialBoard,
  sendIssueToEditor,
  publishIssueOnSite,
  unpublishIssueOnSite,
  deleteIssue,
  acceptIssue,
  rejectIssue,
  uploadPublishedIssue,
  getIssueData
};
