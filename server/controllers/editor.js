import express from 'express';
import { EDITOR_ISSUES, EDITOR_ISSUE } from 'middleware/api_paths';
import { getIssues, getIssue, acceptIssue, rejectIssue } from '../methods/issue';

const router = express.Router();

// Получить все номера
router.get(EDITOR_ISSUES, async (req, res) => {
  try {
    const result = await getIssues(req.baseUrl);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Получить номер
router.get(EDITOR_ISSUE, async (req, res) => {
  try {
    const result = await getIssue(req.params.slug, req.baseUrl);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Управление номером
router.put(EDITOR_ISSUE, async (req, res) => {
  try {
    if (req.body.action === 'accept') {
      await acceptIssue(req.user, req.params.slug, req.body, req.baseUrl);
    }
    else if (req.body.action === 'reject') {
      await rejectIssue(req.user, req.params.slug, req.body, req.baseUrl);
    }
    res.status(200).end();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

module.exports = router;
