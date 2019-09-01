import React from 'react';
import App, { Container } from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from '../mui_theme';
import Auth from 'utils/auth';

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};
    
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);

      if (!pageProps) {
        pageProps = {};
      }
    }

    if (ctx.req) {
      pageProps.user = {
        isAuthenticated: ctx.req.isAuthenticated(),
        roles: ctx.req.user ? ctx.req.user.roles : null
      };
    }

    return { pageProps };
  }

  componentDidMount() {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      user: props.pageProps.user
    };
  }

  render() {
    const { Component, pageProps } = this.props;
    const { user } = this.state;

    return (
      <Container>
        <Head>
          <title>
            Журнал Сибирского Федерального Университета
          </title>
        </Head>
        <ThemeProvider theme={theme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <Auth.Provider value={user}>
            <Component {...pageProps} />
          </Auth.Provider>
        </ThemeProvider>
      </Container>
    );
  }
}

export default MyApp;
