import sendRequest from './send_request';
import requestHeaders from './request_headers';
import {  EDITOR_BASE_PATH,
          EDITOR_ISSUES,
          EDITOR_ISSUE } from '../api_paths';

export const getIssues = cookie =>
  sendRequest(EDITOR_BASE_PATH + EDITOR_ISSUES, {
    method: 'GET',
    headers: requestHeaders(cookie),
    credentials: 'include'
  });

export const getIssue = (slug, cookie) =>
  sendRequest(EDITOR_BASE_PATH + EDITOR_ISSUE.replace(':slug', slug), {
    method: 'GET',
    headers: requestHeaders(cookie),
    credentials: 'include'
  });

export const decide = (slug, data) =>
  sendRequest(EDITOR_BASE_PATH + EDITOR_ISSUE.replace(':slug', slug), {
    method: 'PUT',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify(data)
  });
