import bcrypt from 'bcrypt';
import { Credentials,
         User,
         UserRole } from '../models/index';
import { isEmpty,
         isEmptyOrNull,
         isInvalidEmail } from 'utils/validation';
import { createCredentials } from './credentials';
import { ROLES } from 'middleware/enums';
import { getPlainData } from 'utils/data_parser';

async function getUser(id) {
  return await User.findByPk(id);
}

async function createUserWithThirdParty(data) {
  const id = data.google_id ? { google_id: data.google_id } :
             data.facebook_id ? { facebook_id: data.facebook_id } : null;
  
  if (!id) {
    return null;
  }

  const credentials = await Credentials.create({
    first_name_ru:  data.first_name,
    last_name_ru:   data.last_name,
    contact_email:  data.email
  });

  const user = await User.create({
    ...id,
    email: data.email,
    credentials_id: credentials.credentials_id
  });
  
  await UserRole.create({
    user_id: user.user_id,
    role_id: ROLES.AUTHOR
  });

  return user;
}

async function createUser({ data, isAdmin = false, isReg = false }) {
  if (isEmptyOrNull(data.password.toString()) ||
      isEmptyOrNull(data.email) ||
      isEmptyOrNull(data.first_name) ||
      isEmptyOrNull(data.last_name) ||
      data.roles.length === 0) {
    throw ({
      message: 'Пожалуйста, заполните все поля',
      status: 500
    });
  }

  if (isInvalidEmail(data.email)) {
    throw ({
      message: 'Неверный адрес электронной почты',
      status: 500
    });
  }
  
  if (!isAdmin) {
    if (isEmptyOrNull(data.verify)) {
      throw ({
        message: 'Пожалуйста, заполните все поля',
        status: 500
      });
    }
    if (data.password !== data.verify) {
      throw ({
        message: 'Пароли не совпадают',
        status: 500
      });
    }
  }
  
  const emailAlreadyUsed = await User.findOne({
    where: { email: data.email }
  })
  .then(data => {
    return data !== null;
  });
  
  if (emailAlreadyUsed) {
    throw ({
      message: 'Пользователь с таким адресом электронной почты уже существует',
      status: 500
    });
  }

  const credentialsId = await createCredentials({
    first_name_ru:  data.first_name,
    last_name_ru:   data.last_name,
    contact_email:  data.email,
    organizations:  []
  }, isReg ? isReg : isAdmin);

  const salt = bcrypt.genSaltSync(12);
  const hash = bcrypt.hashSync(data.password, salt);
  
  const user = await User.create({
    email:    data.email,
    password: hash,
    salt:     salt,
    credentials_id: credentialsId
  });
  
  for (const role of data.roles) {
    await UserRole.create({
      user_id: user.user_id,
      role_id: role
    });
  }

  return user;
}

async function getUsers() {
  let users = await User.findAll({
    attributes: [
      'user_id',
      'email',
      [ 'created_at', 'registration_date' ]
    ],
    include: [
      {
        model: Credentials,
        attributes: [
          'first_name_ru',
          'middle_name_ru',
          'last_name_ru'
        ]
      },
      {
        model: UserRole,
        attributes: [ 'role_id' ]
      }
    ]
  });

  if (users.length === 0) {
    return [];
  }

  users = getPlainData(users);

  users.forEach(user => {
    user.roles = user.user_roles.map(role => role.role_id);
    delete user.user_roles;
  });

  return users;
}

