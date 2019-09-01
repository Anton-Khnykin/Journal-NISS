/* eslint-disable react/display-name */
import React, { useState, useContext, useRef } from 'react';
import Auth from 'utils/auth';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withRouter } from 'next/router';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ExpandMore from '@material-ui/icons/ExpandMore';
import MenuIcon from '@material-ui/icons/Menu';
import LoadingCircle from 'components/LoadingCircle';
import WithMobileDialog from 'components/WithMobileDialog';
import NextLink from 'components/NextLink';
import { logout } from 'middleware/api/public';
import dynamic from 'next/dynamic';
import { journalName } from 'static/page_content/general.json';

const Login = dynamic(
  () => import('./Login'),
  {
    loading: () => <LoadingCircle size={24} />
  });
const Registration = dynamic(
  () => import('./Registration'),
  {
    loading: () => <LoadingCircle size={24} />
  });

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    flex: '0 0 auto'
  },
  grow: {
    flexGrow: 1
  },
  appBar: {
    backgroundColor: theme.palette.secondary.light,
    boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.06)'
  },
  sectionDesktop: {
    height: '100%',
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex'
    }
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none'
    }
  },
  btnLink: {
    borderTop: '3px solid transparent',
    borderBottom: '3px solid transparent',
    borderRadius: 0,
    height: '100%',
    margin: theme.spacing(1),
    marginTop: 0,
    marginBottom: 0,
    color: theme.palette.text.primary,
    '&:hover': {
      color: theme.palette.primary.main
    }
  },
  withUnderline: {
    borderBottom: '3px solid ' + theme.palette.primary.main
  },
  btnLinkText:{
    border: '0px solid transparent',
    textTransform: 'none',
    color: 'inherit',
    '&:hover': {
      textDecoration: 'none'
    }
  },
  headerDivider: {
    borderLeft: '1px solid #e6e6e6',
    height: '50%',
    margin: 'auto 15px'
  },
  popper: {
    zIndex: 999999
  },
  dropDownMenu: {
    padding: 0
  },
  menuItem: {
    '&:hover': {
      color: theme.palette.primary.main
    }
  },
  menuItemText: {
    color: 'inherit'
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerPaper: {
    width: drawerWidth
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start'
  },
  nestedItem: {
    paddingLeft: theme.spacing(4)
  },
  accountMenuContainer: {
    height: '100%',
    display: 'flex'
  },
  accountIconBtn: {
    margin: 'auto'
  }
}));

const menu = [
  {
    'title': 'О\xa0журнале',
    'href': '/',
    'value': 1
  },
  {
    'title': 'Текущий\xa0выпуск',
    'href': '/issue/current',
    'value': 2
  },
  {
    'title': 'Архив\xa0выпусков',
    'href': '/archive',
    'value': 3
  },
  {
    'title': 'Поиск',
    'href': '/search',
    'value': 4
  }
];
const infForAuthorMenu = [
  {
    'title': 'Правила\xa0публикации',
    'href': '/rules'
  },
  {
    'title': 'Требования\xa0к\xa0оформлению',
    'href': '/requirements'
  },
  {
    'title': 'Порядок\xa0рецензирования',
    'href': '/reviewing'
  },
  {
    'title': 'Редакционная\xa0коллегия',
    'href': '/editorial-board'
  },
  {
    'title': 'Публикационная\xa0этика',
    'href': '/ethics'
  }
];

