import { File,
         Message,
         MessageFile,
         User,
         Credentials } from '../models/index';
import { createFile } from './file';
import { checkOwnership } from './submission';
import { isEmpty, isEmptyOrNull } from 'utils/validation';
import { ROLES } from 'middleware/enums';
import { AUTHOR_BASE_PATH } from 'middleware/api_paths';
import { getPlainData } from 'utils/data_parser';

async function getMessages({ user_id, roles }, submissionId, baseUrl) {
  if (roles.includes(ROLES.AUTHOR) && baseUrl === AUTHOR_BASE_PATH) {
    if (!(await checkOwnership(user_id, submissionId))) {
      throw ({ 
        message: 'У вас недостаточно прав на эту операцию',
        status: 403
      });
    }
  }
  let messages = await Message.findAll({
    attributes: [
      'date',
      'text',
      'user_id'
    ],
    include: [ 
      {
        model: MessageFile,
        as: 'files',
        attributes: [ 'file_id' ], 
        include: [
          {
            model: File,
            attributes: [
              [ 'file_id', 'id' ],
              [ 'file_name', 'name' ],
              [ 'file_type', 'type' ]
            ]
          }
        ]
      },
      {
        model: User,
        attributes: [ 'user_id' ],
        include: [
          {
            model: Credentials,
            attributes: [
              'first_name_ru',
              'middle_name_ru'
            ]
          }
        ]
      }
    ],
    where: { submission_id: submissionId },
    order: [[ 'date', 'ASC' ]]
  });

  messages = getPlainData(messages);

  for (let message of messages) {
    message.isSender = message.user_id === user_id;
    message.name = message.user.credential.first_name_ru;
    if (message.user.credential.middle_name_ru) {
      message.name += ' ' + message.user.credential.middle_name_ru;
    }
    delete message.user;
    delete message.user_id;

    message.files = message.files.map(item => item.file);
  }

  return messages;
}

async function sendMessage(submissionId, { user_id, roles }, data, files, baseUrl) {
  if (roles.includes(ROLES.AUTHOR) && baseUrl === AUTHOR_BASE_PATH) {
    if (!(await checkOwnership(user_id, submissionId))) {
      throw ({ 
        message: 'У вас недостаточно прав на эту операцию',
        status: 403
      });
    }
  }
  if ((isEmpty(data) || isEmptyOrNull(data.text)) && files.length === 0) {
    throw ({ 
      message: 'Пожалуйста, заполните все поля',
      status: 500
    });
  }
  const message = await Message.create({
    submission_id:  submissionId,
    text:           data.text,
    user_id:        user_id
  });
  if (files.length !== 0) {
    for (const item of files) {
      const file = await createFile(item);
      await MessageFile.create({
        message_id:     message.message_id,
        file_id:        file
      });
    }
  }

  return { status: 200 };
}

module.exports = {
  getMessages,
  sendMessage
};
