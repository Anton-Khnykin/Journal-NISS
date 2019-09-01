import { createMuiTheme } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
import indigo from '@material-ui/core/colors/indigo';
import orange from '@material-ui/core/colors/orange';
import blue from '@material-ui/core/colors/blue';
import grey from '@material-ui/core/colors/grey';

const theme = createMuiTheme({
  palette: {
    /* common: {
      black: ,
      white: 
    }, */
    primary: {
       main: '#6f79a8', //#00796b
       light: '#9fa8da',
       dark: '#424d79'
    },
    secondary: {
      main: '#fafafa',
      light: '#ffffff',
      dark: '#c7c7c7'
    },
    error: {
      main: '#e57373',
      dark: '#ef5350'
    },
    status: {
      accepted: green[600],
      rejected: red[600],
      new: blue[800],
      other: indigo[800]
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      // secondary: "rgba(0, 0, 0, 0.54)"
      // disabled: "rgba(0, 0, 0, 0.38)"
      hint: "#c7c7c7"
    },
    /* background: {
      paper: 
      default: 
    } */
    icon: {
      main: grey[600]
    }
  },
  typography: {
    body2: {
      fontSize: '1rem',
    },
    body1: {
      fontSize: '0.875rem',
    },
    h6: {
      color: 'rgba(0, 0, 0, 0.87)'
    }
  },
  status: {
    success: green[400],
    error: red[400],
    info: indigo[400],
    warning: orange[400]
  }
});

export default theme;
