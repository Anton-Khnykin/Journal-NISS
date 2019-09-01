import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import DashboardLayout from 'components/dashboard/DashboardLayout';
import TransferList from 'components/dashboard/TransferList';
import ConfirmDialog from 'components/dashboard/ConfirmDialog';
import StyledSnackbar from 'components/dashboard/StyledSnackbar';
import IssueToolbar from 'components/dashboard/IssueToolbar';
import NextLink from 'components/NextLink';
import Download from 'components/Download';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import DownloadIcon from '@material-ui/icons/CloudDownload';
import UploadIcon from '@material-ui/icons/CloudUpload';
import { getIssue, manageIssue, deleteIssue, uploadPublishedIssue } from 'middleware/api/secretary';
import { getNames, getDate } from 'utils/data_parser';
import { isEmptyOrNull, replaceChar } from 'utils/validation';
import { ISSUE_STATUS } from 'middleware/enums';

const snackbarMessage = {
  sendToEditorialBoard: 'Выпуск отправлен на рассмотрение редакционной коллегии',
  sendToEditor: 'Выпуск отправлен на рассмотрение главному редактору',
  publishOnSite: 'Выпуск опубликован на сайте',
  unpublishOnSite: 'Выпуск скрыт на сайте',
  delete: 'Выпуск удален'
};

const dialogMessage = {
  sendToEditorialBoard: 'Вы уверены, что хотите отправить выпуск на рассмотрение редакционной коллегии?',
  sendToEditor: 'Вы уверены, что хотите отправить выпуск на рассмотрение главному редактору?',
  publishOnSite: 'Вы уверены, что хотите опубликовать выпуск на сайте?',
  unpublishOnSite: 'Вы уверены, что хотите скрыть выпуск на сайте?',
  delete: 'Вы уверены, что хотите удалить выпуск?'
};

// Содержимое формы редактирования выпуска

const useUploadingIssueContent = makeStyles(theme => ({
  grow: {
    flexGrow: 1 
  },
  paper: {
    padding: theme.spacing(3),
    width: '100%',
    flexGrow: 1,
    marginTop: theme.spacing(1)
  },
  title: {
    margin: theme.spacing(2, 0, 0),
    fontWeight: 500
  },
  upload: {
    cursor: 'pointer'
  },
  date: {
    [theme.breakpoints.down('sm')]: {
      maxWidth: 300
    }
  },
  textAlign: {
    textAlign: 'center'
  },
  icon: {
    color: theme.palette.icon.main
  },
  errorMessage: {
    marginTop: 0,
    paddingBottom: theme.spacing(4)
  }
}));

