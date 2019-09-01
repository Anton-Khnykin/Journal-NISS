import React, { useState } from 'react';
import PropTypes from 'prop-types';
import StyledSnackbar from 'components/dashboard/StyledSnackbar';
import downloadjs from 'downloadjs';
import { getFormedReview } from 'middleware/api/reviewer';
import { getIssueData } from 'middleware/api/secretary';
import { downloadFile, getFilePreview } from 'middleware/api/public';

const Download = ({ fileId, data, func, preview, formed, zip, message, children, fullWidth }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleCloseSnack = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  }

  const handleDownload = () => {
    if (formed) {
      const data = func();
      if (!data) {
        return;
      }
      getFormedReview(data.id, data.data)
        .then(res => {
          if (res.status === 200) {
            downloadjs(res.data, res.name, res.type);
            setSnackbarOpen(false);
          }
          else {
            setSnackbarOpen(true);
          }
        })
    }
    else if (preview) {
      getFilePreview(fileId)
        .then(res => {
          if (res.status === 200) {
            const url = 'https://journal-system.herokuapp.com' + encodeURIComponent(res.filePath);
            func('https://docs.google.com/gview?url=' + url + '&embedded=true');
            setSnackbarOpen(false);
          }
          else {
             setSnackbarOpen(true);
          }
        });
    }
    else if (zip) {
      getIssueData(data)
        .then(res => {
          if (res.status === 200) {
            downloadjs(res.data, res.name, res.type);
            setSnackbarOpen(false);
          }
          else {
             setSnackbarOpen(true);
          }
        });
    }
    else {
      downloadFile(fileId)
        .then(res => {
          if (res.status === 200) {
            downloadjs(res.data, res.name, res.type);
            setSnackbarOpen(false);
          }
          else {
            setSnackbarOpen(true);
          }
        })
    }
  }

  return (
    <>
      <span onClick={handleDownload} style={{ width: fullWidth ? '100%' : 'auto' }}>
        {children}
      </span>
      <StyledSnackbar
        open={snackbarOpen}
        variant="error"
        message={message || "Ошибка загрузки файла"}
        onClose={handleCloseSnack}
      />
    </>
  )
}

Download.propTypes = {
  fileId: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]),
  data: PropTypes.any,
  func: PropTypes.func,
  preview: PropTypes.bool,
  formed: PropTypes.bool,
  zip: PropTypes.bool,
  message: PropTypes.string,
  children: PropTypes.any,
  fullWidth: PropTypes.bool
}

export default Download;