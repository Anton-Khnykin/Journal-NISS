import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({  
  paper: {
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
    width: '100%'
  },
  title: {
    marginBottom: theme.spacing(4)
  }
}));

function PaperBlock(props) {
  const classes = useStyles();
  const { title, children, className } = props;

  return(
    <Paper square className={clsx(classes.paper, className)}>
      <Grid item sm={12}>
        <Typography
          variant="h5"
          component="h1"
          className={classes.title}
        >
          { title }
        </Typography>
      </Grid>
      { children }
    </Paper>
  );
}

PaperBlock.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array
  ]).isRequired,
  className: PropTypes.string
};

export default PaperBlock;
