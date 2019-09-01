import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import DashboardNavBar from './DashboardNavBar';
import NavigationDrawer from './NavigationDrawer';

export const drawerWidth = 270;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex'
  },
  container: {
    width: '100%'
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    [theme.breakpoints.down('xs')]: {
      padding: 0
    },
    [theme.breakpoints.up('lg')]: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: -drawerWidth
    }
  },
  contentShift: {
    [theme.breakpoints.up('lg')]: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen
      }),
      marginLeft: 0
    }
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end'
  }
}));

function DashboardLayout(props) {
  const classes = useStyles();
  const { children, navBarTitle } = props;
  const [ open, setOpen ] = useState(true);
  const [ mobileOpen, setMobileOpen ] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const toggleMobileDrawer = open => event => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setMobileOpen(open);
  }
    
  return (
    <div className={classes.root}>
      <CssBaseline />
      <DashboardNavBar
        open={open}
        handleDrawerOpen={handleDrawerOpen}
        toggleMobileDrawer={toggleMobileDrawer}
        navBarTitle={navBarTitle}
      />
      <NavigationDrawer
        open={open}
        mobileOpen={mobileOpen}
        handleDrawerClose={handleDrawerClose}
        toggleMobileDrawer={toggleMobileDrawer}
      />
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <div className={classes.drawerHeader} />
        <div className={classes.container}>
          {children}
        </div>
      </main>
    </div>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.any.isRequired,
  navBarTitle: PropTypes.string.isRequired
};

export default DashboardLayout;
