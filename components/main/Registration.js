import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import DialogContent from '@material-ui/core/DialogContent';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Typography from '@material-ui/core/Typography';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import IconCheck from '@material-ui/icons/Check';
import IconRegister from '@material-ui/icons/HowToReg';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import { GoogleLoginButton, FacebookLoginButton } from 'components/main/ThirdPartyLoginButtons';
import { registration } from 'middleware/api/public';

const useStyles = makeStyles(theme => ({
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(3)
  },
  title: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  avatar: {
    backgroundColor: theme.palette.primary.main
  },
  button: {
    marginTop: theme.spacing(2),
    height: '36.5px'
  }
}));

function Registration() {
  const classes = useStyles();
  const [state, setState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordVerify: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = event => {
    setState({ ...state, [event.target.name]: event.target.value });
  }

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleRegisterSubmit = event => {
    event.preventDefault();
    registration({
      first_name: state.firstName,
      last_name: state.lastName,
      email: state.email,
      password: state.password,
      verify: state.passwordVerify,
    })
      .then(() => {
        window.location.href = '/';
      });
  }

  return (
    <DialogContent className={classes.content}>
      <Avatar className={classes.avatar}>
        <IconRegister />
        </Avatar>
      <Typography variant="h5" className={classes.title}>
        Регистрация
      </Typography>
      <form onSubmit={handleRegisterSubmit}>
        <Grid container justify="center">
          <Box component={Grid} item xs={12} sm={6} pr={{sm: 1}}>
            <FormControl margin="dense" required fullWidth>
              <InputLabel>
                Имя
              </InputLabel>
              <Input
                autoFocus
                name="firstName"
                onChange={handleInputChange}
                value={state.firstName}
              />
            </FormControl>
          </Box>
          <Box component={Grid} item xs={12} sm={6} pl={{sm: 1}}>
            <FormControl margin="dense" required fullWidth>
              <InputLabel>
                Фамилия
              </InputLabel>
              <Input
                name="lastName"
                onChange={handleInputChange}
                value={state.lastName}
              />
            </FormControl>
          </Box>
          <FormControl margin="dense" required fullWidth>
            <InputLabel htmlFor="email">
              Email адрес
            </InputLabel>
            <Input
              name="email"
              onChange={handleInputChange}
              value={state.email}
            />
          </FormControl>
          <Box component={Grid} item xs={12} sm={6} pr={{sm: 1}}>
            <FormControl margin="dense" required fullWidth>
              <InputLabel htmlFor="password">
                Пароль
              </InputLabel>
              <Input 
                name="password" 
                type={showPassword ? 'text' : 'password'}
                value={state.password}
                onChange={handleInputChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} tabIndex={-1}>
                      { showPassword ? <Visibility /> : <VisibilityOff /> }
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          </Box>
          <Box component={Grid} item xs={12} sm={6} pl={{sm: 1}}>
            <FormControl margin="dense" required fullWidth>
              <InputLabel htmlFor="password">
                Подтвердить
              </InputLabel>
              <Input
                name="passwordVerify"
                type={showPassword ? 'text' : 'password'}
                value={state.passwordVerify}
                onChange={handleInputChange}
                endAdornment={
                  <InputAdornment position="end">
                    { ((state.password === state.passwordVerify) && state.password !== '') && <IconCheck />}
                  </InputAdornment>
                }
              />
            </FormControl>
          </Box>
        </Grid>
        <Button
          fullWidth
          color="primary"
          variant="contained"
          className={classes.button}
          type="submit"
        >
          Загеристрироваться
        </Button>
      </form>
      <GoogleLoginButton
        href="/login/google" 
        text="Зарегистрироваться с помощью Google"
        className={classes.button}
      />
      <FacebookLoginButton
        href="/login/facebook"
        text="Регистрация через Facebook"
        className={classes.button}
      />
    </DialogContent>
  );
}

export default Registration;