function NavBar(props) {
  const classes = useStyles();
  const { router, loginOpen } = props;
  const { isAuthenticated } = useContext(Auth);
  const [ dropDownMenuOpen, setDropDownMenuOpen ] = useState(false);
  const [ accountMenuOpen, setAccountMenuOpen ] = useState(false);
  const [ mobileMenuOpen, setMobileMenuOpen ] = useState(false);
  const [ loginModalOpen, setLoginModalOpen ] = useState(loginOpen || false);
  const [ registerModalOpen, setRegisterModalOpen ] = useState(false);
  const anchorDDM = useRef(null);
  const anchorAM = useRef(null);

  const handleDropDownMenuOpen = () => {
    setAccountMenuOpen(false);
    setDropDownMenuOpen(!dropDownMenuOpen);
  }

  const handleDropDownMenuClose = event => {
    if (anchorDDM.current && anchorDDM.current.contains(event.target)) {
      return;
    }
    setDropDownMenuOpen(false);
  }

  const handleAccountMenuOpen = () => {
    setDropDownMenuOpen(false);
    setAccountMenuOpen(!accountMenuOpen);
  }

  const handleAccountMenuClose = event => {
    if (anchorAM.current && anchorAM.current.contains(event.target)) {
      return;
    }
    setAccountMenuOpen(false);
  };

  const handleLoginModalOpen = () => {
    setLoginModalOpen(true);
  }

  const handleLoginModalClose = () => {
    setLoginModalOpen(false);
  }

  const handleRegisterModalOpen = () => {
    setRegisterModalOpen(true);
  }

  const handleRegisterModalClose = () => {
    setRegisterModalOpen(false);
  }

  const handleMobileMenuOpen = () => {
    setMobileMenuOpen(true);
  }

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  }

  const handleLogoutSubmit = () => {
    logout()
      .then(() => {
        window.location.reload();
      });
  }

  const toggleMobileDrawer = open => event => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setMobileMenuOpen(open);
  }

  const renderMenuList = (list, handle) => {
    const listItems = [];
    for (let i = 0; i < list.length; i++) {
      listItems.push(
        <MenuItem
          key={list[i].href}
          component={NextLink}
          href={list[i].href}
          onClick={handle}
          selected={list[i].href === router.pathname}
          className={classes.menuItem}
        >
          <Typography className={classes.menuItemText}>
            { list[i].title }
          </Typography>
        </MenuItem>
      );
    }

    return (
      <Paper square>
        <ClickAwayListener onClickAway={handle}>
          <MenuList className={classes.dropDownMenu}>
            { listItems }
          </MenuList>
        </ClickAwayListener>
      </Paper>
    );
  }

  const renderDesctopDropDownMenu = (
    <Popper
      open={dropDownMenuOpen}
      anchorEl={anchorDDM.current}
      className={classes.popper}
      placement='bottom-end'
      transition
      disablePortal
    >
      { ({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            id="drop-down-menu-grow"
            style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
          >
            { renderMenuList(infForAuthorMenu, handleDropDownMenuClose) }
          </Grow>
      )}
    </Popper>
  );

  const renderDesktopAccountMenu = (
    <Popper
      open={accountMenuOpen}
      anchorEl={anchorAM.current}
      className={classes.popper}
      placement='bottom-end'
      transition
      disablePortal
    >
      { ({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            id="account-menu-grow"
            style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
          >
          <Paper square>
            <ClickAwayListener onClickAway={handleAccountMenuClose}>
              <MenuList className={classes.dropDownMenu}>
                <MenuItem
                  component={NextLink}
                  href="/dashboard"
                  className={classes.menuItem}
                >
                  <Typography className={classes.menuItemText}>
                    Панель&nbsp;управления
                  </Typography>
                </MenuItem>
                <MenuItem
                  component={NextLink}
                  href="/dashboard/account"
                  className={classes.menuItem}
                >
                  <Typography className={classes.menuItemText}>
                    Учетная&nbsp;запись
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleLogoutSubmit}>
                  <Typography className={classes.menuItemText}>
                    Выход
                  </Typography>
                </MenuItem>
              </MenuList>
            </ClickAwayListener>
          </Paper>
          </Grow>
      )}
    </Popper>
  );

  const renderMobileMenu = (
    <SwipeableDrawer
      className={classes.drawer}
      anchor="right"
      open={mobileMenuOpen}
      onOpen={toggleMobileDrawer(true)}
      onClose={toggleMobileDrawer(false)}
      classes={{ paper: classes.drawerPaper }}
    >
      <div className={classes.drawerHeader}>
        <IconButton onClick={handleMobileMenuClose}>
          <ChevronRightIcon />
        </IconButton>
      </div>
      <Divider />
      <MenuList>
        { menu.map(item => (
            <MenuItem
              key={item.href}
              component={NextLink}
              href={item.href}
              selected={item.href === router.pathname}
            >
              <Typography>
                { item.title }
              </Typography>
            </MenuItem>
          ))
        }
        <MenuItem>
          <Typography>
            Автору
          </Typography>
        </MenuItem>
        { infForAuthorMenu.map(item => (
            <MenuItem
              key={item.href}
              component={NextLink}
              href={item.href}
              selected={item.href === router.pathname}
              className={classes.nestedItem}
            >
              <Typography>
                { item.title }
              </Typography>
            </MenuItem>
          ))
        }
      </MenuList>
      <Divider />
      { !isAuthenticated && (
          <MenuList>
            <MenuItem onClick={handleLoginModalOpen}>
              <Typography>
                Вход
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleRegisterModalOpen}>
              <Typography>
                Регистрация
              </Typography>
            </MenuItem>
          </MenuList>
      )}
      { isAuthenticated && (
          <MenuList>
            <MenuItem component={NextLink} href="/dashboard">
              <Typography>
                Панель&nbsp;управления
              </Typography>
            </MenuItem>
            <MenuItem component={NextLink} href="/dashboard/account">
              <Typography>
                Личный&nbsp;кабинет
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogoutSubmit}>
              <Typography>
                Выход
              </Typography>
            </MenuItem>
          </MenuList>
      )}
    </SwipeableDrawer>
  );

  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.appBar}>
        <Grid container justify="center">
          <Grid container item xs={10}>
            <Toolbar className={classes.grow} disableGutters>
              <Typography variant="h6">
                { journalName.value }
              </Typography>
              <div className={classes.grow} />
              <div className={classes.sectionDesktop}>
                { menu.map(item => (
                    <ButtonBase
                      key={item.href} 
                      component={NextLink} 
                      href={item.href} 
                      className={clsx(
                        classes.btnLink,
                        { [ classes.withUnderline ]: item.href === router.pathname }
                      )}
                    >
                      <Typography className={classes.btnLinkText}>
                        { item.title }
                      </Typography>
                    </ButtonBase>
                  ))
                }
                <ButtonBase
                  buttonRef={anchorDDM}
                  aria-owns={dropDownMenuOpen ? 'drop-down-menu-grow' : undefined}
                  aria-haspopup="true"
                  onClick={handleDropDownMenuOpen}
                  disableRipple
                  className={classes.btnLink}
                >
                  <Typography>
                    Автору
                  </Typography>
                  <ExpandMore />
                </ButtonBase>
                { !isAuthenticated && (
                    <>
                      <div className={classes.headerDivider} />
                      <ButtonBase
                        onClick={handleLoginModalOpen}
                        className={clsx(classes.btnLink)}
                        disableRipple
                      >
                        <Typography className={classes.btnLinkText}>
                          Вход
                        </Typography>
                      </ButtonBase>
                      <ButtonBase
                        onClick={handleRegisterModalOpen}
                        className={clsx(classes.btnLink)}
                        disableRipple
                      >
                        <Typography className={classes.btnLinkText}>
                          Регистрация
                        </Typography>
                      </ButtonBase>
                    </>
                )}
                { isAuthenticated && (
                    <div
                      className={classes.accountMenuContainer}
                      ref={anchorAM}
                      aria-owns={accountMenuOpen ? 'account-menu-grow' : undefined}
                      aria-haspopup="true"
                      onClick={handleAccountMenuOpen}
                    >
                      <IconButton className={classes.accountIconBtn}>
                        <AccountCircle />
                      </IconButton>
                    </div>
                )}     
              </div>
              <div className={classes.sectionMobile}>
                <IconButton
                  aria-haspopup="true"
                  onClick={handleMobileMenuOpen}
                >
                  <MenuIcon />
                </IconButton>
              </div>
              { renderMobileMenu }
              { renderDesctopDropDownMenu }
              { renderDesktopAccountMenu }
            </Toolbar>
          </Grid>
        </Grid>
      </AppBar>

      <WithMobileDialog
        maxWidth="xs"
        open={loginModalOpen}
        onClose={handleLoginModalClose}
      >
        <Login />
      </WithMobileDialog>

      <WithMobileDialog
        maxWidth="xs"
        open={registerModalOpen}
        onClose={handleRegisterModalClose}
      >
        <Registration />
      </WithMobileDialog>

    </div>
  );
}

NavBar.propTypes = {
  loginOpen: PropTypes.bool,
  router: PropTypes.object.isRequired
};

export default withRouter(NavBar);
