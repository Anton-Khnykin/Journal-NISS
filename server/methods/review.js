import Sequelize from 'sequelize';
import { Credentials,
         Recommendation,
         Review,
         Submission,
         SubmissionFile,
         SubmissionHistory } from '../models/index';
import { createFile } from './file';
import { getCredentials } from './credentials';
import { getUsersByRole } from './user';
import { getTemplate } from './template';
import { getFormedFile } from './file';
import { isEmpty } from 'utils/validation';
import { getFullName, getPlainData } from 'utils/data_parser';
import { ROLES,
         REVIEW_STATUS,
         FILE_TYPE } from 'middleware/enums';

const Op = Sequelize.Op;

async function checkOwnership(userId, reviewId) {
  const result = await Review.findOne({
    where: { 
      credentials_id: await getCredentials(userId, true),
      review_id: reviewId 
    }
  });
  return result !== null;
}

async function getReviews(userId, isArchived = false) {
  let reviews = await Review.findAll({
    attributes: [
      'review_id',
      [ 'review_status_id', 'status' ],
      [ 'deadline_reviewer', 'deadline' ],
      [ 'review_file', 'file' ],
      [ 'review_file_signed', 'file_signed' ]
    ],
    include: [ 
      { 
        model: Recommendation,
        attributes: [ 'recommendation' ]
      },
      {
        model: Submission,
        attributes: {
          exclude: [
            'submission_id',
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
    ],
    where: { 
      credentials_id: await getCredentials(userId, true),
      review_status_id: {
        [Op.in]: isArchived ?
          [ REVIEW_STATUS.REJECTED, REVIEW_STATUS.REVIEW_SENT ] :
          [ REVIEW_STATUS.PENDING, REVIEW_STATUS.ACCEPTED ]
      }
    },
    order: [[ 'review_id', 'ASC' ]]
  });

  if (reviews.length === 0) {
    return [];
  }

  reviews = getPlainData(reviews);
  
  for (const review of reviews) {
    review.submission.file = review.submission.submission_files[0].file;
    review.recommendation = review.recommendation ? review.recommendation.recommendation : null;
    delete review.submission.submission_files;
  }

  return reviews;
}

async function getSubmissionReviews(submissionId) {
  return await Review.findAll({
    attributes: [
      'review_id',
      [ 'review_status_id', 'status' ],
      [ 'deadline_reviewer', 'deadline' ],
      [ 'review_file', 'file' ],
      [ 'review_file_signed', 'file_signed' ]
    ],
    include: [
      {
        model: Credentials,
        attributes: [
          'first_name_ru',
          'middle_name_ru',
          'last_name_ru'
        ]
      },
      {
        model: Recommendation,
        attributes: [
          [ 'recommendation_id', 'id' ],
          [ 'recommendation', 'name' ]
        ]
      }
    ],
    order: [[ 'review_id', 'ASC' ]],
    where: { submission_id: submissionId }
  });
}

async function getReviewers(submissionId) {
  const reviewers = await getUsersByRole(ROLES.REVIEWER);

  const submissionReviewers = await Review.findAll({
    attributes: [ 'credentials_id' ],
    where: { submission_id: submissionId }
  });

  const submissionReviewerIds = submissionReviewers.map(item => item.credentials_id);
  const result = [];

  for (const reviewer of reviewers) {
    result.push({
      id: reviewer.credential.credentials_id,
      name: getFullName(reviewer.credential, 'ru'),
      interests: isEmpty(reviewer.credential.scientific_interests_ru) ? 
        '' :
        reviewer.credential.scientific_interests_ru,
      alreadyDid: submissionReviewerIds.includes(reviewer.credential.credentials_id)
    });
  }

  return result;
}

async function acceptReview(userId, reviewId) {
  if (!(await checkOwnership(userId, reviewId))) {
    throw ({ 
      message: 'У вас недостаточно прав на эту операцию',
      status: 403
    });
  }
  await Review.update({
    review_status_id: REVIEW_STATUS.ACCEPTED
  }, {
    where: { review_id: reviewId }
  });

  return { status: 200 };
}

async function rejectReview(userId, reviewId) {
  if (!(await checkOwnership(userId, reviewId))) {
    throw ({ 
      message: 'У вас недостаточно прав на эту операцию',
      status: 403
    });
  }
  await Review.update({
    review_status_id: REVIEW_STATUS.REJECTED
  }, {
    where: { review_id: reviewId }
  });

  return { status: 200 };
}

async function uploadReview(userId, data, reviewId, reviewFile) {
  if (!(await checkOwnership(userId, reviewId))) {
    throw ({ 
      message: 'У вас недостаточно прав на эту операцию',
      status: 403
    });
  }
  const file = await createFile(reviewFile);
  await Review.update({
    review_status_id:   REVIEW_STATUS.REVIEW_SENT,
    recommendation_id:  data.recommendation_id,
    review_file_signed: file
  }, {
    where: { review_id: reviewId }
  });

  return { status: 200 };
}

async function sendReviewToAuthor(reviewId, data) {
  const submission = await Submission.findOne({
    attributes: [ 'submission_status_id' ],
    where: { submission_id: data.submission_id }
  });
  await SubmissionHistory.create({
    submission_id:        data.submission_id,
    submission_status_id: submission.submission_status_id,
    review_id:            reviewId
  });
  await Review.update({
    review_status_id: REVIEW_STATUS.SENT_TO_AUTHOR
  }, {
    where: { review_id: reviewId }
  });
  return { status: 200 };
}

async function getFormedReview(reviewId, data) {
  const template = await getTemplate(data.template_id);

  const review = await Review.findOne({
    attributes: ['submission_id'],
    where: { review_id: reviewId }
  });

  const fileName = `Рецензия для заявки № ${review.submission_id}.docx`;
  const result = await getFormedFile(template.file_id, data.fields, fileName);

  await Review.update({
    review_file: result.id
  }, {
    where: { review_id: reviewId }
  })

  return result.file;
}

module.exports = {
  getReviews,
  getSubmissionReviews,
  getReviewers,
  acceptReview,
  rejectReview,
  uploadReview,
  sendReviewToAuthor,
  getFormedReview
};
