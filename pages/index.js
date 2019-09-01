import React, { useState } from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Layout from 'components/main/Layout';
import PaperBlock from 'components/main/PaperBlock';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import CircularProgress from '@material-ui/core/CircularProgress';
import BioCover from "static/bio_cover.jpg"
import dynamic from 'next/dynamic';
import content from 'static/page_content/main_page.json';
import { journalName } from 'static/page_content/general.json';

const ErrorSnackbar = dynamic(
  () => import('components/dashboard/StyledSnackbar'),
  {
    // eslint-disable-next-line react/display-name
    loading: () => <CircularProgress size={24} />,
    ssr: false
  });

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1
  },
  journalCover: {
    display: 'block',
    maxWidth: '100%',
    [theme.breakpoints.down('sm')]: {
      display: 'block',
      maxWidth: 'none',
      width: 'auto',
      height: 'auto'
    }
  },
  text: {
    fontWeight: 500,
    marginBottom: theme.spacing(1)
  },
  email: {
    color: theme.palette.primary.dark,
    '&:hover': {
      textDecoration: 'none',
      color: theme.palette.primary.light
    }
  },
  '@global': {
    '.attention': {
      fontWeight: 500,
      color: theme.palette.primary.main
    }
  }
}));

function MainPage(props) {
  const classes = useStyles();
  const { loginOpen } = props;
  const [ loginError, setLoginError ] = useState(props.loginError);

  return (
    <>
      <Head>
        <title>О журнале | { journalName.value }</title>
        <meta name="description" content={content.description} />
      </Head>
      <Layout loginOpen={loginOpen}>
        <PaperBlock title='О&nbsp;журнале'>
          <Grid container item spacing={3} className={classes.grow} justify="flex-start">
            <Grid item md={3}>
              <img src={BioCover} className={classes.journalCover} />
            </Grid>
            <Grid item md={9}>
              { content.about.map((item, index) => (
                <>
                  { item.title &&
                    <Typography
                      key={item.title}
                      variant="h6"
                      component="h2"
                      paragraph
                      dangerouslySetInnerHTML={{ __html: item.title }}
                    />
                  }
                  {item.text &&
                    <Typography
                      key={item.text}
                      paragraph={index !== content.about.length - 1}
                      dangerouslySetInnerHTML={{ __html: item.text }}
                    />
                  }
                </>
              ))}
            </Grid>
          </Grid>
        </PaperBlock>
        <PaperBlock title={'Контакты\xa0редакции журнала'}>
          <Grid item container spacing={3} className={classes.grow} justify="space-between">
            { content.contacts.map(contact => (
              <>
                <Grid item lg={4}>
                  <Typography
                    variant="body2"
                    className={classes.text}
                    dangerouslySetInnerHTML={{ __html: contact.name }}
                  />
                  <Typography
                    className={classes.text}
                    dangerouslySetInnerHTML={{ __html: contact.position }}
                  />
                  {(contact.email || contact.phone) &&
                    <Typography>
                      { contact.email &&
                        <>
                          e-mail:&nbsp;
                          <Link href={`mailto:${contact.email}`} className={classes.email}>
                            { contact.email }
                          </Link>
                          <br/>
                        </>
                      }
                      { contact.phone &&
                        <>
                          тел.:&nbsp;
                          <span dangerouslySetInnerHTML={{ __html: contact.phone }}/>
                        </>
                      }
                    </Typography>
                  }
                </Grid>
              </>
            ))}
          </Grid>
        </PaperBlock>

        { loginError &&
          <ErrorSnackbar
            message={loginError.message}
            onClose={() => setLoginError(false)}
            variant="error"
            open={true}
          />
        }

      </Layout>
    </>
  );
}

MainPage.getInitialProps = async ({ req, query }) => {
  // Открытие окна логина при 302
  if (query.unauthorized === 'true' && !req.isAuthenticated()) {
    return { loginOpen: true };
  }

  // Ошибки авторизации через сторонние сайты
  if (query.fail === 'google') {
    return {
      loginError: {
        which: 'google',
        message: 'Ошибка входа через Google.'
      }
    };
  }
  else if (query.fail === 'facebook') {
    return {
      loginError: {
        which: 'google',
        message: 'Ошибка входа через Facebook.'
      }
    };
  }
}

MainPage.propTypes = {
  loginOpen: PropTypes.bool,
  loginError: PropTypes.object
};

export default MainPage;
