import React, { useState } from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { useTheme } from '@material-ui/styles';
import DashboardLayout from 'components/dashboard/DashboardLayout';
import StyledSnackbar from 'components/dashboard/StyledSnackbar';
import SubmissionModalContent from 'components/dashboard/SubmissionModalContent';
import WithMobileDialog from 'components/WithMobileDialog';
import Hidden from '@material-ui/core/Hidden';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { ISSUE_STATUS } from 'middleware/enums';
import { getNames, getDate } from 'utils/data_parser';
import { isEmptyOrNull } from 'utils/validation';
import { getIssue, vote } from 'middleware/api/editorial_board_member';

const CustomTextField = ({ required, error, setError, onBlur }) => {
  const [ value, setValue ] = useState('');

  const handleChange = event => {
    if (required) {
      isEmptyOrNull(event.target.value) ? setError('Поле не должно быть пустым') : setError(null);
    }
    setValue(event.target.value);
  }

  return (
    <TextField
      fullWidth
      autoFocus
      label={error || "Комментарий"}
      multiline
      rows="3"
      rowsMax="10"
      required={required}
      value={value}
      error={!!error}
      onChange={handleChange}
      onBlur={onBlur(value)}
    />
  );
}

CustomTextField.propTypes = {
  required: PropTypes.bool.isRequired,
  error: PropTypes.object,
  setError: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired
}

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing(3),
    width: '100%',
    flexGrow: 1
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
}));

