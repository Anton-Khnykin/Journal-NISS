import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { useDropzone } from 'react-dropzone';
import Typography from '@material-ui/core/Typography';

const useDropzoneStyles = makeStyles(theme => ({
  container: {
    width: '100%'
  },
  dropzone: {
    width: '100%',
    border: '1px solid ' + theme.palette.primary.main,
    borderStyle: 'dashed',
    borderRadius: 5,
  },
  input: {
    margin: theme.spacing(2)
  },
  textAlign: {
    textAlign: 'center'
  }
}));

function SimpleDropzone(props) {
  const classes = useDropzoneStyles();
  const { setFile } = props;
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: 'application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/pdf',
    multiple: false,
    noKeyboard: true,
    onDrop: acceptedFiles => setFile(acceptedFiles[0])
  });

  const uploadedFiles = acceptedFiles.map(file => (
    <Typography key={file.path} className={classes.textAlign}>
      {file.path}
    </Typography>
  ));

  return (
    <section className={classes.container}>
      <div
        {...getRootProps({ className: 'dropzone' })}
        className={classes.dropzone}
      >
        <div className={classes.input}>
          <input {...getInputProps()} />
          <Typography
            color="textSecondary"
            variant="body2"
            className={classes.textAlign}
          >
            Переместите файл сюда или кликните
          </Typography>
          {uploadedFiles.length !== 0 && (
            <aside>
              {uploadedFiles}
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}

SimpleDropzone.propTypes = {
  setFile: PropTypes.func.isRequired
}

export default SimpleDropzone;