import express from 'express';
import upload from '../multer.config';
import {  getSubmissions,
          getSubmission,
          createSubmission,
          editSubmission } from '../methods/submission'
import {  AUTHOR_SUBMISSIONS,
          AUTHOR_SUBMISSIONS_ARCHIVED,
          AUTHOR_SUBMISSION,
          AUTHOR_NEW_SUBMISSION } from 'middleware/api_paths';

const router = express.Router();

// Получить все заявки
router.get(AUTHOR_SUBMISSIONS, async (req, res) => {
  try {
    const result = await getSubmissions(req.user, req.baseUrl);
    res.status(200).json(result); 
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Получить архивные заявки
router.get(AUTHOR_SUBMISSIONS_ARCHIVED, async (req, res) => {
  try {
    const result = await getSubmissions(req.user, req.baseUrl, true);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Получить заявку по ID
router.get(AUTHOR_SUBMISSION, async (req, res) => {
  try {
    const result = await getSubmission(req.params.slug, req.user, req.baseUrl);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Отправить заявку
router.post(AUTHOR_NEW_SUBMISSION, upload.any(), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    await createSubmission(data, req.files, req.user.user_id);
    res.status(200).end();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Редактировать заявку
router.put(AUTHOR_SUBMISSION, upload.any(), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    await editSubmission(data, req.files, req.user.user_id, req.params.slug);
    res.status(200).end();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

module.exports = router;
