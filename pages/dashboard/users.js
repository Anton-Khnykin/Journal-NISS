import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import DashboardLayout from 'components/dashboard/DashboardLayout';
import ConfirmDialog from 'components/dashboard/ConfirmDialog';
import StyledSnackbar from 'components/dashboard/StyledSnackbar';
import CustomTable from 'components/dashboard/table/CustomTable';
import WithMobileDialog from 'components/WithMobileDialog';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import Checkbox from '@material-ui/core/Checkbox';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';
import MoreIcon from '@material-ui/icons/ExpandMore';
import { getUsers, createUser, editUser, deleteUser } from 'middleware/api/admin';
import { parseUsersTableData } from 'utils/table_data_parser';
import { isInvalidEmail, isEmpty, isFieldEmpty } from 'utils/validation';
import { ROLES } from 'middleware/enums';

const searchOptions = {
  threshold: 0.2,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 2,
  keys: [
    "name",
    "email"
  ]
};

const filterList = [
  { filter: ROLES.ADMIN, label: 'Администратор' },
  { filter: ROLES.AUTHOR, label: 'Автор' },
  { filter: ROLES.SECRETARY, label: 'Ответственный секретарь' },
  { filter: ROLES.EDITOR, label: 'Главный редактор' },
  { filter: ROLES.REVIEWER, label: 'Рецензент' },
  { filter: ROLES.EDITORIAL_BOARD_MEMBER, label: 'Член ред. коллегии' }
];

const headRows = [
  { id: 'name', label: 'ФИО', type: 'string' },
  { id: 'email', label: 'Электронный\xa0адрес', type: 'string' },
  { id: 'registrationDate', label: 'Дата регистрации', type: 'date' },
  { id: 'role', label: 'Роль', type: 'number' },
  { id: 'empty' }
];

const useUserModalStyles = makeStyles(theme => ({
  listItem: {
    paddingTop: 0,
    paddingBottom: 0
  },
  listItemIcon: {
    minWidth: theme.spacing(4)
  }
}))

const UserModal = props => {
  const classes = useUserModalStyles();
  const { user, open, editMode, onSave, onDelete, onClose } = props;
  const [ checked, setChecked ] = useState({});
  const [ userData, setUserData ] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [ error, setError ] = useState({});

  useEffect(() => {
    let temp = {};
    if (!isEmpty(user)) {
      filterList.forEach(item => temp[item.filter] = user.roles.some(item2 => item2 === item.filter));
      setUserData({
        firstName: user.credential.first_name_ru,
        lastName: user.credential.last_name_ru,
        email: user.email,
        password: ''
      })
    }
    else {
      filterList.forEach(item => temp[item.filter] = false);
    }
    setChecked(temp);
  }, [user]);

  const getDataForSubmit = () => {
    const data = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      password: userData.password
    }

    const newRoles = [];
    for (const item in checked) {
      if (checked[item]) {
        newRoles.push(parseInt(item, 10));
      }
    }

    if (!isEmpty(user) && editMode) {
      const forCreate = newRoles.filter(newRole => !user.roles.includes(newRole));
      const forDelete = user.roles.filter(role => !newRoles.includes(role));
      data.roles = {
        create: forCreate,
        delete: forDelete
      }
    }
    else if (!editMode) {
      data.roles = newRoles;
    }

    return data;
  }

  const handleChange = name => ({ target: { value } }) => {
    let errors = { role: error.role };
    isFieldEmpty(name, value, errors);
    setError(errors);
    setUserData({ ...userData, [name]: value });
  }

  const handleToggle = value => () => {
    const newChecked = {...checked};
    newChecked[value] = !checked[value];
    if (Object.values(newChecked).some(role => role)) {
      setError({ ...error, role: null });
    }
    setChecked(newChecked);
  };

  const handleSave = () => {
    let errors = {};
    for (const prop in userData) {
      if (prop === 'password') {
        if (!editMode) {
          isFieldEmpty(prop, userData[prop], errors);
        }
        continue;
      }
      isFieldEmpty(prop, userData[prop], errors);
    }

    if (!errors.email) {
      if (isInvalidEmail(userData.email)) {
        Object.assign(errors, { email: 'Неверный формат' });
      }
    }

    if (!Object.values(checked).some(role => role)) {
      Object.assign(errors, { role: 'Выберите как минимум одну роль' });
    }

    setError(errors);

    if (Object.values(errors).some(error => error)) {
      return;
    }

    onSave(getDataForSubmit());
  }

  const handleClose = () => {
    setError({});
    setUserData({
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    });
    onClose();
  }

  return (
    <WithMobileDialog
      maxWidth="sm"
      open={open}
      onClose={handleClose}
      title={!editMode ? 'Добавить пользователя в систему' : 'Редактировать пользователя'}
    >
      <DialogContent dividers>
        <Grid container>
          <Box
            component={Grid}
            item xs={12} sm={6}
            pr={{ xs: 0, sm: 1 }}
          >
            <TextField
              fullWidth
              label={error.lastName || "Фамилия"}
              error={!!error.lastName}
              value={userData.lastName}
              margin="dense"
              onChange={handleChange('lastName')}
            />
          </Box>
          <Box
            component={Grid}
            item xs={12} sm={6}
            pl={{ xs: 0, sm: 1 }}
          >
            <TextField
              fullWidth
              label={error.firstName || "Имя"}
              error={!!error.firstName}
              value={userData.firstName}
              margin="dense"
              onChange={handleChange('firstName')}
            />
          </Box>
          <Box
            component={Grid}
            item xs={12} sm={6}
            pr={{ xs: 0, sm: 1 }}
          >
            <TextField
              fullWidth
              label={error.email || "Электронный адрес"}
              error={!!error.email}
              value={userData.email}
              margin="dense"
              onChange={handleChange('email')}
            />
          </Box>
          <Box
            component={Grid}
            item xs={12} sm={6}
            pl={{ xs: 0, sm: 1 }}
          >
            <TextField
              fullWidth
              label={error.password || (!editMode ? "Пароль" : "Новый пароль")}
              error={!!error.password}
              value={userData.password}
              margin="dense"
              onChange={handleChange('password')}
            />
          </Box>
            
          <Box
            component={Typography}
            variant="body2"
            fontWeight={500}
            pt={2}
          >
            Роли&nbsp;пользователя
            <Typography variant="caption" color="error">
              &nbsp;&nbsp;&nbsp;
              {error.role}
            </Typography>
          </Box>   
          <List>
            <Grid container>
              {filterList.map(role => (
                <Grid item xs={12} sm={6} key={role.filter}>
                  <ListItem button onClick={handleToggle(role.filter)} className={classes.listItem}>
                    <ListItemIcon
                      className={classes.listItemIcon}
                    >
                      <Checkbox
                        edge="start"
                        checked={checked[role.filter]}
                        tabIndex={-1}
                        disableRipple
                        color="primary"
                      />
                    </ListItemIcon>
                    <ListItemText primary={role.label} />
                  </ListItem>
                </Grid>
              ))}
            </Grid>
          </List>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          Отмена
        </Button>
        {editMode &&
          <Button color="primary" onClick={onDelete}>
            Удалить
          </Button> 
        }
        <Button color="primary" onClick={handleSave}>
          Сохранить
        </Button>
      </DialogActions>
    </WithMobileDialog>
  );
}

