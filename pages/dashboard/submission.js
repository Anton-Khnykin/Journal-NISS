import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { useTheme } from '@material-ui/styles';
import Fade from '@material-ui/core/Fade';
import Hidden from '@material-ui/core/Hidden';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Divider from '@material-ui/core/Divider';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import CircularProgress from '@material-ui/core/CircularProgress';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SubmissionIcon from '@material-ui/icons/Inbox';
import AssessmentIcon from '@material-ui/icons/Assessment';
import ChatIcon from '@material-ui/icons/Chat';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
import DashboardLayout from 'components/dashboard/DashboardLayout';
import SubmissionHistory from 'components/dashboard/SubmissionHistory';
import SubmissionAppBar from 'components/dashboard/SubmissionAppBar';
import NothingToDisplayText from 'components/dashboard/NothingToDisplayText';
import StatusChip from 'components/dashboard/StatusChip';
import StyledSnackbar from 'components/dashboard/StyledSnackbar';
import ConfirmDialog from 'components/dashboard/ConfirmDialog';
import SubmissionDialog from 'components/dashboard/SubmissionDialog';
import WithMobileDialog from 'components/WithMobileDialog';
import Download from 'components/Download';
import downloadjs from 'downloadjs';
import { getFullName, getDate, getKeywords } from 'utils/data_parser';
import { isEmptyOrNull } from 'utils/validation';
import { getSorting, stableSort } from 'utils/sorting';
import { REVIEW_STATUS, SUBMISSION_STATUS, SUBMISSION_RECOMMENDATION } from 'middleware/enums';
import { academicDegreesRu, academicDegreesEn, academicTitlesRu, academicTitlesEn } from 'middleware/lists';
import { getSubmission, getSubmissionReviews, manageSubmission, getSubmissionReviewers, sendReviewToAuthor } from 'middleware/api/secretary';
import { downloadFile } from 'middleware/api/public';
import { getMessages } from 'middleware/api/common';
import countries from 'middleware/countries';

// Валидация даты

const isDateValid = date => {
  if (isEmptyOrNull(date)) {
    return 'Поле не должно быть пустым';
  }
  if (new Date(date) <= new Date()) {
    return 'Неверная дата';
  }
  return null;
}

// Стили для мелких компонентов

const useComponentStyles = makeStyles(() => ({
  grow: {
    flexGrow: 1
  },
  panel: {
    width: '100%',
    overflow: 'hidden'
  },
  hiddenDivider: {
    display: 'none'
  }
}));

// Расширяемая панель для просмотра информации о заявке

const CustomPanel = ({ expanded, onChange, summary, details, actions }) => {
  const classes = useComponentStyles();

  return (
    <ExpansionPanel
      square
      className={classes.panel}
      expanded={expanded}
      onChange={onChange}
      elevation={expanded ? 1 : 0}
    >
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} >
        {summary}
      </ExpansionPanelSummary>
      <Divider className={clsx({ [ classes.hiddenDivider]: !expanded })} />
      <ExpansionPanelDetails>
        <Grid container className={classes.grow}>
          {details}
        </Grid>
      </ExpansionPanelDetails>
      {actions}
    </ExpansionPanel>
  );
}

CustomPanel.propTypes = {
  expanded: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  summary: PropTypes.any.isRequired,
  details: PropTypes.any.isRequired,
  actions: PropTypes.any
}

// Заголовок

const TitleBox = ({ title, content }) => (
  <Box 
    display="flex"
    width={1}
    minHeight={60.5}
    pr={{xs: 2, sm: 0}}
    pl={{xs: 2, sm: 0}}
    pt={{xs: 2, sm: 0}}
    pb={3}
  >
    { 
      content ||
      <Typography noWrap variant="h6">
        {title}
      </Typography>
    }
  </Box>
)

TitleBox.propTypes = {
  title: PropTypes.string,
  content: PropTypes.any
}

// Подзаголовок

const SubTitle = label => (
  <Box
    component="span"
    fontStyle="initial"
    fontWeight={500}
    mr={1}
  >
    {label}
  </Box>
)

// Компонент для отображения текста метаданных

const SubContent = ({ children, gutterTop }) => (
  <Box
    component={Typography}
    pt={gutterTop ? 2 : 0}
    fontStyle="italic"
    width={1}
  >
    {children}
  </Box>
)

