import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';

function LoadingCircle({ size }) {
  return (
    <Grid container justify="center">
      <Grid item>
        <CircularProgress size={size} />
      </Grid>
    </Grid>
  )
}

LoadingCircle.propTypes = {
  size: PropTypes.number.isRequired
}

export default LoadingCircle;