const UploadingIssueContent = props => {
  const classes = useUploadingIssueContent();
  const { issue, handleCancelling, setSnackbar } = props;
  const [ issueFile, setIssueFile ] = useState(null);
  const [ issueCover, setIssueCover ] = useState(null);
  const [ submissionFiles, setSubmissionFiles ] = useState(
    issue.submissions.map(item => { return {
      submission_id: item.submission_id,
      file: null
    }})
  );
  const [ pages, setPages ] = useState(
    issue.submissions.map(item => { return {
      submission_id: item.submission_id,
      first_page: '', last_page: ''
    }})
  );
  const [ publicationDate, setPublicationDate ] = useState('');
  const [ labelWidth, setLabelWidth ] = useState({
    issueFile: 0,
    issueCover: 0,
    submission: 0
  });

  const labelRefs = {
    issueFile: useRef(null),
    issueCover: useRef(null),
    submission: useRef(null)
  }

  const inputIssueFileRef = useRef(null);
  const inputIssueCoverRef = useRef(null);
  
  const [dialog, setDialog] = useState({
    open: false,
    text: ''
  });

  const [error, setError] = useState({
    issueFile: null,
    submissionFile: null,
    date: null,
    pages: null
  });

  let formControlError = !!error.issueFile || !!error.submissionFile || !!error.pages;

  useEffect(() => {
    setLabelWidth({
      submission: labelRefs.submission.current.offsetWidth,
      issueFile: labelRefs.issueFile.current.offsetWidth,
      issueCover: labelRefs.issueCover.current.offsetWidth,
    })
  }, []);

  const isDataValid = () => {
    let errors = {};
    isPagesValid(pages, errors);
    isDateValid(publicationDate, errors);
    isFileValid(issueFile, errors);
    isFilesValid(submissionFiles, errors);
    setError(errors);
    return !Object.values(errors).some(error => error);
  }

  const isPagesValid = (values, errors) => {
    if (values.some(page => isEmptyOrNull(page.first_page) || isEmptyOrNull(page.last_page))) {
      errors ?
        Object.assign(errors, { pages: 'Заполните номера страниц для каждой из статей' })
        :
        setError({ ...error, pages: 'Заполните номера страниц для каждой из статей' });
      return false;
    }
    errors ?
      Object.assign(errors, { pages: null })
      :
      setError({ ...error, pages: null });
    return true;
  }

  const isDateValid = (value, errors) => {
    if (isEmptyOrNull(value)) {
      errors ?
        Object.assign(errors, { date: 'Поле не должно быть пустым' })
        :
        setError({ ...error, date: 'Поле не должно быть пустым' });
      return false;
    }
    else {
      if (new Date(value) > new Date()) {
        errors ?
          Object.assign(errors, { date: 'Неверный формат' })
          :
          setError({ ...error, date: 'Неверный формат' });
        return false;
      }
    }
    errors ?
      Object.assign(errors, { date: null })
      :
      setError({ ...error, date: null });
    return true;
  }

  const isFileValid = (file, errors) => {
    if (!file) {
      errors ?
        Object.assign(errors, { issueFile: 'Загрузите файл с выпуском' })
        :
        setError({ ...error, issueFile: 'Загрузите файл с выпуском' });
      return false;
    }
    errors ?
      Object.assign(errors, { issueFile: null })
      :
      setError({ ...error, issueFile: null});
    return true;
  }

  const isFilesValid = (files, errors) => {
    if (files.some(item => !item.file)) {
      errors ?
        Object.assign(errors, { submissionFile: 'Загрузите файл для каждой из статей' })
        :
        setError({ ...error, submissionFile: 'Загрузите файл для каждой из статей' });
      return false;
    }
    errors ?
      Object.assign(errors, { submissionFile: null })
      :
      setError({ ...error, submissionFile: null});
    return true;
  }

  const handleCloseDialog = () => {
    setDialog({...dialog, ['open']: false});
  }

  const onChangeFileInput = event => {
    const id = event.target.id;
    const file = event.target.files[0];
    if (id === 'issueFile') {
      isFileValid(file);
      setIssueFile(file);
    }
    else if (id === 'issueCover') {
      setIssueCover(file);
    }
    else {
      const newFiles = [...submissionFiles];
      newFiles.forEach(item => {
        if (item.submission_id == id) {
          item.file = file;
        }
      });
      isFilesValid(newFiles);
      setSubmissionFiles(newFiles);
    }
  }

  const buildFileSelector = id => {
    const fileSelector = document.createElement('input');
    fileSelector.type = 'file';
    fileSelector.onchange = onChangeFileInput;
    fileSelector.id = id;
    fileSelector.accept = 'application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/pdf';
    return fileSelector;
  }

  const fileSelectors = issue.submissions.map(item => buildFileSelector(item.submission_id));

  const handlePagesChange = index => ({ target: { id, value } }) => {
    const newValues = [...pages];
    newValues[index][id] = replaceChar(value);
    if (newValues.every(page => !isEmptyOrNull(page.first_page) && !isEmptyOrNull(page.last_page))) {
      setError({ ...error, pages: null });
    }
    setPages(newValues);
  }

  const handleDateChange = ({ target: { value } }) => {
    isDateValid(value);
    setPublicationDate(value);
  }

  const renderSubmissions = () => {
    const elements = [];
    for (const item of issue.submissions) {
      const index = issue.submissions.indexOf(item);
      elements.push(
        <Grid
          key={item.submission_id}
          container
          spacing={2}
          item sm={12}
          alignItems="flex-start"
          className={classes.grow}
        >
          <Grid item xs={12} sm={7}>
            <ListItemText
              primary={
                <Typography color="inherit">
                  { item.title_ru }
                </Typography>
              }
              secondary={
                <Typography component="p" color="textSecondary">
                  { getNames(item.authors, 'ru') }
                </Typography>
                }
            />
          </Grid>
          <Grid
            container
            item xs={12} sm={2}
            alignItems="center"
            justify="center"
            className={classes.grow}
          >
            <Grid item xs={12}>
              <Typography className={classes.textAlign}>
                Страницы
              </Typography>
            </Grid>
            <Grid item xs={5}>
              <TextField
                inputProps={{ className: classes.textAlign }}
                id="first_page"
                value={pages[index].first_page}
                onChange={handlePagesChange(index)}
              />
            </Grid>
            <Grid item xs={1} className={classes.textAlign}>-</Grid>
            <Grid item xs={5}>
              <TextField
                inputProps={{className: classes.textAlign}}
                id="last_page"
                value={pages[index].last_page}
                onChange={handlePagesChange(index)}
              />
            </Grid>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FileUploader
              label="Файл&nbsp;статьи"
              value={submissionFiles[index].file}
              id={item.submission_id}
              index={index}
              labelRef={labelRefs.submission}
            />
          </Grid>
        </Grid>
      );
    }
    return elements;
  }

  const FileUploader = props => {
    // eslint-disable-next-line
    const { label, value, accept, id, inputRef, index, labelRef } = props;
    return (
      <FormControl
        fullWidth
        variant='outlined'
        key={id}
        required={id !== 'issueCover'}
      >
        <InputLabel ref={labelRef} htmlFor="component-outlined">
          {label}
        </InputLabel>
        <OutlinedInput
          classes={{
            root: classes.upload,
            input: classes.upload
          }}
          readOnly
          onClick={handleLoadFile(inputRef ? {inputRef} : {index})}
          value={!value ? '' : value.name}
          labelWidth={labelWidth[inputRef ? id : 'submission']} 
          placeholder="Кликните, чтобы загрузить файл"
          startAdornment={
            <InputAdornment position="start">
              <UploadIcon className={classes.icon} />
            </InputAdornment>
          }
          inputProps={{
            tabIndex: "-1"
          }}
        />
        {inputRef && (
          <input
            accept={accept}
            ref={inputRef}
            id={id}
            type="file"
            style={{ display: 'none' }}
            onChange={onChangeFileInput}
          />
        )}
      </FormControl>
    );
  }

  const handleLoadFile = ({ inputRef, index }) => () => {
    !inputRef ? fileSelectors[index].click() : inputRef.current.click();
  }

  const handleSave = () => {
    if (!isDataValid()) {
      return;
    }
    setDialog({
      open: true,
      text: 'Сохранить выпуск?'
    });
  }

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append('issueFile', issueFile);
    formData.append('issueCover', issueCover);
    for (const item of submissionFiles) {
      formData.append('submissionFiles', item.file);
    }
    formData.append('data', JSON.stringify({
      publication_date: publicationDate,
      pages: pages.map(item => {
        return {
          submission_id: item.submission_id,
          pages: item.first_page + '-' + item.last_page
        }
      })
    }));    
    uploadPublishedIssue(issue.issue_id, formData)
      .then(async (res) => {
        if (res.status === 200) {
          window.location.reload();
        }
        else {
          setSnackbar({
            open: true,
            variant: 'error',
            message: res.message || 'Ошибка на сервере'
          });
        }
      });
  }

  return (
    <>
      <IssueToolbar
        onSave={handleSave}
        onCancel={handleCancelling('Отменить загрузку номера?')}
        title="Загрузка выпуска с систему"
      />
      <Paper square className={classes.paper}>
        <FormControl
          error={formControlError}
          style={{ display: !formControlError ? 'none' : 'initial' }}
        >
          <FormHelperText className={classes.errorMessage}>
            {error.issueFile &&
              <>
               { error.issueFile }
               <br />
              </>
            }
            { error.submissionFile &&
              <>
                { error.submissionFile }
                <br />
              </>
            }
            { error.pages && error.pages }
          </FormHelperText>
        </FormControl>
        <Grid container spacing={2} className={classes.grow}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              error={!!error.date}
              id="publicationDate"
              label={error.date || "Дата публикования"}
              type="date"
              onChange={handleDateChange}
              InputLabelProps={{ shrink: true }}
              className={classes.date}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FileUploader 
              label="Файл&nbsp;выпуска"
              value={issueFile}
              id='issueFile'
              accept="application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/pdf"
              inputRef={inputIssueFileRef}
              labelRef={labelRefs.issueFile}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FileUploader
              label="Обложка&nbsp;выпуска"
              value={issueCover}
              id='issueCover' 
              accept="image/*"
              inputRef={inputIssueCoverRef}
              labelRef={labelRefs.issueCover}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} className={classes.grow}>
          <Grid item xs={12}>
            <Typography paragraph variant="body2" className={classes.title}>
              Список&nbsp;статей
            </Typography>
          </Grid>
          { renderSubmissions() }
        </Grid>
      </Paper>
      <ConfirmDialog 
        open={dialog.open}
        text={dialog.text}
        closeYes={handleSubmit}
        closeNo={handleCloseDialog}
      />
    </>
  );
}

