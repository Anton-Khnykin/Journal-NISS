import { Volume, Issue } from '../models/index';
import { isEmpty, isEmptyOrNull } from 'utils/validation';

async function getVolumes() {
  return await Volume.findAll();
}

async function createVolume(data) {
  if (isEmpty(data) || isEmptyOrNull (data.number) || isEmptyOrNull(data.year)) {
    throw ({ 
      message: 'Пожалуйста, заполните все поля',
      status: 500
    });
  }
  await Volume.create(data);

  return { status: 200 };
}

async function deleteVolume(volumeId) {
  const issues = await Issue.findAll({
    where: { volume_id: volumeId }
  });

  if (issues.length === 0) {
    await Volume.destroy({
      where: { volume_id: volumeId }
    })
  }
  else {
    throw ({
      status: 500,
      message: 'Невозможно удалить том'
    });
  }

  return { status: 200 };
}

module.exports = {
  getVolumes,
  createVolume,
  deleteVolume
};
