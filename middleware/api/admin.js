import sendRequest from './send_request';
import requestHeaders from './request_headers';
import {  ADMIN_BASE_PATH,
          ADMIN_USERS,
          ADMIN_NEW_USER,
          ADMIN_USER } from '../api_paths';

export const getUsers = cookie =>
  sendRequest(ADMIN_BASE_PATH + ADMIN_USERS, {
    method: 'GET',
    headers: requestHeaders(cookie),
    credentials: 'include'
  });

export const createUser = data =>
  sendRequest(ADMIN_BASE_PATH + ADMIN_NEW_USER, {
    method: 'POST',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify(data)
  });

export const editUser = (slug, data) =>
  sendRequest(ADMIN_BASE_PATH + ADMIN_USER.replace(':slug', slug), {
    method: 'PUT',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify(data)
  });

export const deleteUser = slug =>
  sendRequest(ADMIN_BASE_PATH + ADMIN_USER.replace(':slug', slug), {
    method: 'DELETE',
    headers: requestHeaders(),
    credentials: 'include'
  });
