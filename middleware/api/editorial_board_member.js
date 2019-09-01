import sendRequest from './send_request';
import requestHeaders from './request_headers';
import {  EDITORIAL_BOARD_MEMBER_BASE_PATH,
          EDITORIAL_BOARD_MEMBER_ISSUES,
          EDITORIAL_BOARD_MEMBER_ISSUE } from '../api_paths';

export const getIssues = cookie =>
  sendRequest(EDITORIAL_BOARD_MEMBER_BASE_PATH + EDITORIAL_BOARD_MEMBER_ISSUES, {
    method: 'GET',
    headers: requestHeaders(cookie),
    credentials: 'include'
  });

export const getIssue = (slug, cookie) =>
  sendRequest(EDITORIAL_BOARD_MEMBER_BASE_PATH + EDITORIAL_BOARD_MEMBER_ISSUE.replace(':slug', slug), {
    method: 'GET',
    headers: requestHeaders(cookie),
    credentials: 'include'
  });

export const vote = (slug, data) =>
  sendRequest(EDITORIAL_BOARD_MEMBER_BASE_PATH + EDITORIAL_BOARD_MEMBER_ISSUE.replace(':slug', slug), {
    method: 'PUT',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify(data)
  });
