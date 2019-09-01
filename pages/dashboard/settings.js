  import React, { useState, createRef, useContext } from 'react';
import Auth from 'utils/auth';
import Head from 'next/head';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { GoogleLoginButton, FacebookLoginButton } from 'components/main/ThirdPartyLoginButtons';
import DashboardLayout from 'components/dashboard/DashboardLayout';
import Portlet from 'components/dashboard/Portlet';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import { ROLES } from 'middleware/enums';
import { changeEmail, changePassword } from 'middleware/api/account';
import { isEmptyOrNull, isInvalidEmail } from 'utils/validation';
import { getSettings } from 'middleware/api/account';

const SubCheckbox = ({ checked, onChange, label }) => (
  <FormControlLabel
    control={
      <Checkbox
        checked={checked}
        onChange={onChange}
        color="primary"
      />
    }
    label={label}
  />
);

SubCheckbox.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired
};

const CustomTextField = ({ label, inputRef, ...other }) => (
  <Grid item xs={12}>
    <TextField
      fullWidth
      variant="outlined"
      margin="dense"
      label={label}
      inputRef={inputRef}
      {...other}
    />
  </Grid>
);

CustomTextField.propTypes = {
  label: PropTypes.string.isRequired,
  inputRef: PropTypes.object.isRequired
};

const useMessageStyle = makeStyles(() => ({
  messageSuccess: {
    color: '#66bb6a'
  },
  messageFail: {
    color: '#ef5350'
  }
}));

const MessageText = ({ children, success }) => {
  const classes = useMessageStyle();

  return (
    <Typography
      gutterBottom
      className={
        success ?
        classes.messageSuccess
        :
        classes.messageFail
      }
    >
      { children }
    </Typography>
  );
}

MessageText.propTypes = {
  children: PropTypes.any,
  success: PropTypes.bool
}

const useStyles = makeStyles(theme => ({
  headerTitle: {
    fontWeight: 500,
    fontSize: '1rem'
  },
  portlet: {
    marginBottom: theme.spacing(4)
  },
  authButtons: {
    maxWidth: 300
  },
  topButton: {
    marginBottom: theme.spacing(2)
  },
  loadingWrapper: {
    position: 'relative'
  },
  buttonProgress: {
    color: theme.palette.primary.main,
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -50
  },
  thirdPartyButton: {
    height: '36.5px'
  }
}));

