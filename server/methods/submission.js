import Sequelize from 'sequelize';
import { Submission,
         SubmissionStatus,
         SubmissionHistory,
         SubmissionFile,
         AuthorSubmission,
         UserOrganization,
         UserSubmission,
         Credentials,
         File,
         FileType,
         Review,
         Recommendation,
         Country,
         AcademicTitle,
         AcademicDegree } from '../models/index';
import { editCredentials,
         createCredentials,
         deleteCredentials } from './credentials';
import { isEmpty, isEmptyOrNull } from 'utils/validation';
import { createFile, deleteFile } from './file';
import { AUTHOR_BASE_PATH } from 'middleware/api_paths';
import { ROLES,
         SUBMISSION_STATUS,
         REVIEW_STATUS,
         FILE_TYPE,
         LANGUAGE } from 'middleware/enums';
import { getPlainData, getKeywords } from 'utils/data_parser';

const Op = Sequelize.Op;

async function checkOwnership(userId, submissionId) {
  const result = await UserSubmission.findOne({
    where: { 
      user_id: userId,
      submission_id: submissionId 
    }
  });
  return result !== null;
}

async function getSubmissions({ roles, user_id }, baseUrl, isArchived = false) {
  let query = {
    attributes: [
      'submission_id',
      [ 'submission_date', 'date' ],
      'title_ru',
      'title_en',
      [ 'submission_status_id', 'status' ]
    ],
    include: [
      {
        model: AuthorSubmission, 
        attributes: [ 'author_submission_id' ],
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
        order: [[ 'author_position_in_credits', 'ASC' ]]
      }
    ],
    where: {},
    order: [[ 'submission_id', 'ASC' ]]
  };

  const operator = isArchived ? Op.in : Op.notIn;
  query.where.submission_status_id = {
    [operator]: [ SUBMISSION_STATUS.PUBLISHED, SUBMISSION_STATUS.REJECTED ]
  }

  if (roles.includes(ROLES.AUTHOR) && baseUrl === AUTHOR_BASE_PATH) {
    const submissions = await UserSubmission.findAll({
      attributes: [ 'submission_id' ],
      where: { user_id: user_id }
    });
    if (submissions.length === 0) {
      return [];
    }
    
    query.where.submission_id = { [Op.or]: submissions.map(item => item.submission_id) };

    let result = await Submission.findAll(query);
    result = getPlainData(result);
    
    for (const item of result) {
      if (item.status === SUBMISSION_STATUS.UNDER_REVISION) {
        let deadline = await SubmissionHistory.findOne({
          attributes: [
            [ 'deadline_author', 'deadline' ],
            'commentary'
          ],
          where: { 
            submission_id: item.submission_id,
            submission_status_id: SUBMISSION_STATUS.UNDER_REVISION
          },
          order: [[ 'submission_history_id', 'DESC' ]]
        });
        item.deadline = deadline;
      }
      item.authors = item.author_submissions.map(author => author.credential);
      delete item.author_submissions;
    }
    return result;
  }
  
  let submissions = await Submission.findAll(query);
  
  if (submissions.length === 0) {
    return [];
  }
  
  submissions = getPlainData(submissions);

  for (let submission of submissions) {
    submission.authors = submission.author_submissions.map(item => item.credential);
    delete submission.author_submissions;
  }


  return submissions;
}

async function getRecommendedSubmissions() {
  let submissions = await Submission.findAll({
    attributes: [
      'submission_id',
      'title_ru'
    ],
    include: [
      {
        model: AuthorSubmission, 
        attributes: [ 'author_submission_id' ],
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
        order: [[ 'author_position_in_credits', 'ASC' ]]
      }
    ],
    where: { submission_status_id: SUBMISSION_STATUS.RECOMMENDED_FOR_PUBLISHING }
  });

  submissions = getPlainData(submissions);

  for (const submission of submissions) {
    submission.authors = submission.author_submissions.map(author => author.credential);
    delete submission.author_submissions;
  }

  return submissions;
}

