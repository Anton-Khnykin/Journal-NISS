import React, { useState, useEffect, createRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import MobileStepper from '@material-ui/core/MobileStepper';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepButton from '@material-ui/core/StepButton';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Tooltip from '@material-ui/core/Tooltip';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fade from '@material-ui/core/Fade';
import Chip from '@material-ui/core/Chip';
import Hidden from '@material-ui/core/Hidden';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import PersonAdd from '@material-ui/icons/PersonAdd';
import Add from '@material-ui/icons/Add';
import Remove from '@material-ui/icons/Remove';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import CancelIcon from '@material-ui/icons/Clear';
import FilesDropzone from './FilesDropzone';
import AuthorCard from './AuthorCard';
import ConfirmDialog from './ConfirmDialog';
import NextLink from 'components/NextLink';
import StyledSnackbar from 'components/dashboard/StyledSnackbar';
import Autocomplete from './Autocomplete';
import WithMobileDialog from 'components/WithMobileDialog';
import { sendSubmission, editSubmission } from 'middleware/api/author';
import { getCredentials } from 'middleware/api/account';
import { LANGUAGE, FILE_TYPE } from 'middleware/enums';
import { isEmptyOrNull, isEmpty, replaceNull } from 'utils/validation';
import { getFullName } from 'utils/data_parser';
import usePrevious from 'utils/use_previous';
import countries from 'middleware/countries';
import { academicDegreesRu, academicDegreesEn, academicTitlesRu, academicTitlesEn } from 'middleware/lists';

const CustomBox = ({ children, leftSided }) => (
  <Box
    component={Grid}
    pr={ leftSided ? { sm: 3 } : { sm: 0 } }
    pl={ leftSided ? { sm: 0 } : { sm: 3 } }
    item
    xs={12}
    sm={6}
  >
    { children }
  </Box>
);

CustomBox.propTypes = {
  children: PropTypes.any,
  leftSided: PropTypes.bool
};

const CustomSelect = ({ label, value, onChange, readOnly, values }) => (
  <TextField
    select
    fullWidth
    margin="dense"
    label={label}
    value={value}
    onChange={onChange}
    inputProps={{
      readOnly: readOnly
    }}
  >
    <MenuItem value={0} />
    { values.map((item, index) => (
      <MenuItem value={index + 1} key={item}>
        { item }
      </MenuItem>
      ))
    }
  </TextField>
)

CustomSelect.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  values: PropTypes.array.isRequired
}

const useChipInputStyles = makeStyles(theme => ({
  textFieldWide: {
    width: '100%'
  },
  chip: {
    margin: theme.spacing(0.5, 0.25)
  },
  inputRoot: {
    flexWrap: 'wrap'
  },
  inputInput: {
    width: 'auto',
    flexGrow: 1
  },
}));

const ChipInput = ({ readOnly, label, onKeyUp, onDelete, values, setter }) => {
  const classes = useChipInputStyles();

  return (
    <Tooltip
      title="Введите и нажмите Enter"
      {...readOnly ? { open: false } : {}}
    >
      <TextField
        required
        label={label}
        onKeyUp={onKeyUp}
        type="text"
        className={classes.textFieldWide}
        margin="dense"
        InputProps={{
          classes: {
            root: classes.inputRoot,
            input: classes.inputInput
          },
          readOnly: readOnly,
          startAdornment: values.map((keyword, idx) => (
            <Chip
              size="small"
              key={keyword + idx}
              tabIndex={-1}
              label={keyword}
              className={classes.chip}
              onDelete={
                !readOnly
                  ? onDelete(idx, values, setter)
                  : undefined
              }
            />
          ))
        }}
      />
    </Tooltip>
  )
}

ChipInput.propTypes = {
  readOnly: PropTypes.bool,
  label: PropTypes.string.isRequired,
  onKeyUp: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  values: PropTypes.array.isRequired,
  setter: PropTypes.func.isRequired
}

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1
  },
  root: {
    width: '100%',
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    paddingTop: theme.spacing(4),
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 0,
      paddingRight: 0,
      width: '90%'
    }
  },
  shrunk: {
    width: '50%',
    margin: 'auto'
  },
  paper: {
    width: '100%',
    [theme.breakpoints.down('xs')]: {
      minHeight: 'calc(100vh - 160px)'
    }
  },
  content: {
    [theme.breakpoints.down('xs')]: {
      height: 'calc(100vh - 160px)',
      overflowX: 'auto'
    }
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%'
  },
  button: {
    marginRight: theme.spacing(1)
  },
  textFieldWide: {
    width: '100%'
  },
  buttons: {
    paddingTop: theme.spacing(3),
    display: 'flex'
  },
  textFieldLeft: {
    paddingRight: theme.spacing(3)
  },
  textFieldRight: {
    paddingLeft: theme.spacing(3)
  },
  cards: {
    paddingTop: theme.spacing(2)
  },
  title: {
    paddingTop: theme.spacing(2),
    opacity: '0.55',
    fontWeight: 400,
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.3rem'
    }
  },
  addIcon: {
    height: '2rem',
    width: '2rem',
    [theme.breakpoints.down('xs')]: {
      height: '1.6rem',
      width: '1.6rem'
    }
  },
  wrapper: {
    position: 'relative'
  },
  buttonProgress: {
    color: theme.palette.primary.main,
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -15
  },
  mobileStepper: {
    width: '100%',
    backgroundColor: theme.palette.secondary.light
  },
  header: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    height: 50,
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(4),
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 0,
      paddingRight: 0,
      width: '90%'
    }
  },
  stepper: {
    paddingTop: 0,
    paddingRight: 0,
    paddingLeft: 0
  },
  requirementsList: {
    listStyleType: 'none',
    padding: 0,
    display: 'flex'
  },
  verticalDividerContainer: {
    width: theme.spacing(2)
  },
  verticalDivider: {
    width: 2,
    height: '100%'
  },
  link: {
    textDecoration: 'none',
    color: theme.palette.text.primary,
    '&:hover': {
      color: theme.palette.primary.main
    }
  },
  externalLink: {
    color: theme.palette.primary.dark,
    '&:hover': {
      textDecoration: 'none',
      color: theme.palette.primary.light
    }
  }
}));

