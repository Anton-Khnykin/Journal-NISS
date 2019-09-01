import { getShortNames, getFullName, getDate } from './data_parser';

const createSubmissionsTableData = (id, date, authors, title, status) => {
  return { id, date, authors, title, status };
}

export const parseSubmissionsTableData = data => {
  const rows = [];
  for (const item of data) {
    rows.push(createSubmissionsTableData(
      item.submission_id,
      getDate(item.date), 
      getShortNames(item.authors, 'ru'), 
      item.title_ru, 
      item.status
    ));
  }
  return rows;
}

const createIssuesTableData = (id, number, numberGeneral, volume, creationDate, publicationDate, status) => {
  return { id, number, numberGeneral, volume, creationDate, publicationDate, status };
}

export const parseIssuesTableData = data => {
  const rows = [];
  for (const item of data) {
    rows.push(createIssuesTableData(
      item.issue_id,
      item.number,
      item.number_general,
      `${item.volume.number} (${item.volume.year})`,
      getDate(item.creation_date),
      item.publication_date === null ? '-' : getDate(item.publication_date),
      item.status
    ));
  }
  return rows;
}

export const parseEbmIssuesTableData = data => {
  const rows = [];
  for (const item of data) {
    rows.push(createIssuesTableData(
      item.issue.issue_id,
      item.issue.number,
      item.issue.number_general,
      `${item.issue.volume.number} (${item.issue.volume.year})`,
      getDate(item.issue.creation_date),
      item.issue.publication_date === null ? '-' : getDate(item.issue.publication_date),
      {
        id: item.issue.status.id,
        name: item.issue.status.name
      }
    ))
  }
  return rows;
}

export const parseEditorIssuesTableData = data => {
  const rows = [];
  for (const item of data) {
    rows.push(createIssuesTableData(
      item.issue_id,
      item.number,
      item.number_general,
      `${item.volume.number} (${item.volume.year})`,
      getDate(item.creation_date),
      item.publication_date === null ? '-' : getDate(item.publication_date),
      {
        id: item.status.id,
        name: item.status.name
      }
    ))
  }
  return rows;
}

const createUsersTableData = (id, name, email, registrationDate, roles) => {
  return { id, name, email, registrationDate, roles };
}

export const parseUsersTableData = data => {
  const rows = [];
  for (const item of data) {
    rows.push(createUsersTableData(
      item.user_id,
      getFullName(item.credential, 'ru'),
      item.email,
      getDate(item.registration_date),
      item.roles
    ));
  }
  return rows;
}