import express from 'express';
import passport from 'passport';
import { getPublicIssues, getPublicIssue, getArticle } from '../methods/issue';
import { createUser } from '../methods/user';
import { getFile, getFilePreview } from '../methods/file';
import search from '../methods/search';
import { ROLES } from 'middleware/enums';
import {  PUBLIC_ISSUES,
          PUBLIC_ISSUE,
          PUBLIC_CURRENT_ISSUE,
          PUBLIC_ARTICLE,
          PUBLIC_LOGOUT,
          PUBLIC_REGISTRATION,
          PUBLIC_LOGIN,
          PUBLIC_SEARCH,
          PUBLIC_FILE,
          PUBLIC_FILE_PREVIEW } from 'middleware/api_paths';

const router = express.Router();

// Регистрация автора
router.post(PUBLIC_REGISTRATION, async (req, res) => {
  try {
    req.body.roles = [ ROLES.AUTHOR ];
    const result = await createUser({ data: req.body, isReg: true });

    return req.login(result, err => {
      if (!err) {
        return res.status(200).end();
      }

      return res.status(500).json({
        message: 'Ошибка авторизации'
      });
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Авторизация
router.post(PUBLIC_LOGIN, async (req, res) => {
  try {
    return passport.authenticate('local', (err, user) => {
      if (err) {
        return res.status(500).json({
          message: 'Ошибка аутентификации, попробуйте ещё раз'
        });
      }

      if (!user) {
        return res.status(404).json({
          message: 'Неверный логин или пароль'
        });
      }

      req.login(user, err => {
        if (!err) {
          res.status(200).end();
        }
      });
    })(req, res);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Деавторизация
router.post(PUBLIC_LOGOUT, async (req, res) => {
  try {
    req.logout();
    return res.status(200).end();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Получить все выпуски
router.get(PUBLIC_ISSUES, async (req, res) => {
  try {
    const result = await getPublicIssues();
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Получить текущий выпуск
router.get(PUBLIC_CURRENT_ISSUE, async (req, res) => {
  try {
    const result = await getPublicIssue(true);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Получить выпуск
router.get(PUBLIC_ISSUE, async (req, res) => {
  try {
    const result = await getPublicIssue(false, req.params.slug);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Получить статью
router.get(PUBLIC_ARTICLE, async (req, res) => {
  try {
    const result = await getArticle(req.params.slug);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Скачать файл
router.get(PUBLIC_FILE, async (req, res) => {
  try {
    const file = await getFile(req.params.slug);
    res.attachment(file.file_name);
    res.type(file.file_type);
    res.status(200).send(file.file_data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Скачать файл
router.get(PUBLIC_FILE_PREVIEW, async (req, res) => {
  try {
    const result = await getFilePreview(req.params.slug);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Поиск по статьям
router.get(PUBLIC_SEARCH, async (req, res) => {
  try {
    const result = await search(req.query);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

module.exports = router;
