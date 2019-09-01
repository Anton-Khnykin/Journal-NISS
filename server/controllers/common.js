import express from 'express';
import upload from '../multer.config';
import { COMMON_MESSAGES, COMMON_MESSAGE, COMMON_SUBMISSION_HISTORY } from 'middleware/api_paths';
import { getMessages, sendMessage } from '../methods/message';
import { getSubmissionHistory } from '../methods/submission';
const router = express.Router();

// Получить сообщения по заявке
router.get(COMMON_MESSAGES, async (req, res) => {
  try {
    const result = await getMessages(req.user, req.params.slug, req.baseUrl);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Отправить сообщение
router.post(COMMON_MESSAGE, upload.any(), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    await sendMessage(req.params.slug, req.user, data, req.files, req.baseUrl);
    res.status(200).end();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Получить историю заявки
router.get(COMMON_SUBMISSION_HISTORY, async (req, res) => {
  try {
    const result = await getSubmissionHistory(req.user, req.params.slug);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

module.exports = router;
