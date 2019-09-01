import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import DashboardLayout from 'components/dashboard/DashboardLayout';
import NothingToDisplayText from 'components/dashboard/NothingToDisplayText';
import ReviewPanel from 'components/dashboard/ReviewPanel';
import ConfirmDialog from 'components/dashboard/ConfirmDialog';
import StyledSnackbar from 'components/dashboard/StyledSnackbar';
import SimpleDropzone from 'components/dashboard/SimpleDropzone';
import WithMobileDialog from 'components/WithMobileDialog';
import Download from 'components/Download';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { getReviews, manageReview, sendReview, getTemplates } from 'middleware/api/reviewer';
import { SUBMISSION_RECOMMENDATION } from 'middleware/enums';
import { isEmptyOrNull, isFieldEmpty } from 'utils/validation';

const ControlledInput = ({ label, placeholder, error, setError, onBlur }) => {
  const [ value, setValue ] = useState('');

  const handleChange = ({ target: { value } }) => {
    setError(isEmptyOrNull(value) ?
      { [placeholder]: 'Поле не должно быть пустым' }
      :
      { [placeholder]: null }
    );
    setValue(value);
  }

  return (
    <TextField
      value={value}
      onChange={handleChange}
      error={!!error}
      onBlur={onBlur({ [placeholder]: value })}
      label={error || label}
      fullWidth
      multiline
      margin="dense"
    />
  );
}

ControlledInput.propTypes = {
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  error: PropTypes.string,
  setError: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
}

// Форма для формирования рецензии

