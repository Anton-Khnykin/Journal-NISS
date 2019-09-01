import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles(theme => ({
  cont: {
    padding: theme.spacing(3)
  },
  header: {
    borderBottom: `1px solid ${theme.palette.secondary.dark}`,
  },
  footer: {
    borderTop: `1px solid ${theme.palette.secondary.dark}`
  },
  common: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3)
  }
}));

function Portlet(props) {
  const { children, headerContent, footerContent, ...other } = props;
  const classes = useStyles();

  return (
    <Paper square {...other}>
      <div className={clsx(classes.header, classes.common)}>
        { headerContent }
      </div>
      <div className={classes.cont}>
        { children }
      </div>
      <div className={clsx(classes.footer, classes.common)}>
        { footerContent }
      </div>
    </Paper>
  );
}

Portlet.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array
  ]).isRequired,
  headerContent: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array
  ]),
  footerContent: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array
  ])
};

export default Portlet;