function Settings(props) {
  const classes = useStyles();
  const { roles } = useContext(Auth);
  const { settings } = props;
  const [ checkedSwitches, setCheckedSwitches ] = useState({
    new_issues: false,
    submission_status_secretary: false,
    submission_status_author: false,
    new_messages_author: false,
    new_messages_secretary: false
  });
  const [ passwordStatus, setPasswordStatus ] = useState({
    message: '',
    success: undefined
  });
  const [ emailStatus, setEmailStatus ] = useState({
    message: '',
    success: undefined
  });
  const [ changingPassword, setChangingPassword ] = useState(false);
  const [ changingEmail, setChangingEmail ] = useState(false);

  const currentPasswordRef = createRef(),
        newPasswordRef = createRef(),
        verifyPasswordRef = createRef(),
        newEmailRef = createRef();

  const handleSubChange = sub => {
    setCheckedSwitches({
      ...checkedSwitches,
      [sub]: !checkedSwitches[sub]
    });
  }

  const defaultSwitches = () => {
    return (
      <Grid item xs={12}>
        <SubCheckbox
          checked={checkedSwitches.new_issues}
          onChange={() => handleSubChange('new_issues')}
          label="Новые номера журнала"
        />
      </Grid>
    );
  }

  const authorSwitches = () => {
    return (
      <>
        <Grid item xs={12}>
          <SubCheckbox
            checked={checkedSwitches.submission_status_author}
            onChange={() => handleSubChange('submission_status_author')}
            label="Изменения статусов моих заявок"
          />
        </Grid>
        <Grid item xs={12}>
          <SubCheckbox
            checked={checkedSwitches.new_messages_author}
            onChange={() => handleSubChange('new_messages_author')}
            label="Новые сообщения от редакции"
          />
        </Grid>
      </>
    );
  }

  const secretarySwitches = () => {
    return (
      <>
        <Grid item xs={12}>
          <SubCheckbox
            checked={checkedSwitches.submission_status_secretary}
            onChange={() => handleSubChange('submission_status_secretary')}
            label="Изменения статусов заявок"
          />
        </Grid>
        <Grid item xs={12}>
          <SubCheckbox
            checked={checkedSwitches.new_messages_secretary}
            onChange={() => handleSubChange('new_messages_secretary')}
            label="Новые сообщения от авторов"
          />
        </Grid>
      </>
    );
  }

  const handleSave = () => {

  }

  const handlePassword = async () => {
    let currentPassword;
    const newPassword = newPasswordRef.current.value;
    const verify = verifyPasswordRef.current.value;
    
    if (settings.locally_authorized) {
      currentPassword = currentPasswordRef.current.value;
      if (isEmptyOrNull(currentPassword)) {
        setPasswordStatus({
          message: 'Заполните все поля',
          success: false
        });
      }
    }

    if (isEmptyOrNull(newPassword) ||
        isEmptyOrNull(verify)) {
      setPasswordStatus({
        message: 'Заполните все поля',
        success: false
      });
      
      return;
    }
    else if (newPassword !== verify) {
      setPasswordStatus({
        message: 'Новый пароль и подтверждение должны совпадать',
        success: false
      });
      
      return;
    }
    
    setChangingPassword(true);
    const result = await changePassword({ currentPassword, newPassword, verify });
    setChangingPassword(false);
    const success = result.status === 200;
    let message;

    if (success) {
      // currentPasswordRef.current.value = '';
      // newPasswordRef.current.value = '';
      // verifyPasswordRef.current.value = '';
      message = settings.locally_authorized
        ? 'Пароль успешно изменен'
        : 'Пароль успешно создан';
    }
    else {
      message = result.message;
    }

    setPasswordStatus({ message, success });
  }

  const handleChangeEmail = async () => {
    const newEmail = newEmailRef.current.value;

    if (isEmptyOrNull(newEmail)) {
      setEmailStatus({
        message: 'Введите новый адрес',
        success: false
      });

      return;
    }
    else if (isInvalidEmail(newEmail)) {
      setEmailStatus({
        message: 'Неверный адрес',
        success: false
      });

      return;
    }

    setChangingEmail(true);
    const result = await changeEmail({ email: newEmail });
    setChangingEmail(false);
    const success = result.status === 200;
    let message;

    if (success) {
      // newEmailRef.current.value = '';
      message = 'Адрес успешно изменен';
    }
    else {
      message = result.message;
    }

    setEmailStatus({ message, success });
  }

  return (
    <>
      <Head>
        <title>Настройки | Панель управления</title>
      </Head>
      <DashboardLayout navBarTitle="Настройки">
        <Grid container spacing={4}>
          <Grid
            container
            direction="column"
            item xs={12} sm={12} md={7}
          >
            <Portlet
              className={classes.portlet}
              headerContent={
                <Typography className={classes.headerTitle}>
                  Уведомления
                </Typography>
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

              { defaultSwitches() }

              { roles.includes(ROLES.AUTHOR) && authorSwitches() }

              { roles.includes(ROLES.SECRETARY) && secretarySwitches() }

            </Portlet>
            <Portlet
              headerContent={
                <Typography className={classes.headerTitle}>
                  Привязанные аккаунты третьих сторон
                </Typography>
              }
            >
              <Grid
                container
                justify="center"
              >
                <div className={classes.authButtons}>
                  <GoogleLoginButton
                    href="/login/google"
                    text={
                      settings.google_authorized ? 
                      'Аккаунт Google привязан'
                      :
                      'Привязать аккаунт Google'
                    }
                    className={clsx(classes.thirdPartyButton, classes.topButton)}
                    disabled={settings.google_authorized}
                  />
                  <FacebookLoginButton
                    href="/login/facebook"
                    text={
                      settings.facebook_authorized ?
                      'Аккаунт Facebook привязан'
                      :
                      'Привязать аккаунт Facebook'
                    }
                    className={classes.thirdPartyButton}
                    disabled={settings.facebook_authorized}
                  />
                </div>
              </Grid>
            </Portlet>
          </Grid>
          <Grid
            container
            direction="column"
            item xs={12} sm={12} md={5}
          >
            <Portlet
              className={classes.portlet}
              headerContent={
                <Typography className={classes.headerTitle}>
                  { settings.locally_authorized ? 'Изменить пароль' : 'Создать пароль' }
                </Typography>
              }
              footerContent={
                <div className={classes.loadingWrapper}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handlePassword}
                  >
                    Сохранить
                  </Button>
                  { changingPassword && 
                    <CircularProgress size={24} className={classes.buttonProgress} />
                  }
                </div>
              }
            >
              <Grid container>
                { passwordStatus.message &&
                  <MessageText success={passwordStatus.success}>
                    { passwordStatus.message }
                  </MessageText>
                }
                { settings.locally_authorized &&
                  <CustomTextField label="Текущий пароль" inputRef={currentPasswordRef} type="password" />
                }
                <CustomTextField label="Новый пароль" inputRef={newPasswordRef} type="password" />
                <CustomTextField label="Подтвердить" inputRef={verifyPasswordRef} type="password" />
              </Grid>
            </Portlet>
            <Portlet
              headerContent={
                <Typography className={classes.headerTitle}>
                  Изменить адрес электронной почты
                </Typography>
              }
              footerContent={
                <div className={classes.loadingWrapper}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleChangeEmail}
                  >
                    Сохранить
                  </Button>
                  { changingEmail && 
                    <CircularProgress size={24} className={classes.buttonProgress} />
                  }
                </div>
              }
            >
              { emailStatus.message &&
                <MessageText success={emailStatus.success}>
                  { emailStatus.message }
                </MessageText>
              }
              <Grid container>
                <CustomTextField
                  label="Новый адрес"
                  inputRef={newEmailRef}
                  type="email"
                />
              </Grid>
            </Portlet>
          </Grid>
        </Grid>
      </DashboardLayout>
    </>
  );
}

Settings.getInitialProps = async ({ req }) => {
  const settings = req ? await getSettings(req.headers.cookie) : await getSettings();
  return { settings };
}

Settings.propTypes = {
  settings: PropTypes.object.isRequired
};

export default Settings;
