import React, { useState,  useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';
import VisibilityIcon from '@material-ui/icons/Visibility';
import StyledSnackbar from './StyledSnackbar';
import ConfirmDialog from './ConfirmDialog';
import IssueToolbar from './IssueToolbar';
import CreateIssueModal from './CreateIssueModal'
import NextLink from 'components/NextLink';
import { getRecommendedSubmissions, createIssue, manageIssue, getIssues } from 'middleware/api/secretary';
import { getNames } from 'utils/data_parser';

const useStyles = makeStyles(theme => ({
  listContainer: {
    width: '100%',
    overflow: 'auto',
    [theme.breakpoints.up('md')]: {
      minHeight: 'calc(100vh - 202px)',
      maxHeight: 'calc(100vh - 202px)'
    }
  },
  title: {
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    fontSize: '1rem'
  },
  buttonGrid: {
    margin: 'auto'
  },
  buttonContainer: {
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'row',
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(3)
    }
  },
  button: {
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(0, 0.5)
    },
    [theme.breakpoints.up('md')]: {
      margin: theme.spacing(0.5, 0)
    }
  },
}));

const not = (a, b) => {
  return a.filter(value => b.indexOf(value) === -1);
}

const intersection = (a, b) => {
  return a.filter(value => b.indexOf(value) !== -1);
}

function TransferList(props) {
  const classes = useStyles();
  const { handleCancelling, editMode, setIssues, data } = props;
  const [ savingOpen, setSavingOpen ] = useState(false);
  const [ checked, setChecked ] = useState([]);
  const [ left, setLeft ] = useState([]);
  const [ right, setRight ] = useState([]);
  const [ dialogOpen, setDialogOpen ] = useState(false);
  const [ snackbar, setSnackbar ] = useState({
    open: false,
    variant: 'success',
    message: ''
  });

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  useEffect(() => {
    let isMounted = true;
    const fetchSubmissions = async () => {
      const submissions = await getRecommendedSubmissions();
      if (isMounted) {
        if (editMode) {
          const rightList = submissions.length === 0 ?
            data.submissions :
            submissions.filter(recommended => data.submissions.find(updated => updated.submission_id === recommended.submission_id));
          setRight(rightList);
          setLeft(not(submissions, rightList));
        }
        else {
          setLeft(submissions);
        }
      }
    }
    fetchSubmissions();
    return () => isMounted = false;
  }, []);

  const handleToggle = value => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];
    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setChecked(newChecked);
  };

  const handleAllRight = () => {
    setRight(right.concat(left));
    setLeft([]);
  };

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked));
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked));
    setRight(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const handleAllLeft = () => {
    setLeft(left.concat(right));
    setRight([]);
  };

  const handleSavingOpen = () => {
    setSavingOpen(true)
  }
  const handleSavingClose = () => {
    setSavingOpen(false)
  }

  const handleGoBack = () => {
    window.location.href = '/dashboard/issues';
  }

  const handleStayOnPage = () => {
    setDialogOpen(false);
  }

  const handleCloseSnack = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({...snackbar, ['open']: false});
  }

  const handleSubmit = issueData => {
    if (editMode) {
      const updatedSubmissions = [];
      for (const updated of right) {
        if (!data.submissions.find(old => updated.submission_id === old.submission_id)) {
          updatedSubmissions.push({
            action: "create",
            submission_id: updated.submission_id
          });
        }
      }
      for (const old of data.submissions) {
        if (!right.find(updated => updated.submission_id === old.submission_id)) {
          updatedSubmissions.push({
            action: "delete",
            submission_id: old.submission_id
          })
        }
      }
      manageIssue(data.issue_id, {
        action: 'update',
        issue: {
          volume_id: issueData.volume,
          number: issueData.number,
        },
        submissions: updatedSubmissions
      })
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
    else {
      createIssue({
        volume_id: issueData.volume,
        number: issueData.number,
        submissions: right.map(item => item.submission_id)
      })
        .then(async (res) => {
          if (res.status === 200) {
            setSnackbar({
              open: true,
              variant: 'success',
              message: 'Выпуск сохранен'
            });
            setIssues(await getIssues());
            setDialogOpen(true);
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
    setSavingOpen(false);
  }

  const CustomButton = (onClickFunction, label, disabled) => {
    return (
      <Button
        variant="outlined"
        size="small"
        className={classes.button}
        onClick={onClickFunction}
        disabled={disabled}
      >
        {label}
      </Button>
    );
  }

  const CustomList = (items, title) => (
    <Paper square className={classes.listContainer}>
      <Typography
        paragraph
        variant="h6"
        noWrap
        className={classes.title}
      >
        {title}
      </Typography>
      <List dense>
        {items.map(item => (
          <ListItem
            key={item.submission_id}
            button
            onClick={handleToggle(item)}
          >
            <ListItemIcon>
              <Checkbox
                color="primary"
                checked={checked.indexOf(item) !== -1}
                tabIndex={-1}
                disableRipple
              />
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography component="p">
                  {item.title_ru}
                </Typography>
              }
              secondary={
                <Typography component="p" color="textSecondary">
                  {getNames(item.authors, 'ru')}
                </Typography>
              }
            />
            <ListItemSecondaryAction>
              <Tooltip title="Перейти к заявке">
                <IconButton
                  component={NextLink}
                  href={`/dashboard/submission?slug=${item.submission_id}`}
                  hrefAs={`/dashboard/submission/${item.submission_id}`}
                  target="_blank"
                >
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  return (
    <Grid
      container
      justify="center"
      alignItems="flex-start"
      className={classes.grow}
    >
      <IssueToolbar
        onSave={handleSavingOpen}
        onCancel={handleCancelling('Отменить ' + (!editMode ? 'создание' : 'редактирование') + ' выпуска?')}
        title={!editMode ? 'Создание\xa0выпуска' : 'Редактирование\xa0выпуска'}
        disabled={right.length === 0}
      />
      <Divider />
      <Grid item xs={12} md={5}>
        <Fade in>
          {CustomList(left, 'Рекомендованные\xa0заявки')}
        </Fade>
      </Grid>
      <Grid item md={2} className={classes.buttonGrid}>
        <Box
          component={Grid}
          container
          direction="column"
          alignItems="center"
          justify="center"
          className={classes.buttonContainer}
        >
          {CustomButton(handleAllRight, '≫', left.length === 0)}
          {CustomButton(handleCheckedRight, '>', leftChecked.length === 0)}
          {CustomButton(handleCheckedLeft, '<', rightChecked.length === 0)}
          {CustomButton(handleAllLeft, '≪', right.length === 0)}
        </Box>
      </Grid>
      <Grid item xs={12} md={5}>
        <Fade in>
          {CustomList(right, 'Содержание\xa0нового\xa0номера')}
        </Fade>
      </Grid>

      <CreateIssueModal
        open={savingOpen}
        onClose={handleSavingClose}
        onSubmit={handleSubmit}
        value={data}
      />

      <StyledSnackbar
        open={snackbar.open}
        variant={snackbar.variant}
        message={snackbar.message}
        onClose={handleCloseSnack}
      />

      <ConfirmDialog 
        open={dialogOpen}
        text="Вернуться на страницу выпусков?"
        closeYes={handleGoBack}
        closeNo={handleStayOnPage}
      />
    </Grid>
  );
}

TransferList.propTypes = {
  handleCancelling: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
  editMode: PropTypes.bool,
  setIssues: PropTypes.func
};

export default TransferList;
