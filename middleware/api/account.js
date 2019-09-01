import sendRequest from './send_request';
import requestHeaders from './request_headers';
import {  ACCOUNT_BASE_PATH,
          ACCOUNT_CREDENTIALS,
          ACCOUNT_EMAIL,
          ACCOUNT_PASSWORD,
          ACCOUNT_SETTINGS } from '../api_paths';

export const getCredentials = cookie =>
  sendRequest(ACCOUNT_BASE_PATH + ACCOUNT_CREDENTIALS, {
    method: 'GET',
    headers: requestHeaders(cookie),
    credentials: 'include'
  });

export const editCredentials = data =>
  sendRequest(ACCOUNT_BASE_PATH + ACCOUNT_CREDENTIALS, {
    method: 'PUT',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify(data)
  });

export const changeEmail = data =>
  sendRequest(ACCOUNT_BASE_PATH + ACCOUNT_EMAIL, {
    method: 'PUT',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify(data)
  });

export const changePassword = data =>
  sendRequest(ACCOUNT_BASE_PATH + ACCOUNT_PASSWORD, {
    method: 'PUT',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify(data)
  });

export const getSettings = cookie =>
  sendRequest(ACCOUNT_BASE_PATH + ACCOUNT_SETTINGS, {
    method: 'GET',
    headers: requestHeaders(cookie),
    credentials: 'include'
  });
