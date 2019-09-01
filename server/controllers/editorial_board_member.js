import express from 'express';
import { EDITORIAL_BOARD_MEMBER_ISSUES,
         EDITORIAL_BOARD_MEMBER_ISSUE } from 'middleware/api_paths';
import { getIssues, getIssue, acceptIssue, rejectIssue } from '../methods/issue';

const router = express.Router();

// Получить все номера
router.get(EDITORIAL_BOARD_MEMBER_ISSUES, async (req, res) => {
  try {
    const result = await getIssues(req.baseUrl, req.user.user_id);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Получить номер
router.get(EDITORIAL_BOARD_MEMBER_ISSUE, async (req, res) => {
  try {
    const result = await getIssue(req.params.slug, req.baseUrl, req.user.user_id);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Управление номером
router.put(EDITORIAL_BOARD_MEMBER_ISSUE, async (req, res) => {
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
