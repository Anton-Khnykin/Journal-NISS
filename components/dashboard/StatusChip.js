import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { useTheme } from '@material-ui/styles';
import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { SUBMISSION_STATUS, ISSUE_STATUS, REVIEW_STATUS } from 'middleware/enums';

const statusText = {
  submission: {
    [SUBMISSION_STATUS.UNDER_CONSIDERATION]: 'На\xa0рассмотрении',
    [SUBMISSION_STATUS.UNDER_REVIEWING]: 'На\xa0рецензировании',
    [SUBMISSION_STATUS.UNDER_REVISION]: 'На\xa0доработке',
    [SUBMISSION_STATUS.RECOMMENDED_FOR_PUBLISHING]: 'Рекомендовано\xa0к публикации',
    [SUBMISSION_STATUS.ACCEPTED_IN_CURRENT_ISSUE]: 'Принято\xa0в текущий выпуск',
    [SUBMISSION_STATUS.PUBLISHED]: 'Опубликовано',
    [SUBMISSION_STATUS.REJECTED]: 'Отклонено'
  },
  review: {
    [REVIEW_STATUS.PENDING]: 'На\xa0рассмотрении',
    [REVIEW_STATUS.ACCEPTED]: 'Принято\xa0к\xa0рецензированию',
    [REVIEW_STATUS.REJECTED]: 'Отказано\xa0в\xa0рецензировании',
    [REVIEW_STATUS.REVIEW_SENT]: 'Готово',
    [REVIEW_STATUS.SENT_TO_AUTHOR]: 'Отправлено\xa0автору',
  },
  issue: {
    [ISSUE_STATUS.CREATED]: 'Выпуск\xa0создан',
    [ISSUE_STATUS.CONSIDERATION_EDITORIAL_BOARD]: 'На\xa0рассмотрении редакционной коллегией',
    [ISSUE_STATUS.REJECTED_EDITORIAL_BOARD]: 'Отклонено\xa0редакционной коллегией',
    [ISSUE_STATUS.ACCEPTED_EDITORIAL_BOARD]: 'Принято\xa0редакционной коллегией',
    [ISSUE_STATUS.CONSIDERATION_EDITOR]: 'На\xa0рассмотрении главным редактором',
    [ISSUE_STATUS.REJECTED_EDITOR]: 'Отклонено\xa0главным редактором',
    [ISSUE_STATUS.ACCEPTED_EDITOR]: 'Принято\xa0главным редактором',
    [ISSUE_STATUS.IN_DEVELOPMENT]: 'В\xa0разработке',
    [ISSUE_STATUS.PUBLISHED]: 'Опубликовано',
    [ISSUE_STATUS.PUBLISHED_ON_SITE]: 'Опубликовано\xa0на сайте'
  }
}

const useStyles = makeStyles(theme => ({
  chip: {
    width: 180,
  },
  label: {
    overflow: 'hidden',
  },
  labelText: {
    margin: theme.spacing(1),
    fontWeight: 410
  }
}));

function StatusChip(props) {
  const classes = useStyles();
  const { statusOf, status, label } = props;
  const theme = useTheme();
  let chipColor = '';

  switch(statusOf) {
    case 'submission':
      switch(status) {
        case SUBMISSION_STATUS.UNDER_CONSIDERATION:
          chipColor = theme.palette.status.new;
          break;
        case SUBMISSION_STATUS.UNDER_REVIEWING:
        case SUBMISSION_STATUS.UNDER_REVISION:
        case SUBMISSION_STATUS.PUBLISHED:
          chipColor = theme.palette.status.other;
          break;
        case SUBMISSION_STATUS.RECOMMENDED_FOR_PUBLISHING:
        case SUBMISSION_STATUS.ACCEPTED_IN_CURRENT_ISSUE:
          chipColor = theme.palette.status.accepted;
          break;
        case SUBMISSION_STATUS.REJECTED:
          chipColor = theme.palette.status.rejected;
          break;
      }
      break;
    case 'review':
      switch(status) {
        case REVIEW_STATUS.PENDING:
          chipColor = theme.palette.status.new;
          break;
        case REVIEW_STATUS.REVIEW_SENT:
        case REVIEW_STATUS.SENT_TO_AUTHOR:
          chipColor = theme.palette.status.other;
          break;
        case REVIEW_STATUS.ACCEPTED:
          chipColor = theme.palette.status.accepted;
          break;
        case REVIEW_STATUS.REJECTED:
          chipColor = theme.palette.status.rejected;
          break;
      }
      break;
    case 'issue':
      switch(status) {
        case ISSUE_STATUS.CREATED:
          chipColor = theme.palette.status.new;
          break;
        case ISSUE_STATUS.CONSIDERATION_EDITORIAL_BOARD:
        case ISSUE_STATUS.CONSIDERATION_EDITOR:
        case ISSUE_STATUS.IN_DEVELOPMENT:
        case ISSUE_STATUS.PUBLISHED:
        case ISSUE_STATUS.PUBLISHED_ON_SITE:
          chipColor = theme.palette.status.other;
          break;
        case ISSUE_STATUS.REJECTED_EDITORIAL_BOARD:
        case ISSUE_STATUS.REJECTED_EDITOR:
          chipColor = theme.palette.status.rejected;
          break;
        case ISSUE_STATUS.ACCEPTED_EDITORIAL_BOARD:
        case ISSUE_STATUS.ACCEPTED_EDITOR:
          chipColor = theme.palette.status.accepted;
          break;
      }
      break;
  }

  return (
    <Tooltip title={label || statusText[statusOf][status]}>
      <Chip 
        label={
          <Typography noWrap className={classes.labelText}>
            {label || statusText[statusOf][status]}
          </Typography>
        }
        variant="outlined"
        classes={{
          root: classes.chip,
          label: classes.label
        }}
        style={{
          'color': chipColor,
          'borderColor': chipColor
        }} 
      />
    </Tooltip>
  );  
}

StatusChip.propTypes = {
  statusOf: PropTypes.string.isRequired,
  status: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]).isRequired,
  label: PropTypes.string
};

export default StatusChip;
