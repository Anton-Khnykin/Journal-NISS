import React from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Layout from 'components/main/Layout';
import NextLink from 'components/NextLink';
import Download from 'components/Download';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { getIssue } from 'middleware/api/public';
import { getShortNames, getDate } from 'middleware/utils/data_parser';
import { journalName } from 'static/page_content/general.json';

const useStyles = makeStyles(theme => ({
  paper: {
    width: '100%',
    padding: theme.spacing(3)
  },
  button: {
    borderRadius: 0,
    marginBottom: theme.spacing(4)
  },
  cover: {
    width: '100%'
  },
  listItem: {
    '&:hover': {
      color: theme.palette.primary.main
    }
  }
}));

function Issue(props) {
  const classes = useStyles();
  const { issue } = props;

  const elements = [];
  for (const article of issue.articles) {
    elements.push(
      <ListItem
        key={article.file}
        button
        className={classes.listItem}
        component={NextLink}
        href={`/issue/article?slug=${article.article_id}`}
        hrefAs={`/issue/article/${article.article_id}`}
      >
        <ListItemText
          primary={
            <Typography color="inherit">
              { article.title_ru }
            </Typography>
          }
          secondary={
            <Typography color="textSecondary">
              { getShortNames(article.authors, 'ru') }
            </Typography>
          }
        />
        <ListItemSecondaryAction>
          <Typography color="textSecondary">
            { article.pages }&nbsp;с.
          </Typography>
        </ListItemSecondaryAction>
      </ListItem>
    );
  }

  const title = `Том\xa0${issue.volume.number}\xa0(${issue.volume.year}),\xa0№${issue.number}\xa0(${issue.number_general})`;

  return(
    <>
      <Head>
        <title>{ title } | { journalName.value }</title>
      </Head>
      <Layout>
        <Box
          component={Grid}
          container
          item sm={12} md={9}
          pr={{ sm: 0, md: 2 }}
          mt={4}
        >
          <Paper square className={classes.paper}>
            <Typography variant="h6">
              { title }
            </Typography>
            <Box
              component={Typography}
              variant="body2"
              fontWeight={500}
              pt={3}
            >
              Содержание&nbsp;выпуска
            </Box>
            <List>
              { elements }
            </List>
          </Paper>
        </Box>
        <Box
          component={Grid}
          container
          item sm={12} md={3}
          alignContent="flex-start"
          pl={{ sm: 0, md: 2 }}
          mt={4}
        >
          <Box
            component={Grid}
            container
            item xs={6} md={12}
            pr={{ xs: 4, md: 0 }}
          >
            <Paper square className={classes.paper}>
              <img src={issue.cover} className={classes.cover} />
            </Paper>
          </Box>
          <Box
            component={Grid}
            container
            item xs={6} md={12}
            mt={{ sm: 0, md: 4 }}
            alignContent="flex-start"
          >
            <Grid container item xs={12}>
              <Download fileId={issue.file} fullWidth>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.button}
                >
                  Скачать выпуск
                </Button>
              </Download>
            </Grid>
            <Grid container item xs={12}>
              <Paper square className={classes.paper}>
                <Box
                  component={Typography}
                  variant="body2"
                  paragraph
                  fontWeight={500}
                >
                  Дата&nbsp;публикации
                </Box>
                <Typography>
                  { getDate(issue.publication_date) }
                </Typography>
              </Paper>
            </Grid>
          </Box>
        </Box>
      </Layout>
    </>
  );
  
}

Issue.getInitialProps = async ({ query }) => {
  const issue = await getIssue(query.slug);
  return { issue };
}

Issue.propTypes = {
  issue: PropTypes.object.isRequired
};

export default Issue;
