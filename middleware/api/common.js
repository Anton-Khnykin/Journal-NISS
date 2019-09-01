import sendRequest from './send_request';
import requestHeaders from './request_headers';
import { COMMON_BASE_PATH, COMMON_MESSAGES, COMMON_MESSAGE, COMMON_SUBMISSION_HISTORY } from '../api_paths';

export const getMessages = (slug, cookie) =>
  sendRequest(COMMON_BASE_PATH + COMMON_MESSAGES.replace(':slug', slug), {
    method: 'GET',
    headers: requestHeaders(cookie),
    credentials: 'include'
  });

export const sendMessage = (slug, formData) =>
  sendRequest(COMMON_BASE_PATH + COMMON_MESSAGE.replace(':slug', slug), {
    method: 'POST',
    headers: requestHeaders(undefined, true),
    credentials: 'include',
    body: formData
  });

export const getSubmissionHistory = slug =>
  sendRequest(COMMON_BASE_PATH + COMMON_SUBMISSION_HISTORY.replace(':slug', slug), {
    method: 'GET',
    headers: requestHeaders(),
    credentials: 'include'
  });
