import express from 'express';
import upload from '../multer.config';
import {  SECRETARY_SUBMISSIONS,
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
          SECRETARY_TEMPLATE } from 'middleware/api_paths';
import {  getSubmissions,
          getRecommendedSubmissions,
          getSubmission,
          acceptSubmission,
          rejectSubmission,
          sendSubmissionToReview,
          sendSubmissionToRevision } from '../methods/submission'
import {  getSubmissionReviews, getReviewers, sendReviewToAuthor } from '../methods/review';
import {  createVolume, deleteVolume, getVolumes } from '../methods/volume';
import {  getTemplates, createTemplate, deleteTemplate } from '../methods/template';
import {  getIssues,
          getIssue,
          createIssue,
          editIssue,
          sendIssueToEditorialBoard,
          sendIssueToEditor,
          publishIssueOnSite,
          unpublishIssueOnSite,
          deleteIssue,
          uploadPublishedIssue,
          getIssueData } from '../methods/issue';

const router = express.Router();

// Заявки

// Получить все заявки
router.get(SECRETARY_SUBMISSIONS, async (req, res) => {
  try {
    const result = await getSubmissions(req.user, req.baseUrl);
    res.status(200).json(result); 
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Получить архивные заявки
router.get(SECRETARY_SUBMISSIONS_ARCHIVED, async (req, res) => {
  try {
    const result = await getSubmissions(req.user, req.baseUrl, true);
    res.status(200).json(result); 
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Получить рекомендованные к публикации заявки
router.get(SECRETARY_RECOMMENDED_SUBMISSIONS, async (req, res) => {
  try {
    const result = await getRecommendedSubmissions();
    res.status(200).json(result); 
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Получить заявку по ID
router.get(SECRETARY_SUBMISSION, async (req, res) => {
  try {
    const result = await getSubmission(req.params.slug, req.user, req.baseUrl);
    res.status(200).json(result); 
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Управление заявкой
router.put(SECRETARY_SUBMISSION, async (req, res) => {
  try {
    switch (req.body.action) {
      case 'accept':
        await acceptSubmission(req.params.slug);
        break;
      case 'reject':
        await rejectSubmission(req.params.slug);
        break;
      case 'sendToReview':
        await sendSubmissionToReview(req.body, req.params.slug);
        break;
      case 'sendToRevision':
        await sendSubmissionToRevision(req.body, req.params.slug);
        break;
    }
    res.status(200).end();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Рецензии

// Получить все рецензии для заявки
router.get(SECRETARY_SUBMISSION_REVIEWS, async (req, res) => {
  try {
    const result = await getSubmissionReviews(req.params.slug);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Получить всех рецензентов
router.get(SECRETARY_REVIEWERS, async (req, res) => {
  try {
    const result = await getReviewers(req.params.slug);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Отправить рецензию автору
router.post(SECRETARY_REVIEW, async (req, res) => {
  try {
    await sendReviewToAuthor(req.params.slug, req.body);
    res.status(200).end();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Том

// Получить все тома
router.get(SECRETARY_VOLUMES, async (req, res) => {
  try {
    const result = await getVolumes();
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Создать Том
router.post(SECRETARY_NEW_VOLUME, async (req, res) => {
  try {
    await createVolume(req.body);
    res.status(200).end();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Удалить Том
router.delete(SECRETARY_VOLUME, async (req, res) => {
  try {
    await deleteVolume(req.params.slug);
    res.status(200).end();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Выпуск

// Получить все выпуски
router.get(SECRETARY_ISSUES, async (req, res) => {
  try {
    const result = await getIssues(req.baseUrl);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Получить выпуск по ID
router.get(SECRETARY_ISSUE, async (req, res) => {
  try {
    const result = await getIssue(req.params.slug, req.baseUrl);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Создать выпуск
router.post(SECRETARY_NEW_ISSUE, async (req, res) => {
  try {
    await createIssue(req.body);
    res.status(200).end();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Загрузить опубликованный номер
const uploads = upload.fields([{ name: 'issueFile', maxCount: 1 }, { name: 'issueCover', maxCount: 1 }, { name: 'submissionFiles' }]);
router.post(SECRETARY_ISSUE_PUBLISHED, uploads, async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    await uploadPublishedIssue(req.params.slug, data, req.files.issueFile[0], req.files.issueCover[0], req.files.submissionFiles); 
    res.status(200).end();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Управление выпуском
router.put(SECRETARY_ISSUE, async (req, res) => {
  try {
    switch(req.body.action) {
      case 'update':
        await editIssue(req.body, req.params.slug);
        break;
      case 'sendToEditorialBoard':
        await sendIssueToEditorialBoard(req.params.slug);
        break;
      case 'sendToEditor':
        await sendIssueToEditor(req.params.slug);
        break;
      case 'publishOnSite':
        await publishIssueOnSite(req.params.slug);
        break;
      case 'unpublishOnSite':
        await unpublishIssueOnSite(req.params.slug);
        break;
    }
    res.status(200).end();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Удалить выпуск
router.delete(SECRETARY_ISSUE, async (req, res) => {
  try {
    await deleteIssue(req.params.slug);
    res.status(200).end();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Загрузить данные о выпуске
router.get(SECRETARY_ISSUE_DATA, async (req, res) => {
  try {
    const { zipName, zipData } = await getIssueData(req.params.slug);
    res.attachment(zipName);
    res.type('application/zip');
    res.status(200).send(zipData);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Шаблоны

// Просмотреть все шаблоны
router.get(SECRETARY_TEMPLATES, async (req, res) => {
  try {
    const result = await getTemplates();
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Создать шаблон
router.post(SECRETARY_NEW_TEMPLATE, upload.single('template_file'), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    await createTemplate(data, req.file);
    res.status(200).end();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Удалить шаблон
router.delete(SECRETARY_TEMPLATE, async (req, res) => {
  try {
    await deleteTemplate(req.params.slug);
    res.status(200).end();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

module.exports = router;
