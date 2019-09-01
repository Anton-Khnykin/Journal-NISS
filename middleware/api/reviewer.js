import sendRequest from './send_request';
import requestHeaders from './request_headers';
import {  REVIEWER_BASE_PATH,
          REVIEWER_REVIEWS,
          REVIEWER_REVIEWS_ARCHIVED,
          REVIEWER_REVIEW,
          REVIEWER_REVIEW_FORMED,
          REVIEWER_TEMPLATES } from '../api_paths';

export const getReviews = cookie =>
  sendRequest(REVIEWER_BASE_PATH + REVIEWER_REVIEWS, {
    method: 'GET',
    headers: requestHeaders(cookie),
    credentials: 'include'
  });

export const getArchivedReviews = cookie =>
  sendRequest(REVIEWER_BASE_PATH + REVIEWER_REVIEWS_ARCHIVED, {
    method: 'GET',
    headers: requestHeaders(cookie),
    credentials: 'include'
  });

export const getFormedReview = (slug, data) =>
  sendRequest(REVIEWER_BASE_PATH + REVIEWER_REVIEW_FORMED.replace(':slug', slug), {
    method: 'POST',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify(data)
  });

export const getTemplates = () =>
  sendRequest(REVIEWER_BASE_PATH + REVIEWER_TEMPLATES, {
    method: 'GET',
    headers: requestHeaders(),
    credentials: 'include'
  });

export const sendReview = (slug, formData) =>
  sendRequest(REVIEWER_BASE_PATH + REVIEWER_REVIEW.replace(':slug', slug), {
    method: 'POST',
    headers: requestHeaders(undefined, true),
    credentials: 'include',
    body: formData
  });

export const manageReview = (slug, data) =>
  sendRequest(REVIEWER_BASE_PATH + REVIEWER_REVIEW.replace(':slug', slug), {
    method: 'PUT',
    headers: requestHeaders(),
    credentials: 'include',
    body: JSON.stringify(data)
  });