UploadingIssueContent.propTypes = {
  issue: PropTypes.object.isRequired,
  handleCancelling: PropTypes.func.isRequired,
  setSnackbar: PropTypes.func.isRequired
};

// Форма просмотра выпуска

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%'
  },
  grow: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing(3),
    width: '100%',
    flexGrow: 1,
    minHeight: 'calc(100vh - 113px)'
  },
  title: {
    margin: theme.spacing(2, 0, 0),
    fontWeight: 500
  },
  listItem: {
    '&:hover': {
      color: theme.palette.primary.main
    }
  },
  button: {
    marginBottom: theme.spacing(2)
  }
}));

function Issue(props) {
  const classes = useStyles();
  const [ issue, setIssue ] = useState(props.issue);
  const [ issueForUpdate, setIssueForUpdate ] = useState(null);
  const [ issueAction, setIssueAction ] = useState('');
  const [ updatingIssue, setUpdatingIssue ] = useState(false);
  const [ uploadingIssue, setUploadingIssue ] = useState(false);
  const [ cancelling, setCancelling ] = useState(false);
  const [ snackbar, setSnackbar ] = useState({
    open: false,
    variant: 'success',
    message: ''
  });
  const [dialog, setDialog] = useState({
    open: false,
    text: ''
  });

  const status = issue.issue_status.id;
  const isPublished = issue.issue_status.id === ISSUE_STATUS.PUBLISHED;
  const isPublishedOnSite = issue.is_published_on_site;

  const handleUpdatingIssue = () => {
    setIssueForUpdate({
      issue_id: issue.issue_id,
      number: issue.number,
      volume: issue.volume.id,
      submissions: issue.submissions
    });
    updatingIssue ? setUpdatingIssue(false) : setUpdatingIssue(true);
    setCancelling(false);
  }

  const handleUploadingIssue = () => {
    uploadingIssue ? setUploadingIssue(false) : setUploadingIssue(true);
    setCancelling(false);
  }

  const handleCancelling = text => () => {
    setCancelling(true);
    setDialog({ open: true, text: text });
  }

  const handleCloseDialog = () => {
    setCancelling(false);
    setIssueAction('');
    setDialog({...dialog, ['open']: false});
  }

  const handleManageClick = action => () => {
    setIssueAction(action);
    setDialog({
      open: true,
      text: dialogMessage[action]
    });
  }

  const handleCloseSnack = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({...snackbar, ['open']: false});
  }

  const handleDeleteIssue = () => {
    deleteIssue(issue.issue_id)
      .then(res => {
        if (res.status === 200) {
          window.location.href = '/dashboard/issues';
        }
        else {
          setSnackbar({
            open: true,
            variant: 'error',
            message: res.message || 'Ошибка на сервере'
          });
        }
      });
  }

  const handleDialogYes = () => {
    if (issueAction === 'delete') {
      handleDeleteIssue();
    }
    else if (cancelling) {
      setCancelling(false);
      setUpdatingIssue(false);
      setUploadingIssue(false);
    }
    else {
      manageIssue(issue.issue_id, { action: issueAction })
        .then(async (res) => {
          if (res.status === 200) {
            setIssue(await getIssue(issue.issue_id));
            setSnackbar({
              open: true,
              variant: 'success',
              message: snackbarMessage[issueAction]
            });
          }
          else {
            setSnackbar({
              open: true,
              variant: 'error',
              message: res.message || 'Ошибка на сервере'
            });
          }
        });
    }
    handleCloseDialog();
  }

  const CustomButton = (handleClick, title, disabled) => (
    <Button 
      fullWidth
      variant="outlined"
      color="primary"
      className={classes.button}
      disabled={disabled}
      onClick={handleClick}
    >
      {title}
    </Button>
  );

  const Title = label => (
    <Typography
      paragraph
      variant="body2"
      className={classes.title}
    >
      {label}
    </Typography>
  );

  const issueName = `Выпуск\xa0№\xa0${issue.number}\xa0(${issue.number_general})`;

  return (
    <>
      <Head>
        <title>{ issueName } | Панель управления</title>
      </Head>
      <DashboardLayout navBarTitle="Выпуск">
        { (!updatingIssue && !uploadingIssue) && (
          <Grid container spacing={3} className={classes.grow}>
            <Grid container item md={8} className={classes.grow}>
              <Paper square className={classes.paper}>
                <Box
                  display="flex"
                  width={1}
                  alignItems="center"
                  pb={2}
                >
                  <Typography variant="h6">
                    { issueName }
                  </Typography>
                  <div className={classes.grow}/>
                  {isPublished && (
                    <Download fileId={issue.file}>
                      <Tooltip title="Скачать выпуск">
                        <IconButton>
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                    </Download>
                  )}
                </Box>
                <Grid container>
                  <Grid item xs={12} sm={6} md={isPublished ? 4 : 6}>
                    { Title("Статус\xa0выпуска") }
                    <Typography paragraph>
                      {issue.issue_status.name}
                      {isPublishedOnSite && '\xa0на\xa0сайте'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={isPublished ? 4 : 6}>
                    { Title("Дата\xa0создания") }
                    <Typography paragraph>
                      {getDate(issue.creation_date)}
                    </Typography>
                  </Grid>
                  {isPublished && (
                    <Grid item xs={12} sm={6} md={4}>
                      { Title("Дата\xa0опубликования") }
                      <Typography paragraph>
                        {getDate(issue.publication_date)}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
                { Title("Содержание\xa0выпуска") }
                <List dense>
                  { issue.submissions.map(submission => (
                    <ListItem 
                      key={submission.submission_id} 
                      className={classes.listItem} 
                      button 
                      component={NextLink} 
                      href={`/dashboard/submission?slug=${submission.submission_id}`}
                      hrefAs={`/dashboard/submission/${submission.submission_id}`}
                      target="_blank"
                    >
                      <ListItemText
                        fontSize="0.875rem"
                        primary={
                          <Typography color="inherit">
                            {submission.title_ru}
                          </Typography>
                        }
                        secondary={
                          <Typography component="p" color="textSecondary">
                            { getNames(submission.authors, 'ru') }
                          </Typography>
                        }
                      />
                      { isPublished && (
                        <ListItemSecondaryAction>
                          <Download fileId={submission.file}>
                            <Tooltip title="Скачать текст статьи">
                              <IconButton edge="end" aria-label="Download">
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                          </Download>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
            <Grid container item md={4} className={classes.grow}>
              <Paper square className={classes.paper}>
                <Typography paragraph noWrap variant="h6">
                  Управление&nbsp;выпуском
                </Typography>
                <div>
                  {CustomButton(
                    handleUpdatingIssue,
                    'Редактировать\xa0выпуск',
                    status > ISSUE_STATUS.CREATED
                  )}
                  {CustomButton(
                    handleManageClick('delete'),
                    'Удалить\xa0выпуск',
                    status > ISSUE_STATUS.CREATED
                  )}
                  {CustomButton(
                    handleManageClick('sendToEditorialBoard'),
                    'Отправить\xa0на\xa0рассмотрение редакционной\xa0коллегии',
                    !isPublished ? (status >= ISSUE_STATUS.CONSIDERATION_EDITORIAL_BOARD ? true : false) : true
                  )}
                  {CustomButton(
                    handleManageClick('sendToEditor'),
                    'Отправить\xa0на\xa0рассмотрение главному\xa0редактору',
                    !isPublished ?
                      ((status === ISSUE_STATUS.ACCEPTED_EDITORIAL_BOARD || status === ISSUE_STATUS.REJECTED_EDITORIAL_BOARD) ? false : true) :
                      true
                  )}
                  {CustomButton(
                    handleManageClick('publishOnSite'),
                    'Опубликовать\xa0на\xa0сайте',
                    isPublished ? isPublishedOnSite : true
                  )}
                  {CustomButton(
                    handleManageClick('unpublishOnSite'),
                    'Скрыть\xa0с\xa0сайта',
                    isPublished ? !isPublishedOnSite : true)}
                  {CustomButton(
                    handleUploadingIssue,
                    'Загрузить\xa0выпуск в\xa0систему',
                    isPublished
                  )}
                  <Download
                    zip
                    data={issue.issue_id}
                    message="Ошибка загрузки даннных о выпуске"
                  >
                    {CustomButton(
                      undefined,
                      'Загрузить\xa0данные о\xa0выпуске',
                      status < ISSUE_STATUS.ACCEPTED_EDITOR
                    )}
                  </Download>
                </div>
              </Paper>
            </Grid>
          </Grid>
        )}

        { updatingIssue &&
          <TransferList
            handleCancelling={handleCancelling}
            data={issueForUpdate}
            setIssue={setIssue} 
            editMode
          />
        }

        { uploadingIssue && (
          <UploadingIssueContent
            issue={issue}
            setIssue={setIssue}
            handleCancelling={handleCancelling}
            setSnackbar={setSnackbar}
            setCancelling={setCancelling}
          />
        )}

        <StyledSnackbar
          open={snackbar.open}
          variant={snackbar.variant}
          message={snackbar.message}
          onClose={handleCloseSnack}
        />

        <ConfirmDialog 
          open={dialog.open}
          text={dialog.text}
          closeYes={handleDialogYes}
          closeNo={handleCloseDialog}
        />
      </DashboardLayout>
    </>
  );
}

Issue.getInitialProps = async ({ req, query }) => {
  const issueId = query.slug;
  const issue = req ? await getIssue(issueId, req.headers.cookie) : await getIssue(issueId);
  return { issue }
}

Issue.propTypes = {
  issue: PropTypes.object.isRequired
};

export default Issue;