function EbmIssue(props) {
  const classes = useStyles();
  const theme = useTheme();
  const [ issue, setIssue ] = useState(props.issue);
  const [ submission, setSubmission ] = useState({
    open: false,
    submission: {}
  });
  const [ issueAction, setIssueAction ] = useState('');
  const [ dialog, setDialog ] = useState({
    open: false,
    title: ''
  });
  const [ snackbar, setSnackbar ] = useState({
    open: false,
    variant: 'success',
    message: ''
  });
  const [ anchorElManageMenu, setAnchorElManageMenu ] = useState(null);
  const [ commentary, setCommentary ] = useState('');
  const [ error, setError ] = useState(null);

  const isPublished = issue.status.id === ISSUE_STATUS.PUBLISHED;

  const onBlur = value => () => {
    setCommentary(value);
  }

  const handleManageMenuOpen = event => {
    setAnchorElManageMenu(event.currentTarget);
  }

  const handleManageMenuClose = () => {
    setAnchorElManageMenu(null);
  }

  const handleCloseSnack = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({...snackbar, ['open']: false});
  }

  const handleDialogOpen = accept => () => {
    setIssueAction(accept ? 'accept' : 'reject');
    setDialog({
      open: true,
      title: (accept ? 'Принять' : 'Отклонить') + ' выпуск'
    });
  }

  const handleSubmit = () => {
    if (issueAction === 'reject') {
      if (isEmptyOrNull(commentary)) {
        setError('Поле не должно быть пустым');
        return;
      }
      else {
        setError(null);
      }
    }

    vote(issue.issue_id, {
      action: issueAction,
      commentary: commentary
    })
      .then(async (res) => {
        if (res.status === 200) {
          setIssue(await getIssue(issue.issue_id));
          setSnackbar({
            open: true,
            variant: 'success',
            message: 'Выпуск ' + (issueAction === 'accept' ? '' : 'не ') + 'рекомендован'  + ' к печати'
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
    setDialog({ ...dialog, open: false });
  }

  const handleDialogClose = () => {
    setError(null);
    setIssueAction('');
    setDialog({ ...dialog, open: false });
  }

  const handleSubmissionModalOpen = submission => () => {
    setSubmission({
      open: true,
      submission: submission
    });
  }

  const handleSubmissionModalClose = () => {
    setSubmission({
      ...submission,
      open: false
    });
  }

  const Title = label => (
    <Typography
      paragraph
      variant="body2"
      className={classes.title}
    >
      {label}
    </Typography>
  );

  const issueName = `Выпуск\xa0№\xa0${issue.number}\xa0(${issue.number_general})`

  return (
    <>
      <Head>
        <title>{ issueName } | Панель управления</title>
      </Head>
      <DashboardLayout navBarTitle="Выпуск">
        <Paper square className={classes.paper}>
          <Box
            display="flex"
            alignItems="center"
            pb={2}
          >
            <Typography variant="h6">
              {issueName}
            </Typography>
            <div className={classes.grow} />
            <Hidden xsDown implementation="css">    
              { issue.status.id === ISSUE_STATUS.CONSIDERATION_EDITORIAL_BOARD &&
                <>
                  <Button onClick={handleDialogOpen(false)}>
                    Отклонить
                  </Button>
                  <Button color="primary" onClick={handleDialogOpen(true)}>
                    Принять
                  </Button>
                </>
              }
            </Hidden>
            <Hidden smUp implementation="css">
              { issue.status.id === ISSUE_STATUS.CONSIDERATION_EDITORIAL_BOARD &&
                <>
                  <IconButton aria-controls="manage-menu" aria-haspopup="true" onClick={handleManageMenuOpen}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    id="manage-menu"
                    anchorEl={anchorElManageMenu}
                    keepMounted
                    open={Boolean(anchorElManageMenu)}
                    onClose={handleManageMenuClose}
                  >
                    <MenuItem onClick={handleDialogOpen(true)}>Принять</MenuItem>
                    <MenuItem onClick={handleDialogOpen(false)}>Отклонить</MenuItem>
                  </Menu>
                </>
              }
            </Hidden>
          </Box>

          <Grid container>
            <Grid item xs={12} sm={6} md={3}>
              { Title("Статус") }
              <Typography paragraph style={{
                color: issue.status.id === ISSUE_STATUS.ACCEPTED_EDITORIAL_BOARD ? theme.palette.status.accepted :
                       issue.status.id === ISSUE_STATUS.REJECTED_EDITORIAL_BOARD ? theme.palette.status.rejected :
                       theme.palette.status.other
              }}>
                { issue.status.name }
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              { Title("Дата\xa0создания") }
              <Typography paragraph>
                { getDate(issue.creation_date) }
              </Typography>
            </Grid>
            { isPublished && (
              <Grid item xs={12} sm={6} md={3}>
                { Title("Дата\xa0опубликования") }
                <Typography paragraph>
                  { getDate(issue.publication_date) }
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
                onClick={handleSubmissionModalOpen(submission)}
              >
                <ListItemText
                  fontSize="0.875rem"
                  primary={
                    <Typography color="inherit">
                      { submission.title_ru }
                    </Typography>
                  }
                  secondary={
                    <Typography component="p" color="textSecondary">
                      { getNames(submission.authors, 'ru') }
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>

      <WithMobileDialog
        maxWidth="md"
        open={submission.open}
        onClose={handleSubmissionModalClose}
        title="Метаданные"
      >
       <SubmissionModalContent
        submission={submission.submission}
        onClose={handleSubmissionModalClose}
      />
      </WithMobileDialog>

      {issue.status.id === ISSUE_STATUS.CONSIDERATION_EDITORIAL_BOARD &&
        <WithMobileDialog
          maxWidth="xs"
          open={dialog.open}
          onClose={handleDialogClose}
          title={dialog.title}
        >
          <DialogContent dividers>
            <CustomTextField
              setError={setError}
              error={error}
              required={issueAction === 'reject'}
              onBlur={onBlur}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>
              Отмена
            </Button>
            <Button color="primary" onClick={handleSubmit}>
              Сохранить
            </Button>
          </DialogActions>
        </WithMobileDialog>
      }

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

EbmIssue.getInitialProps = async ({ req, query }) => {
  const issue = req ? await getIssue(query.slug, req.headers.cookie) : await getIssue(query.slug);
  return { issue };
}

EbmIssue.propTypes = {
  issue: PropTypes.object.isRequired
};

export default EbmIssue;
