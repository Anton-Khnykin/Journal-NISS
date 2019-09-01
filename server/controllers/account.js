import express from 'express';
import { getCredentials, editCredentials } from '../methods/credentials';
import { changeEmail, changePassword, getSettings } from '../methods/user';
import { ACCOUNT_CREDENTIALS,
         ACCOUNT_EMAIL,
         ACCOUNT_PASSWORD,
         ACCOUNT_SETTINGS } from 'middleware/api_paths';

const router = express.Router();

// Получить данные об аккаунте
router.get(ACCOUNT_CREDENTIALS, async (req, res) => {
  try {
    const result = await getCredentials(req.user.user_id);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Изменить данные о пользователе Credentials
router.put(ACCOUNT_CREDENTIALS, async (req, res) => {
  try {
    await editCredentials({ data: req.body, userId: req.user.user_id });
    res.status(200).end();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Изменить Email
router.put(ACCOUNT_EMAIL, async (req, res) => {
  try {
    await changeEmail(req.user.user_id, req.body.email);
    res.status(200).end();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Изменить Пароль
router.put(ACCOUNT_PASSWORD, async (req, res) => {
  try {
    await changePassword(req.user.user_id, req.body);
    res.status(200).end();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Получить настройки
router.get(ACCOUNT_SETTINGS, async (req, res) => {
  try {
    const result = await getSettings(req.user.user_id);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

module.exports = router;