const FillInTemplateModal = props => {
  const { reviewId, open, onClose } = props;
  const [ templates, setTemplates ] = useState([]);
  const [ fields, setFields ] = useState({});
  const [ selectedTemplate, setSelectedTemplate ] = useState(null);
  const [ error, setError ] = useState({});

  useEffect(() => {
    getTemplates()
      .then(res => {
        res.forEach(item => item.fields = JSON.parse(item.fields));
        setTemplates(res);
      });
  }, []);

  const handleSelectChange = ({ target: { value } }) => {
    if (!value) {
      return;
    }
    setError({ ...error, 'template': null });
    const template = templates.find(template => template.id === value);
    const newFields = {};
    template.fields.forEach(field => newFields[field.placeholder] = '');
    setFields(newFields);
    setSelectedTemplate(template);
  }

  const onBlur = data => () => {
    const newFields = {...fields};
    Object.assign(newFields, data);
    setFields(newFields);
  }

  const handleSubmit = () => {  
    const errors = {};
    for (const prop in fields) {
      isFieldEmpty(prop, fields[prop], errors);
    }
    Object.assign(errors, {
      template: !selectedTemplate ? "Выберите шаблон" : null
    });
    setError(errors);

    if (Object.values(errors).some(error => error)) {
      return null;
    }
    else {
      return {
        data: {
          template_id: selectedTemplate.id,
          fields: fields
        },
        id: reviewId
      }
    }
  }

  return (
    <WithMobileDialog
      maxWidth="sm"
      open={open}
      onClose={onClose}
      title="Сформировать&nbsp;файл&nbsp;рецензии"
      fullHeight
    >
      <DialogContent dividers>
        <FormControl fullWidth error={!!error.template}>
          <InputLabel htmlFor="template">
            Выберите шаблон
          </InputLabel>
          <Select
            value={selectedTemplate ? selectedTemplate.id : ''}
            onChange={handleSelectChange}
            inputProps={{id: 'template'}}
          >
            <MenuItem value=''></MenuItem>
            { templates.map(template => (
              <MenuItem key={template.id} value={template.id}>
                {template.name}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            {error.template}
          </FormHelperText>
        </FormControl>
        { selectedTemplate && selectedTemplate.fields.map(field => (
          <ControlledInput
            key={field.placeholder}
            label={field.caption}
            placeholder={field.placeholder}
            error={error[field.placeholder] || null}
            setError={setError}
            onBlur={onBlur}
          />
        ))}  
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Отмена
        </Button>
        <Download
          formed
          message="Ошибка формирования рецензии"
          func={handleSubmit}
        >
          <Button color="primary">
            Сформировать рецензию
          </Button>
        </Download>
      </DialogActions>
    </WithMobileDialog>
  );
}

FillInTemplateModal.propTypes = {
  reviewId: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
}

// Форма для загрузки подписанной рецензии

const SendReviewModal = props => {
  const { reviewId, open, onClose, setSnackbar, setReviews } = props;
  const [ recommendation, setRecommendation ] = useState('');
  const [ file, setFile ] = useState(null);
  const [ error, setError ] = useState({
    file: null,
    recommendation: null
  });

  useEffect(() => {
    if (file) {
      setError({ ...error, file: null });
    }
  }, [file]);

  const handleChange = ({ target: { value } }) => {
    if (value !== '') {
      setError({ ...error, recommendation: null });
    }
    setRecommendation(value);
  }

  const handleSubmit = () => {
    let errors = {};
    if (!file) {
      Object.assign(errors, { file: 'Прикрепите файл с рецензией' });
    }
    if (recommendation === '') {
      Object.assign(errors, { recommendation: 'Выберите рекомедацию к статье' });
    }
    setError(errors);

    if (Object.values(errors).some(error => error)) {
      return;
    }

    const formData = new FormData();
    formData.append('reviewFile', file);
    formData.append('data', JSON.stringify({ recommendation_id: recommendation }));
    sendReview(reviewId, formData)
      .then(async (res) => {
        if (res.status === 200) {
          setReviews(await getReviews());
          setSnackbar({
            open: true,
            variant: 'success',
            message: 'Рецензия успешно отправлена'
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
    onClose();
  }

  return (
    <WithMobileDialog
      maxWidth="sm"
      open={open}
      onClose={onClose}
      title="Отправить&nbsp;рецензию"
    >
      <DialogContent dividers>
        <FormControl
          fullWidth
          style={{ paddingBottom: 24 }}
          error={!!error.recommendation}
        >
          <InputLabel htmlFor="recommendation">
            {error.recommendation || 'Рекоммендация'}
          </InputLabel>
          <Select
            value={recommendation}
            onChange={handleChange}
            inputProps={{id: 'recommendation'}}
          >
            <MenuItem value={SUBMISSION_RECOMMENDATION.ACCEPT}>
              Принять
            </MenuItem>
            <MenuItem value={SUBMISSION_RECOMMENDATION.REJECT}>
              Отклонить
            </MenuItem>
            <MenuItem value={SUBMISSION_RECOMMENDATION.SEND_FOR_REVISION_WITHOUT_REVIEWING}>
              Отправить на доработку без повторного рецензирования
            </MenuItem>
            <MenuItem value={SUBMISSION_RECOMMENDATION.SEND_FOR_REVISION_WITH_REVIEWING}>
              Отправить на доработку с повторным рецензированием
            </MenuItem>
          </Select>
        </FormControl>
        <SimpleDropzone setFile={setFile} />
        <FormControl error={!!error.file}>
          <FormHelperText>
            {error.file}
          </FormHelperText>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Отмена
        </Button>
        <Button color="primary" onClick={handleSubmit}>
          Отправить
        </Button>
      </DialogActions>
    </WithMobileDialog>
  );
}

SendReviewModal.propTypes = {
  reviewId: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  setSnackbar: PropTypes.func.isRequired,
  setReviews: PropTypes.func.isRequired
};

function CurrentReviews(props) {
  const [ reviews, setReviews ] = useState(props.reviews);
  const [ modalReviewOpen, setModalReviewOpen ] = useState(false);
  const [ modalTemplateOpen, setModalTemplateOpen ] = useState(false);
  const [ reviewManage, setReviewManage ] = useState({
    reviewId: '',
    action: ''
  });
  const [ snackbar, setSnackbar ] = useState({
    open: false,
    variant: 'success',
    message: ''
  });
  const [ dialog, setDialog ] = useState({
    open: false,
    text: ''
  });

  const handleModalReviewOpen = reviewId => () => {
    setReviewManage({...reviewManage, reviewId: reviewId});
    setModalReviewOpen(true);
  }

  const handleModalReviewClose = () => {
    setModalReviewOpen(false);
    setReviewManage({
      reviewId: '',
      action: ''
    });
  }

  const handleModalTemplateOpen = reviewId => () => {
    setReviewManage({ ...reviewManage, reviewId: reviewId });
    setModalTemplateOpen(true);
  }

  const handleModalTemplateClose = () => {
    setModalTemplateOpen(false);
    setReviewManage({
      reviewId: '',
      action: ''
    });
  }

  const handleSubmit = () => {
    manageReview(reviewManage.reviewId, { action: reviewManage.action })
      .then(async (res) => {
        if (res.status === 200) {
          setReviews(await getReviews());
          setSnackbar({
            open: true,
            variant: 'success',
            message: reviewManage.action === 'accept' ?
              'Заявка принята к работе' :
              'Заявка отклонена'
          });
        }
        else {
          setSnackbar({
            open: false,
            variant: 'error',
            message: res.message || 'Ошибка на сервере'
          });
        }
      });
    handleCloseDialog();
  }

  const handleCloseDialog = () => {
    setReviewManage({
      reviewId: '',
      action: ''
    });
    setDialog({...dialog, open: false});
  }

  const onPendingClick = (reviewId, action) => event => {
    event.stopPropagation();
    setReviewManage({
      reviewId: reviewId,
      action: action
    });
    setDialog({
      open: true,
      text: action === 'accept' ? 
        'Вы уверены, что хотите принять статью к работе?' :
        'Вы уверены, что хотите отказаться от рецензирования статьи?'
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
        <title>Рецензии | Панель управления</title>
      </Head>
      <DashboardLayout navBarTitle="Рецензии">
        {reviews.length === 0 ?
          <NothingToDisplayText text="Нет запросов на рецензирование" />
          :
          <div style={{ width: '100%' }}>
            { reviews.map(review => (
              <ReviewPanel 
                key={'review' + review.review_id}
                review={review}
                onPendingClick={onPendingClick}
                onModalReviewOpen={handleModalReviewOpen}
                onModalTemplateOpen={handleModalTemplateOpen}
              />
            ))}
          </div>
        }

        <SendReviewModal 
          reviewId={reviewManage.reviewId}
          open={modalReviewOpen}
          onClose={handleModalReviewClose}
          setSnackbar={setSnackbar}
          setReviews={setReviews}
        />

        <FillInTemplateModal
          reviewId={reviewManage.reviewId}
          open={modalTemplateOpen}
          onClose={handleModalTemplateClose}
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
          closeYes={handleSubmit}
          closeNo={handleCloseDialog}
        />

      </DashboardLayout>
    </>
  );
}

CurrentReviews.getInitialProps = async ({ req }) => {
  const reviews = req ? await getReviews(req.headers.cookie) : await getReviews();
  return { reviews };
}

CurrentReviews.propTypes = {
  reviews: PropTypes.array.isRequired
};

export default CurrentReviews;