function SubmissionStepper(props) {
  const classes = useStyles();
  const {
    handleCancelling,
    handleFinishSubmission,
    submission,
    readOnlyMode,
    editMode,
    submissionId,
    ...other } = props;

  const steps = readOnlyMode || editMode
    ? ['Метаданные', 'Загрузка файлов']
    : ['Условия и положения', 'Метаданные', 'Загрузка файлов', 'Подтверждение'];

  const [ activeStep, setActiveStep ] = useState(0);
  const [ completed, setCompleted ] = useState(() => {
    if (readOnlyMode || editMode) {
      return [true, true];
    }
    else {
      return [];
    }
  });
  const [ checked, setChecked ] = useState(false);
  const previousStep = usePrevious(activeStep);

  const [ subData, setData ] = useState(() => {
    if (submission) {
      // eslint-disable-next-line no-unused-vars
      const { keywords_ru, keywords_en, submission_status, ...metadata } = submission.submission_details;
      return metadata;
    }
    else {
      return {
        title_ru: '',
        title_en: '',
        abstract_ru: '',
        abstract_en: '',
        language_id: LANGUAGE.RUSSIAN
      };
    }
  });

  const [ authors, setAuthors ] = useState(() => {
    if (submission) {
      const newAuthors = [];
      for (const author of submission.authors) {
        const { country_id, ...authorInfo } = author;
        authorInfo.country_name = countries[country_id - 1].label;
        newAuthors.push(authorInfo);
      }
      return newAuthors;
    }
    else {
      return [];
    }
  });

  const [ keywordsRu, setKeywordsRu ] = useState(() => {
    if (submission) {
      return submission.submission_details.keywords_ru.split(',');
    }
    else {
      return [];
    }
  });

  const [ keywordsEn, setKeywordsEn ] = useState(() => {
    if (submission) {
      return submission.submission_details.keywords_en.split(',');
    }
    else {
      return [];
    }
  });

  const [ files, setFiles ] = useState(() => {
    if (submission) {
      const newFiles = [];
      for (const file of submission.files) {
        newFiles.push({
          name: file.file.name,
          fileType: file.file_type.id
        });
      }
      return newFiles;
    }
    else {
      return [];
    }
  });

  const [invalidFields, setInvalidFileds] = useState({ subData: [], authors: [] });

  // Информация о статье
  const titleRu    = createRef(),
        titleEn    = createRef(),
        abstractRu = createRef(),
        abstractEn = createRef();

  // Авторы статьи
  const firstNameRu           = createRef(),
        firstNameEn           = createRef(),
        middleNameRu          = createRef(),
        middleNameEn          = createRef(),
        lastNameRu            = createRef(),
        lastNameEn            = createRef(),
        contactEmail          = createRef(),
        scientificInterestsRu = createRef(),
        scientificInterestsEn = createRef();

  const metadataStep = editMode || readOnlyMode ? 0 : 1;
  
  // Валидация 2го шага подачи заявки: формы
  useEffect(() => {
    if (!readOnlyMode) {
      if (previousStep === metadataStep && activeStep !== metadataStep) {
        const invalidKeys = {
          subData: [],
          authors: []
        };
        const exeptions = [
          'academic_degree_id',
          'academic_title_id',
          'scientific_interests_ru',
          'scientific_interests_en',
          'middle_name_ru',
          'middle_name_en',
          'organizations',
          'author_position_in_credits',
          'is_primary_contact'
        ];
        const keyCaption = {
          'title_ru': 'Название статьи на русском',
          'title_en': 'Название статьи на английском',
          'language_id': 'Язык статьи',
          'abstract_ru': 'Аннотация на русском',
          'abstract_en': 'Аннотация на английском',
          'keywords_ru': 'Ключевые слова на русском',
          'keywords_en': 'Ключевые слова на английском',
          'is_primary_contact': 'Корреспондирующий автор',
          'author_position_in_credits': 'Позиция автора',
          'last_name_ru': 'Фамилия на русском',
          'last_name_en': 'Фамилия на английском',
          'first_name_ru': 'Имя на русском',
          'first_name_en': 'Имя на английском',
          'contact_email': 'Адрес электронной почты',
          'country_name': 'Страна',
          'organizations': 'Организация (у автора должна быть как минимум одна организация)',
          'organization_name_ru': 'Наименование организации на русском',
          'organization_name_en': 'Наименование организации на английском',
          'organization_address_ru': 'Адрес организации на русском',
          'organization_address_en': 'Адрес организации на английском',
          'person_position_ru': 'Должность на русском',
          'person_position_en': 'Должность на английском'
        }

        let validated = true;

        for (const key in subData) {
          if (isEmptyOrNull(subData[key].toString())) {
            validated = false;
            invalidKeys.subData.push(keyCaption[key]);
          }
        }
        if (keywordsRu.length === 0) {
          validated = false;
          invalidKeys.subData.push(keyCaption['keywords_ru']);
        }
        if (keywordsEn.length === 0) {
          validated = false;
          invalidKeys.subData.push(keyCaption['keywords_en']);
        }
        if (!authors.some(item => item.is_primary_contact)) {
          validated = false;
          invalidKeys.subData.push(keyCaption['is_primary_contact']);
        }

        for (const author of authors) {
          const invalidAuthor = {
            name: '',
            keys: []
          };
          for (const key in author) {
            if (!exeptions.includes(key)) {
              if(!author[key] || isEmptyOrNull(author[key].toString())) {
                validated = false;
                invalidAuthor.keys.push(keyCaption[key]);
              }
            }
            if (isEmptyOrNull(author.author_position_in_credits.toString())) {
              validated = false;
              invalidAuthor.keys.push(keyCaption['author_position_in_credits']);
            }
          }

          if (author.organizations.length === 0) {
            validated = false;
            invalidAuthor.keys.push(keyCaption['organizations']);
          }

          for (const org of author.organizations) {
            for (const key in org) {
              if (key === 'user_organization_id') {
                continue;
              }
              if (isEmptyOrNull(org[key])) {
                validated = false;
                invalidAuthor.keys.push(keyCaption[key]);
              }
            }
          }

          if (invalidAuthor.keys.length !== 0) {
            invalidAuthor.keys = Array.from(new Set(invalidAuthor.keys));
            invalidAuthor.name = getFullName(author, 'ru');
            invalidKeys.authors.push(invalidAuthor);
          }
        }

        setInvalidFileds(invalidKeys);
        const newCompleted = [...completed];
        if (validated) {
          newCompleted[metadataStep] = true;
          setCompleted(newCompleted);
        }
        else {
          delete newCompleted[metadataStep];
          setCompleted(newCompleted);
        }
      }
    }
  }, [
    previousStep,
    activeStep,
    completed,
    subData,
    authors,
    keywordsRu,
    keywordsEn,
    readOnlyMode,
    editMode,
    metadataStep
  ]);

  // Валидация 3го шага подачи заявки: файлы
  useEffect(() => {
    let stepTwoComplete = false;
    if (files.length >= 2) {
      stepTwoComplete = true;
      const fileTypes = files.map(file => file.fileType);

      const requiredTypes2 = [
        FILE_TYPE.ARTICLE,
        FILE_TYPE.OPEN_PUBLICATION_CONCLUSION,
        FILE_TYPE.IDENTIFICATION_CONCLUSION,
      ];

      const requiredTypes1 = [
        FILE_TYPE.ARTICLE,
        FILE_TYPE.EXPERT_CONCLUSION
      ];

      if (fileTypes.includes(' ') ||
         !(requiredTypes1.every(type => fileTypes.includes(type))) &&
         !(requiredTypes2.every(type => fileTypes.includes(type)))) {
        stepTwoComplete = false;
      }
    }

    stepTwoComplete ? handleComplete() : handleIncomplete();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const [ confirmContinueOpen, setConfirmContinueOpen ] = useState(false);

  const handleContinue = () => setConfirmContinueOpen(false);

  const handleDiscontinue = () => {
    localStorage.removeItem('submission');
    setChecked(false);
    setData({
      title_ru: '',
      title_en: '',
      abstract_ru: '',
      abstract_en: '',
      language_id: LANGUAGE.RUSSIAN
    });
    setKeywordsRu([]);
    setKeywordsEn([]);
    setCompleted([]);
    setAuthors([]);
    setActiveStep(0);
    fetchCredentials();
    setConfirmContinueOpen(false);
  }

  // Извлекаем прогресс из local storage
  useEffect(() => {
    if (!readOnlyMode && !editMode) {
      let savedData = localStorage.getItem('submission');
      if (savedData) {
        try {
          savedData = JSON.parse(savedData);
          setChecked(savedData.checked);
          setData(savedData.subData);
          setAuthors(savedData.authors);
          setActiveStep(savedData.activeStep);
          setKeywordsRu(savedData.keywordsRu);
          setKeywordsEn(savedData.keywordsEn);

          // Т.к. объект File сериализировать невозможно
          // Не сохраняем приложенные файлы в local storage
          // Поэтому удаляем данные о завершённом этапе загрузки файлов
          delete savedData.completed[2];
          setCompleted(savedData.completed);

          setConfirmContinueOpen(true);
        }
        catch(e) {
          setSnackbar({
            open: true,
            message: 'Ошибка выгрузки сохранённой заявки.',
            variant: 'error'
          });
          fetchCredentials();
        }
      } 
      else {
        fetchCredentials();
      }
    }
  }, [readOnlyMode, editMode]);

  // Сохраняем прогресс в local storage
  useEffect(() => {
    if (!submitting && !readOnlyMode && !editMode) {
      const json = JSON.stringify({
        checked,
        subData,
        keywordsRu,
        keywordsEn,
        authors,
        activeStep,
        completed
      });
      localStorage.setItem('submission', json);
    }
  });

  // Сбор данных с полей метаданных статьи
  useEffect(() => {
    if (!readOnlyMode) {
      let interval;
      if (activeStep === metadataStep) {
        interval = setInterval(() => {
          gatherArticleInfo();
        }, 5000);
      }

      return () => {
        clearInterval(interval);
      }
    }
  });

  const [ fetchingCredentials, setFetchingCredentials ] = useState(false);

  // Получение информации о пользователе для автозаполнения автора
  const fetchCredentials = async () => {
    setFetchingCredentials(true);

    // eslint-disable-next-line no-unused-vars
    const { credentials_id, country_id, ...credentials } = await getCredentials();
    setAuthors([{
      ...credentials,
      country_name: countries[country_id - 1].label,
      author_position_in_credits: 1,
      is_primary_contact: true,
    }]);

    setFetchingCredentials(false);
  }

  const [ authorModal, setAuthorModal ] = useState({
    open: false,
    idx: 0,
    countryName: '',
    academicTitleId: 0,
    academicDegreeId: 0,
    orgRefs: []
  });

  // Скролл до новой организации при её добавлении
  useEffect(() => {
    const length = authorModal.orgRefs.length;
    if (length !== 0) {
      if (authorModal.orgRefs[length - 1][5].current) {
        authorModal.orgRefs[length - 1][5].current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [authorModal.orgRefs, authorModal.orgRefs.length]);

  const [ deletingAuthor, setDeletingAuthor ] = useState({
    deleting: false,
    idx: null
  });

  const [ submitting, setSubmitting ] = useState(false);

  const [ snackbar, setSnackbar ] = useState({
    open: false,
    message: '',
    variant: 'success'
  });

  const totalSteps = () => steps.length;

  const completedSteps = () => Object.keys(completed).length;

  const isLastStep = () => activeStep === totalSteps() - 1;

  const allStepsCompleted = () => {
    const shift = editMode ? 0 : 1;
    return completedSteps() === totalSteps() - shift;
  };

  const handleSetActiveStep = nextStep => {
    setActiveStep(previousStep => {
      if (previousStep === metadataStep && !readOnlyMode) {
        gatherArticleInfo();
      }
      return nextStep;
    });
  }

  const handleNext = () => {
    handleSetActiveStep(activeStep + 1);
  }

  const handleBack = () => handleSetActiveStep(activeStep - 1);

  const handleComplete = () => {
    const newCompleted = [...completed];
    newCompleted[activeStep] = true;
    setCompleted(newCompleted);
  }

  const handleIncomplete = () => {
    const newCompleted = [...completed];
    delete newCompleted[activeStep];
    setCompleted(newCompleted);
  }

  const handleCheckboxChange = () => {
    checked ? handleIncomplete() : handleComplete();
    setChecked(!checked);
  }

  const getStepContent = step => {
    if (readOnlyMode || editMode) {
      switch(step) {
        case 0:
          return stepTwo();
        case 1:
          return stepThree();
      }
    }
    else {
      switch (step) {
        case 0:
          return stepOne();
        case 1:
          return stepTwo();
        case 2:
          return stepThree();
        case 3:
          return stepFour();
      }
    }
  }

  const handleChange = name => event => {
    setData({ ...subData, [name]: event.target.value });
  };

  const gatherArticleInfo = () => {
    setData({
      title_ru: titleRu.current ? titleRu.current.value : '',
      title_en: titleEn.current ? titleEn.current.value : '',
      abstract_ru: abstractRu.current ? abstractRu.current.value : '',
      abstract_en: abstractEn.current ? abstractEn.current.value : '',
      language_id: subData.language_id
    });
  }

  const handleAuthorPosInCreditsChange = idx => event => {
    const newPos = event.target.value;
    const newAuthors = [...authors];
    if (newPos !== '') {
      const prev = newAuthors.findIndex(a => a.author_position_in_credits === newPos);
      if (prev !== -1) {
        newAuthors[prev].author_position_in_credits = '';
      }
    }
    newAuthors[idx].author_position_in_credits = newPos;

    setAuthors(newAuthors);
  }
  
  const handlePrimaryContactChange = idx => {
    const newAuthors = [...authors];
    for (let i = 0; i < newAuthors.length; i++) {
      if (i === idx) {
        newAuthors[i].is_primary_contact = !newAuthors[i].is_primary_contact;
      }
      else {
        newAuthors[i].is_primary_contact = false;
      }
    }

    setAuthors(newAuthors);
  }

  const handleAuthorModalChange = property => event => {
    const value = event.target ? event.target.value : event;
    const newAuthorModal = {
      ...authorModal,
      [property]: value
    };

    setAuthorModal(newAuthorModal);
  }

  const handleAuthorModalOpen = (idx, isAuthorNew) => {
    setAuthorModal({
      open: true,
      idx: idx,
      orgRefs:
        Array.from({
          length: authors[idx] ?
          authors[idx].organizations.length
          : 0 },
          () => Array.from({length: 6}, () => createRef())),
      countryName:
        authors[idx] ?
        authors[idx].country_name ?
        authors[idx].country_name
        : '' : '',
      academicTitleId:
        authors[idx] ?
        authors[idx].academic_title_id ?
        authors[idx].academic_title_id
        : 0 : 0,
      academicDegreeId:
        authors[idx] ?
        authors[idx].academic_degree_id ?
        authors[idx].academic_degree_id
        : 0 : 0,
      new: isAuthorNew
    });
  }

  const handleNewAuthor = () => {
    const newAuthors = [...authors];
    newAuthors.push({});
    setAuthors(newAuthors);
    handleAuthorModalOpen(newAuthors.length - 1, true);
  }

  const handleDeletingAuthor = idx => {
    setDeletingAuthor({
      deleting: true,
      idx: idx
    });
  }

  const handleConfirmDeletion = confirmed => {
    if (confirmed) {
      const newAuthors = [...authors];
      const deletedAuthorPos = newAuthors[deletingAuthor.idx].author_position_in_credits;
      newAuthors.splice(deletingAuthor.idx, 1);

      // Если был удалён автор с позицией меньшей, чем у некоторых
      // Изменяем позиции оставшихся авторов на -1
      for (const author of newAuthors) {
        if (author.author_position_in_credits > deletedAuthorPos) {
          author.author_position_in_credits -= 1;
        }
      }

      setAuthors(newAuthors);
    }

    setDeletingAuthor({
      deleting: false,
      idx: null
    });
  }

  const handleAuthorModalClose = cancel =>  {
    if (!cancel) {
      const organizations = [];
      for (let i = 0; i < authorModal.orgRefs.length; i++) {
        // Если организация удалена
        if (authorModal.orgRefs[i] == undefined) {
          continue
        }

        const newOrg = {
          organization_name_ru: authorModal.orgRefs[i][0].current.value,
          organization_name_en: authorModal.orgRefs[i][1].current.value,
          organization_address_ru: authorModal.orgRefs[i][2].current.value,
          organization_address_en: authorModal.orgRefs[i][3].current.value,
          person_position_ru: authorModal.orgRefs[i][4].current.value,
          person_position_en: authorModal.orgRefs[i][5].current.value
        }

        // Для режима редактирования
        if (editMode && authors[authorModal.idx].organizations[i]) {
          newOrg.user_organization_id = authors[authorModal.idx].organizations[i].user_organization_id
        }

        organizations.push(newOrg);
      }

      const newAuthors = [...authors];
      const newAuthor = {
        first_name_ru: firstNameRu.current.value,
        first_name_en: firstNameEn.current.value,
        middle_name_ru: middleNameRu.current.value,
        middle_name_en: middleNameEn.current.value,
        last_name_ru: lastNameRu.current.value,
        last_name_en: lastNameEn.current.value,
        contact_email: contactEmail.current.value,
        country_name: authorModal.countryName,
        academic_degree_id: authorModal.academicDegreeId,
        academic_title_id: authorModal.academicTitleId,
        scientific_interests_ru: scientificInterestsRu.current.value,
        scientific_interests_en: scientificInterestsEn.current.value,
        author_position_in_credits:
          newAuthors[authorModal.idx].author_position_in_credits ?
          newAuthors[authorModal.idx].author_position_in_credits :
          newAuthors.length,
        is_primary_contact: authors[authorModal.idx].is_primary_contact ?
          authors[authorModal.idx].is_primary_contact :
          false,
        organizations: organizations
      };

      // Для редактирования
      if (authors[authorModal.idx].credentials_id) {
        newAuthor.credentials_id = authors[authorModal.idx].credentials_id
      }

      newAuthors[authorModal.idx] = newAuthor;
      setAuthors(newAuthors);
    }
    else if (authorModal.new) {
      // Если пользователь добавляет нового автора
      // И в модальном окне сразу отменяет действие
      // Новый пустой объект автора удаляется из массива
      const newAuthors = [...authors];
      newAuthors.splice(authorModal.idx, 1);
      setAuthors(newAuthors);
    }

    setAuthorModal({ ...authorModal, open: false, orgRefs: [] });
  }

  const handleNewOrg = () => {
    const newAuthorModal = {...authorModal};
    newAuthorModal.orgRefs.push(Array.from({length: 6}, () => createRef()));
    setAuthorModal(newAuthorModal);
  }

  const handleOrgDeletion = idx => {
    const newAuthorModal = {...authorModal};
    delete newAuthorModal.orgRefs[idx];
    setAuthorModal(newAuthorModal);
  }

  const handleNewKeyword = (keywords, setKeywords) => event => {
    if (event.key == 'Enter') {
      let keyword = event.target.value.trim();
      if (keyword !== '') {
        let arr = keyword.split(',').map(item => item.trim());
        let newKeywords = [...keywords];
        for (const item of arr) {
          if (item !== '') {
            newKeywords.push(item);
          }
        }
        event.target.value = '';
        setKeywords(newKeywords);
      }
    }
  }

  const handleDeleteKeyword = (idx, keywords, setKeywords) => () => {
    const newKeywords = [...keywords];
    newKeywords.splice(idx, 1);
    setKeywords(newKeywords);
  }

  const authorCards = () => {
    return authors.map((author, index) => (
      <Grid
        item xs={12} sm={6} md={4}
        key={author.first_name_ru + index}
      >
        <AuthorCard
          firstName={author.first_name_ru}
          lastName={author.last_name_ru}
          middleName={author.middle_name_ru}
          posInCredits={replaceNull(author.author_position_in_credits)}
          positions={Array.from({length: authors.length}, (v, k) => k + 1)}
          onAuthorPosInCreditsChange={handleAuthorPosInCreditsChange(index)}
          onClick={() => handleAuthorModalOpen(index)}
          onClickDelete={() => handleDeletingAuthor(index)}
          isPrimaryContact={author.is_primary_contact}
          onPrimaryContactChange={() => handlePrimaryContactChange(index)}
          readOnlyMode={readOnlyMode}
        />
      </Grid>
    ));
  }

  const stepOne = () => {
    return (
      <Grid container>
        <Box width={1}>
          <Box component={Typography} variant="body2" fontWeight={500}>
            Перед оформлением заявки на публикацию, пожалуйста, ознакомьтесь со следующими правилами и требованиями:
          </Box>
          <ul className={classes.requirementsList}>
            <div className={classes.verticalDividerContainer}>
              <Divider className={classes.verticalDivider}/>
            </div>
            <div>
            <Box component="li" pb={1} pt={1}>
              <Typography
                component={NextLink}
                href="/rules"
                target="_blank"
                className={classes.link}
              >
                Правила публикации
              </Typography>
            </Box>
            <Box component="li" pb={1}>
              <Typography
                component={NextLink}
                href="/ethics"
                target="_blank"
                className={classes.link}
              >
                Публикационная этика
              </Typography>
            </Box>
            <Box component="li" pb={1}>
              <Typography
                component={NextLink}
                href="/reviewing"
                target="_blank"
                className={classes.link}
              >
                Порядок рецензирования
              </Typography>
            </Box>
            <Box component="li" pb={1}>
              <Typography
                component={NextLink}
                href="/requirements"
                target="_blank"
                className={classes.link}
              >
                Требования к оформлению
              </Typography>
            </Box>
            </div>
          </ul>
        </Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={checked}
              onChange={handleCheckboxChange}
              color="primary"
            />
          }
          label="Я ознакомился со всеми правилами и требованиями и принимаю их условия"
        />
      </Grid>
    );
  }

  const authorFields = [
    {
      id: 'last-name-ru',
      label: 'Фамилия',
      ref: lastNameRu,
      req: true,
      defVal: authors[authorModal.idx] ? authors[authorModal.idx].last_name_ru : ''
    },
    {
      id: 'last-name-en',
      label: 'Фамилия на английском',
      ref: lastNameEn,
      req: true,
      defVal: authors[authorModal.idx] ? authors[authorModal.idx].last_name_en : ''
    },
    {
      id: 'first-name-ru',
      label: 'Имя',
      ref: firstNameRu,
      req: true,
      defVal: authors[authorModal.idx] ? authors[authorModal.idx].first_name_ru : ''
    },
    {
      id: 'first-name-en',
      label: 'Имя на английском',
      ref: firstNameEn,
      req: true,
      defVal: authors[authorModal.idx] ? authors[authorModal.idx].first_name_en : ''
    },
    {
      id: 'middle-name-ru',
      label: 'Отчество',
      ref: middleNameRu,
      req: false,
      defVal: authors[authorModal.idx] ? authors[authorModal.idx].middle_name_ru : ''
    },
    {
      id: 'middle-name-en',
      label: 'Отчество на английском',
      ref: middleNameEn,
      req: false,
      defVal: authors[authorModal.idx] ? authors[authorModal.idx].middle_name_en : ''
    }
  ];

  const authorOrgFields = [
    {
      id: 'organization-name-ru',
      label: 'Наименование организации',
      propName: 'organization_name_ru'
    },
    {
      id: 'organization-name-en',
      label: 'Наименование на английском',
      propName: 'organization_name_en'
    },
    {
      id: 'organization-address-ru',
      label: 'Адрес организации',
      propName: 'organization_address_ru'
    },
    {
      id: 'organization-address-en',
      label: 'Адрес на английском',
      propName: 'organization_address_en'
    },
    {
      id: 'person-position-ru',
      label: 'Должность в организации',
      propName: 'person_position_ru'
    },
    {
      id: 'person-position-en',
      label: 'Должность на английском',
      propName: 'person_position_en'
    }
  ];

  const authorOrgs = () => {
    const orgs = [];
    let count = 0;
    for (let i = 0; i < authorModal.orgRefs.length; i++) {
      // Если организация удалена
      if (authorModal.orgRefs[i] == undefined) {
        continue;
      }

      count += 1;
      const text = `Организация #${count}`;
      orgs.push(
        <Grid item xs={12} key={text}>
          <Typography
            variant="h6"
            component="h3"
            className={classes.title}
            style={{paddingTop: 0}}
          >
            { text }
            { !readOnlyMode &&
              <Tooltip title="Удалить организацию">
                <IconButton onClick={() => handleOrgDeletion(i)}>
                  <Remove />
                </IconButton>
              </Tooltip>
            }
          </Typography>
        </Grid>
      );

      for (let j = 0; j < 6; j++) {
        const id = authorOrgFields[j].id;
        const label = authorOrgFields[j].label;
        const propName = authorOrgFields[j].propName;
        const theOrgs = authors[authorModal.idx] ? authors[authorModal.idx].organizations : undefined;

        orgs.push(
          <CustomBox leftSided={j % 2 === 0} key={`${i}-${j}`}>
            <TextField
              inputRef={authorModal.orgRefs[i][j]}
              defaultValue={theOrgs ? theOrgs[i] ? theOrgs[i][propName] : '' : ''}
              label={label}
              required
              fullWidth
              margin="dense"
              id={id + `-${j}`}
              inputProps={{
                readOnly: readOnlyMode
              }}
            />
          </CustomBox>
        );
      }
    }

    return orgs;
  }

  const stepTwo = () => {
    return (
      <>
        <div className={classes.container}>
          <CustomBox leftSided>
            <TextField
              inputRef={titleRu}
              defaultValue={subData.title_ru}
              label="Название статьи"
              type="text"
              required
              multiline
              rows="2"
              margin="dense"
              className={classes.textFieldWide}
              InputProps={{
                readOnly: readOnlyMode
              }}
            />
          </CustomBox>
          <CustomBox>
            <TextField
              inputRef={titleEn}
              defaultValue={subData.title_en}
              label="Название на английском"
              type="text"
              required
              multiline
              rows="2"
              margin="dense"
              className={classes.textFieldWide}
              InputProps={{
                readOnly: readOnlyMode
              }}
            />
          </CustomBox>
          <Grid item xs={12}>
            <TextField
              select
              value={subData.language_id}
              label="Язык статьи"
              onChange={handleChange('language_id')}
              required
              margin="dense"
              InputProps={{
                readOnly: readOnlyMode
              }}
            >
              <MenuItem value={LANGUAGE.RUSSIAN}>
                Русский
              </MenuItem>
              <MenuItem value={LANGUAGE.ENGLISH}>
                Английский
              </MenuItem>
            </TextField>
          </Grid>
          <CustomBox leftSided>
            <TextField
              inputRef={abstractRu}
              defaultValue={subData.abstract_ru}
              label="Аннотация"
              type="text"
              required
              multiline
              rows="3"
              rowsMax="10"
              margin="dense"
              className={classes.textFieldWide}
              InputProps={{
                readOnly: readOnlyMode
              }}
            />
          </CustomBox>
          <CustomBox>
            <TextField
              inputRef={abstractEn}
              defaultValue={subData.abstract_en}
              label="Аннотация на английском"
              type="text"
              required
              multiline
              rows="3"
              rowsMax="10"
              margin="dense"
              className={classes.textFieldWide}
              InputProps={{
                readOnly: readOnlyMode
              }}
            />
          </CustomBox>
          <CustomBox leftSided>
            <ChipInput
              readOnly={readOnlyMode}
              label="Ключевые слова"
              onKeyUp={handleNewKeyword(keywordsRu, setKeywordsRu)}
              onDelete={handleDeleteKeyword}
              setter={setKeywordsRu}
              values={keywordsRu}
            />
          </CustomBox>
          <CustomBox>
            <ChipInput
              readOnly={readOnlyMode}
              label="Ключевые слова на английском"
              onKeyUp={handleNewKeyword(keywordsEn, setKeywordsEn)}
              onDelete={handleDeleteKeyword}
              setter={setKeywordsEn}
              values={keywordsEn}
            />
          </CustomBox>
          <Grid item xs={12} className={classes.title}>
            <Typography variant="h5" component="h2">
              Авторы&nbsp;
              { !readOnlyMode &&
                <Tooltip title="Добавить автора">
                  <IconButton onClick={handleNewAuthor}>
                    <PersonAdd className={classes.addIcon} />
                  </IconButton>
                </Tooltip>
              }
            </Typography>
          </Grid>
          <Grid
            container
            item xs={12}
            spacing={3}
            className={classes.cards}
          >
            { fetchingCredentials
              ? 
              <Grid item>
                <CircularProgress size={60} />
              </Grid>
              : 
              authorCards()
            }
          </Grid>
        </div>
        
        <WithMobileDialog
          maxWidth="md"
          open={authorModal.open}
          onClose={() => handleAuthorModalClose(true)}
          title="Автор"
        >
          <DialogContent dividers>
            <Box component={Grid} container pb={2}>
              {
                authorFields.map((field, index) => (
                  <CustomBox leftSided={index % 2 === 0} key={field.label}>
                    <TextField
                      required={field.req}
                      inputRef={field.ref}
                      defaultValue={field.defVal}
                      fullWidth
                      margin="dense"
                      id={field.id}
                      label={field.label}
                      inputProps={{
                        readOnly: readOnlyMode
                      }}
                    />
                  </CustomBox>
                ))
              }
              <CustomBox leftSided>
                <CustomSelect
                  label="Учёное звание"
                  value={authorModal.academicTitleId}
                  onChange={handleAuthorModalChange('academicTitleId')}
                  readOnly={readOnlyMode}
                  values={academicTitlesRu}
                />
              </CustomBox>
              <CustomBox>
                <CustomSelect
                  label="Учёное звание на английском"
                  value={authorModal.academicTitleId}
                  onChange={handleAuthorModalChange('academicTitleId')}
                  readOnly={readOnlyMode}
                  values={academicTitlesEn}
                />
              </CustomBox>
              <CustomBox leftSided>
                <CustomSelect
                  label="Учёная степень"
                  value={authorModal.academicDegreeId}
                  onChange={handleAuthorModalChange('academicDegreeId')}
                  readOnly={readOnlyMode}
                  values={academicDegreesRu}
                />
              </CustomBox>
              <CustomBox>
                <CustomSelect
                  label="Учёная степень на английском"
                  value={authorModal.academicDegreeId}
                  onChange={handleAuthorModalChange('academicDegreeId')}
                  readOnly={readOnlyMode}
                  values={academicDegreesEn}
                />
              </CustomBox>
              <Grid item container xs={12}>
                <CustomBox leftSided>
                  <TextField
                    inputRef={contactEmail}
                    defaultValue={
                      authors[authorModal.idx] ?
                      authors[authorModal.idx].contact_email
                      : ''
                    }
                    fullWidth
                    required
                    margin="dense"
                    type="email"
                    label="Адрес электронной почты"
                    inputProps={{
                      readOnly: readOnlyMode
                    }}
                  />
                </CustomBox>
              </Grid>
              <Grid item xs={12}>
                <CustomBox leftSided>
                  { readOnlyMode
                    ?
                    <TextField
                      inputRef={abstractEn}
                      defaultValue={authorModal.countryName}
                      fullWidth
                      label="Страна"
                      margin="dense"
                      InputProps={{
                        readOnly: readOnlyMode
                      }}
                    />
                    :
                    <Autocomplete
                      label="Страна"
                      placeholder="Начните ввод страны"
                      required
                      suggestions={countries}
                      value={authorModal.countryName}
                      onChange={handleAuthorModalChange('countryName')}
                    />
                    }
                </CustomBox>
              </Grid>
              <CustomBox leftSided>
                <TextField
                  inputRef={scientificInterestsRu}
                  defaultValue={
                    authors[authorModal.idx] ?
                    authors[authorModal.idx].scientific_interests_ru
                    : ''
                  }
                  fullWidth
                  multiline
                  rowsMax="8"
                  rows="3"
                  margin="dense"
                  label="Область научных интересов"
                  inputProps={{
                    readOnly: readOnlyMode
                  }}
                />
              </CustomBox>
              <CustomBox>
                <TextField
                  inputRef={scientificInterestsEn}
                  defaultValue={
                    authors[authorModal.idx] ?
                    authors[authorModal.idx].scientific_interests_en
                    : ''
                  }
                  fullWidth
                  multiline
                  rowsMax="8"
                  rows="3"
                  margin="dense"
                  label="Область научных интересов на английском"
                  inputProps={{
                    readOnly: readOnlyMode
                  }}
                />
              </CustomBox>
              <Grid item xs={12} className={classes.title}>
                <Typography variant="h5">
                  Организации
                  { !readOnlyMode &&
                    <Tooltip title="Добавить организацию">
                      <IconButton onClick={handleNewOrg}>
                        <Add className={classes.addIcon} />
                      </IconButton>
                    </Tooltip>
                  }
                </Typography>
              </Grid>
              { authorOrgs() }
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleAuthorModalClose(true)} color="primary">
              { readOnlyMode ? 'Закрыть' : 'Отмена' }
            </Button>
            { !readOnlyMode &&
              <Button onClick={() => handleAuthorModalClose(false)} color="primary">
                Сохранить
              </Button>
            }
          </DialogActions>
        </WithMobileDialog>

        <ConfirmDialog
          open={deletingAuthor.deleting}
          text="Вы уверены, что хотите удалить автора?"
          closeYes={() => handleConfirmDeletion(true)}
          closeNo={() => handleConfirmDeletion(false)}
        />
      </>
    )
  }

  const stepThree = () => {
    return (
      <Box component={Grid}>
        <Typography paragraph>
          Прикрепите файлы, содержащие сканы заключений о возможности открытого опубликования и об отсутствии в содержании статьи сведений, 
          попадающих под действие закона 
          <Link href="http://www.consultant.ru/document/cons_doc_LAW_23850/" className={classes.externalLink}>
            &quot;Об экспортном контроле&quot;
          </Link>.
          Данные файлы могут быть представлены в одном документе - &quot;Экспертное заключение&quot;.
          <br/>
          Также вы можете предоставить дополнительные материалы в формате архива, прикрепив их к категории &quot;Прочее&quot;.
        </Typography>
        <FilesDropzone
          maxFiles={4}
          maxFileSize={10000000} // 10 Мбайт
          files={files}
          setFiles={setFiles}
          readOnlyMode={readOnlyMode}
        />
      </Box>
    )
  }

  const stepFour = () => {
    return (
      <Grid container>
        { allStepsCompleted() &&
          <Typography paragraph>
            Ваша заявка готова к отправке. Убедитесь, что вы заполнили все данные верно. Когда вы будете готовы, нажмите на кнопку 
            &quot;Отправить заявку&quot;.
          </Typography>
        }
        { (invalidFields.subData.length !== 0 || invalidFields.authors.length !== 0) &&
          <>
            <Box
              component={Typography}
              variant="body2"
              fontWeight={500}
              width={1}
            >
              Пожалуйста, заполните все необходимые поля:
            </Box>
            <ul>
              {invalidFields.subData.map(item => (
                <li key={item}>
                  <Typography>
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>

            { invalidFields.authors.length !== 0 &&
              <>
                { invalidFields.authors.map((author, index) => (
                  <>
                    <Box
                      key={author.name + index}
                      component={Typography}
                      fontWeight={500}
                      width={1}
                    >
                      { `Для автора ${author.name}:` }
                    </Box>
                    <ul>
                      { author.keys.map((key, index) => (
                        <li key={key + index}>
                          <Typography>
                            { key }
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  </>
                ))}
              </>
            }

          </>
        }
      </Grid>
    );
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  }

  const handleSendSubmission = () => {
    const formData = new FormData();
    const fileTypes = [];
    for (const file of files) {
      fileTypes.push(file.fileType);
      formData.append('files', file);
    }

    const newAuthors = [...authors];
    for (const author of newAuthors) {
      author.country_id = countries.findIndex(country => author.country_name === country.label) + 1;
      author.academic_degree_id = author.academic_degree_id === 0 ? null : author.academic_degree_id;
      author.academic_title_id = author.academic_title_id === 0 ? null : author.academic_title_id;
      delete author.country_name;
    }

    const data = { 
      submission: {
        ...subData,
        keywords_ru: keywordsRu.join(),
        keywords_en: keywordsEn.join()
      },
      files: fileTypes,
      authors: newAuthors
    };

    formData.append('data', JSON.stringify(data));

    setSubmitting(true);

    sendSubmission(formData).then(res => {
      if (res.status === 200) {
        localStorage.removeItem('submission');
        handleFinishSubmission();
      }
      else {
        setSnackbar({
          open: true,
          message: 'Ошибка отправки заявки.',
          variant: 'error'
        });
        
        setSubmitting(false);
      }
    });
  }

  const handleSendEditedSubmission = () => {
    const {
      keywords_ru,
      keywords_en,
      // eslint-disable-next-line no-unused-vars
      submission_status,
      ...initialSubData } = submission.submission_details;

    const newSubmission = {
      submission: {},
      authors: [],
      files: {
        create: [],
        delete: []
      }
    };

    const formData = new FormData();

    // Ищем изменения в метаданных
    for (const prop in subData) {
      if (subData[prop] !== initialSubData[prop]) {
        newSubmission.submission[prop] = subData[prop];
      }
    }

    // Ищем изменения в ключевых словах
    if (keywordsRu.join() !== keywords_ru) {
      newSubmission.submission.keywords_ru = keywordsRu.join();
    }
    if (keywordsEn.join() !== keywords_en) {
      newSubmission.submission.keywords_en = keywordsEn.join();
    }

    // Ищем удалённые файлы
    for (const initialFile of submission.files) {
      const initFile = {
        name: initialFile.file.name,
        fileType: initialFile.file_type.id
      };
      if (!files.some(file => JSON.stringify(file) === JSON.stringify(initFile))) {
        newSubmission.files.delete.push(initialFile.id);
      }
    }

    // Ищем новые добавленные файлы
    for (const file of files) {
      if (!submission.files.some(initialFile =>
            JSON.stringify(file) === JSON.stringify({
                name: initialFile.file.name,
                fileType: initialFile.file_type.id
      }))) {
        newSubmission.files.create.push(file.fileType);
        formData.append('files', file);
      }
    }
    
    const initAuthors = [];
    for (const author of submission.authors) {
      const { country_id, ...authorInfo } = author;
      authorInfo.country_name = countries[country_id - 1].label;
      initAuthors.push(authorInfo);
    }

    // Ищем новых добавленных авторов
    const createdAuthorsIndexes = [];
    authors.forEach((author, idx) => {
      if (!author.credentials_id) {
        newSubmission.authors.push({ action: 'create', ...author });
        createdAuthorsIndexes.push(idx);
      }
    });

    const authorsCopy = [...authors];
    createdAuthorsIndexes.forEach(idx => authorsCopy.splice(idx, 1));

    // Ищем удалённых авторов
    const deletedAuthorsCredentialsIds = [];
    const authorsCredentialsIds = authorsCopy.map(author => author.credentials_id);
    for (const initAuthor of initAuthors) {
      if (!authorsCredentialsIds.includes(initAuthor.credentials_id)) {
        newSubmission.authors.push({
          action: 'delete',
          credentials_id: initAuthor.credentials_id
        });
        deletedAuthorsCredentialsIds.push(initAuthor.credentials_id);
      }
    }

    // Ищем изменённых авторов
    const probablyUpdatedAuthors
      = initAuthors
        .filter(initAuthor => !deletedAuthorsCredentialsIds.includes(initAuthor.credentials_id));
    
    for (const author of authorsCopy) {
      const probAuthor = probablyUpdatedAuthors.find(a => a.credentials_id === author.credentials_id);
      const updatedAuthor = {};
      const orgs = { delete: [], create: [], update: [] };
      
      for (const key in author) {
        if (key === 'organizations') {
          // Ищем изменения в организациях
          for (const org of author.organizations) {
            const initOrg = probAuthor.organizations.find(o => o.user_organization_id === org.user_organization_id);

            if (org.user_organization_id) {
              const changes = {};
              // Ищем возможные изменения в организации
              for (const prop in org) {
                if (org[prop] !== initOrg[prop]) {
                  changes[prop] = org[prop];
                }
              }

              if (!isEmpty(changes)) {
                orgs.update.push({
                  ...changes,
                  user_organization_id: initOrg.user_organization_id
                });
              }
            }
            else {
              // Новая добавленная организация
              orgs.create.push(org);
            }
          }

          const orgIds = author.organizations.map(a => a.user_organization_id);
          if (!orgIds.some(org => org === probAuthor.user_organization_id)) {
            orgs.delete.push(probAuthor.user_organization_id);
          }

          continue;
        }

        // Ищем изменения в персональной информации автора
        if (author[key] !== probAuthor[key]) {
          updatedAuthor[key] = author[key];
        }
      }
      
      if (!isEmpty(updatedAuthor) &&
          orgs.delete.length !== 0 ||
          orgs.create.length !== 0 ||
          orgs.update.length !== 0) {
        Object.assign(updatedAuthor, {
          action: 'update',
          credentials_id: author.credentials_id,
          organizations: orgs
        });
        newSubmission.authors.push(updatedAuthor);
      }
    }
    
    // Заменяем названия стран на их id
    // Добавляем organizations, если их нет
    for (const author of newSubmission.authors) {
      const index = countries.findIndex(country => author.country_name === country.label);
      if (index !== -1) {
        author.country_id = index + 1;
        delete author.country_name;
      }

      if (!author.organizations) {
        author.organizations = [];
      }
    }

    // console.log(newSubmission);

    setSubmitting(true);

    formData.append('data', JSON.stringify(newSubmission));

    editSubmission(submissionId, formData).then(res => {
      if (res.status === 200) {
        handleFinishSubmission();
      }
      else {
        setSnackbar({
          open: true,
          message: 'Ошибка редактирования заявки.',
          variant: 'error'
        });

        setSubmitting(false);
      }
    });
  }

  return (
    <Fade in>
      <Paper className={classes.paper} square {...other}>
        <Hidden mdUp>
          <Grid container item xs={12} justify="center">
            <Paper square elevation={0} className={classes.header}>
              <Typography variant="h6">
                { steps[activeStep] }
              </Typography>
              <div className={classes.grow} />
              <Tooltip title="Отменить">
                <IconButton onClick={handleCancelling}>
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            </Paper>
          </Grid>
          <Divider />
        </Hidden>
        <Grid container justify="center" className={classes.content}>
          <div className={classes.root}>
            <Hidden smDown>
              <Stepper
                nonLinear
                activeStep={activeStep}
                className={
                  clsx(classes.stepper, { [classes.shrunk]: readOnlyMode || editMode })
                }
              >
                { steps.map((label, index) => (
                  <Step key={label}>
                    <StepButton onClick={() => handleSetActiveStep(index)} completed={completed[index]}>
                      { label }
                    </StepButton>
                  </Step>
                  ))
                }
              </Stepper>
            </Hidden>
            <div>
              <Grid>
                { getStepContent(activeStep) }
              </Grid>
              <Hidden smDown>
                <div className={classes.buttons}>
                  <Button
                    onClick={handleCancelling}
                    className={classes.button}
                  >
                    { readOnlyMode ? 'Закрыть' : 'Отменить' }
                  </Button>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    variant="contained"
                    color="primary"
                    className={classes.button}
                  >
                    Назад
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    className={classes.button}
                    disabled={isLastStep()}
                  >
                    Далее
                  </Button>
                  { isLastStep() && !readOnlyMode &&
                    <div className={classes.wrapper}>
                      <Button
                        disabled={!allStepsCompleted() || submitting}
                        variant="contained"
                        color="primary"
                        onClick={editMode ? handleSendEditedSubmission : handleSendSubmission}
                        className={classes.button}
                      >
                        { editMode ? 'Сохранить изменения' : 'Отправить заявку' }
                      </Button>
                      { submitting && <CircularProgress size={24} className={classes.buttonProgress} /> }
                    </div>
                  }
                </div>
              </Hidden>
            </div>
          </div>
        </Grid>
        <Hidden mdUp>
          <Divider />
          <MobileStepper
            className={classes.mobileStepper}
            variant="dots"
            steps={totalSteps()}
            position="static"
            activeStep={activeStep}
            nextButton={
              <>
                { isLastStep() &&
                  <div className={classes.wrapper}>
                    <Button
                      size="small"
                      onClick={editMode ? handleSendEditedSubmission : handleSendSubmission}
                      disabled={!allStepsCompleted() || submitting}
                    >
                      { editMode ? 'Сохранить изменения' : 'Отправить заявку' }
                      <KeyboardArrowRight />
                    </Button>
                    { submitting && <CircularProgress size={24} className={classes.buttonProgress} /> }
                  </div>
                }
                { !isLastStep() &&
                  <Button size="small" onClick={handleNext}>
                    Далее
                    <KeyboardArrowRight />
                  </Button>
                }
              </>
            }
            backButton={
              <Button
                size="small"
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                <KeyboardArrowLeft />
                Назад
              </Button>
            }
          />
        </Hidden>
        
        <StyledSnackbar
          open={snackbar.open}
          variant={snackbar.variant}
          message={snackbar.message}
          onClose={handleCloseSnackbar}
        />

        { !readOnlyMode && !editMode &&
          <ConfirmDialog
            open={confirmContinueOpen}
            text="Желаете продолжить заполнение предыдущей заявки?"
            closeYes={handleContinue}
            closeNo={handleDiscontinue}
          />
        }

      </Paper>
    </Fade>
  );
}

SubmissionStepper.propTypes = {
  handleCancelling: PropTypes.func,
  handleFinishSubmission: PropTypes.func,
  readOnlyMode: PropTypes.bool,
  editMode: PropTypes.bool,
  submission: PropTypes.object,
  submissionId: PropTypes.string
};

export default SubmissionStepper;
