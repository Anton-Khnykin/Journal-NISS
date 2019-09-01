import React, { useState } from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { useTheme } from '@material-ui/styles';
import DashboardLayout from 'components/dashboard/DashboardLayout';
import StyledSnackbar from 'components/dashboard/StyledSnackbar';
import SubmissionModalContent from 'components/dashboard/SubmissionModalContent';
import ConfirmDialog from 'components/dashboard/ConfirmDialog';
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
import ListItemIcon from '@material-ui/core/ListItemIcon';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Divider from '@material-ui/core/Divider';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import AcceptedIcon from '@material-ui/icons/Done';
import RejectedIcon from '@material-ui/icons/Close';
import { ISSUE_STATUS } from 'middleware/enums';
import { getNames, getFullName, getDate } from 'utils/data_parser';
import { getIssue, decide } from 'middleware/api/editor';

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
  icon: {
    minWidth: 24
  },
  memberName: {
    fontWeight: 500
  },
  acceptedIcon: {
    color: '#7cb342'
  },
  rejectedIcon: {
    color: '#c62828'
  }
}));

function EditorIssue(props) {
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
    text: ''
  });
  const [ opinionModalOpen, setOpinionModalOpen ] = useState(false);
  const [ snackbar, setSnackbar ] = useState({
    open: false,
    variant: 'success',
    message: ''
  });
  const [ anchorElManageMenu, setAnchorElManageMenu ] = useState(null);

  const isPublished = issue.status.id === ISSUE_STATUS.PUBLISHED;

  const handleManageMenuOpen = event => {
    setAnchorElManageMenu(event.currentTarget);
  }

  const handleManageMenuClose = () => {
    setAnchorElManageMenu(null);
  }

  const handleOpinionModalOpen = () => {
    setOpinionModalOpen(true);
  }

  const handleOpinionModalClose = () => {
    setOpinionModalOpen(false);
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
      text: 'Вы уверены, что хотите ' + (accept ? 'принять' : 'отклонить') + ' выпуск?'
    });
  }

  const handleDialogClose = () => {
    setIssueAction('');
    setDialog({ ...dialog, open: false });
  }

  const handleSubmit = () => {
    decide(issue.issue_id, { action: issueAction })
      .then(async (res) => {
        if (res.status === 200) {
          setIssue(await getIssue(issue.issue_id));
          setSnackbar({
            open: true,
            variant: 'success',
            message: 'Выпуск ' + (issueAction === 'accept' ? '' : 'не ') + 'принят'  + ' к печати'
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

  const issueName = `Выпуск\xa0№\xa0${issue.number}\xa0(${issue.number_general})`;

  return (
    <>
      <Head>
        <title>{ issueName } | Панель управления</title>
      </Head>
      <DashboardLayout navBarTitle="Выпуск">
        <Paper square className={classes.paper}>
          <Box
            display="flex"
            width={1}
            alignItems="center"
            pb={2}
          >
            <Typography variant="h6">
              {issueName}
            </Typography>
            <div className={classes.grow}/>
            <Hidden smDown implementation="css">
              { issue.status.id === ISSUE_STATUS.CONSIDERATION_EDITOR &&
                <>
                  <Button onClick={handleDialogOpen(false)}>
                    Отклонить
                  </Button>
                  <Button color="primary" onClick={handleDialogOpen(true)}>
                    Принять
                  </Button>
                </>
              }
                <Button color="primary" onClick={handleOpinionModalOpen}>
                  Решение редакционной коллегии
                </Button>
            </Hidden>
            <Hidden mdUp implementation="css">
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
                {issue.status.id === ISSUE_STATUS.CONSIDERATION_EDITOR &&
                  <>
                    <MenuItem onClick={handleDialogOpen(true)}>
                      Принять
                    </MenuItem>
                    <MenuItem onClick={handleDialogOpen(false)}>
                      Отклонить
                    </MenuItem>
                  </>
                }
                <MenuItem onClick={handleOpinionModalOpen}>
                  Решение редакционной коллегии
                </MenuItem>
            </Menu>
            </Hidden>
          </Box>

          <Grid container>
            <Grid item xs={12} sm={6} md={3}>
              { Title("Статус") }
              <Typography paragraph style={{
                color: issue.status.id === ISSUE_STATUS.ACCEPTED_EDITOR ? theme.palette.status.accepted :
                       issue.status.id === ISSUE_STATUS.REJECTED_EDITOR ? theme.palette.status.rejected :
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
            {isPublished && (
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
                  primary={<Typography color="inherit">{submission.title_ru}</Typography>}
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

      <WithMobileDialog
        maxWidth="sm"
        open={opinionModalOpen}
        onClose={handleOpinionModalClose}
        title="Рекомендации членов редакционной коллегии"
      >
        <DialogContent dividers>
          <List>
            { issue.decisions.map((item, index) => (
              <React.Fragment key={'desicion' + index}>
                <ListItem>
                  <ListItemText 
                    primary={
                      <Typography className={classes.memberName}>
                        {getFullName(item, 'ru')}
                      </Typography>
                    }
                    secondary={item.commentary ? item.commentary : 'Комментарий отсутсвует'}
                  />
                  <ListItemIcon className={classes.icon}>
                    { item.is_accepted ?
                      <AcceptedIcon className={classes.acceptedIcon} /> :
                      <RejectedIcon className={classes.rejectedIcon} />
                    }
                  </ListItemIcon>
                </ListItem>
                { issue.decisions.length !== (index + 1) && <Divider /> }
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={handleOpinionModalClose}>
            Закрыть
          </Button>
        </DialogActions>
      </WithMobileDialog>

      <ConfirmDialog 
        open={dialog.open}
        text={dialog.text}
        closeYes={handleSubmit}
        closeNo={handleDialogClose}
      />

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

EditorIssue.getInitialProps = async ({ req, query }) => {
  const issue = req ? await getIssue(query.slug, req.headers.cookie) : await getIssue(query.slug);
  return { issue };
}

EditorIssue.propTypes = {
  issue: PropTypes.object.isRequired
};

export default EditorIssue;
