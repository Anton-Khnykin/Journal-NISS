import { File } from '../models/index';
import JSZip from 'jszip';
import Docxtemplater from 'docxtemplater';
import tmp from 'tmp';
import fs from 'fs';
import path from 'path';

async function getFile(id) {
  return await File.findByPk(id);
}

async function getFormedFile(fileId, fields, fileName) {
  const file = await getFile(fileId);
  
  const zip = new JSZip(file.file_data);
  const doc = new Docxtemplater();
  doc.loadZip(zip);
  doc.setData(fields);

  try {
    doc.render();
  }
  catch (error) {
    throw error;
  }

  const buffer = doc.getZip().generate({ type: 'nodebuffer' });

  const createdFile = await File.create({
    file_data: buffer,
    file_type: file.file_type,
    file_name: fileName
  });

  return { 
    id: createdFile.file_id,
      file: {
        data: buffer,
        name: fileName,
        type: file.file_type
      }
    };
}

async function createFile(data) {
  const file = await File.create({
    file_data: data.buffer,
    file_type: data.mimetype,
    file_name: data.originalname
  });
  return file.file_id;
}

async function deleteFile(fileId) {
  await File.destroy({
    where: { file_id: fileId }
  });
  return { status: 200 };
}

async function getFilePreview(fileId) {
  const file = await getFile(fileId);
  const fileNameParts = file.file_name.split('.');
  const postfix = '.' + fileNameParts[fileNameParts.length - 1];
  const dir = path.normalize(__dirname + '/../public/temp/');

  let tmpobj = tmp.fileSync({ postfix: postfix, dir: dir });

  const pathName = tmpobj.name.split('\\').join('/');
  const nameParts = pathName.split('/');
  const name = nameParts[nameParts.length - 1];

  try {
    fs.appendFileSync(tmpobj.name, file.file_data);
  } catch (err) {
    throw err;
  }
  const filePath = `/temp/${name}`;

  setTimeout(tmpobj.removeCallback, 10 * 1000 * 6);

  return {
    filePath: filePath,
    originalFilePath: pathName,
    originalName: name
  };
}

module.exports = {
  getFile,
  getFormedFile,
  createFile,
  deleteFile,
  getFilePreview
};
