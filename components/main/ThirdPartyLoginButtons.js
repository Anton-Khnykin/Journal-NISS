import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import NextLink from '../NextLink';
import GoogleIcon from 'static/google-favicon-logo.png';
import FacebookIcon from 'static/facebook_logo.png';

const useStyles = makeStyles(theme => ({
  googleLogin: {
    color: 'rgba(0, 0, 0, 0.54)',
    backgroundColor: theme.palette.secondary.light,
    '&:hover': {
      backgroundColor: theme.palette.secondary.main
    }
  },
  facebookLogin: {
    color: theme.palette.secondary.light,
    backgroundColor: '#3d5a98',
    '&:hover': {
      backgroundColor: '#2b4371'
    }
  },
  thirdPartyIcon: {
    width: '18px',
    display: 'flex'
  },
  iconText: {
    marginLeft: '8px',
    marginRight: '8px',
    fontWeight: 500,
    textAlign: 'center'
  },
  iconTextGrid: {
    flexGrow: 1 
  }
}));

export function GoogleLoginButton(props) {
  const classes = useStyles();
  const { href, text, className, ...other } = props;

  return (
    <Button
      component={NextLink}
      href={href}
      fullWidth
      variant="contained"
      className={clsx(classes.googleLogin, className)}
      {...other}
    >
      <Grid container alignItems="center" >
        <Grid item>
          <img src={GoogleIcon} className={classes.thirdPartyIcon} />
        </Grid>
        <Grid item className={classes.iconTextGrid}>
          <Typography className={classes.iconText}>
            { text }
          </Typography>
        </Grid>
      </Grid>
    </Button>
  );
}

GoogleLoginButton.propTypes = {
  href: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  className: PropTypes.string
};

export function FacebookLoginButton(props) {
  const classes = useStyles();
  const { href, text, className, ...other } = props;

  return (
    <Button
      component={NextLink}
      href={href}
      fullWidth
      variant="contained"
      className={clsx(classes.facebookLogin, className)}
      {...other}
    >
      <Grid container alignItems="center" >
        <Grid item>
          <img src={FacebookIcon} className={classes.thirdPartyIcon} />
        </Grid>
        <Grid item className={classes.iconTextGrid}>
          <Typography className={classes.iconText}>
            { text }
          </Typography>
        </Grid>
      </Grid>
    </Button>
  );
}

FacebookLoginButton.propTypes = {
  href: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  className: PropTypes.string
};
