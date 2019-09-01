import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { makeStyles } from '@material-ui/core/styles';
import DashboardLayout from 'components/dashboard/DashboardLayout';
import TransferList from 'components/dashboard/TransferList';
import ConfirmDialog from 'components/dashboard/ConfirmDialog';
import StyledSnackbar from 'components/dashboard/StyledSnackbar';
import StatusChip from 'components/dashboard/StatusChip';
import CreateIssueModal from 'components/dashboard/CreateIssueModal';
import CustomTable from 'components/dashboard/table/CustomTable';
import WithMobileDialog from 'components/WithMobileDialog';
import NextLink from 'components/NextLink';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Tooltip from '@material-ui/core/Tooltip';
import Zoom from '@material-ui/core/Zoom';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Divider from '@material-ui/core/Divider';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import VolumeIcon from '@material-ui/icons/Book';
import DeleteIcon from '@material-ui/icons/Delete';
import ForwardIcon from '@material-ui/icons/Forward';
import { getIssues, createVolume, getVolumes, deleteVolume } from 'middleware/api/secretary';
import { parseIssuesTableData } from 'utils/table_data_parser';
import { replaceChar, isFieldEmpty } from 'utils/validation';
import { ISSUE_STATUS } from 'middleware/enums';

const searchOptions = {
  threshold: 0.4,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 2,
  keys: [
    "number",
    "numberGeneral",
    "volume"
  ]
};

const filterList = [
  { filter: ISSUE_STATUS.CREATED, label: 'Выпуск создан' },
  { filter: ISSUE_STATUS.CONSIDERATION_EDITORIAL_BOARD, label: 'На рассмотрении редакционной коллегией' },
  { filter: ISSUE_STATUS.REJECTED_EDITORIAL_BOARD, label: 'Отклонено редакционной коллегией' },
  { filter: ISSUE_STATUS.ACCEPTED_EDITORIAL_BOARD, label: 'Принято редакционной коллегией' },
  { filter: ISSUE_STATUS.CONSIDERATION_EDITOR, label: 'На рассмотрении главным редактором' },
  { filter: ISSUE_STATUS.REJECTED_EDITOR, label: 'Отклонено главным редактором' },
  { filter: ISSUE_STATUS.ACCEPTED_EDITOR, label: 'Принято главным редактором' },
  { filter: ISSUE_STATUS.IN_DEVELOPMENT, label: 'В разработке' },
  { filter: ISSUE_STATUS.PUBLISHED, label: 'Опубликовано' },
  { filter: ISSUE_STATUS.PUBLISHED_ON_SITE, label: 'Опубликовано на сайте' }
];

const headRows = [
  { id: 'empty' },
  { id: 'number', label: 'Номер', type: 'number' },
  { id: 'numberGeneral', label: 'Сквозной\xa0номер', type: 'number' },
  { id: 'volume', label: 'Том', type: 'number' },
  { id: 'creationDate', label: 'Дата\xa0создания', type: 'date' },
  { id: 'publicationDate', label: 'Дата\xa0публикации', type: 'date' },
  { id: 'status', label: 'Статус', type: 'string' }
];

const useTableRowStyles = makeStyles(theme => ({
  tableCell: {
    fontSize: '0.875rem',
    paddingRight: theme.spacing(2)
  },
  link: {
    color: 'inherit',
    textDecoration: 'none',
    '&:hover': {
      color: theme.palette.primary.main
    }
  }
}));

const IssueTableRow = ({ row }) => {
  const classes = useTableRowStyles();

  return (
    <TableRow hover tabIndex={-1}>
      <TableCell
        className={classes.tableCell}
        align="left"
        padding="checkbox"
        style={{ paddingRight: 0 }}
      >
        <IconButton
          component={NextLink}
          href={`/dashboard/issue?slug=${row.id}`}
          hrefAs={`/dashboard/issue/${row.id}`}
        >
          <ForwardIcon />
        </IconButton>
      </TableCell>
      <TableCell className={classes.tableCell} align="left">{row.number}</TableCell>
      <TableCell className={classes.tableCell} align="left">{row.numberGeneral}</TableCell>
      <TableCell className={classes.tableCell} align="left">{row.volume}</TableCell>
      <TableCell className={classes.tableCell} align="left">{row.creationDate}</TableCell>
      <TableCell className={classes.tableCell} align="left">{row.publicationDate}</TableCell>
      <TableCell className={classes.tableCell} align="left">
        <StatusChip statusOf="issue" status={row.status}/>
      </TableCell>
    </TableRow>
  );
}

IssueTableRow.propTypes = {
  row: PropTypes.object.isRequired
};

