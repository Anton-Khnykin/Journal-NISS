import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { useDropzone } from 'react-dropzone';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Cancel from '@material-ui/icons/Cancel';
import FileIcon from '../../static/file-icon.png';
import Fade from '@material-ui/core/Fade';
import StyledSnackbar from './StyledSnackbar';
import { FILE_TYPE } from 'middleware/enums';

const useStyles = makeStyles(theme => ({
  drop: {
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.palette.primary.main
  },
  text: {
    fontSize: '1.875rem',
    color: theme.palette.text.hint,
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.5rem'
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '1rem'
    }
  },
  cont: {
    height: '100%'
  },
  preview: {
    [theme.breakpoints.down('xs')]: {
      minHeight: 100,
      paddingBottom: theme.spacing(1)
    }
  },
  img: {
    width: 'auto',
    height: 80,
    [theme.breakpoints.down('xs')]: {
      height: 50
    }
  },
  thumbs: {
    paddingTop: theme.spacing(2),
  },
  fileName: {
    width: '100%'
  },
  thumbCancel: {
    height: 22,
    width: 22,
    color: theme.palette.primary.light
  },
  cancelGrid: {
    '& :hover': {
      color: theme.palette.primary.main,
      cursor: 'pointer'
    }
  },
  formControl: {
    width: '100%',
    maxWidth: 250
  },
}));

function FilesDropzone(props) {
  const classes = useStyles();
  const { maxFiles, maxFileSize, files, setFiles, readOnlyMode } = props;
  const [ openSnack, setOpenSnack ] = useState(false);
  const [ snackMessage, setSnackmessage ] = useState('');
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, ' +
            'application/pdf, application/x-rar-compressed, application/zip, ' +
            'application/octet-stream, application/x-zip-compressed, multipart/x-zip',
    noKeyboard: true,
    onDrop: acceptedFiles => {
      if (files.length + acceptedFiles.length > maxFiles) {
        setSnackmessage('Максимальное количество файлов — 4');
        setOpenSnack(true);
        return;
      }
      
      let rejected, tooBig = false;
      for (const acceptedFile of acceptedFiles) {
        if (acceptedFile.size > maxFileSize) {
          setSnackmessage('Максимальный размер загружаемого файла — 10 Мбайт');
          setOpenSnack(true);
          tooBig = true;
          break;
        }

        acceptedFile.fileType = ' ';

        for (const file of files) {
          const fileWithoutType = {...file};
          fileWithoutType.fileType = ' ';
          if (JSON.stringify(acceptedFile) === JSON.stringify(fileWithoutType)) {
            setSnackmessage('Файл уже прикреплён');
            setOpenSnack(true);
            rejected = true;
            break;
          }
        }

        if (rejected) {
          break;
        }
      }
      
      if (!rejected && !tooBig) {
        setFiles([...files, ...acceptedFiles]);
      }
    }
  });

  function handleCloseSnack(event, reason) {
    if (reason === 'clickaway') {
      return;
    }

    setOpenSnack(false);
  }
  
  function handleFileTypeChange(event, file) {
    const value = event.target.value;
    if (value === '') {
      return;
    }

    const fileId = files.indexOf(file);
    const filesCopy = [...files];
    filesCopy[fileId].fileType = value;

    setFiles(filesCopy);
  }

  const handleFileDeletion = file => {
    const fileId = files.indexOf(file);
    const filesCopy = [...files];
    filesCopy.splice(fileId, 1);
    
    setFiles(filesCopy);
  }

  const thumbs = () => {
    const itemAlreadySelected = (array, value) => {
      for (const obj of array) {
        if (obj.fileType === value) {
          return true;
        }
      }
      return false;
    }

    return files.map((file, idx) => (
      <Fade key={file.name + idx} in>
        <Grid
          container
          item xs={6} sm={3} md={2}
          className={classes.preview}
          justify="center"
        >
          { !readOnlyMode &&
            <Grid
              container
              justify="flex-end"
              className={classes.cancelGrid}
              onClick={() => handleFileDeletion(file)}
            >
              <Cancel className={classes.thumbCancel} />
            </Grid>
          }
          <img
            src={FileIcon}
            className={classes.img}
          />
          <Typography align="center" className={classes.fileName} noWrap>
            { file.name }
          </Typography>

          <FormControl className={classes.formControl}>
            <Select
              value={file.fileType}
              onChange={event => handleFileTypeChange(event, file)}
              inputProps={{
                name: 'File type',
                id: 'file-type',
                readOnly: readOnlyMode || !(file instanceof File)
              }}
            >
              <MenuItem value=" ">
                <em>Тип файла</em>
              </MenuItem>
              <MenuItem
                disabled={itemAlreadySelected(files, FILE_TYPE.ARTICLE)}
                value={FILE_TYPE.ARTICLE}
              >
                Текст статьи
              </MenuItem>
              <MenuItem
                disabled={itemAlreadySelected(files, FILE_TYPE.OPEN_PUBLICATION_CONCLUSION)}
                value={FILE_TYPE.OPEN_PUBLICATION_CONCLUSION}
              >
                Заключение о возможности открытого публикования
              </MenuItem>
              <MenuItem
                disabled={itemAlreadySelected(files, FILE_TYPE.IDENTIFICATION_CONCLUSION)}
                value={FILE_TYPE.IDENTIFICATION_CONCLUSION}
              >
                Идентификационное заключение
              </MenuItem>
              <MenuItem
                disabled={itemAlreadySelected(files, FILE_TYPE.EXPERT_CONCLUSION)}
                value={FILE_TYPE.EXPERT_CONCLUSION}
              >
                Экспертное заключение
              </MenuItem>
              <MenuItem
                disabled={itemAlreadySelected(files, FILE_TYPE.OTHER)}
                value={FILE_TYPE.OTHER}
              >
                Прочее
              </MenuItem>
            </Select>
          </FormControl>

        </Grid>
      </Fade>
      ));
  }

  return (
    <>
      { !readOnlyMode &&
        <Grid container>
          <Grid
            item
            xs={12}
            {...getRootProps({className: classes.drop})}
          >
            <Grid
              container
              justify="center"
              alignItems="center"
              className={classes.cont}
            >
              <Grid item>
                <input {...getInputProps()} />
                <Typography className={classes.text}>
                  Переместите файлы сюда или кликните
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      }
      <Grid container className={classes.thumbs}>
        <Grid container item xs={12} spacing={2}>
          { thumbs() }
        </Grid>
      </Grid>

      <StyledSnackbar
        open={openSnack}
        variant="error"
        message={snackMessage}
        onClose={handleCloseSnack}
      />

    </>
  );
}

FilesDropzone.propTypes = {
  maxFiles: PropTypes.number.isRequired,
  maxFileSize: PropTypes.number.isRequired,
  files: PropTypes.array.isRequired,
  setFiles: PropTypes.func.isRequired,
  readOnlyMode: PropTypes.bool
};

export default FilesDropzone;
