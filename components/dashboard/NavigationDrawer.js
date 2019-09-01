/* eslint-disable react/jsx-key */
import React, { useContext } from 'react';
import Auth from 'utils/auth';
import { withRouter } from 'next/router';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Hidden from '@material-ui/core/Hidden';
import Drawer from '@material-ui/core/Drawer';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Settings from '@material-ui/icons/Settings';
import Label from '@material-ui/icons/Label';
import Archive from '@material-ui/icons/Archive';
import Book from '@material-ui/icons/Book';
import Inbox from '@material-ui/icons/Inbox';
import Poll from '@material-ui/icons/Poll';
import School from '@material-ui/icons/School';
import ImportContacts from '@material-ui/icons/ImportContacts';
import InsertDriveFile from '@material-ui/icons/InsertDriveFile';
import AccountCircle from '@material-ui/icons/AccountCircle';
import SupervisedUserCircle from '@material-ui/icons/SupervisedUserCircle';
import LibraryBooks from '@material-ui/icons/LibraryBooks';
import ListMenu from './ListMenu';
import NextLink from 'components/NextLink';
import { drawerWidth } from './DashboardLayout';
import { ROLES } from 'middleware/enums';

const useStyles = makeStyles(theme => ({
  drawer: {
    [theme.breakpoints.up('lg')]: {
      width: drawerWidth,
      flexShrink: 0
    }
  },
  drawerPaper: {
    width: drawerWidth
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: `0 ${theme.spacing(1)}px`,
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end'
  },
  listItemText: {
    fontSize: '0.875rem'
  },
  divider: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  firstDivider: {
    marginBottom: theme.spacing(1)
  }
}));

