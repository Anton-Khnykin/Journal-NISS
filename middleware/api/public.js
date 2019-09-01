import sendRequest from './send_request';
import requestHeaders from './request_headers';
import {  PUBLIC_BASE_PATH,
          PUBLIC_ISSUES,
          PUBLIC_ISSUE,
          PUBLIC_CURRENT_ISSUE,
          PUBLIC_ARTICLE,
          PUBLIC_LOGOUT,
          PUBLIC_REGISTRATION,
          PUBLIC_LOGIN,
          PUBLIC_SEARCH,
          PUBLIC_FILE,
          PUBLIC_FILE_PREVIEW } from '../api_paths';

export const registration = data =>
  sendRequest(PUBLIC_BASE_PATH + PUBLIC_REGISTRATION, {
    method: 'POST',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify(data)
  });

export const login = data =>
  sendRequest(PUBLIC_BASE_PATH + PUBLIC_LOGIN, {
    method: 'POST',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify(data)
  });

export const logout = () =>
  sendRequest(PUBLIC_BASE_PATH + PUBLIC_LOGOUT, {
    method: 'POST',
    headers: requestHeaders(),
    credentials: 'include'
  });

export const getIssues = () =>
  sendRequest(PUBLIC_BASE_PATH + PUBLIC_ISSUES, {
    method: 'GET',
    headers: requestHeaders(),
    credentials: 'include'
  });

export const getCurrentIssue = () =>
  sendRequest(PUBLIC_BASE_PATH + PUBLIC_CURRENT_ISSUE, {
    method: 'GET',
    headers: requestHeaders(),
    credentials: 'include'
  });

export const getIssue = slug =>
  sendRequest(PUBLIC_BASE_PATH + PUBLIC_ISSUE.replace(':slug', slug), {
    method: 'GET',
    headers: requestHeaders(),
    credentials: 'include'
  });

export const getArticle = slug =>
  sendRequest(PUBLIC_BASE_PATH + PUBLIC_ARTICLE.replace(':slug', slug), {
    method: 'GET',
    headers: requestHeaders(),
    credentials: 'include'
  });

export const downloadFile = slug =>
  sendRequest(PUBLIC_BASE_PATH + PUBLIC_FILE.replace(':slug', slug), {
    method: 'GET',
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    },
    credentials: 'include'
  });

export const getFilePreview = slug =>
  sendRequest(PUBLIC_BASE_PATH + PUBLIC_FILE_PREVIEW.replace(':slug', slug), {
    method: 'GET',
    headers: requestHeaders(),
    credentials: 'include'
  });

export const search = query => 
  sendRequest(PUBLIC_BASE_PATH + PUBLIC_SEARCH + query, {
    method: 'GET',
    headers: requestHeaders(),
  });