UserModal.propTypes = {
  user: PropTypes.object,
  open: PropTypes.bool.isRequired,
  editMode: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};  

const useStyles = makeStyles(theme => ({
  tableCell: {
    fontSize: '0.875rem',
    paddingRight: theme.spacing(2)
  },
  name: {
    fontWeight: 500
  },
  roleListItem:  {
    padding: 0
  },
  grow: {
    flexGrow: 1
  },
  mainRoleItem: {
    cursor: 'pointer'
  }
}));

Users.getInitialProps = async ({ req }) => {
  const users = req ? await getUsers(req.headers.cookie) : await getUsers();
  return { users }
}

function Users(props) {
  const classes = useStyles();
  const [users, setUsers] = useState(props.users);
  const [rows, setRows] = useState(parseUsersTableData(users));
  const [dataForUpdate, setDataForUpdate] = useState(null);
  const [action, setAction] = useState('');
  const [dialog, setDialog] = useState({ open: false, text: '' });
  const [snackbar, setSnackbar] = useState({ open: false, variant: 'success', message: '' });
  const [userModal, setUserModal] = useState({
    open: false,
    editMode: false,
    data: {}
  })

  useEffect(() => {
    setRows(parseUsersTableData(users));
  }, [users]);

  const handleCloseSnack = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({...snackbar, ['open']: false});
  }

  const handleModalUserOpen = (editMode, userId) => () => {
    setUserModal({
      open: true,
      editMode: editMode || false,
      data: users.find(item => item.user_id === userId) || {}
    });
  }

  const handleModalUserClose = () => {
    setUserModal({ ...userModal, open: false });
    setAction('');
    setDataForUpdate(null);
    setDialog({ ...dialog, open: false });
  }

  const handleSave = data => {
    if (userModal.editMode) {
      setAction('update');
      setDataForUpdate(data);
      setDialog({
        open: true,
        text: 'Сохранить изменения?'
      });
    }
    else {
      createUser(data)
        .then(async (res) => {
          if (res.status === 200) {
            handleModalUserClose();
            setUsers(await getUsers());
            setSnackbar({
              open: true,
              variant: 'success',
              message: 'Пользователь успешно добавлен в систему'
            });
          }
          else {
            setSnackbar({
              open: true,
              variant: 'error',
              message: res.message || 'Ошибка на сервере'
            });
          }
        });
    }
  }

  const handleDelete = () => {
    setAction('delete');
    setDialog({
      open: true,
      text: 'Вы уверены, что хотите удалить пользователя из системы?'
    });
  }

  const handleSubmit = () => {
    if (action === 'update') {
      editUser(userModal.data.user_id, dataForUpdate)
        .then(async (res) => {
          if (res.status === 200) {
            handleModalUserClose();
            setUsers(await getUsers());
            setSnackbar({
              open: true,
              variant: 'success',
              message: 'Информация о пользователе успешно изменена'
            });
          }
          else {
            setSnackbar({
              open: true,
              variant: 'error',
              message: res.message || 'Ошибка на сервере'
            });
          }
        })
    }
    else if (action === 'delete') {
      deleteUser(userModal.data.user_id)
        .then(async (res) => {
          if (res.status === 200) {
            handleModalUserClose();
            setUsers(await getUsers());
            setSnackbar({
              open: true,
              variant: 'success',
              message: 'Пользователь успешно удален из системы'
            });
          }
          else {
            setSnackbar({
              open: true,
              variant: 'error',
              message: res.message || 'Ошибка на сервере'
            });
          }
        });
    }
  }

  const handleDialogClose = () => {
    setDialog({ ...dialog, open: false });
    setAction('');
  }

  const ToolbarActions = () => {
    return (
      <Tooltip title="Добавить пользователя">
        <IconButton onClick={handleModalUserOpen()}>
          <AddIcon />
        </IconButton>
      </Tooltip>
    )
  }

  const UserTableRow = ({ row }) => {
    const [ open, setOpen ] = useState(false);

    const handleShowRoles = () => {
      setOpen(!open);
    }

    const getRoles = () => {
      if (row.roles.length > 1) {
        const elements = [];
        for (let i = 1; i < row.roles.length; i++) {
          elements.push(
            <ListItem key={row.id + row.roles[i]} className={classes.roleListItem}>
              <Typography>
                {filterList.find(item => item.filter === row.roles[i]).label}
              </Typography>
            </ListItem>
          );
        }
        return (
          <List component="div" disablePadding>
            <ListItem key={row.id.toString() + row.roles[0]} className={clsx(classes.roleListItem, classes.mainRoleItem)}>
              <Typography>
                {filterList.find(item => item.filter === row.roles[0]).label}
              </Typography>
              <MoreIcon />
            </ListItem>

            <Collapse in={open} timeout="auto">
              <List component="div" disablePadding>
                {elements}
              </List>
            </Collapse>
          </List>
        );
      }
      else {
        return (
          <Typography key={row.id + row.roles[0]}>
            {filterList.find(item => item.filter === row.roles[0]).label}
          </Typography>
        )
      }
    }
    
    return (
      <TableRow hover tabIndex={-1}>
        <TableCell className={clsx(classes.tableCell, classes.name)} align="left">{row.name}</TableCell>
        <TableCell className={classes.tableCell} align="left">{row.email}</TableCell>
        <TableCell className={classes.tableCell} align="left">{row.registrationDate}</TableCell>
        <TableCell className={classes.tableCell} align="left" onClick={handleShowRoles}>
          {getRoles()}
        </TableCell>
        <TableCell className={classes.tableCell} align="left">
          <IconButton onClick={handleModalUserOpen(true, row.id)}>
            <EditIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      <Head>
        <title>Пользователи системы | Панель управления</title>
      </Head>
      <DashboardLayout navBarTitle="Управление пользователями">
        <CustomTable 
          rows={rows}
          ToolbarActions={ToolbarActions}
          headRows={headRows}
          CustomTableRow={UserTableRow}
          searchOptions={searchOptions}
          defaultOrder='registrationDate'
          emptyRowsText='Нет пользователей'
          filterList={filterList}
          filterProperty="roles"
        />

        <UserModal
          user={userModal.data}
          open={userModal.open}
          editMode={userModal.editMode}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={handleModalUserClose}
        />

        <ConfirmDialog
          open={dialog.open}
          text={dialog.text}
          closeYes={handleSubmit}
          closeNo={handleDialogClose}
        />

        <StyledSnackbar
          open={snackbar.open}
          variant={snackbar.variant}
          message={snackbar.message}
          onClose={handleCloseSnack}
        />
      </DashboardLayout>     
    </>
  );
}

Users.propTypes = {
  users: PropTypes.array.isRequired
}

export default Users;