SubContent.propTypes = {
  children: PropTypes.any.isRequired,
  gutterTop: PropTypes.bool
}

const useButtonStyles = makeStyles(theme => ({
  button: {
    marginBottom: theme.spacing(2)
  },
  acceptBtn: {
    borderColor: green[200],
    color: green[500],
    '&:hover': {
      borderColor: green[600]
    }
  },
  rejectBtn: {
    borderColor: red[200],
    color: red[500],
    '&:hover': {
      borderColor: red[600]
    }
  }
}));

// Стилизованная кнопка управления заявкой

const ManageButton = ({ title, onClick, disabled, accept, reject }) => {
  const classes = useButtonStyles();

  return (
    <Button
      onClick={onClick}
      fullWidth
      variant="outlined"
      color={!(accept || reject) ? "primary" : "default"}
      disabled={disabled}
      className={clsx(
        classes.button,
        {
          [classes.acceptBtn]: accept,
          [classes.rejectBtn]: reject
        }
      )}
    >
      {title}
    </Button>
  )
}

ManageButton.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  accept: PropTypes.bool,
  reject: PropTypes.bool
}

// Модальное окно для отправки заявки на доработку

const ModalRevisionContent = props => {
  const { submissionId,
          open,
          onClose,
          setSnackbar,
          setSubmission } = props;
  const [ deadline, setDeadline ] =  useState('');
  const [ commentary, setCommentary ] = useState('');
  const [ error, setError ] = useState(null);

  const handleCommentaryChange = event => {
    setCommentary(event.target.value);
  };

  const handleDateChange = ({ target: { value } }) => {
    setError(isDateValid(value));
    setDeadline(value);
  }

  const handleSubmit = ()=> {
    const isInvalid = isDateValid(deadline);
    if (isInvalid) {
      setError(isInvalid);
      return;
    }
    manageSubmission(submissionId, {
      action: 'sendToRevision',
      deadline_author: deadline,
      commentary: commentary
    })
      .then(async (res) => {
        if (res.status === 200) {
          setSubmission(await getSubmission(submissionId));
          setSnackbar({
            open: true,
            variant: 'success',
            message: 'Статья отправлена на доработку'
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
      maxWidth="xs"
      open={open}
      onClose={onClose}
      title="Отправить&nbsp;статью на&nbsp;доработку"
    >
      <DialogContent dividers>
        <TextField
          label={error || "Дедлайн"}
          value={deadline}
          onChange={handleDateChange}
          error={!!error}
          required
          fullWidth
          margin="dense"
          type="date"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Комментарий"
          value={commentary}
          onChange={handleCommentaryChange}
          fullWidth
          margin="dense"
          multiline
          rows="2"
          rowsMax="4"
        />
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

ModalRevisionContent.propTypes = {
  submissionId: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  setSnackbar: PropTypes.func.isRequired,
  setSubmission: PropTypes.func.isRequired
};

const useModalToReviewStyles = makeStyles(theme => ({
  subTitle: {
    fontWeight: 500
  },
  dateField: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3)
  },
  tableWrapper: {
    minHeight: 150,
    [theme.breakpoints.down('xs')]: {
      overflowX: 'scroll'
    }
  }
}));

// Модальное окно для отправки заявки на рецензирование

const ModalReviewContent = props => {
  const classes = useModalToReviewStyles();
  const { submissionId,
          open,
          onClose,
          setSnackbar,
          setReviews,
          setSubmission } = props;
  const [ reviewers, setReviewers ] = useState([]);
  const [ deadline, setDeadline ] = useState('');
  const [ order, setOrder ] = useState('asc');
  const [ orderBy, setOrderBy ] = useState('name');
  const [ selected, setSelected ] = useState([]);
  const [ error, setError ] = useState({
    date: null,
    selected: null
  });

  useEffect(() => {
    getSubmissionReviewers(submissionId).then(res => {
      setReviewers(res);
    }); 
  }, []);

  const handleDateChange = ({ target: { value } }) => {
    setError({ ...error, date: isDateValid(value) });
    setDeadline(value);
  }

  const handleRequestSort = property => () => {
    const isDesc = orderBy === property && order === 'desc';
    setOrder(isDesc ? 'asc' : 'desc');
    setOrderBy(property);
  }

  const isSelectedValid = data => {
    if (data.length === 0) {
      return 'Выберите как минимум одного рецензента';
    }
    return null;
  }

  const handleRowClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setError({ ...error, selected: isSelectedValid(newSelected) });
    setSelected(newSelected);
  }

  const handleSubmit = () => {
    let isInvalid = isDateValid(deadline);
    if (isInvalid) {
      setError({
        date: isInvalid,
        selected: isSelectedValid(selected)
      });
      return;
    }
    else {
      isInvalid = isSelectedValid(selected);
      if (isInvalid) {
        setError({ ...error, selected: isInvalid });
        return;
      }
    }

    manageSubmission(submissionId, {
      action: 'sendToReview',
      deadline_reviewer: deadline,
      reviewers: selected
    })
      .then(async (res) => {
        if (res.status === 200) {
          setReviews(await getSubmissionReviews(submissionId));
          setSubmission(await getSubmission(submissionId));
          setSnackbar({
            open: true,
            variant: 'success',
            message: 'Статья отправлена на рецензирование'
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

  const isSelected = id => selected.indexOf(id) !== -1;

  return (
    <WithMobileDialog
      maxWidth="md"
      open={open}
      onClose={onClose}
      title="Отправить&nbsp;статью на&nbsp;рецензирование"
    >
      <DialogContent dividers>
        <Box
          component={Typography}
          variant="body2"
          className={classes.subTitle}
        >
          Установите&nbsp;дедлайн
        </Box>
        <TextField
          label={error.date || "Дедлайн"}
          value={deadline}
          onChange={handleDateChange}
          error={!!error.date}
          required
          fullWidth
          type="date"
          className={classes.dateField}
          InputLabelProps={{ shrink: true }}
        />
        <Box
          component={Typography}
          variant="body2"
          className={classes.subTitle}
        >
          Выберите&nbsp;рецензентов
        </Box>
        <div className={classes.tableWrapper}>
          {reviewers.length === 0 ? <CircularProgress size={30} /> :
            <Fade in>
              <Table aria-labelledby="tableTitle" size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell align='left' sortDirection={orderBy === 'name' ? order : false}>
                      <TableSortLabel
                        active={orderBy === 'name'} 
                        direction={order} 
                        onClick={handleRequestSort('name')}
                      >
                        ФИО
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      align='left'
                      sortDirection={orderBy === 'interests' ? order : false}
                    >
                      <TableSortLabel
                        active={orderBy === 'interests'}
                        direction={order}
                        onClick={handleRequestSort('interests')}
                      >
                        Научные&nbsp;интересы
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                 <TableBody>
                  {stableSort(reviewers, getSorting(order, orderBy)).map(row => {
                    const isItemSelected = isSelected(row.id);
                    return (
                      <TableRow
                        key={row.name}
                        tabIndex={-1}
                        hover
                        onClick={event => handleRowClick(event, row.id)}
                        aria-checked={isItemSelected}
                        selected={isItemSelected}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isItemSelected}
                            disabled={row.alreadyDid}
                            color="primary"
                          />
                        </TableCell>
                        <TableCell padding="none">{row.name}</TableCell>
                        <TableCell padding="none">{row.interests}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Fade>
          }
          <FormControl error={!!error.selected}>
            <FormHelperText>{error.selected}</FormHelperText>
          </FormControl>
        </div>
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

ModalReviewContent.propTypes = {
  submissionId: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  setSnackbar: PropTypes.func.isRequired,
  setReviews: PropTypes.func.isRequired,
  setSubmission: PropTypes.func.isRequired
};

// Вкладка с заявкой

const useSubmissionTabStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1
  },
  root: {
    padding: theme.spacing(3),
    [theme.breakpoints.down('xs')]: {
      padding: 0
    }
  },
  file: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      color: theme.palette.primary.light,
      cursor: 'pointer'
    }
  }
}));

const SubmissionTabContent = props => {
  const classes = useSubmissionTabStyles();
  const { submission,
          setSubmission,
          submissionId,
          setSnackbar,
          setReviews,
          expanded,
          onPanelChange } = props;
  const [modalHistoryOpen, setModalHistoryOpen] = useState(false);
  const [modalReviewOpen, setModalReviewOpen] = useState(false);
  const [modalRevisionOpen, setModalRevisionOpen] = useState(false);
  const [submissionAction, setSubmissionAction] = useState('');
  const [dialog, setDialog] = useState({
    open: false,
    text: ''
  }); 
  const disabled = submission.submission_details.status.id === SUBMISSION_STATUS.ACCEPTED_IN_CURRENT_ISSUE ||
                   submission.submission_details.status.id === SUBMISSION_STATUS.PUBLISHED ||
                   submission.submission_details.status.id === SUBMISSION_STATUS.REJECTED;

  const handleSubmit = () => {
    manageSubmission(submissionId, { action: submissionAction })
      .then(async (res) => {
        if (res.status === 200) {
          setSubmission(await getSubmission(submissionId));
          setSnackbar({
            open: true,
            variant: 'success',
            message: submissionAction === 'accept' ? 'Статья принята к публикации' : 'Заявка на публикацю отклонена'
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
    handleCloseDialog();
  }

  const handleCloseDialog = () => {
    setSubmissionAction('');
    setDialog({...dialog, ['open']: false});
  }

  const handleManageClick = action => () => {
    setSubmissionAction(action);
    setDialog({
      open: true,
      text: 'Вы уверены, что хотите ' + (action === 'accept' ? 'принять' : 'отклонить') + ' заявку?'
    });
  }

  const handleModalRevisionOpen = () => {
    setModalRevisionOpen(true);
  }

  const handleModalRevisionClose = () => {
    setModalRevisionOpen(false);
  }

  const handleModalReviewOpen = () => {
    setModalReviewOpen(true);
  }

  const handleModalReviewClose = () => {
    setModalReviewOpen(false);
  }

  const handleModalHistoryOpen = () => {
    setModalHistoryOpen(true);
  }

  const handleModalHistoryClose = () => {
    setModalHistoryOpen(false);
  }

  // Рендер данных

  const MetaTitle = label => (
    <Box
      component={Typography}
      fontWeight={500}
      style={{ fontWeight: 500 }}
      pt={2}
    >
      {label}
    </Box>
  )

  const getPrimaryContact = () => {
    const primaryContact = submission.authors.find(author => author.is_primary_contact);
    return (
      <>
        <SubContent gutterTop>
          {SubTitle("ФИО:")}
          {getFullName(primaryContact, 'ru')}
        </SubContent>
        <SubContent>
          {SubTitle("Email:")}
          {primaryContact.contact_email}
        </SubContent>
      </>
    );
  }

  const getAuthors = lang => {
    const elements = [];
    for (const author of submission.authors) {
      const organizations = [];
      for (const organization of author.organizations) {
        organizations.push(
          <React.Fragment key={organization[`organization_name_${lang}`] + author.organizations.indexOf(organization)}>
            <SubContent>
              {SubTitle("Наименование\xa0организации:")}
              {organization[`organization_name_${lang}`]}
            </SubContent>
            <SubContent>
              {SubTitle("Адрес\xa0организации:")}
              {organization[`organization_address_${lang}`]}
            </SubContent>
            <SubContent>
              {SubTitle("Должность:")}
              {organization[`person_position_${lang}`]}
            </SubContent>
          </React.Fragment>
        );
      }
      elements.push(
        <Box
          key={author[`first_name_${lang}`] + submission.authors.indexOf(author)}
          width={1}
          pt={2}
        >
          <SubContent>
            {SubTitle("ФИО:")}
            {getFullName(author, lang)}
          </SubContent>
          <SubContent>
            {SubTitle("Email:")}
            {author['contact_email']}
          </SubContent>
          <SubContent>
            {SubTitle("Ученое\xa0звание:")}
            {author.academic_title_id ?
              <>
              {lang === 'ru' && academicTitlesRu[author.academic_title_id - 1]}
              {lang === 'en' && academicTitlesEn[author.academic_title_id - 1]}
              </>
              :
              "Не указано"
            }
          </SubContent>
          <SubContent>
            {SubTitle("Ученая\xa0степень:")}
            {author.academic_degree_id ?
              <>
                {lang === 'ru' && academicDegreesRu[author.academic_degree_id - 1]}
                {lang === 'en' && academicDegreesEn[author.academic_degree_id - 1]}
              </>
              :
              "Не указано"
            }
          </SubContent>
          <SubContent>
            {SubTitle("Научные\xa0интересы:")}
            {author[`scientific_interests_${lang}`] ?
              author[`scientific_interests_${lang}`]
              :
              "Не указано"
            }
          </SubContent>
          <SubContent>
            {SubTitle("Страна:")}
            {countries[author.country_id - 1].label}
          </SubContent>
          {organizations}
        </Box>
      );
    }

    return elements;
  }

  const getMetadata = lang => {
    return (
      <>
        {MetaTitle("Название\xa0статьи")}
        <SubContent gutterTop>
          {submission.submission_details[`title_${lang}`]}
        </SubContent>
        {MetaTitle("Аннотация")}
        <SubContent gutterTop>
          {submission.submission_details[`abstract_${lang}`]}
        </SubContent>
        {MetaTitle("Ключевые\xa0слова")}
        <SubContent gutterTop>
          {getKeywords(submission.submission_details[`keywords_${lang}`])}
        </SubContent>
      </>
    );
  }

  const getFiles = () => {
    const elements = [];
    for (const item of submission.files) {
      elements.push(
        <Box
          key={'file' + item.file.id}
          component={Typography}
          display="flex"
          width={1}
          pt={2}
        >
          {SubTitle(`${item.file_type.name}:`)}
          <Download fileId={item.file.id}>
            <span className={classes.file}>
              {item.file.name}
            </span>
          </Download>
        </Box>
      );
    }
    return (
      <>{elements}</>
    );
  }

  return (
    <Grid container className={classes.root}>
      <Box
        component={Grid}
        container
        item sm={8} md={9}
        alignContent="flex-start"
        pr={{ xs:0, sm:1 }}
      >
        <TitleBox
          content={
            <>
              <Typography noWrap variant="h6">
                Информация&nbsp;о&nbsp;заявке
              </Typography>          
              <div className={classes.grow}/>
              <Button color="primary" onClick={handleModalHistoryOpen}>
                История
              </Button>
            </>
          }
        />
        <Box width={1}>
          <CustomPanel
            expanded={expanded['panel1']}
            onChange={onPanelChange('panel1')}
            summary="Заявка&nbsp;на&nbsp;публикацию"
            details={
              <>
                <SubContent gutterTop>
                  {SubTitle("Статус\xa0заявки:")}
                  {submission.submission_details.status.name}
                  {submission.submission_details.deadline_author &&
                    ` до (${getDate(submission.submission_details.deadline_author)})`
                  }
                </SubContent>
                {MetaTitle("Корреспондирующий\xa0автор:")}
                {getPrimaryContact()}
              </>
            }
          />
          <CustomPanel
            expanded={expanded['panel2']}
            onChange={onPanelChange('panel2')}
            summary="Авторы"
            details={getAuthors('ru')}
          />
          <CustomPanel
            expanded={expanded['panel3']}
            onChange={onPanelChange('panel3')}
            summary="Авторы&nbsp;(английский&nbsp;язык)"
            details={getAuthors('en')}
          />
          <CustomPanel
            expanded={expanded['panel4']}
            onChange={onPanelChange('panel4')}
            summary="Метаданные"
            details={getMetadata('ru')}
          />
          <CustomPanel
            expanded={expanded['panel5']}
            onChange={onPanelChange('panel5')}
            summary="Метаданные&nbsp;(английский&nbsp;язык)"
            details={getMetadata('en')}
          />
          <CustomPanel
            expanded={expanded['panel6']}
            onChange={onPanelChange('panel6')}
            summary="Прикрепленные&nbsp;файлы"
            details={getFiles()}
          />
        </Box>
      </Box>

      <Hidden smUp>
        <Box component={Divider} width={1} mt={2} />
      </Hidden>

      <Box
        component={Grid}
        container
        item sm={4} md={3}
        alignContent="flex-start"
        pl={{ xs:0, sm:1 }}
      >
        <TitleBox title="Управление&nbsp;заявкой"/>
        <Box
          width={1}
          pr={{xs: 2, sm: 0}}
          pl={{xs: 2, sm: 0}}
        >
          <ManageButton
            title="Принять&nbsp;заявку"
            onClick={handleManageClick('accept')}
            disabled={disabled || submission.submission_details.status.id === SUBMISSION_STATUS.RECOMMENDED_FOR_PUBLISHING}
            accept
          />
          <ManageButton
            title="Отклонить&nbsp;заявку"
            onClick={handleManageClick('reject')}
            disabled={disabled}
            reject
          />
          <ManageButton
            title="Отправить&nbsp;на доработку"
            onClick={handleModalRevisionOpen}
            disabled={disabled}
          />
          <ManageButton
            title="Отправить&nbsp;на рецензирование"
            onClick={handleModalReviewOpen}
            disabled={disabled}
          />
        </Box>
      </Box>

      <ConfirmDialog 
        open={dialog.open}
        text={dialog.text}
        closeYes={handleSubmit}
        closeNo={handleCloseDialog}
      />

      <ModalRevisionContent
        submissionId={submissionId}
        open={modalRevisionOpen}
        onClose={handleModalRevisionClose}
        setSnackbar={setSnackbar}
        setSubmission={setSubmission}
      />

      <ModalReviewContent
        submissionId={submissionId}
        open={modalReviewOpen}
        onClose={handleModalReviewClose}
        setSnackbar={setSnackbar}
        setReviews={setReviews}
        setSubmission={setSubmission}
      />

      <WithMobileDialog
        maxWidth="xs"
        open={modalHistoryOpen}
        onClose={handleModalHistoryClose}
        title="История&nbsp;заявки"
      >
        <SubmissionHistory
          submissionId={submissionId}
          onClose={handleModalHistoryClose}
        />
      </WithMobileDialog>
    </Grid>
  );
}

SubmissionTabContent.propTypes = {
  submission: PropTypes.object.isRequired,
  setSubmission: PropTypes.func.isRequired,
  submissionId: PropTypes.string.isRequired,
  setSnackbar: PropTypes.func.isRequired,
  setReviews: PropTypes.func.isRequired,
  expanded: PropTypes.object.isRequired,
  onPanelChange: PropTypes.func.isRequired
};

// Вкладка с рецензиями

const useReviewsTabStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1
  },
  title: {
    marginBottom: theme.spacing(3)
  },
  menu: {
    padding: 0
  },
  actions: {
    [theme.breakpoints.down('xs')]: {
      display: 'block'
    }
  },
  button: {
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      margin: 0
    }
  }
}));

const ReviewsTabContent = props => {
  const classes = useReviewsTabStyles();
  const theme = useTheme();
  const { reviews,
          setReviews,
          submissionId,
          setSnackbar,
          expanded,
          onPanelChange } = props;
  const temp = {};
  reviews.forEach(review => temp[review.review_id] = null);
  const [anchors, setAnchors] = useState(temp);
  const [reviewForSubmit, setReviewForSubmit] = useState(null);
  const [dialog, setDialog] = useState({
    open: false,
    text: ''
  });

  const handleSubmit = () => {
    sendReviewToAuthor(reviewForSubmit, { submission_id: submissionId })
      .then(async (res) => {
        if (res.status === 200) {
          setSnackbar({
            open: true,
            variant: 'success',
            message:  'Рецензия отправлена автору'
          });
          setReviews(await getSubmissionReviews(submissionId));
        }
        else {
          setSnackbar({
            open: true,
            variant: 'error',
            message: res.message || 'Ошибка на сервере'
          });
        }
      });
    handleCloseDialog();
  }

  const handleCloseDialog = () => {
    setReviewForSubmit(null);
    setDialog({...dialog, ['open']: false });
  }

  const handleMenuOpen = id => event => {
    setAnchors({...anchors, [id]: event.currentTarget});
  }

  const handleMenuClose = id => () => {
    setAnchors({...anchors, [id]: null});
  }

  const handleMenuItemClick = (fileId, id) => () => {
    downloadFile(fileId)
      .then(res => downloadjs(res.data, res.name, res.type));
    setAnchors({...anchors, [id]: null});
  }

  const handleSendReviewClick = reviewId => () => {
    setReviewForSubmit(reviewId);
    setDialog({
      open: true,
      text: 'Вы уверены, что хотите отправить рецензию автору?'
    });
  }

  const elements = [];
  for (const review of reviews) {
    const index = reviews.indexOf(review) + 1;
    const isSignedReady = review.file_signed !== null;
    const isUnsignedReady = (review.file_signed === null && review.file !== null);

    elements.push(
      <CustomPanel
        key={review.review_id}
        expanded={expanded[`panel${index}`]}
        onChange={onPanelChange(`panel${index}`)}
        summary={
          <Box width={1} display="flex">
            <div>
              <Box component={Typography} width={1}>
                {getFullName(review.credential, 'ru')}
              </Box>
              <Typography color="textSecondary">
                Крайний срок:&nbsp;{getDate(review.deadline)}
              </Typography>
            </div>
            <div className={classes.grow}/>
            <Hidden xsDown>
              <StatusChip statusOf="review" status={review.status} />
            </Hidden>
          </Box>
        }
        details={
          <>
            <Box width={1}>
              <Hidden smUp>
                <Box pt={{ xs: 2, sm: 0 }}>
                  <StatusChip statusOf="review" status={review.status} />
                </Box>
              </Hidden>
              {(review.status !== REVIEW_STATUS.REJECTED && review.status !== REVIEW_STATUS.PENDING) &&
                <>
                  {(!isSignedReady && !isUnsignedReady) &&
                    <Box component={Typography} pt={2}>
                      Рецензия&nbsp;не&nbsp;готова
                    </Box>
                  }
                  {isUnsignedReady &&
                    <Box component={Typography} pt={2}>
                      Подписанный&nbsp;вариант&nbsp;не&nbsp;загружен
                    </Box>
                  }
                  {isSignedReady &&
                    <SubContent gutterTop>
                      {SubTitle("Рекомендация\xa0рецензента:")}
                      <span style={{
                        color:
                          review.recommendation.id === SUBMISSION_RECOMMENDATION.REJECT ?
                            theme.palette.status.rejected :
                            review.recommendation.id === SUBMISSION_RECOMMENDATION.ACCEPT ?
                              theme.palette.status.accepted :
                              theme.palette.status.other
                      }}>
                        {review.recommendation.name}
                      </span>
                    </SubContent>
                  }
                </>
              }
            </Box>
            <Menu
              id={`download-menu-${review.review_id}`}
              anchorEl={anchors[review.review_id]}
              open={Boolean(anchors[review.review_id])}
              onClose={handleMenuClose(review.review_id)}
            >
                <MenuItem onClick={handleMenuItemClick(review.file, review.review_id)}>
                  <Typography>Неподписанный вариант</Typography>
                </MenuItem>
              {isSignedReady &&
                <MenuItem onClick={handleMenuItemClick(review.file_signed, review.review_id)}>
                  <Typography>Подписанный вариант</Typography>
                </MenuItem>
              }
            </Menu>
          </>
        }
        actions={(isUnsignedReady || isSignedReady) &&
          <>
            <Divider/>
            <ExpansionPanelActions className={classes.actions}>
              <Button
                onClick={handleMenuOpen(review.review_id)}
                color="primary"
                size="small"
                className={classes.button}
              >
                Скачать
              </Button>
              {isSignedReady &&
                <Button
                  onClick={handleSendReviewClick(review.review_id)}
                  color="primary"
                  size="small"
                  className={classes.button}
                  disabled={review.status === REVIEW_STATUS.SENT_TO_AUTHOR}
                >
                  Отправить автору
                </Button>
              }
            </ExpansionPanelActions>
          </>
        }
      />
    );
  }

  return (
    <Box width={1} p={{ xs: 0, sm: 3 }} alignContent="flex-start">
      {reviews.length === 0 ? <NothingToDisplayText text="Нет рецензий" /> :
        <>
          <Hidden smUp>
            <Box
              component={Typography}
              variant="h6"
              pr={{xs: 2, sm: 0}}
              pl={{xs: 2, sm: 0}}
              pt={{xs: 2, sm: 0}}
              pb={3}
            >
              Рецензии
            </Box>
          </Hidden>
          <Box>
            {elements}
          </Box>
        </>
      }
      <ConfirmDialog 
        open={dialog.open}
        text={dialog.text}
        closeYes={handleSubmit}
        closeNo={handleCloseDialog}
      />
    </Box>
  );
}

ReviewsTabContent.propTypes = {
  reviews: PropTypes.array.isRequired,
  setReviews: PropTypes.func.isRequired,
  submissionId: PropTypes.string.isRequired,
  setSnackbar: PropTypes.func.isRequired,
  expanded: PropTypes.object.isRequired,
  onPanelChange: PropTypes.func.isRequired
};

// Страница заявки

const useStyles = makeStyles(theme => ({
  container: {
    minHeight: 'calc(100vh - 161px)',
    [theme.breakpoints.down('xs')]: {
      minHeight: 'calc(100vh - 105px)'
    }
  }
}));

function Submission(props) {
  const classes = useStyles();
  const { submissionId } = props;
  const [ submission, setSubmission ] = useState(props.submission);
  const [ reviews, setReviews ] = useState(props.reviews);
  const [ messages, setMessages ] = useState(props.messages);
  const [ messageText, setMessageText ] = useState('');
  const [ tabValue, setTabValue ] = useState(0);
  const [ snackbar, setSnackbar ] = useState({
    open: false,
    variant: 'success',
    message: ''
  });
  const [ submissionPanelsExpanded, setSubmissionPanelsExpanded ] = useState({
    'panel1': true,
    'panel2': false,
    'panel3': false,
    'panel4': false,
    'panel5': false,
    'panel6': false
  });
  const reviewPanels = {};
  for (var i = 0; i < reviews.length; i++) {
    reviewPanels[`panel${i + 1}`] = false;
  }
  const [ reviewPanelsExpanded, setReviewPanelsExpanded ] = useState(reviewPanels);

  const handleSubmissionPanelChange = panel => (event, isExpanded) => {
    setSubmissionPanelsExpanded({ ...submissionPanelsExpanded, [panel]: isExpanded });
  };

  const handleReviewPanelChange = panel => (event, isExpanded) => {
    setReviewPanelsExpanded({ ...reviewPanelsExpanded, [panel]: isExpanded });
  };

  const handleCloseSnack = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({...snackbar, ['open']: false});
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  }

  return (
    <>
      <Head>
        <title>Заявка № { submissionId } | { submission.submission_details.title_ru } | Панель управления</title>
      </Head>
      <DashboardLayout navBarTitle="Управление заявкой">
        <Paper square>
          <SubmissionAppBar
            tabs={[
              {
                label: 'Управление заявкой',
                icon: <SubmissionIcon/>
              },
              {
                label: 'Рецензии',
                icon: <AssessmentIcon/>
              },
              {
                label: 'Диалог с автором',
                icon: <ChatIcon/>
              }
            ]}
            value={tabValue}
            onChange={handleTabChange}
          />
          <div className={classes.container}>
            {tabValue === 0 && <SubmissionTabContent
              submission={submission}
              setSubmission={setSubmission}
              submissionId={submissionId}
              setSnackbar={setSnackbar}
              setReviews={setReviews}
              expanded={submissionPanelsExpanded}
              onPanelChange={handleSubmissionPanelChange}
            />}
            {tabValue === 1 && <ReviewsTabContent
              reviews={reviews}
              setReviews={setReviews}
              submissionId={submissionId}
              setSnackbar={setSnackbar}
              expanded={reviewPanelsExpanded}
              onPanelChange={handleReviewPanelChange}
            />}
            {tabValue === 2 && <SubmissionDialog
              submissionId={submissionId}
              messages={messages}
              setMessages={setMessages}
              messageText={messageText}
              setMessageText={setMessageText}
            />}
          </div>
        </Paper>
        <StyledSnackbar
          open={snackbar.open}
          variant={snackbar.variant}
          message={snackbar.message}
          onClose={handleCloseSnack}
        />
      </DashboardLayout>
    </>
  );
}

Submission.getInitialProps = async ({ req, query }) => {
  const submissionId = query.slug;
  const submission = req ? await getSubmission(submissionId, req.headers.cookie) : await getSubmission(submissionId);
  const reviews = req ? await getSubmissionReviews(submissionId, req.headers.cookie) : await getSubmissionReviews(submissionId);
  const messages = req ? await getMessages(submissionId, req.headers.cookie) : await getMessages(submissionId);
  return { submission, reviews, messages, submissionId };
}

Submission.propTypes = {
  submission: PropTypes.object.isRequired,
  reviews: PropTypes.array.isRequired,
  messages: PropTypes.array.isRequired,
  submissionId: PropTypes.string.isRequired
};

export default Submission;
