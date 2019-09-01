import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Download from 'components/Download';
import { REVIEW_STATUS } from 'middleware/enums';
import { getDate, getKeywords } from 'utils/data_parser';
import { LANGUAGE } from 'middleware/enums';

const usePanelStyles = makeStyles(theme => ({
  panel: {
    width: '100%',
    overflow: 'hidden'
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
  subTitle: {
    fontWeight: 500
  }
}));

const ReviewPanel = props => {
  const classes = usePanelStyles();
  const {
    review,
    onPendingClick,
    onModalReviewOpen,
    onModalTemplateOpen } = props;
  const [ checked, setChecked ] = useState(false);

  const handleChange = event => {
    setChecked(event.target.checked);
  }

  const getSubmission = lang => {
    return (
      <Box width={1}>
        {SubTitle("Название\xa0статьи")}
        <Typography paragraph>
          {review.submission[`title_${lang}`]}
        </Typography>
        {SubTitle("Аннотация")}
        <Typography paragraph>
          {review.submission[`abstract_${lang}`]}
        </Typography>
        {SubTitle("Ключевые\xa0слова")}
        <Typography paragraph>
          {getKeywords(review.submission[`keywords_${lang}`])}
        </Typography>
        {SubTitle("Язык\xa0статьи")}
        <Typography paragraph>
          { review.submission.language_id === LANGUAGE.RUSSIAN && 'Русский' }
          { review.submission.language_id === LANGUAGE.ENGLISH && 'Английский' }
        </Typography>
      </Box>
    );
  }

  const SubTitle = label => (
    <Typography paragraph variant="body2" className={classes.subTitle}>
      {label}
    </Typography>
  );

  const CustomButton = (label, onClick) => (
    <Button
      size="small"
      color="primary"
      className={classes.button}
      onClick={onClick}
    >
      {label}
    </Button>
  );

  return (
    <ExpansionPanel square className={classes.panel}>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Grid container>
          <Grid container item xs={12} sm={6}>
            <Box component={Typography} width={1}>
              Выполнить до {getDate(review.deadline)}
            </Box>
            <Typography color="textSecondary">
              { review.status === REVIEW_STATUS.PENDING && 'Новый запрос на рецензирование' }
              { review.status === REVIEW_STATUS.ACCEPTED && 'В работе' }
              { review.status === REVIEW_STATUS.REJECTED && 'Отклонено' }
              { review.status === REVIEW_STATUS.REVIEW_SENT && 'Отправлено' }
            </Typography>
          </Grid>
          <Grid container item xs={12} sm={6} alignItems="center">
            {review.status === REVIEW_STATUS.REVIEW_SENT &&
              <Typography>
                Ваша&nbsp;рекоммендация: {review.recommendation}
              </Typography>
            }
          </Grid>
        </Grid>
      </ExpansionPanelSummary>
      <Divider />
      <ExpansionPanelDetails>
        <div>
          <Box
            display="flex"
            justifyContent="flex-end"
            width={1}
          >
            <FormControlLabel
              control={<Switch checked={checked} value="checked" color="primary" />}
              label="Метаданные на английском"
              labelPlacement="start"
              onChange={handleChange}
            />
          </Box>
          {checked ? getSubmission('en') : getSubmission('ru')}
          <Box
            display="flex"
            justifyContent="flex-end"
            width={1}
          >
            <Download fileId={review.submission.file}>
              <Button color="primary" variant="outlined">
                Скачать текст статьи
              </Button>
            </Download>
          </Box>
        </div>
      </ExpansionPanelDetails>
      <Divider />
      <ExpansionPanelActions className={classes.actions}>
        { review.status === REVIEW_STATUS.PENDING &&
          <>
            {CustomButton('Принять', onPendingClick(review.review_id, 'accept'))}
            {CustomButton('Отклонить', onPendingClick(review.review_id, 'reject'))}
          </>
        }
        { review.status === REVIEW_STATUS.ACCEPTED && 
          <>
            {review.file !== null &&
              <Download fileId={review.file}>
                {CustomButton('Скачать рецензию')}
              </Download>
            }
            {CustomButton('Сформировать рецензию', onModalTemplateOpen(review.review_id))}
            {CustomButton('Отправить рецензию', onModalReviewOpen(review.review_id))}
          </>
        }
        { review.status === REVIEW_STATUS.REVIEW_SENT &&
          <>
            <Download fileId={review.file}>
              {CustomButton('Скачать рецензию')}
            </Download>
            <Download fileId={review.file_signed}>
              {CustomButton('Скачать подписанный вариант')}
            </Download>
          </>
        } 
      </ExpansionPanelActions>
    </ExpansionPanel>
  );
}

ReviewPanel.propTypes = {
  review: PropTypes.object.isRequired,
  onPendingClick: PropTypes.func,
  onModalReviewOpen: PropTypes.func,
  onModalTemplateOpen: PropTypes.func
};

export default ReviewPanel;
