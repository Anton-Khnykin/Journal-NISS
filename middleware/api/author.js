import sendRequest from './send_request';
import requestHeaders from './request_headers';
import {  AUTHOR_BASE_PATH,
          AUTHOR_SUBMISSIONS,
          AUTHOR_SUBMISSIONS_ARCHIVED,
          AUTHOR_SUBMISSION,
          AUTHOR_NEW_SUBMISSION } from '../api_paths';

export const getSubmissions = cookie =>
  sendRequest(AUTHOR_BASE_PATH + AUTHOR_SUBMISSIONS, {
    method: 'GET',
    headers: requestHeaders(cookie),
    credentials: 'include'
  });

export const getArchivedSubmissions = cookie =>
  sendRequest(AUTHOR_BASE_PATH + AUTHOR_SUBMISSIONS_ARCHIVED, {
    method: 'GET',
    headers: requestHeaders(cookie),
    credentials: 'include'
  });

export const getSubmission = (slug, cookie) =>
  sendRequest(AUTHOR_BASE_PATH + AUTHOR_SUBMISSION.replace(':slug', slug), {
    method: 'GET',
    headers: requestHeaders(cookie),
    credentials: 'include'
  });

export const sendSubmission = formData =>
  sendRequest(AUTHOR_BASE_PATH + AUTHOR_NEW_SUBMISSION, {
    method: 'POST',
    headers: requestHeaders(undefined, true),
    credentials: 'include',
    body: formData
  });

export const editSubmission = (slug, formData) =>
  sendRequest(AUTHOR_BASE_PATH + AUTHOR_SUBMISSION.replace(':slug', slug), {
    method: 'PUT',
    headers: requestHeaders(undefined, true),
    credentials: 'include',
    body: formData
  });
