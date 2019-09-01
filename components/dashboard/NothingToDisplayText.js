import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(() => ({
  text: {
    fontSize: '1.875rem',
    opacity: '0.42',
    display: 'flex',
    flexDirection: 'column-reverse',
    textAlign: 'center'
  }
}));

function NothingToDisplayText({ text }) {
  const classes = useStyles();

  return (
    <Typography className={classes.text}>
      { text }
    </Typography>
  );
}

NothingToDisplayText.propTypes = {
  text: PropTypes.string.isRequired
};

export default NothingToDisplayText;