async function editUser(userId, data) {
  let userData = {};

  if (!isEmptyOrNull(data.email)) {
    userData.email = data.email;
  }
  if (!isEmptyOrNull(data.password)) {
    const salt = bcrypt.genSaltSync(12);
    userData.salt = salt;
    userData.password = bcrypt.hashSync(data.password, salt);
  }

  if (!isEmpty(userData)) {
    await User.update(userData, {
      where: { user_id: userId }
    });
  }

  userData = {};

  if (!isEmptyOrNull(data.first_name)) {
    userData.first_name_ru = data.first_name
  }

  if (!isEmptyOrNull(data.last_name)) {
    userData.last_name_ru = data.last_name
  }

  if (!isEmpty(userData)) {
    const user = await User.findOne({
      attributes: [ 'credentials_id' ],
      where: { user_id: userId }
    });

    await Credentials.update(userData, {
      where: { credentials_id: user.credentials_id }
    });
  }

  if (!isEmpty(data.roles)) {
    for (const role of data.roles.create) {
      await UserRole.create({
        user_id: userId,
        role_id: role
      });
    }
    for (const role of data.roles.delete) {
      await UserRole.destroy({
        where: {
          user_id: userId,
          role_id: role
        }
      });
    }
  }

  return { status: 200 }
}

async function deleteUser(userId) {
  const user = await User.findOne({
    attributes: [ 'credentials_id' ],
    where: { user_id: userId }
  });
  await Credentials.destroy({
    where: { credentials_id: user.credentials_id }
  });
  
  return { status: 200 };
}

async function changeEmail(userId, email) {
  if (isEmptyOrNull(email)) {
    throw ({
      message: 'Пожалуйста, заполните все поля',
      status: 500
    });
  }

  if (isInvalidEmail(email)) {
    throw ({
      message: 'Неверный адрес электронной почты',
      status: 500
    });
  }

  const user = await User.findOne({
    attributes: [
      'user_id',
      'email'
    ],
    where: { email: email }
  });

  if (user) {
    if (user.user_id !== userId) {
      throw ({
        message: 'Данный адрес уже занят',
        status: 500
      });
    }
    else {
      throw ({
        message: 'Введен текущий адрес электронной почты',
        status: 500
      });
    }
  }

  await User.update({
    email: email
  }, {
    where: { user_id: userId }
  });

  return { status: 200 };
}

async function changePassword(userId, { currentPassword, newPassword, verify }) {
  if (isEmptyOrNull(newPassword) || isEmptyOrNull(verify)) {
    throw ({
      message: 'Пожалуйста, заполните все поля',
      status: 500
    });
  }

  if (newPassword !== verify) {
    throw ({
      message: 'Пароли не совпадают',
      status: 500
    });
  }

  const user = await User.findOne({
    attributes: [
      'email',
      'password'
    ],
    where: { user_id: userId }
  });

  if (!isEmptyOrNull(user.password)) {
    if (isEmptyOrNull(currentPassword) ||
        !bcrypt.compareSync(currentPassword, user.password)) {
      throw ({
        message: 'Неверный текущий пароль',
        status: 500
      });
    }

    if (bcrypt.compareSync(newPassword, user.password)) {
      throw ({
        message: 'Введен текущий пароль',
        status: 500
      });
    }
  }

  if (user.email === newPassword) {
    throw ({
      message: 'Пароль не должен совпадать с электронной почтой',
      status: 500
    });
  }

  const salt = bcrypt.genSaltSync(12);
  const hash = bcrypt.hashSync(newPassword, salt);

  await User.update({
    password: hash,
    salt: salt
  }, {
    where: { user_id: userId }
  });

  return { status: 200 };
}

async function getUsersByRole(role) {
  const userRoles = await UserRole.findAll({
    where: { role_id: role }
  });

  const userRoleIds = userRoles.map(item => item.user_id);

  const users = await User.findAll({
    where: { user_id: userRoleIds },
    include: [ Credentials ]
  });
  
  return users;
}

async function getSettings(userId) {
  const user = await User.findOne({
    attributes: [
      'google_id',
      'facebook_id',
      'password'
    ],
    where: { user_id: userId }
  });

  return {
    'locally_authorized': !isEmptyOrNull(user.password),
    'google_authorized': !isEmptyOrNull(user.google_id),
    'facebook_authorized': !isEmptyOrNull(user.facebook_id)
  };
}

module.exports = {
  getUser,
  getUsers,
  editUser,
  deleteUser,
  changeEmail,
  changePassword,
  createUser,
  createUserWithThirdParty,
  getUsersByRole,
  getSettings
};
