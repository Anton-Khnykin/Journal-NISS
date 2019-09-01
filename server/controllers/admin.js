import express from 'express';
import { getUsers, deleteUser, createUser, editUser } from '../methods/user';
import { ADMIN_USERS, ADMIN_USER, ADMIN_NEW_USER } from 'middleware/api_paths';

const router = express.Router();

// Получить всех пользователей
router.get(ADMIN_USERS, async (req, res) => {
  try {
    const result = await getUsers();
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Добавить пользователя в систему
router.post(ADMIN_NEW_USER, async (req, res) => {
  try {
    await createUser({ data: req.body, isAdmin: true });
    res.status(200).end();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Изменить пользователя (ДОБАВИТЬ РОЛЬ)
router.put(ADMIN_USER, async (req, res) => {
  try {
    await editUser(req.params.slug, req.body);
    res.status(200).end();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

// Удалить пользователя из системы
router.delete(ADMIN_USER, async (req, res) => {
  try {
    await deleteUser(req.params.slug);
    res.status(200).end();
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || err.toString() });
  }
});

module.exports = router;
