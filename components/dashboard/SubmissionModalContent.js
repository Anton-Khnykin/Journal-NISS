import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Download from 'components/Download';
import { LANGUAGE } from 'middleware/enums';
import { getKeywords } from 'utils/data_parser';

const useStyles = makeStyles(() => ({
  container: {
    width: '100%' 
  },
  subTitle: {
    fontWeight: 500
  }
}));

const SubmissionModalContent = props => {
  const classes = useStyles();
  const { submission, onClose } = props;
  const [ checked, setChecked ] = useState(false);

  const handleChange = event => {
    setChecked(event.target.checked);
  }

  const getSubmission = lang => {
    return (
      <Grid item xs={12} className={classes.container}>
        <Typography paragraph variant="body2" className={classes.subTitle}>
          Название&nbsp;статьи
        </Typography>
        <Typography paragraph>
          {submission[`title_${lang}`]}
        </Typography>
        <Typography paragraph variant="body2" className={classes.subTitle}>
          Аннотация
        </Typography>
        <Typography paragraph>
          {submission[`abstract_${lang}`]}
        </Typography>
        <Typography paragraph variant="body2" className={classes.subTitle}>
          Ключевые&nbsp;слова
        </Typography>
        <Typography paragraph>
          {getKeywords(submission[`keywords_${lang}`])}
        </Typography>
        <Typography paragraph variant="body2" className={classes.subTitle}>
          Язык&nbsp;статьи
        </Typography>
        <Typography paragraph>
          {submission.language_id === LANGUAGE.RUSSIAN && 'Русский'}
          {submission.language_id === LANGUAGE.ENGLISH && 'Английский'}
        </Typography>
      </Grid>
    );
  }

  return (
    <>
      <DialogContent dividers>
        <Grid container>
          <Grid container item xs={12} className={classes.container} justify="flex-end">
            <FormControlLabel
              control={<Switch checked={checked} value="checked" color="primary" />}
              label="Метаданные на английском"
              labelPlacement="start"
              onChange={handleChange}
            />
          </Grid>
          { checked ? getSubmission('en') : getSubmission('ru') }
        </Grid>
      </DialogContent>
      <DialogActions>
        <Download fileId={submission.file}>
          <Button color="primary">
            Загрузить текст статьи
          </Button>
        </Download>
        <Button color="primary" onClick={onClose}>
          Закрыть
        </Button>
      </DialogActions>
    </>
  );
}

SubmissionModalContent.propTypes = {
  submission: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
};

export default SubmissionModalContent;
