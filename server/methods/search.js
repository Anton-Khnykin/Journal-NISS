import db from '../models';
import { getShortNames } from 'utils/data_parser';
import { isEmptyOrNull, isInvalidDate , cleanSearchQuery } from 'utils/validation';

async function search(queryParams) {
  let { query, from, to } = queryParams;

  if (!isEmptyOrNull(from) && isInvalidDate(from)) {
    from = '';
  }
  if (!isEmptyOrNull(to) && isInvalidDate(to)) {
    to = '';
  }

  if (query.length > 0) {
    query = cleanSearchQuery(query, '|');
  }
  else {
    return {};
  }
  
  let dateSort = '';
  if (from && to) {
    dateSort = `AND publication_date::date BETWEEN '${from}' AND '${to}'`;
  }
  else if (from) {
    dateSort = `AND publication_date::date >= '${from}'`;
  }
  else if (to) {
    dateSort = `AND publication_date::date <= '${to}'`;
  }

  const result = await db.sequelize.query(
    `SELECT
      i.publication_date,
      is1.issue_submission_id,
      s.title_en,
      s.abstract_en,
      array_agg(c1.first_name_ru) first_names,
      array_agg(c1.middle_name_ru) middle_names,
      array_agg(ts_headline('Russian', c1.last_name_ru, query, 'StartSel=''<span class="attention">'', StopSel=</span>, HighlightAll=true')) last_names,
      ts_rank_cd(is1.submission_search, query, 16) rank,
      ts_headline('Russian', s.title_ru, query, 'StartSel=''<span class="attention">'', StopSel=</span>, HighlightAll=true') title_ru,
      ts_headline('Russian', s.abstract_ru, query, 'StartSel=''<span class="attention">'', StopSel=</span>, MinWords=60, MaxWords=100') abstract_ru
    FROM issue i 
      INNER JOIN issue_submission is1 ON (i.issue_id = is1.issue_id )
        INNER JOIN submission s ON (is1.submission_id = s.submission_id)
          INNER JOIN author_submission as1 ON (s.submission_id = as1.submission_id)
            INNER JOIN credentials c1 ON (as1.credentials_id = c1.credentials_id),
          to_tsquery('Russian', :query) query
    WHERE i.is_published_on_site = TRUE AND query @@ is1.submission_search ${dateSort} 
    GROUP BY
      i.publication_date,
      is1.issue_submission_id,
      s.title_ru,
      s.title_en,
      s.abstract_ru,
      s.abstract_en,
      is1.submission_search,
      query.query
    ORDER BY rank DESC;`,
    {
      // eslint-disable-next-line no-console
      logging: console.log,
      type: db.Sequelize.QueryTypes.SELECT,
      replacements: { query: query }
    }
  );

  const response = [];
  const authors = [];

  for (let i = 0; i < result.length; i++) {
    const articleAuthors = [];
    for (let j = 0; j < result[i].first_names.length; j++) {
      const author = {
        first_name_ru: result[i].first_names[j],
        last_name_ru: result[i].last_names[j]
      }

      if (result[i].middle_names[j]) {
        Object.assign(author, {
          middle_name_ru: result[i].middle_names[j]
        });
      }

      articleAuthors.push(author);
    }

    authors.push(getShortNames(articleAuthors, 'ru'));
  }

  result.forEach((article, index) => {
    response.push({
      id: article.issue_submission_id,
      title_ru: article.title_ru,
      abstract_ru: article.abstract_ru,
      authors: authors[index]
    });
  });

  return response;
}

module.exports = search;
