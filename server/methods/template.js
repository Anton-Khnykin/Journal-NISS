import { ReviewTemplate } from '../models/index';
import { File } from '../models/index';
import { isEmpty, isEmptyOrNull } from 'utils/validation';

async function getTemplate(id) {
  return await ReviewTemplate.findByPk(id);
}

async function getTemplates(withFields = false) {
  return await ReviewTemplate.findAll({
    attributes: {
      include: withFields ?
        [
          [ 'review_template_id', 'id' ]
        ] :
        [
          [ 'review_template_id', 'id' ],
          [ 'file_id', 'file' ]
        ],
      exclude: withFields ?
        [ 'file_id', 'review_template_id' ] :
        [ 'fields', 'file_id', 'review_template_id' ]
    }
  });
}

async function createTemplate(data, templateFile) {
  if (isEmpty(data.fields) || isEmptyOrNull(data.name) || isEmpty(templateFile)) {
    throw ({ 
      message: 'Пожалуйста, заполните все поля',
      status: 500
    });
  }

  const file = await File.create({
    file_data: templateFile.buffer,
    file_type: templateFile.mimetype,
    file_name: templateFile.originalname
  });

  await ReviewTemplate.create({
    name:     data.name,
    file_id:  file.file_id,
    fields:   JSON.stringify(data.fields)
  });

  return { status: 200 };
}

async function deleteTemplate(templateId) {
  const template = await ReviewTemplate.findOne({
    attributes: [ 'file_id' ],
    where: { review_template_id: templateId }
  });

  await ReviewTemplate.destroy({
    where: { review_template_id: templateId }
  });

  await File.destroy({
    where: { file_id: template.file_id }
  });

  return { status: 200 };
}

module.exports = {
  getTemplate,
  getTemplates,
  createTemplate,
  deleteTemplate
};
