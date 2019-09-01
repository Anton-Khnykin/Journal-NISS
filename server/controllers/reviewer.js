import express from 'express';
import upload from '../multer.config';
import { REVIEWER_REVIEWS,
         REVIEWER_REVIEWS_ARCHIVED,
         REVIEWER_REVIEW,
         REVIEWER_REVIEW_FORMED,
         REVIEWER_TEMPLATES } from  'middleware/api_paths';
import { getReviews,
         acceptReview,
         rejectReview,
         uploadReview } from '../methods/review'
import { getFormedReview } from '../methods/review';
import { getTemplates } from '../methods/template';

const router = express.Router();

// Получить заявки на рецензии
router.get(REVIEWER_REVIEWS, async (req, res) => {
  try {
    const result = await getReviews(req.user.user_id);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Получить архивые заявки на рецензии
router.get(REVIEWER_REVIEWS_ARCHIVED, async (req, res) => {
  try {
    const result = await getReviews(req.user.user_id, true);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Скачать сформированный файл
router.post(REVIEWER_REVIEW_FORMED, async (req, res) => {
  try {
    const file = await getFormedReview(req.params.slug, req.body);
    res.attachment(file.name);
    res.type(file.type);
    res.status(200).send(file.data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Получить шаблоны
router.get(REVIEWER_TEMPLATES, async (req, res) => {
  try {
    const templates = await getTemplates(true);
    res.status(200).json(templates);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Загрузить файл рецензии
router.post(REVIEWER_REVIEW, upload.single('reviewFile'), async (req, res) => {
  try {
    await uploadReview(req.user.user_id, JSON.parse(req.body.data), req.params.slug, req.file);
    res.status(200).end();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Управление рецензией
router.put(REVIEWER_REVIEW, async (req, res) => {
  try {
    if (req.body.action === 'accept') {
      await acceptReview(req.user.user_id, req.params.slug);
    }
    else if (req.body.action === 'reject') {
      await rejectReview(req.user.user_id, req.params.slug);
    }
    res.status(200).end();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

module.exports = router;
