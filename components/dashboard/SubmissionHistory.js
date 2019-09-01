import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Download from 'components/Download';
import { getSubmissionHistory } from 'middleware/api/common';
import { getDate } from 'utils/data_parser';

const useStyles = makeStyles(theme => ({
  subTitle: {
    marginRight: theme.spacing(1),
    fontWeight: 500,
    fontStyle: 'initial',
  },
  fontStyle: {
    fontStyle: 'italic'
  },
  file: {
    color: theme.palette.primary.main,
    '&:hover': {
      color: theme.palette.primary.dark,
      cursor: 'pointer'
    }
  }
}));

function SubmissionHistory (props) {
  const classes = useStyles();
  const { submissionId, onClose } = props;
  const [ history, setHistory ] = useState([]);
  const endOfHistoryRef = useRef(null);

  useEffect(() => {
    getSubmissionHistory(submissionId)
      .then(res => setHistory(res));
  }, []);

  const scrollToBottom = () => {
    endOfHistoryRef.current.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(scrollToBottom, [history]);

  const Content = (label, data, style) => (
    <Typography style={style}>
      <span className={classes.subTitle}>{label}</span>
      {data}
    </Typography>
  );

  return (
    <>
      <DialogContent dividers>
        <Stepper orientation="vertical">
          {history.map(item => (
            <Step key={item.date} active>
              <StepLabel>
                <Typography color="textSecondary">
                  {getDate(item.date)}
                </Typography>
              </StepLabel>
              <StepContent>
                {Content('Статус:', item.status.name)}
                {item.deadline && Content('Дедлайн:', item.deadline)}
                {item.commentary && Content('Комментарий:', item.commentary, {whiteSpace: 'pre-wrap'})}
                
                {item.reviews.length !== 0 && item.reviews.map((review, index) => (
                  <React.Fragment key={'review' + index}>
                    {Content(`Рецензия\xa0${index + 1}`)}
                    {Content('Решение:', review.recommendation.recommendation)}
                    <Download fileId={review.file}>
                      <Typography className={classes.file}>
                        Скачать файл с рецензией
                      </Typography>
                    </Download>
                  </React.Fragment>
                ))}
              </StepContent>
            </Step>
          ))}
        </Stepper>
        <div ref={endOfHistoryRef} />
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onClose}>
          Закрыть
        </Button>
      </DialogActions>
    </>
  );
}

SubmissionHistory.propTypes = {
  submissionId: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]).isRequired,
  onClose: PropTypes.func.isRequired
};

export default SubmissionHistory;
