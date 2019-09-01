import React from 'react';
import Router from 'next/router';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Hidden from '@material-ui/core/Hidden';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import MenuIcon from '@material-ui/icons/Menu';
import ExitToApp from '@material-ui/icons/ExitToApp';
import Home from '@material-ui/icons/Home';
// import Notifications from '@material-ui/icons/Notifications';
import { drawerWidth } from './DashboardLayout';
import { logout } from 'middleware/api/public';

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1,
  },
  appBarHeader: {
    marginLeft: 20
  },
  appBar: {
    [theme.breakpoints.up('lg')]: {
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      backgroundColor: theme.palette.primary.main,
    }
  },
  appBarShift: {
    [theme.breakpoints.up('lg')]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }
  },
  hide: {
    display: 'none',
  }
}));

function DashboardNavBar(props) {
  const classes = useStyles();
  const { open, handleDrawerOpen, toggleMobileDrawer, navBarTitle } = props;

  const handleLogout = () => {
    logout().then(() => window.location.href='/');
  }

  return (
    <AppBar
      position="fixed"
      className={clsx(classes.appBar, {
        [classes.appBarShift]: open,
      })}
    >
      <Toolbar>
        <Hidden lgUp implementation="css">
          <IconButton
            color="inherit"
            aria-label="Open mobile drawer"
            onClick={toggleMobileDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
        </Hidden>
        <Hidden mdDown implementation="css">
          <IconButton
            color="inherit"
            aria-label="Open drawer"
            onClick={handleDrawerOpen}
            className={open ? classes.hide : null}
          >
            <MenuIcon />
          </IconButton>
        </Hidden>
        <Typography 
          variant="h6"
          color="inherit"
          noWrap
          className={classes.appBarHeader}
        >
          {navBarTitle}
        </Typography>
        <div className={classes.grow} />
        {/* <Tooltip title="Уведомления">
          <IconButton color="inherit" aria-label="Уведомления">
            <Notifications />
          </IconButton>
        </Tooltip> */}
        <Tooltip title="На главную" onClick={() => Router.push('/')}>
          <IconButton color="inherit" aria-label="На главную">
            <Home />
          </IconButton>
        </Tooltip>
        <Tooltip title="Выйти" onClick={handleLogout}>
          <IconButton color="inherit" aria-label="Выйти">
            <ExitToApp />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}

DashboardNavBar.propTypes = {
  open: PropTypes.bool.isRequired,
  handleDrawerOpen: PropTypes.func.isRequired,
  toggleMobileDrawer: PropTypes.func.isRequired,
  navBarTitle: PropTypes.string.isRequired
};

export default DashboardNavBar;