function Issues(props) {
  const [rows, setRows ] = useState(parseIssuesTableData(props.issues));
  const [issueData, setIssueData ] = useState({
    volume: '',
    number: ''
  });
  const [dialog, setDialog ] = useState({
    open: false,
    text: ''
  });
  const [creatingIssue, setCreatingIssue ] = useState({
    openForm: false,
    openModal: false
  });

  const handleCreatingIssueModalOpen = () => {
    setCreatingIssue({ ...creatingIssue, openModal: true });
  }

  const handleCreatingIssueModalClose = () => {
    setCreatingIssue({ ...creatingIssue, openModal: false });
  }

  const handleCreatingIssueFormOpen = () => {
    handleCreatingIssueModalClose();
    setCreatingIssue({ ...creatingIssue, openForm: true });
  }

  const handleCreatingIssueFormClose = () => {
    handleCreatingIssueModalClose();
    setCreatingIssue({ ...creatingIssue, openForm: false });
  }

  const handleCancelCreatingIssue = () => {
    setDialog({ ...dialog, open: false });
    handleCreatingIssueFormClose();
  }

  const handleCloseDialog = () => {
    setDialog({ ...dialog, open: false });
  }

  const handleCancelling = text => () => {
    handleCreatingIssueModalClose();
    setDialog({
      open: true,
      text: text
    });
  }

  const setIssues = newValue => {
    setRows(parseIssuesTableData(newValue));
  }

  const ToolbarActions = () => {
    const [ volumes, setVolumes ] = useState([]);
    const [ volumesModalOpen, setVolumesModalOpen ] = useState(false);
    const [ createVolumeModalOpen, setCreateVolumeModalOpen ] = useState(false);
    const [ confirmDialogOpen, setConfirmDialogOpen ] = useState(false);
    const [ anchorElMenu, setAnchorElMenu ] = useState(null);
    const [ volumeForDelete, setVolumeForDelete ] = useState('');
    const [ snackbar, setSnackbar ] = useState({
      open: false,
      variant: 'success',
      message: ''
    });
    const [ volumeValues, setVolumeValues ] = useState({
      number: '',
      year: ''
    });
    const [ error, setError ] = useState({
      number: null,
      year: null
    });
    
    useEffect(() => {
      getVolumes()
        .then(res => setVolumes(res));
    }, []);

    const isDataValid = () => {
      let errors = {};
      if (!isFieldEmpty('number', volumeValues.number, errors)) {
        isNumberCorrect(volumeValues.number, errors);
      }
      if (!isFieldEmpty('year', volumeValues.year, errors)) {
        isYearCorrect(volumeValues.year, errors);
      }
      setError(errors);
      return !Object.values(errors).some(error => error);
    }

    const isNumberCorrect = (value, errors) => {
      if (parseInt(value, 10) <= 0) {
        Object.assign(errors, { number: 'Неверный формат' });
        return false;
      }
      Object.assign(errors, { number: null });
      return true;
    }

    const isYearCorrect = (value, errors) => {
      if (!value.match(/\d{4}/)) {
        Object.assign(errors, { year: 'Неверный формат' });
        return false;
      }
      Object.assign(errors, { year: null });
      return true;
    }

    const handleVolumeChange = ({ target: { name, value } }) => {
      let errors = {};
      isFieldEmpty(name, value, errors);
      setError(errors);
      if (name === 'year') {
        if (value.length > 4) {
          return;
        }
      }
      setVolumeValues({ ...volumeValues, [name]: replaceChar(value) });
    }
    
    const handleMenuOpen = event => {
      setAnchorElMenu(event.currentTarget);
    }

    const handleMenuClose = () => {
      setAnchorElMenu(null);
    }

    const handleCreateVolumeModalOpen = () => {
      setCreateVolumeModalOpen(true);
      setAnchorElMenu(null);
    }

    const handleCreateVolumeModalClose = () => {
      setVolumeValues({
        number: '',
        year: ''
      });
      setError({
        number: null,
        year: null
      });
      setCreateVolumeModalOpen(false);
    }

    const handleVolumesModalOpen = () => {
      setVolumesModalOpen(true);
    }

    const handleVolumesModalClose = () => {
      setVolumesModalOpen(false);
    }

    const handleCloseSnack = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
      setSnackbar({...snackbar, ['open']: false});
    }

    const handleConfirmDialogOpen = volumeId => () => {
      setVolumeForDelete(volumeId);
      setConfirmDialogOpen(true);
    }

    const handleConfirmDialogClose = () => {
      setConfirmDialogOpen(false);
    }

    const handleDelete = () => {
      deleteVolume(volumeForDelete)
        .then(async (res) => {
          if (res.status === 200) {
            setVolumes(await getVolumes());
            setSnackbar({
              open: true,
              variant: 'success',
              message: 'Том успешно удален'
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
      handleConfirmDialogClose();
    }

    const handleCreateVolume = () => {
      handleVolumesModalClose();
      handleCreateVolumeModalOpen();
    }

    const handleCreatingIssue = data => {
      setIssueData({...data});
      handleCreatingIssueFormOpen();
    }

    const handleSubmit = () => {
      if (!isDataValid()) {
        return;
      }
      
      createVolume({
        number: volumeValues.number,
        year: volumeValues.year
      }).then(async (res) => {
        if (res.status === 200) {
          setVolumeValues({ number: '', year: '' });
          setVolumes(await getVolumes());
          handleVolumesModalOpen();
          setSnackbar({
            open: true,
            variant: 'success',
            message: 'Том успешно создан'
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
      handleCreateVolumeModalClose();
    }

    return (
      <>
        <Tooltip title="Создать">
          <IconButton 
            aria-label="Create"
            aria-owns={anchorElMenu ? 'menu' : undefined}
            aria-haspopup="true"
            onClick={handleMenuOpen}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Посмотреть тома журнала">
          <IconButton onClick={handleVolumesModalOpen}>
            <VolumeIcon />
          </IconButton>
        </Tooltip>
        <Menu
          id="menu"
          anchorEl={anchorElMenu}
          open={Boolean(anchorElMenu)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleCreatingIssueModalOpen}>
            Создать&nbsp;выпуск
          </MenuItem>
          <MenuItem onClick={handleCreateVolumeModalOpen}>
            Создать&nbsp;том
          </MenuItem>
        </Menu>

        <WithMobileDialog
          maxWidth="xs"
          open={volumesModalOpen}
          onClose={handleVolumesModalClose}
          title="Тома&nbsp;журнала"
        >
          <DialogContent dividers>
            <List>
              { volumes.length === 0 &&
                <ListItem>
                  <ListItemText primary="В системе еще нет созданных томов" />
                </ListItem>
              }
              { volumes.map(item => (
                <React.Fragment key={item.volume_id}>
                  <ListItem>
                    <ListItemText primary={`${item.number} (${item.year})`} />
                    <ListItemSecondaryAction>
                      <IconButton onClick={handleConfirmDialogOpen(item.volume_id)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleVolumesModalClose}>
              Закрыть
            </Button>
            <Button color="primary" onClick={handleCreateVolume}>
              Создать&nbsp;том
            </Button>
          </DialogActions>
        </WithMobileDialog>

        <WithMobileDialog
          maxWidth="xs"
          open={createVolumeModalOpen}
          onClose={handleCreateVolumeModalClose}
          title="Создание&nbsp;тома"
        >
          <DialogContent dividers>
            <TextField
              fullWidth
              required
              error={!!error.number}
              margin="dense"
              onChange={handleVolumeChange}
              name="number"
              label={error.number || "Номер"}
              value={volumeValues.number}
            />
            <TextField
              fullWidth
              required
              error={!!error.year}
              margin="dense"
              onChange={handleVolumeChange}
              name="year"
              label={error.year || "Год"}
              value={volumeValues.year}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCreateVolumeModalClose}>
              Отмена
            </Button>
            <Button color="primary" onClick={handleSubmit}>
              Сохранить
            </Button>
          </DialogActions>
        </WithMobileDialog>

        <CreateIssueModal
          open={creatingIssue.openModal}
          onClose={handleCreatingIssueModalClose}
          onSubmit={handleCreatingIssue}
          title="Создание&nbsp;выпуска"
          submitAction="Заполнить&nbsp;выпуск"
        />

        <ConfirmDialog
          open={confirmDialogOpen}
          text="Вы уверены, что хотите удалить том?"
          closeYes={handleDelete}
          closeNo={handleConfirmDialogClose}
        />

        <StyledSnackbar
          open={snackbar.open}
          variant={snackbar.variant}
          message={snackbar.message}
          onClose={handleCloseSnack}
        />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Выпуски журнала | Панель управления</title>
      </Head>
      <DashboardLayout navBarTitle="Выпуски журнала">
        { !creatingIssue.openForm &&
          <CustomTable 
            rows={rows}
            ToolbarActions={ToolbarActions}
            headRows={headRows}
            CustomTableRow={IssueTableRow}
            searchOptions={searchOptions}
            defaultOrder='numberGeneral'
            emptyRowsText='Нет выпусков'
            filterList={filterList}
            filterProperty="status"
          />
        }

        { creatingIssue.openForm && 
          <Zoom in>
            <TransferList
              setIssues={setIssues}
              handleCancelling={handleCancelling}
              data={issueData}
            />
          </Zoom>
        }

        <ConfirmDialog
          open={dialog.open}
          text={dialog.text}
          closeYes={handleCancelCreatingIssue}
          closeNo={handleCloseDialog}
        />
      </DashboardLayout>
    </>
  );
}

Issues.getInitialProps = async ({ req }) => {
  const issues = req ? await getIssues(req.headers.cookie) : await getIssues();
  return { issues };
}

Issues.propTypes = {
  issues: PropTypes.array.isRequired
};

export default Issues;
