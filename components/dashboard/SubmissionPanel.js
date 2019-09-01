import React from 'react';
import Router from 'next/router';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import StatusChip from 'components/dashboard/StatusChip';
import { SUBMISSION_STATUS } from 'middleware/enums';
import { getNames, getDate } from 'utils/data_parser';
import Divider from '@material-ui/core/Divider';

const useStyles = makeStyles(theme => ({
  panel: {
    width: '100%',
    overflow: 'hidden'
  },
  grow: {
    flexGrow: 1
  },
  fontWeight: {
    fontWeight: 500
  },
  actions: {
    [theme.breakpoints.down('xs')]: {
      display: 'block'
    }
  },
  button: {
    [theme.breakpoints.down('xs')]: {
      width: '100%'
    }
  },
}));

function SubmissionPanel(props) {
  const classes = useStyles();

  const { submission, handleOpenModalHistory } = props;

  const handleViewSubmission = (view = '') => () => {
    Router.push(
      `/dashboard/my-submission?slug=${submission.submission_id}${view}`,
      `/dashboard/my-submission/${submission.submission_id}${view}`
    );
  }

  return (
    <ExpansionPanel square className={classes.panel}>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Grid container className={classes.grow}>
          <Grid container item className={classes.grow}>
            <Typography className={classes.fontWeight}>
              { getDate(submission.date) }
            </Typography>
            <div className={classes.grow} />
            <StatusChip statusOf="submission" status={submission.status} />
          </Grid>
          <Grid container item className={classes.grow}>
            <Grid item sm={12}>
              <Typography className={classes.fontWeight}>
                { getNames(submission.authors, 'ru') }
              </Typography>
            </Grid>
            <Grid item sm={12}>
              <Typography className={classes.articleTitle}>
                { submission.title_ru }
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </ExpansionPanelSummary>
      <Divider />
      <ExpansionPanelActions className={classes.actions}>
        <Button
          color="primary"
          size="small"
          className={classes.button}
          onClick={handleOpenModalHistory(submission.submission_id)}
        >
          История
        </Button>
        <Button
          color="primary"
          size="small"
          className={classes.button}
          onClick={handleViewSubmission()}
        >
          { submission.status === SUBMISSION_STATUS.UNDER_REVISION ? 
            'Редактировать\xa0заявку'
            :
            'Посмотреть\xa0заявку'
          }
        </Button>
        <Button
          color="primary"
          size="small"
          className={classes.button}
          onClick={handleViewSubmission('#dialog')}
        >
          Перейти&nbsp;к&nbsp;диалогу
        </Button>
      </ExpansionPanelActions>
    </ExpansionPanel>
  );
}

SubmissionPanel.propTypes = {
  submission: PropTypes.object.isRequired,
  handleOpenModalHistory: PropTypes.func.isRequired
};

export default SubmissionPanel;
