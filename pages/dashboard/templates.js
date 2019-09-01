import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import DownloadIcon from '@material-ui/icons/CloudDownload';
import PreviewIcon from '@material-ui/icons/Visibility';
import DashboardLayout from 'components/dashboard/DashboardLayout';
import SimpleDropzone from 'components/dashboard/SimpleDropzone';
import StyledSnackbar from 'components/dashboard/StyledSnackbar';
import ConfirmDialog from 'components/dashboard/ConfirmDialog';
import WithMobileDialog from 'components/WithMobileDialog';
import Download from 'components/Download';
import { getTemplates, createTemplate, deleteTemplate } from 'middleware/api/secretary';
import { isEmptyOrNull, isFieldEmpty } from 'utils/validation';

// Компонент с полями

const NewFields = ({ onBlur, onDelete, error, setError }) => {
  const [ values, setValues ] = useState({ caption: '', placeholder: '' });

  const handleChange = ({ target: { name, value } }) => {
    setError({ ...error, fields: null });
    setValues({ ...values, [name]: value });
  }

  return (
    <Grid container>
      <Grid container item sm={11}>
        <Box
          component={Grid}
          item xs={12} sm={6}
          pr={{ sm: 1 }}
        >
          <TextField
            fullWidth
            values={values.caption}
            name='caption'
            label='Название поля'
            onChange={handleChange}
            onBlur={onBlur}
          />
          </Box>
        <Box
          component={Grid}
          item xs={12} sm={6}
          pl={{ sm: 1 }}
        >
          <TextField
            fullWidth
            value={values.placeholder}
            name='placeholder'
            label='Обозначение поля'
            onChange={handleChange}
            onBlur={onBlur}
          />
        </Box>
      </Grid>
      <Grid container item sm={1}>
        <IconButton
          edge="end"
          aria-label="Delete"
          tabIndex={-1}
          onClick={onDelete}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Grid>
    </Grid>
  );
}

NewFields.propTypes = {
  onBlur: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  error: PropTypes.object,
  setError: PropTypes.func
};

// Модальное окно для создания шаблона
  