async function getSubmission(submissionId, user, baseUrl) {
  if (user.roles.includes(ROLES.AUTHOR) && baseUrl === AUTHOR_BASE_PATH) {
    if (!(await checkOwnership(user.user_id, submissionId))) {
      throw ({ 
        message: 'У вас недостаточно прав на эту операцию',
        status: 403
      });
    }
  }
  
  let submission = await Submission.findOne({
    attributes: { exclude: [
      'submission_id',
      'submission_date',
      'submission_status_id',
      'title_ru_tokens',
      'title_en_tokens',
      'abstract_ru_tokens',
      'abstract_en_tokens'
    ] },
    include: [ 
      {
        model: SubmissionFile,
        attributes: [[ 'submission_file_id', 'id' ]],
        include: [
          {
            model: File,
            attributes: [
              ['file_id', 'id'],
              ['file_name', 'name']
            ]
          },
          {
            model: FileType,
            attributes: [
              ['file_type_id', 'id'],
              ['file_type_name', 'name']
            ]
          } 
        ]
      },
      {
        model: AuthorSubmission,
        include: [ Credentials ]
      },
      {
        model: SubmissionStatus,
        as: 'status',
        attributes: [
          [ 'submission_status_id', 'id' ],
          [ 'status', 'name' ]
        ]
      }
    ],
    where: { submission_id: submissionId }
  });

  if (isEmpty(submission)) {
    return {};
  }

  submission = getPlainData(submission);

  let result = {
    submission_details: submission,
    authors: [],
    files: []
  };

  for (const item of submission.author_submissions) {
    const organizations = await UserOrganization.findAll({
      attributes: {
        exclude: [ 'credentials_id' ]
      },
      where: { credentials_id: item.credential.credentials_id }
    });
    result.authors.push(Object.assign(item.credential, {
      author_position_in_credits: item.author_position_in_credits,
      is_primary_contact:         item.is_primary_contact,
      organizations:              organizations
    }));
  }

  result.files = result.submission_details.submission_files;
  delete result.submission_details.author_submissions;
  delete result.submission_details.submission_files;
  if (submission.status.id === SUBMISSION_STATUS.UNDER_REVISION) {
    const deadline = await SubmissionHistory.findOne({
      attributes: [ 'deadline_author' ],
      where: { 
        submission_id: submissionId,
        submission_status_id: SUBMISSION_STATUS.UNDER_REVISION
      },
      order: [[ 'submission_history_id', 'DESC' ]]
    });
    result.submission_details.deadline_author = deadline.deadline_author;
  }

  return result;
}

