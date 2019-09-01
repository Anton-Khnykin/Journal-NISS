import nodemailer from 'nodemailer';
import htmlToText from 'nodemailer-html-to-text';
import mailConfig from 'server/nodemailconfig';
import journalInfo from 'static/page_content/general.json';
import { SUBSCRIPTION } from 'middleware/enums';
import { User, UserSubscription } from '../models/index';

async function sendMail(subscription, info) {
  let subject = '';
  let html = '';
  let recipients = [];

  const header = `<p>Здравствуйте, ${}!</p><br />`;
  const footer = `Вы можете отписаться от рассылки на странице 
                 <a href="${journalInfo.journalURL.value}">настроек аккаунта</a>`;

  switch(subscription) {
    case SUBSCRIPTION.NEW_ISSUES:
      subject = `Новый выпуск`;
      html = `<p>Уведомляем вас о выходе нового выпуска 
             ${journalInfo.journalName.value}.<br />
             Выпуск доступен по ссылке: <a href="${journalInfo.journalURL.value}/issue/current">
             ${journalInfo.journalURL.value}/issue/current</a></p>`;
      
      break;
    case SUBSCRIPTION.AUTHOR_SUBMISSION_STATUS_CHANGE:
      subject = `Изменение статуса заявки`;
      html = `<p>Статус вашей заявки "${}" был изменён на "${}".<br />
             Вы можете просмотреть заявку по ссылке: <a href="${journalInfo.journalURL.value}/dashboard/my-submission/${}">
             ${journalInfo.journalURL.value}/dashboard/my-submission/${}</a></p`;

      break;
    case SUBSCRIPTION.AUTHOR_NEW_SUBMISSION_MESSAGE:
      subject = `Новое сообщение`;
      html = `Вы получили сообщение от редакции журнала:<br />${}`;
      break;
    case SUBSCRIPTION.SECRETARY_SUBMISSION_STATUS_CHANGE:
      subject = `Изменение статуса заявки`;
      html = `<p>Статус заявки "${}" был изменён на "${}".<br />
             Вы можете просмотреть заявку по ссылке: <a href="${journalInfo.journalURL.value}/dashboard/submission/${}">
             ${journalInfo.journalURL.value}/dashboard/my-submission/${}</a></p`;
      break;
    case SUBSCRIPTION.SECRETARY_NEW_SUBMISSION_MESSAGE:
      subject = `Новое сообщение`;
      html = `<p>Вы получили сообщение от автора заявки "${}":<br />${}</p>`;
      break;
    case SUBSCRIPTION.SECRETARY_NEW_ISSUE_STATUS:
      subject = `Новый статус выпуска`;
      html = `<p>Статус сформированного выпуска №${} поменялся на "${}"</p>`;
      break;
    case SUBSCRIPTION.SECRETARY_NEW_SUBMISSION:
      subject = `Новая заявка`;
      html = `<p>Была получена новая заявка "${}"<br />
             Вы можете просмотреть заявку по ссылке: ${}/dashboard/submission/${}</p>`;
      break;
    case SUBSCRIPTION.REVIEWER_NEW_REVIEW:
      subject = `Новая заявка на рецензирование`;
      html = `Вами была получена новая заявка на рецензирование статьи "${}"<br />
             `;
      break;
    case SUBSCRIPTION.EDITOR_NEW_ISSUE:
      subject = ``;
      html = ``;
      break;
    case SUBSCRIPTION.EBM_NEW_ISSUE:
      subject = ``;
      html = ``;
      break;
    default:
      break;
  }
  
  const transporter = nodemailer.createTransport(mailConfig);
  transporter.use('compile', htmlToText());
  const mailOptions = {
    from: `${journalInfo.journalName.value} <${mailConfig.auth.user}>`,
    to: ['yakool@yandex.ru', 'antinoobsss@gmail.com'],
    subject: subject + ` | ${journalInfo.journalName.value}`,
    html: header + html + footer
  };
  transporter.sendMail(mailOptions, error => {
    if (error) {
      return console.log(error);
    }
    return;
  });
}

export default sendMail;
