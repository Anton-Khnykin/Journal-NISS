import sendRequest from './send_request';
import requestHeaders from './request_headers';
import {  SECRETARY_BASE_PATH,
          SECRETARY_SUBMISSIONS,
          SECRETARY_SUBMISSIONS_ARCHIVED,
          SECRETARY_RECOMMENDED_SUBMISSIONS,
          SECRETARY_SUBMISSION,
          SECRETARY_SUBMISSION_REVIEWS,
          SECRETARY_REVIEWERS,
          SECRETARY_REVIEW,
          SECRETARY_VOLUMES,
          SECRETARY_NEW_VOLUME,
          SECRETARY_VOLUME,
          SECRETARY_ISSUES,
          SECRETARY_ISSUE,
          SECRETARY_NEW_ISSUE,
          SECRETARY_ISSUE_PUBLISHED,
          SECRETARY_ISSUE_DATA,
          SECRETARY_TEMPLATES,
          SECRETARY_NEW_TEMPLATE,
          SECRETARY_TEMPLATE } from '../api_paths';

// Заявки

export const getSubmissions = cookie =>
  sendRequest(SECRETARY_BASE_PATH + SECRETARY_SUBMISSIONS, {
    method: 'GET',
    headers: requestHeaders(cookie),
    credentials: 'include'
  });

export const getArchivedSubmissions = cookie =>
  sendRequest(SECRETARY_BASE_PATH + SECRETARY_SUBMISSIONS_ARCHIVED, {
    method: 'GET',
    headers: requestHeaders(cookie),
    credentials: 'include'
  });

export const getRecommendedSubmissions = cookie =>
  sendRequest(SECRETARY_BASE_PATH + SECRETARY_RECOMMENDED_SUBMISSIONS, {
    method: 'GET',
    headers: requestHeaders(cookie),
    credentials: 'include'
  });

export const getSubmission = (slug, cookie) =>
  sendRequest(SECRETARY_BASE_PATH + SECRETARY_SUBMISSION.replace(':slug', slug), {
    method: 'GET',
    headers: requestHeaders(cookie),
    credentials: 'include'
  });

export const manageSubmission = (slug, data) =>
  sendRequest(SECRETARY_BASE_PATH + SECRETARY_SUBMISSION.replace(':slug', slug), {
    method: 'PUT',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify(data)
  });

// Рецензии

 export const getSubmissionReviews = (slug, cookie) =>
  sendRequest(SECRETARY_BASE_PATH + SECRETARY_SUBMISSION_REVIEWS.replace(':slug', slug), {
    method: 'GET',
    headers: requestHeaders(cookie),
    credentials: 'include'
  });

export const getSubmissionReviewers = (slug, cookie) =>
  sendRequest(SECRETARY_BASE_PATH + SECRETARY_REVIEWERS.replace(':slug', slug), {
    method: 'GET',
    headers: requestHeaders(cookie),
    credentials: 'include'
  });

export const sendReviewToAuthor = (slug, data) =>
  sendRequest(SECRETARY_BASE_PATH + SECRETARY_REVIEW.replace(':slug', slug), {
    method: 'POST',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify(data)
  });

// Том

export const getVolumes = () =>
  sendRequest(SECRETARY_BASE_PATH + SECRETARY_VOLUMES, {
    method: 'GET',
    headers: requestHeaders(),
    credentials: 'include'
  });

export const createVolume = data =>
  sendRequest(SECRETARY_BASE_PATH + SECRETARY_NEW_VOLUME, {
    method: 'POST',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify(data)
  });

export const deleteVolume = slug =>
  sendRequest(SECRETARY_BASE_PATH + SECRETARY_VOLUME.replace(':slug', slug), {
    method: 'DELETE',
    headers: requestHeaders(),
    credentials: 'include'
  });

// Выпуск

export const getIssues = cookie =>
  sendRequest(SECRETARY_BASE_PATH + SECRETARY_ISSUES, {
    method: 'GET',
    headers: requestHeaders(cookie),
    credentials: 'include'
  });

export const getIssue = (slug, cookie) =>
  sendRequest(SECRETARY_BASE_PATH + SECRETARY_ISSUE.replace(':slug', slug), {
    method: 'GET',
    headers: requestHeaders(cookie),
    credentials: 'include'
  });

export const createIssue = data =>
  sendRequest(SECRETARY_BASE_PATH + SECRETARY_NEW_ISSUE, {
    method: 'POST',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify(data)
  });

export const uploadPublishedIssue = (slug, formData) =>
  sendRequest(SECRETARY_BASE_PATH + SECRETARY_ISSUE_PUBLISHED.replace(':slug', slug), {
    method: 'POST',
    headers: requestHeaders(undefined, true),
    credentials: 'include',
    body: formData
  });

export const manageIssue = (slug, data) =>
  sendRequest(SECRETARY_BASE_PATH + SECRETARY_ISSUE.replace(':slug', slug), {
    method: 'PUT',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify(data)
  });

export const deleteIssue = slug =>
  sendRequest(SECRETARY_BASE_PATH + SECRETARY_ISSUE.replace(':slug', slug), {
    method: 'DELETE',
    headers: requestHeaders(),
    credentials: 'include'
  });

export const getIssueData = slug =>
  sendRequest(SECRETARY_BASE_PATH + SECRETARY_ISSUE_DATA.replace(':slug', slug), {
    method: 'GET',
    headers: requestHeaders(undefined, true),
    credentials: 'include'
  })

// Шаблон

export const getTemplates = cookie =>
  sendRequest( SECRETARY_BASE_PATH + SECRETARY_TEMPLATES, {
    method: 'GET',
    headers: requestHeaders(cookie),
    credentials: 'include'
  });

export const createTemplate = formData =>
  sendRequest(SECRETARY_BASE_PATH + SECRETARY_NEW_TEMPLATE, {
    method: 'POST',
    headers: requestHeaders(undefined, true),
    credentials: 'include',
    body: formData
  });

export const deleteTemplate = slug =>
  sendRequest( SECRETARY_BASE_PATH + SECRETARY_TEMPLATE.replace(':slug', slug), {
    method: 'DELETE',
    headers: requestHeaders(),
    credentials: 'include'
  });
