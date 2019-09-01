import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import DialogContent from '@material-ui/core/DialogContent';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { GoogleLoginButton, FacebookLoginButton } from 'components/main/ThirdPartyLoginButtons';
import { login } from 'middleware/api/public';

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
  checkbox: {
    width: '100%'
  },
  avatar: {
    backgroundColor: theme.palette.primary.main
  },
  button: {
    marginTop: theme.spacing(2),
    height: '36.5px'
  }
}));

function Login() {
  const classes = useStyles();
  const [state, setState] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [ loginError, setLoginError ] = useState();

  const handleInputChange = event => {
    const value =
      event.target.type === 'checkbox' ? 
        event.target.checked
        : event.target.value;
    setState({
      ...state,
      [event.target.name]: value
    });
  }

  const handleLoginSubmit = async event => {
    event.preventDefault();
    const result = await login({
      email: state.email,
      password: state.password,
      rememberMe: state.rememberMe
    });

    result.status === 200 ? window.location.href = '/' : setLoginError(result.message);
  }

  const handleFocus = () => setLoginError(null);

  return (
    <DialogContent className={classes.content}>
      <Avatar className={classes.avatar}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography variant="h5" className={classes.title}>
        Вход
      </Typography>
      <form onSubmit={handleLoginSubmit}>
        <FormControl margin="dense" required fullWidth>
          <InputLabel htmlFor="email">
            { loginError ? loginError : 'Email адрес' }
          </InputLabel>
          <Input
            error={!!loginError}
            name="email"
            autoComplete="email"
            autoFocus
            onChange={handleInputChange}
            value={state.email}
            onFocus={handleFocus}
          />
        </FormControl>
        <FormControl margin="dense" required fullWidth>
          <InputLabel htmlFor="password">
            { loginError ? loginError : 'Пароль' }
          </InputLabel>
          <Input
            error={!!loginError}
            name="password"
            type="password"
            autoComplete="current-password"
            onChange={handleInputChange}
            value={state.password}
            onFocus={handleFocus}
          />
        </FormControl>
        <FormControlLabel
          control={<Checkbox value="remember" color="primary" />}
          className={classes.checkbox}
          label="Запомнить меня"
          value={state.rememberMe}
          name="rememberMe"
          onChange={handleInputChange}
        />
        <Button
          fullWidth
          color="primary"
          variant="contained"
          className={classes.button}
          type="submit"
        >
          Войти
        </Button>
      </form>
      <GoogleLoginButton
        href="/login/google"
        text="Войти с помощью Google"
        className={classes.button}
      />
      <FacebookLoginButton
        href="/login/facebook"
        text="Войти через Facebook"
        className={classes.button}
      />
    </DialogContent>
  );
}

export default Login;
