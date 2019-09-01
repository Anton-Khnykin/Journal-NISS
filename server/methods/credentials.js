import { User, UserOrganization, Credentials } from '../models/index';
import { isEmpty, isEmptyOrNull } from 'utils/validation';

async function getCredentials(userId, onlyId = false) {
  const user = await User.findOne({
    attributes: [ 'credentials_id' ],
    where: { user_id: userId },
  });
  const credentials = await Credentials.findOne({
    where: { credentials_id: user.credentials_id },
    include: [ { 
      model: UserOrganization,
      as: 'organizations',
      attributes: {
        exclude: [
          'credentials_id'
        ]
      }
    } ]
  });
  return onlyId ? credentials.credentials_id : credentials;
}

async function createCredentials(data, isAdmin = false) {
  if (isEmpty(data) ||
      isEmptyOrNull(data.first_name_ru) ||
      isEmptyOrNull(data.last_name_ru) ||
      isEmptyOrNull(data.contact_email)) {
    throw ({
      message: 'Пожалуйста, заполните все поля',
      status: 500
    });
  }
  if (!isAdmin) {
    if (data.organizations.length === 0) {
      throw ({ 
        message: 'Пожалуйста, заполните все поля',
        status: 500
      });
    }
  }
  if (data.organizations.length !== 0) {
    for (const item of data.organizations) {
      if (isEmptyOrNull(item.organization_name_ru) ||
          isEmptyOrNull(item.organization_name_en) ||
          isEmptyOrNull(item.organization_address_ru) ||
          isEmptyOrNull(item.organization_address_en) ||
          isEmptyOrNull(item.person_position_ru) ||
          isEmptyOrNull(item.person_position_en)) {
        throw ({ 
          message: 'Пожалуйста, заполните все поля',
          status: 500
        });
      }
    }
  }
  
  const credentials = await Credentials.create(data);
    
  if (data.organizations.length !== 0) {
    for (const organization of data.organizations) {
      await UserOrganization.create({
        credentials_id: credentials.credentials_id,
        ...organization
      });
    }
  }

  return credentials.credentials_id;
}

async function editCredentials({ userId, credentialsId, data }) {
  if (userId) {
    credentialsId = await getCredentials(userId, true);
  }
  // Проверка на принадлежность обновляемых организаций credentials
  // if (!isEmpty(data.organizations)) {
  //   const organizations = await UserOrganization.findAll({
  //     attributes: [ 'user_organization_id' ],
  //     where: { credentials_id: credentialsId }
  //   });
  //   let ids = [];
  //   organizations.forEach(org => ids.push(org.user_organization_id));
  //   const orgsForCheck = data.organizations.update.concat(data.organizations.delete);
  //   for (const org of orgsForCheck) {
  //     if (!ids.includes(org.user_organization_id)) {
  //       throw ({
  //         message: 'У вас недостаточно прав на эту операцию',
  //         status: 403
  //       });
  //     }
  //   }
  // }

  await Credentials.update(data, {
    where: { credentials_id: credentialsId }
  });

  for (const org of data.organizations.create) {
    await UserOrganization.create({ credentials_id: credentialsId, ...org });
  }

  for (const org of data.organizations.update) {
    await UserOrganization.update(org, {
      where: { user_organization_id: org.user_organization_id }
    });
  }

  for (const org of data.organizations.delete) {
    await UserOrganization.destroy({
      where: { user_organization_id: org }
    });
  }

  return { status: 200 };
}

async function deleteCredentials(credentialsId) {
  await Credentials.destroy({
    where: { credentials_id: credentialsId }
  });

  return { status: 200 };
}

module.exports = {
  getCredentials,
  createCredentials,
  editCredentials,
  deleteCredentials
};
