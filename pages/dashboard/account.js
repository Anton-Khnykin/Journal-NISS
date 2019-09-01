import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import DashboardLayout from 'components/dashboard/DashboardLayout';
import Portlet from 'components/dashboard/Portlet';
import Autocomplete from 'components/dashboard/Autocomplete';
import StyledSnackbar from 'components/dashboard/StyledSnackbar';
import WithMobileDialog from 'components/WithMobileDialog';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { getCredentials, editCredentials } from 'middleware/api/account';
import { isEmpty, isFieldEmpty } from 'utils/validation';
import { academicDegreesRu, academicDegreesEn, academicTitlesRu, academicTitlesEn } from 'middleware/lists';
import countries from 'middleware/countries';

const CustomTextField = ({ label, onBlur, ...other }) => (
  <TextField
    fullWidth
    variant="outlined"
    margin="dense"
    label={label}
    onBlur={onBlur}
    {...other}
  />
);

CustomTextField.propTypes = {
  label: PropTypes.string.isRequired,
  onBlur: PropTypes.func
};

const CustomSelect = ({ label, selectValues, ...other }) => (
  <TextField
    select
    fullWidth
    variant="outlined"
    margin="dense"
    label={label}
    {...other}
  >
    <MenuItem value={0} />
    { selectValues.map((item, index) => (
      <MenuItem value={index + 1} key={item}>
        { item }
      </MenuItem>
      ))
    }
  </TextField>
)

CustomSelect.propTypes = {
  label: PropTypes.string.isRequired,
  selectValues: PropTypes.array.isRequired
};

const AddOrgModal = ({ open, onClose, onSave, title, data }) => {
  const [ org, setOrg ] = useState({});
  const [ error, setError ] = useState({});

  useEffect(() => {
    if (!isEmpty(data)) {
      setOrg(data);
    }
    else {
      setOrg({
        'organization_name_ru': '',
        'organization_name_en': '',
        'organization_address_ru': '',
        'organization_address_en': '',
        'person_position_ru': '',
        'person_position_en': ''
      });
    }
  }, [data]);

  const handleChange = ({ target: { name, value } }) => {
    let errors = {};
    isFieldEmpty(name, value, errors);
    setError(errors);
    setOrg({ ...org, [name]: value });
  }

  const handleSave = () => {
    let errors = {};
    for (const prop in org) {
      if (prop === 'user_organization_id') {
        continue;
      }
      isFieldEmpty(prop, org[prop], errors);
    }
    setError(errors);
    if (Object.values(errors).some(error => error)) {
      return;
    }

    onSave(org);
  }

  return (
    <WithMobileDialog
      maxWidth="sm"
      open={open}
      onClose={onClose}
      title={title}
    >
      <DialogContent dividers>
         <Grid container>
            <Box
              component={Grid}
              container
              item xs={12} sm={6}
              pr={1.5}
            >
              <CustomTextField
                label={error.organization_name_ru || "Наименование организации"}
                name="organization_name_ru"
                error={!!error.organization_name_ru}
                onChange={handleChange}
                value={org.organization_name_ru}
              />
              <CustomTextField
                label={error.organization_address_ru || "Адрес организации"}
                error={!!error.organization_address_ru}
                name="organization_address_ru"
                onChange={handleChange}
                value={org.organization_address_ru}
              />
              <CustomTextField
                label={error.person_position_ru || "Должность"}
                error={!!error.person_position_ru}
                name="person_position_ru"
                onChange={handleChange}
                value={org.person_position_ru}
              />
            </Box>
            <Box
              component={Grid}
              container
              item xs={12} sm={6}
              pl={1.5}
            >
              <CustomTextField
                label={error.organization_name_en || "Наименование на английском"}
                error={!!error.organization_name_en}
                name="organization_name_en"
                onChange={handleChange}
                value={org.organization_name_en}
              />
              <CustomTextField
                label={error.organization_address_en || "Адрес на английском"}
                error={!!error.organization_address_en}
                name="organization_address_en"
                onChange={handleChange}
                value={org.organization_address_en}
              />
              <CustomTextField
                label={error.person_position_en || "Должность на английском"}
                error={!!error.person_position_en}
                name="person_position_en"
                onChange={handleChange}
                value={org.person_position_en}
              />
            </Box>
          </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Отмена
        </Button>
        <Button color="primary" onClick={handleSave}>
          Сохранить
        </Button>
      </DialogActions>
    </WithMobileDialog>
  );
}

AddOrgModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  data: PropTypes.object
};

function Account(props) {
  const [ credentials, setCredentials ] = useState(props.credentials);
  const [ organizations, setOrganizations ] = useState(props.organizations);
  const [ orgDialog, setOrgDialog ] = useState({
    open: false,
    editMode: false,
    data: {},
    index: null
  })
  const [ snackbar, setSnackbar ] = useState({
    open: false,
    variant: 'success',
    message: ''
  }); 

  const handleCloseSnack = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({...snackbar, ['open']: false});
  }

  const handleOrgDialogOpen = (editMode, data, index) => () => {
    setOrgDialog({
      open: true,
      editMode: editMode || false,
      data: data || {},
      index: index
    });
  }

  const handleOrgDialogClose = () => {
    setOrgDialog({ ...orgDialog, open: false });
  }

  const handleBlur = ({ target: { name, value } }) => {
    setCredentials({ ...credentials, [name]: value });
  }

  const handleCountryChange = countryName => {
    const countryId = countries.indexOf(countries.find(item => item.label === countryName)) + 1;
    setCredentials({ ...credentials, ['country_id']: countryId });
  }

  const handleSelectChange = property => ({ target: { value } }) => {
    setCredentials({  ...credentials, [property]: value });
  }

  const handleSaveOrg = data => {
    let newOrgs = [...organizations];
    orgDialog.editMode ? newOrgs[orgDialog.index] = data : newOrgs.push(data);
    setOrganizations(newOrgs);
    handleOrgDialogClose();
  }

  const handleDeleteOrg = index => () => {
    const newOrgs = [...organizations];
    newOrgs.splice(index, 1);
    setOrganizations(newOrgs);
  }

  const handleSave = () => {
    const newOrgs = {
      create: [],
      update: [],
      delete: []
    }
    const initialOrgs = [...props.organizations];
    const initialIds = initialOrgs.map(org => org.user_organization_id);
    const newIds = organizations.filter(org => org.user_organization_id).map(org => org.user_organization_id);
    newOrgs.delete = initialIds.filter(id => !newIds.includes(id));

    organizations.forEach(org => {
      if (!org.user_organization_id) {
        newOrgs.create.push(org);
      }
      else {
        const newOrg = {};
        const initialOrg = initialOrgs.find(item => item.user_organization_id === org.user_organization_id);

        for (const prop in org) {
          if (org[prop] !== initialOrg[prop]) {
            newOrg[prop] = org[prop];
          }
        }
        if (!isEmpty(newOrg)) {
          newOrg.user_organization_id = initialOrg.user_organization_id;
          newOrgs.update.push(newOrg);
        }
      }
    });

    const newData = Object.assign({}, credentials, { organizations: newOrgs });
    editCredentials(newData)
      .then(res => {
        if (res.status === 200) {
          setSnackbar({
            open: true,
            variant: 'success',
            message: 'Данные успешно обновлены'
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

  return (
    <>
      <Head>
        <title>Учетная запись | Панель управления</title>
      </Head>
      <DashboardLayout navBarTitle="Учётная запись">
        <Grid container>
          <Portlet
            headerContent={
              <Box
                component={Typography}
                fontWeight={500}
                variant="body2"
              >
                Персональные данные
              </Box>
            }
            footerContent={
              <Button
                variant="outlined"
                color="primary"
                onClick={handleSave}
              >
                Сохранить
              </Button>
            }
          >
            <Grid container spacing={4}>
              <Grid container item xs={12} sm={6} alignContent="flex-start">
                <CustomTextField
                  label="Фамилия"
                  name="last_name_ru"
                  onBlur={handleBlur}
                  defaultValue={credentials.last_name_ru}
                />
                <CustomTextField
                  label="Имя"
                  name="first_name_ru"
                  onBlur={handleBlur}
                  defaultValue={credentials.first_name_ru}
                />
                <CustomTextField
                  label="Отчество"
                  name="middle_name_ru"
                  onBlur={handleBlur}
                  defaultValue={credentials.middle_name_ru}
                />
              </Grid>
              <Grid container item xs={12} sm={6} alignContent="flex-start">
                <CustomTextField
                  label="Фамилия на английском"
                  name="last_name_en"
                  onBlur={handleBlur}
                  defaultValue={credentials.last_name_en}
                />
                <CustomTextField
                  label="Имя на английском"
                  name="first_name_en"
                  onBlur={handleBlur}
                  defaultValue={credentials.first_name_en}
                />
                <CustomTextField
                  label="Отчество на английском"
                  name="middle_name_en"
                  onBlur={handleBlur}
                  defaultValue={credentials.middle_name_en}
                />
              </Grid>
            </Grid>
            <Grid container spacing={4}>
              <Grid container item xs={12} sm={6} alignContent="flex-start">
                <CustomTextField
                  label="Контактный электронный адрес"
                  name="contact_email"
                  onBlur={handleBlur}
                  defaultValue={credentials.contact_email}
                  type="email"
                />
                <Grid item xs={12}>      
                  <Autocomplete
                    label="Страна"
                    placeholder="Начните ввод страны"
                    suggestions={countries}
                    value={credentials.country_id ? countries[credentials.country_id - 1].label : ''}
                    onChange={handleCountryChange}
                    variant="outlined"
                    margin="dense"
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid container spacing={4}>
              <Grid container item xs={12} sm={6} alignContent="flex-start">
                <CustomSelect
                  label="Учёное звание"
                  selectValues={academicTitlesRu}
                  value={credentials.academic_title_id || ''}
                  onChange={handleSelectChange('academic_title_id')}
                />
                <CustomSelect
                  label="Учёная степень"
                  selectValues={academicDegreesRu}
                  value={credentials.academic_degree_id || ''}
                  onChange={handleSelectChange('academic_degree_id')}
                />
              </Grid>
              <Grid container item xs={12} sm={6} alignContent="flex-start">
                <CustomSelect
                  label="Учёное звание на английском"
                  selectValues={academicTitlesEn}
                  value={credentials.academic_title_id || ''}
                  onChange={handleSelectChange('academic_title_id')}
                />
                <CustomSelect
                  label="Учёная степень"
                  selectValues={academicDegreesEn}
                  value={credentials.academic_degree_id || ''}
                  onChange={handleSelectChange('academic_degree_id')}
                />
              </Grid>
            </Grid>
            <Box
              component={Grid}
              container
              item sm={6}
              pt={3}
            >
              <Box
                component={Typography}
                variant="body2"
                fontWeight={500}
                display="flex"
                alignItems="center"
              >
                Организации
              </Box>
              <Tooltip title="Добавить">
                <IconButton onClick={handleOrgDialogOpen()}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Grid container item sm={6}>
              <Box component={List} dense width={1}>
                { organizations.length === 0 ?
                  <Typography>
                    Организаций нет
                  </Typography>
                  :
                  organizations.map((org, index) => (
                    <React.Fragment key={org.organization_name_ru + index}>
                      <ListItem>
                        <ListItemText
                          primary={
                          <Typography>
                            { org.organization_name_ru }
                          </Typography>}
                          secondary={
                          <Typography color="textSecondary">
                            { org.organization_name_en }
                          </Typography>}
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Редактировать">
                            <IconButton onClick={handleOrgDialogOpen(true, org, index)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Удалить">
                            <IconButton onClick={handleDeleteOrg(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))
                }
              </Box>
            </Grid>
          </Portlet>
        </Grid>

        <AddOrgModal
          open={orgDialog.open}
          onClose={handleOrgDialogClose}
          onSave={handleSaveOrg}
          title={orgDialog.editMode ? "Редактировать организацию" : "Добавить организацию"}
          data={orgDialog.data}
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

Account.getInitialProps = async ({ req }) => {
  const { organizations, ...credentials } = req ? await getCredentials(req.headers.cookie) : await getCredentials();
  return { credentials, organizations };
}

Account.propTypes = {
  credentials: PropTypes.object.isRequired,
  organizations: PropTypes.array
};

export default Account;
