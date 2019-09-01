import { getPlainData } from 'utils/data_parser';
import { ISSUE_STATUS } from 'middleware/enums';

const afterIssueUpdate = async instance => {
  const { issue_submission, submission, author_submission, credentials } = instance.sequelize.models;

  if (instance.issue_status_id === ISSUE_STATUS.PUBLISHED) {
    let issueSubmissions = await issue_submission.findAll({
      attributes: [ 'issue_submission_id' ],
      where: { issue_id: instance.issue_id },
      include: [
        {
          model: submission,
          attributes: [
            'submission_id',
            'title_ru',
            'title_en',
            'abstract_ru',
            'abstract_en'
          ]
        }
      ]
    });

    issueSubmissions = getPlainData(issueSubmissions);

    for (const item of issueSubmissions) {
      let authors = await author_submission.findAll({
        where: { submission_id: item.submission.submission_id },
        attributes: [],
          include: [
            {
              model: credentials,
              attributes: [
                'first_name_ru',
                'first_name_en',
                'last_name_ru',
                'last_name_en',
                'middle_name_ru',
                'middle_name_en'
              ]
            }
          ]
      })

      authors = authors.map(author => getPlainData(author.credential));
      let authorsRu = '';
      let authorsEn = '';
      authors.forEach((author, index) => {
        authorsRu += `coalesce('${author.first_name_ru}','')
                      || ' ' || coalesce('${author.last_name_ru}','')
                      || ' ' || coalesce('${author.middle_name_ru}','')`;
        authorsEn += `coalesce('${author.first_name_en}','')
                      || ' ' || coalesce('${author.last_name_en}','')
                      || ' ' || coalesce('${author.middle_name_en}','')`;
        if (index !== authors.length - 1) {
          authorsRu += ` || ' ' || `;
          authorsEn += ` || ' ' || `;
        }
      });

      instance.sequelize.query(
        `UPDATE issue_submission SET submission_search=
          setweight(to_tsvector('Russian', coalesce(:titleRu,'')), 'B') ||
          setweight(to_tsvector('Russian', ${authorsRu}), 'A') ||
          setweight(to_tsvector('Russian', coalesce(:abstractRu,'')), 'C') ||
          setweight(to_tsvector('English', coalesce(:titleEn,'')), 'B') ||
          setweight(to_tsvector('English', ${authorsEn}), 'A') ||
          setweight(to_tsvector('English', coalesce(:abstractEn,'')), 'C')
        WHERE issue_submission_id = ${item.issue_submission_id};`,
        {
          // eslint-disable-next-line no-console
          logging: console.log,
          replacements: {
            titleRu: item.submission.title_ru,
            abstractRu: item.submission.abstract_ru,
            titleEn: item.submission.title_en,
            abstractEn: item.submission.abstract_en
          }
        }
      );
    }
  }
}

module.exports = {
  afterIssueUpdate
};