async function getSubmissionForExport(submissionId) {
  let submission = await Submission.findOne({
    attributes: [
      [ 'title_ru', 'Название статьи' ],
      [ 'title_en', 'Название статьи на английском' ],
      [ 'abstract_ru', 'Аннотация' ],
      [ 'abstract_en', 'Аннотация на английском' ],
      'keywords_ru',
      'keywords_en',
      'language_id'
    ],
    include: [
      {
        model: SubmissionFile,
        attributes: [ 'submission_file_id' ],
        where: { file_type_id: FILE_TYPE.ARTICLE },
        include: [
          {
            model: File,
            attributes: [
              'file_name',
              'file_data'
            ]
          },
        ]
      },
      {
        model: AuthorSubmission,
        include: [
          {
            model: Credentials,
            attributes: [
              'credentials_id',
              [ 'last_name_ru', 'Фамилия' ],
              [ 'last_name_en', 'Фамилия на английском' ],
              [ 'first_name_ru', 'Имя' ],
              [ 'first_name_en', 'Имя на английском' ],
              [ 'middle_name_ru', 'Отчество' ],
              [ 'middle_name_en', 'Отчество на английском' ],
              [ 'contact_email', 'Контактный адрес электронной почты' ],
              [ 'scientific_interests_ru', 'Область научных интересов' ],
              [ 'scientific_interests_en', 'Область научных интересов на английском' ],
            ],
            include: [
              {
                model: AcademicTitle,
                attributes: [
                  'name_ru',
                  'name_en'
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
                model: Country,
                attributes: [
                  'name_ru',
                  'name_en'
                ]
              }
            ]
          }
        ],
        order: [[ 'author_position_in_credits', 'ASC' ]]
      }
    ],
    where: { submission_id: submissionId }
  });

  submission = getPlainData(submission);

  submission.file = submission.submission_files[0].file;
  delete submission.submission_files;

  if (submission.language_id === LANGUAGE.RUSSIAN) {
    submission['Язые статьи'] = 'Русский'
  }
  else if (submission.language_id === LANGUAGE.ENGLISH) {
    submission['Язые статьи'] = 'Английский'
  }
  delete submission.language_id;

  submission['Ключевые слова'] = getKeywords(submission.keywords_ru);
  submission['Ключевые слова на английском'] = getKeywords(submission.keywords_ru);
  delete submission.keywords_ru;
  delete submission.keywords_en;

  let result = {
    ...submission,
    'Авторы': []
  };

  for (const item of submission.author_submissions) {
    const organizations = await UserOrganization.findAll({
      attributes: [
        [ 'organization_name_ru', 'Наименование организации' ],
        [ 'organization_name_en', 'Наименование организации на английском' ],
        [ 'organization_address_ru', 'Адрес организации' ],
        [ 'organization_address_en', 'Адрес организации на английском' ],
        [ 'person_position_ru', 'Должность' ],
        [ 'person_position_en', 'Должность на английском' ],
      ],
      where: { credentials_id: item.credential.credentials_id }
    });
    delete item.credential.credentials_id;

    item.credential['Страна'] = item.credential.country.name_ru;
    item.credential['Страна на английском'] = item.credential.country.name_en;
    delete item.credential.country;

    if (item.credential.academic_title) {
      item.credential['Ученое звание'] = item.credential.academic_title.name_ru;
      item.credential['Ученое звание на английском'] = item.credential.academic_title.name_en;
    }
    delete item.credential.academic_title;

    if (item.credential.academic_degree) {
      item.credential['Ученое звание'] = item.credential.academic_degree.name_ru;
      item.credential['Ученое звание на английском'] = item.credential.academic_degree.name_en;
    }
    delete item.credential.academic_degree;

    result['Авторы'].push(Object.assign(item.credential, {
      'Корреспондирующий автор':  item.is_primary_contact ? 'Да' : 'Нет',
      'Организации':              organizations
    }));
  }
  delete result.author_submissions;

  return result;
}

async function getSubmissionHistory({ user_id, roles }, submissionId) {
  if (roles.includes(ROLES.AUTHOR) && !roles.includes(ROLES.SECRETARY)) {
    if (!(await checkOwnership(user_id, submissionId))) {
      throw ({ 
        message: 'У вас недостаточно прав на эту операцию',
        status: 403
      });
    }
  }
  return await SubmissionHistory.findAll({
    attributes: [
      'date',
      'commentary',
      [ 'deadline_author', 'deadline' ]
    ],
    include: [ 
      {
        model: SubmissionStatus,
        as: 'status',
        attributes: [
          [ 'submission_status_id', 'id' ],
          [ 'status', 'name' ]
        ]
      },
      {
        model: Review,
        include: [ Recommendation ],
        attributes: [ [ 'review_file', 'file' ] ] 
      } 
    ],
    where: { submission_id: submissionId },
    order: [[ 'date', 'ASC' ]]
  });
}

async function createSubmission(data, files, userId) {
  if (isEmpty(data) || isEmpty(data.submission) || data.files.length === 0 || 
      data.authors.length === 0 || files.length === 0 ||
      isEmptyOrNull(data.submission.title_ru) || isEmptyOrNull(data.submission.title_en) ||
      isEmptyOrNull(data.submission.abstract_ru) || isEmptyOrNull(data.submission.abstract_en) ||
      isEmptyOrNull(data.submission.language_id.toString()) ||
      isEmptyOrNull(data.submission.keywords_ru) || isEmptyOrNull(data.submission.keywords_en)) {
    throw ({ 
      message: 'Пожалуйста, заполните все поля',
      status: 500
    });
  }
  
  for (const item of data.authors) {
    if (item.organizations.length === 0 ||
        isEmptyOrNull(item.first_name_ru) || isEmptyOrNull(item.first_name_en) ||
        isEmptyOrNull(item.last_name_ru) || isEmptyOrNull(item.last_name_en) ||
        isEmptyOrNull(item.contact_email) || isEmptyOrNull(item.country_id.toString()) ||
        isEmptyOrNull(item.author_position_in_credits.toString()) || typeof(item.is_primary_contact) !== 'boolean') {
      throw ({ 
        message: 'Пожалуйста, заполните все поля',
        status: 500
      });
    }
    for (const organization of item.organizations) {
      if (isEmptyOrNull(organization.organization_name_ru) || isEmptyOrNull(organization.organization_name_en) ||
          isEmptyOrNull(organization.organization_address_ru) || isEmptyOrNull(organization.organization_address_en) ||
          isEmptyOrNull(organization.person_position_ru) || isEmptyOrNull(organization.person_position_en)) {
        throw ({ 
          message: 'Пожалуйста, заполните все поля',
          status: 500
        });
      }
    }
  }

  if (data.files.length !== files.length) {
    throw ({ 
      message: 'Пожалуйста, заполните все поля',
      status: 500
    });
  }
  const submission = await Submission.create({
    submission_status_id: SUBMISSION_STATUS.UNDER_CONSIDERATION,
    ...data.submission
  });

  for (const item of files) {
    const file = await createFile(item);
    await SubmissionFile.create({
      submission_id:  submission.submission_id,
      file_type_id:   data.files[files.indexOf(item)],
      file_id:        file
    });
  }

  for (const item of data.authors) {
    const { credentials_id, ...author } = item;
    const credentials = await createCredentials(author);
    await AuthorSubmission.create({
      credentials_id:             credentials,
      submission_id:              submission.submission_id,
      author_position_in_credits: item.author_position_in_credits,
      is_primary_contact:         item.is_primary_contact
    });
  }

  await SubmissionHistory.create({
    submission_id:        submission.submission_id,
    submission_status_id: submission.submission_status_id,
    date:                 submission.submission_date
  });

  await UserSubmission.create({
    user_id: userId,
    submission_id: submission.submission_id
  });

  return { status: 200 };
}

async function editSubmission(data, files, userId, submissionId) {
  if (!(await checkOwnership(userId, submissionId))) {
    throw ({ 
      message: 'У вас недостаточно прав на эту операцию',
      status: 403
    });
  }
  if (data.files.create.length !== files.length) {
    throw ({ 
      message: 'Пожалуйста, заполните все поля',
      status: 500
    });
  }
  // Проверка на принадлежность обновляемых Credentials заявке
  if (data.authors.length !== 0) {
    const credentials = await AuthorSubmission.findAll({
      attributes: [ 'credentials_id' ],
      where: { submission_id: submissionId }
    });
    let ids = credentials.map(item => item.credentials_id);
    for (const author of data.authors) {
      if (author.action !== 'create') {
        if (ids.indexOf(author.credentials_id) === -1) {
          throw ({
            message: 'У вас недостаточно прав на эту операцию',
            status: 403
          });
      }
      }
    }
  } 
  // Проверка на принадлежность обновляемых файлов заявке
  if (data.files.delete.length !== 0) {
    const submissionFiles = await SubmissionFile.findAll({
      attributes: [ 'submission_file_id' ],
      where: { submission_id: submissionId }
    });
    let ids = submissionFiles.map(item => item.submission_file_id);
    for (const author of data.files.delete) {
      if (author.action !== 'create') {
        if (ids.indexOf(author) === -1) {
          throw ({ 
            message: 'У вас недостаточно прав на эту операцию',
            status: 403
          });
        }
      }
    }
  }

  if (!isEmpty(data.submission)) {
    await Submission.update(data.submission, {
      where: { submission_id: submissionId } 
    });
  }

  if (!isEmpty(data.files)) {
    for (const item of data.files.delete) {
      const file = await SubmissionFile.findOne({
        attributes: [ 'file_id' ],
        where: { submission_file_id: item }
      })
      await SubmissionFile.destroy({
        where: { submission_file_id: item }
      });
      await deleteFile(file.file_id);
    }
  }

  if (files.length !== 0 && data.files.create.length !== 0) {
    for (const item of files) {
      const file = await createFile(item);
      await SubmissionFile.create({
        submission_id:  submissionId,
        file_type_id:   data.files.create[files.indexOf(item)],
        file_id:        file
      });
    }
  }

  if (data.authors.length !== 0) {
    for (const item of data.authors) {
      switch(item.action) {
        case 'update':
          var { credentials_id, ...other } = item;
          await editCredentials({
            credentialsId: credentials_id,
            data: other
          });
          break;
        case 'delete':
          await deleteCredentials(item.credentials_id);
          break;
        case 'create':
          await AuthorSubmission.create({
            credentials_id:             await createCredentials(item),
            submission_id:              submissionId,
            author_position_in_credits: item.author_position_in_credits,
            is_primary_contact:         item.is_primary_contact
          });
          break;
        default:
          throw ({ 
            message: 'Неверное значение ключа action',
            status: 500
          });
      }
    }
  }

  const submission = await Submission.findOne({
    attributes: [ 'submission_status_id' ],
    where: { submission_id: submissionId }
  });
  
  if (submission.submission_status_id === SUBMISSION_STATUS.UNDER_REVISION) {
    await Submission.update({
      submission_status_id: SUBMISSION_STATUS.UNDER_CONSIDERATION,
    }, {
      where: { submission_id: submissionId }
    });
    await SubmissionHistory.create({
      submission_id:        submissionId,
      submission_status_id: SUBMISSION_STATUS.UNDER_CONSIDERATION
    });
  }

  return { status: 200 };
}

async function deleteSubmission(submissionId) {
  const files = await SubmissionFile.findAll({
    attributes: [ 'file_id' ],
    where: { submission_id: submissionId }
  });
  const authors = await AuthorSubmission.findAll({
    attributes: [ 'credentials_id' ],
    where: { submission_id: submissionId }
  })
  for (const item of authors) {
    await Credentials.destroy({
      where: { credentials_id: item.credentials_id }
    });
  }
  await Submission.destroy({
    where: { submission_id: submissionId } 
  });
  for (const item of files) {
    await deleteFile(item.file_id);
  }
  return { status: 200 };
}

async function acceptSubmission(submissionId) {
  await Submission.update({
    submission_status_id: SUBMISSION_STATUS.RECOMMENDED_FOR_PUBLISHING
  }, {
    where: { submission_id: submissionId }
  });
  await SubmissionHistory.create({
    submission_id:        submissionId,
    submission_status_id: SUBMISSION_STATUS.RECOMMENDED_FOR_PUBLISHING
  });
  
  return { status: 200 };
}

async function rejectSubmission(submissionId) {
  await Submission.update({
    submission_status_id: SUBMISSION_STATUS.REJECTED
  }, {
    where: { submission_id: submissionId }
  });
  await SubmissionHistory.create({
    submission_id:        submissionId,
    submission_status_id: SUBMISSION_STATUS.REJECTED
  });
  
  return { status: 200 };
}

async function sendSubmissionToReview(data, submissionId) {
  await Submission.update({
    submission_status_id: SUBMISSION_STATUS.UNDER_REVIEWING
  }, {
    where: { submission_id: submissionId }
  });
  for (const item of data.reviewers) {
    await Review.create({
      submission_id:      submissionId,
      credentials_id:     item,
      deadline_reviewer:  data.deadline_reviewer,
      review_status_id:   REVIEW_STATUS.PENDING
    });
  }

  await SubmissionHistory.create({
    submission_id: submissionId,
    submission_status_id: SUBMISSION_STATUS.UNDER_REVIEWING
  });

  return { status: 200 };
}

async function sendSubmissionToRevision(data, submissionId) {
  await Submission.update({
    submission_status_id: SUBMISSION_STATUS.UNDER_REVISION
  }, {
    where: { submission_id: submissionId }
  });
  await SubmissionHistory.create({
    submission_id:        submissionId,
    submission_status_id: SUBMISSION_STATUS.UNDER_REVISION,
    deadline_author:      data.deadline_author,
    commentary:           data.commentary
  });

  return { status: 200 };
}

module.exports = {
  checkOwnership,
  getSubmissions,
  getRecommendedSubmissions,
  getSubmission,
  getSubmissionForExport,
  getSubmissionHistory,
  createSubmission,
  editSubmission,
  deleteSubmission,
  acceptSubmission,
  rejectSubmission,
  sendSubmissionToReview,
  sendSubmissionToRevision
};
