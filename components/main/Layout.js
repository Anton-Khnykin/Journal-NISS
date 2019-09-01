import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import NavBar from './NavBar';
import Footer from './Footer';

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1
  },
  body: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.secondary.main
  },
  content: {
    flex: '1 0 auto'
  }
}));

function Layout(props) {
  const classes = useStyles();
  const { value, children, loginOpen } = props;

  return (
    <div className={classes.body}>
      <NavBar value={value} loginOpen={loginOpen} />
      <div className={classes.content}>
        <Grid container className={classes.grow} justify="center">
          <Grid container item xs={10}>
            { children }
          </Grid>
        </Grid>
      </div>
      <Footer />
    </div>
  );
}

Layout.propTypes = {
  value: PropTypes.number,
  children: PropTypes.oneOfType([
    PropTypes.object, PropTypes.array
  ]).isRequired,
  loginOpen: PropTypes.bool
};

export default Layout;