function NavigationDrawer(props) {
  const classes = useStyles();
  const { roles } = useContext(Auth);
  const {
    router,
    open,
    handleDrawerClose,
    mobileOpen,
    toggleMobileDrawer } = props;

  const adminMenu = () => (
    <>
      <List disablePadding>
        <ListItem
          button
          component={NextLink}
          selected={router.pathname === '/dashboard/users'}
          href="/dashboard/users"
        >
          <ListItemIcon>
            <SupervisedUserCircle />
          </ListItemIcon>
          <ListItemText
            primary="Пользователи"
            classes={{ primary: classes.listItemText }}
          />
        </ListItem>
      </List>
      <Divider className={classes.divider} />
    </>
  );

  const authorMenu = () => (
    <>
      <ListMenu
        parentNodeText="Мои заявки"
        parentNodeIcon={<Book />}
        listItemIcons={[<Label />, <Archive />]}
        listItemTexts={["Текущие", "Архивные"]}
        listItemLinks={["/dashboard/my-submissions", "/dashboard/my-submissions/archived"]}
        pathname={router.pathname}
      />
      <Divider className={classes.divider} />
    </>
  );

  const secretaryMenu = () => (
    <>
      <ListMenu
        parentNodeText="Заявки"
        parentNodeIcon={<Inbox />}
        listItemIcons={[<Label />, <Archive />]}
        listItemTexts={["Текущие", "Архивные"]}
        listItemLinks={["/dashboard/submissions", "/dashboard/submissions/archived"]}
        pathname={router.pathname}
      />
      <List disablePadding>
        <ListItem
          button
          component={NextLink}
          selected={router.pathname === '/dashboard/issues'}
          href="/dashboard/issues"
        >
          <ListItemIcon>
            <LibraryBooks />
          </ListItemIcon>
          <ListItemText
            primary="Выпуски"
            classes={{ primary: classes.listItemText }}
          />
        </ListItem>
        <ListItem
          button
          component={NextLink}
          selected={router.pathname === '/dashboard/templates'}
          href="/dashboard/templates"
        >
          <ListItemIcon>
            <InsertDriveFile />
          </ListItemIcon>
          <ListItemText
            primary="Шаблоны"
            classes={{ primary: classes.listItemText }}
          />
        </ListItem>
      </List>
      <Divider className={classes.divider} />
    </>
  )

  const editorMenu = () => (
    <>
      <List disablePadding>
        <ListItem
          button
          component={NextLink}
          selected={router.pathname === '/dashboard/editor-issues'}
          href="/dashboard/editor-issues"
        >
          <ListItemIcon>
            <ImportContacts />
          </ListItemIcon>
          <ListItemText
            primary="Решения о выпусках"
            classes={{ primary: classes.listItemText }}
          />
        </ListItem>
      </List>
      <Divider className={classes.divider} />
    </>
  );

  const reviewerMenu = () => (
    <>
      <ListMenu
        parentNodeText="Заявки на рецензию"
        parentNodeIcon={<School />}
        listItemIcons={[<Label />, <Archive />]}
        listItemTexts={["Текущие", "Архивные"]}
        listItemLinks={["/dashboard/reviews", "/dashboard/reviews/archived"]}
        pathname={router.pathname}
      />
      <Divider className={classes.divider} />
    </>
  );

  const ebmMenu = () => (
    <>
      <List disablePadding>
        <ListItem
          button
          component={NextLink}
          selected={router.pathname === '/dashboard/board-issues'}
          href="/dashboard/board-issues"
        >
          <ListItemIcon>
            <Poll />
          </ListItemIcon>
          <ListItemText
            primary="Голосования"
            classes={{ primary: classes.listItemText }}
          />
        </ListItem>
      </List>
      <Divider className={classes.divider} />
    </>
  );

  const drawer = (
    <>
      <div className={classes.drawerHeader}>
        <Hidden lgUp implementation="css">
          <IconButton onClick={toggleMobileDrawer(false)}>
            <ChevronLeftIcon />
          </IconButton>
        </Hidden>
        <Hidden mdDown implementation="css">
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </Hidden>
      </div>
      <Divider className={classes.firstDivider} />

      { roles.includes(ROLES.AUTHOR) && authorMenu() }

      { roles.includes(ROLES.SECRETARY) && secretaryMenu() }

      { roles.includes(ROLES.REVIEWER) && reviewerMenu() }

      { roles.includes(ROLES.EDITORIAL_BOARD_MEMBER) && ebmMenu() }

      { roles.includes(ROLES.EDITOR) && editorMenu() }

      { roles.includes(ROLES.ADMIN) && adminMenu() }

      <List disablePadding>
        <ListItem
          button
          component={NextLink}
          selected={router.pathname === '/dashboard/account'}
          href="/dashboard/account"
        >
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText
            primary="Учётная запись"
            classes={{ primary: classes.listItemText }}
          />
        </ListItem>
        <ListItem
          button
          component={NextLink}
          selected={router.pathname === '/dashboard/settings'}
          href="/dashboard/settings"
        >
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText
            primary="Настройки"
            classes={{ primary: classes.listItemText }}
          />
        </ListItem>
      </List>
    </>
  );

  return (
    <nav className={classes.drawer}>
      <Hidden lgUp >
        <SwipeableDrawer
          anchor="left"
          open={mobileOpen}
          onOpen={toggleMobileDrawer(true)}
          onClose={toggleMobileDrawer(false)}
          classes={{ paper: classes.drawerPaper }}
          ModalProps={{ keepMounted: true }}
        >
          { drawer }
        </SwipeableDrawer>
      </Hidden>
      <Hidden mdDown implementation="css">
        <Drawer
          variant="persistent"
          anchor="left"
          open={open}
          classes={{ paper: classes.drawerPaper }}
        >
          { drawer }
        </Drawer>
      </Hidden>
    </nav>
  );
}

NavigationDrawer.propTypes = {
  router: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  handleDrawerClose: PropTypes.func.isRequired,
  mobileOpen: PropTypes.bool.isRequired,
  toggleMobileDrawer: PropTypes.func.isRequired
};

export default withRouter(NavigationDrawer);