const CreatingTemplateContent = ({ open, onClose, setTemplates, setSnackbar }) => {
  const [ file, setFile ] = useState(null);
  const [ templateName, setTemplateName ] = useState('');
  const [ fields, setFields ] = useState([{ caption: '', placeholder: '' }]);
  const [ error, setError ] = useState({});

  useEffect(() => {
    if (file) {
      setError({ ...error, file: null });
    }
  }, [file]);

  const handleChange = ({ target: { value } }) => {
    let errors = {...error};
    isFieldEmpty('name', value, errors);
    setError(errors);
    setTemplateName(value);
  }

  const handleAdd = () => {
    const newFields = [...fields];
    newFields.push({ caption: '', placeholder: '' });
    setFields(newFields);
  }

  const handleBlur = index => ({ target: { name, value } }) => {
    const temp = [...fields];
    temp[index][name] = value;
    setFields(temp);
  };

  const handleDelete = index => () => {
    let newValues = [...fields];
    newValues.splice(index, 1);
    setFields(newValues);
  }

  const handleSubmit = () => {
    let errors = {};

    if (fields.length === 0) {
      Object.assign(errors, { fields: 'Создайте как минимум одно поле шаблона' });
    }
    for (const field of fields) {
      for (const prop in field) {
        if (isEmptyOrNull(field[prop])) {
          Object.assign(errors, { fields: 'Заполните все поля шаблона' });
          break;
        }
      }
    }
    isFieldEmpty('name', templateName, errors);
    if (!file) {
      Object.assign(errors, { file: 'Прикрепите файл' });
    }
    setError(errors);
    if (Object.values(errors).some(error => error)) {
      return;
    }

    const formData = new FormData();
    formData.append('template_file', file);
    formData.append('data', JSON.stringify({
      name: templateName,
      fields: fields
    }));
    createTemplate(formData)
      .then(async (res) => {
        if (res.status === 200) {
          setTemplates(await getTemplates());
          onClose();
          setSnackbar({
            open: true,
            variant: 'success',
            message: 'Шаблон успешно создан'
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

  return (
    <WithMobileDialog 
      maxWidth="sm"
      open={open}
      onClose={onClose}
      fullHeight
      title="Создание&nbsp;шаблона"
    >
      <DialogContent dividers>
        <TextField
          fullWidth
          label={error.name || "Название шаблона"}
          error={!!error.name}
          value={templateName}
          onChange={handleChange}
        />
        <Box
          component={Typography}
          paragraph
          variant='body2'
          fontWeight={500}
          pt={2}
        >
          Файл&nbsp;с&nbsp;шаблоном
        </Box>

        {(error.file || error.fields) &&
          <Typography variant="caption" color="error" paragraph>
            {error.file &&
              <>
                {error.file}
                <br/>
              </>
            }
            {error.fields && error.fields}
          </Typography>
        }

        <SimpleDropzone setFile={setFile} />

        <Grid container item xs={12} alignItems='center'>
          <Box
            component={Typography}
            variant='body2'
            fontWeight={500}
          >
            Поля&nbsp;шаблона
          </Box>
          <div style={{ flexGrow: 1 }}></div>
          <IconButton onClick={handleAdd}>
            <AddIcon />
          </IconButton>
        </Grid>

        <List>
          { fields.map((field, index) => (
            <NewFields
              key={'filed' + index}
              onDelete={handleDelete(index)}
              onBlur={handleBlur(index)}
              error={error}
              setError={setError}
            />
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Отмена
        </Button>
        <Button color="primary" onClick={handleSubmit}>
          Сохранить
        </Button>
      </DialogActions>
    </WithMobileDialog>
  );
}

CreatingTemplateContent.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  setTemplates: PropTypes.func.isRequired,
  setSnackbar: PropTypes.func.isRequired
};

// Форма для просмотра и управления шаблонами

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1
  },
  container: {
    width: '100%',
    height: '100%',
    minHeight: 'calc(100vh - 90px)'
  },
  paper: {
    height: '100%',
    padding: theme.spacing(2)
  },
  previewTitle: {
    fontSize: '1.25rem',
    color: theme.palette.text.hint,
    textAlign: 'center',
    width: '100%'
  },
  preview: {
    width: '100%',
    height: '100%',
    border: 'none'
  }
}));

function Templates(props) {
  const classes = useStyles();
  const [ templates, setTemplates ] = useState(props.templates);
  const [ modalOpen, setModalOpen ] = useState(false);
  const [ templateForDelete, setTemplateForDelete ] = useState(null);
  const [ url, setUrl ] = useState('');
  const [ snackbar, setSnackbar ] = useState({
    open: false,
    variant: 'success',
    message: ''
  });
  const [ dialog, setDialog ] = useState({
    open: false,
    text: ''
  });

  const handleDelete = () => {
    deleteTemplate(templateForDelete)
      .then(async (res) => {
        if (res.status === 200) {
          setTemplates(await getTemplates());
          setSnackbar({
            open: true,
            variant: 'success',
            message: 'Шаблон успешно удален'
          });
        }
        else {
          setSnackbar({
            open: true,
            variant: 'success',
            message: res.message || 'Ошибка на сервере'
          });
        }
      });
    handleCloseDialog();
  }

  const handleCloseDialog = () => {
    setTemplateForDelete(null);
    setDialog({...dialog, ['open']: false});
  }

  const handleModalOpen = () => {
    setModalOpen(true);
  }

  const handleModalClose = () => {
    setModalOpen(false);
  }

  const handleDeleteClick = (templateId, templateName) => () => {
    setTemplateForDelete(templateId);
    setDialog({
      open: true,
      text: `Вы уверены, что хотите удалить шаблон "${templateName}"?`
    });
  }

  const handleCloseSnack = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({...snackbar, ['open']: false});
  }

  return (
    <>
      <Head>
        <title>Шаблоны для рецензий | Панель управления</title>
      </Head>
      <DashboardLayout navBarTitle="Шаблоны для рецензий">
        <Grid container spacing={3} className={classes.grow}>
          <Grid item md={6} className={classes.container}>
            <Paper square className={classes.paper}>
              <Box
                display="flex"
                width={1}
                alignItems='center'
              >
                <Typography noWrap variant='h6'>
                  Шаблоны&nbsp;рецензий
                </Typography>
                <div className={classes.grow}/>
                <Tooltip title="Создать шаблон">
                  <IconButton onClick={handleModalOpen}>
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <List>
                { templates.map(template => (
                  <ListItem key={template.id}>
                    <ListItemText primary={template.name}/>
                    <ListItemSecondaryAction>
                      <Download
                        preview
                        fileId={template.file}
                        func={setUrl}
                        message="Ошибка отображения файла"
                      >
                        <Tooltip title="Предпросмотр">
                          <IconButton edge="end" aria-label="Preview">
                            <PreviewIcon />
                          </IconButton>
                        </Tooltip>
                      </Download>
                      <Download fileId={template.file}>
                        <Tooltip title="Скачать">
                          <IconButton edge="end" aria-label="Download">
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      </Download>
                      <Tooltip title="Удалить">
                        <IconButton
                          edge="end"
                          aria-label="Delete"
                          onClick={handleDeleteClick(template.id, template.name)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid
            container
            item md={6}
            alignItems="flex-start"
            className={classes.container}
          >
            {url === '' ?
              <Typography className={classes.previewTitle}>
                Предпросмотр&nbsp;документа
              </Typography>
              :
              <Box height={1}>
                <iframe className={classes.preview} src={url}></iframe>
              </Box>
            }
          </Grid>
        </Grid>

        <CreatingTemplateContent
          open={modalOpen}
          onClose={handleModalClose}
          setTemplates={setTemplates}
          setSnackbar={setSnackbar}
        />

        <StyledSnackbar
          open={snackbar.open}
          variant={snackbar.variant}
          message={snackbar.message}
          onClose={handleCloseSnack}
        />

        <ConfirmDialog 
          open={dialog.open}
          text={dialog.text}
          closeYes={handleDelete}
          closeNo={handleCloseDialog}
        />

      </DashboardLayout>
    </>
  );
}

Templates.getInitialProps = async ({ req }) => {
  const templates = req ? await getTemplates(req.headers.cookie) : await getTemplates();
  return { templates };
}

Templates.propTypes = {
  templates: PropTypes.array.isRequired
};

export default Templates;
