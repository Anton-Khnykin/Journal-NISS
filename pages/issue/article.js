import React, { useState } from 'react';
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
import Link from '@material-ui/core/Link';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Divider from '@material-ui/core/Divider';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import grey from '@material-ui/core/colors/grey';
import { getArticle } from 'middleware/api/public';
import { getFullName, getShortNames, getDate } from 'utils/data_parser';
import { journalName } from 'static/page_content/general.json';

const useStyles = makeStyles(theme => ({
  paper: {
    width: '100%',
    padding: theme.spacing(3)
  },
  subTitle: {
    color: grey[700],
    fontWeight: 500,
    paddingBottom: theme.spacing(5)
  },
  divider: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4)
  },
  tabs: {
    paddingBottom: theme.spacing(4)
  },
  stickyBlock: {
    position: 'sticky',
    top: theme.spacing(4)
  },
  button: {
    borderRadius: 0
  },
  keyWord: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  panelSummaryContent: {
    display: 'flex',
    flexDirection: 'column'
  },
  panelSummary: {
    minHeight: 20
  },
  verticalDividerContainer: {
    width: theme.spacing(2)
  },
  verticalDivider: {
    width: 2,
    height: '100%'
  },
  issueLink: {
    textDecoration: 'none',
    '&:hover': {
      color: theme.palette.primary.main
    }
  }
}));

function Article(props) {
  const classes = useStyles();
  const { article } = props;
  const [ metaTab, setMetaTab ] = useState('meta_ru');

  const handleMetaTabChange = (event, newValue) => {
    setMetaTab(newValue);
  }

  const SubTitle = label => (
    <Box
      component={Typography}
      variant="body2"
      noWrap
      paragraph
      fontWeight={500}
    >
      {label}
    </Box>
  );

  const getAuthors = () => {
    return article.authors.map(author => (
      <ExpansionPanel elevation={0} key={author.contact_email}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          className={classes.panelSummary}
          classes={{
            content: classes.panelSummaryContent,
            root: classes.panelSummary
          }}
        >
          <Box component={Typography} width={1}>
            { getFullName(author, 'ru') }
          </Box>
          <Typography color="textSecondary">
            { getFullName(author, 'en') }
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Box pl={2} display="flex">
            <div className={classes.verticalDividerContainer}>
              <Divider className={classes.verticalDivider} />
            </div>
            <div>
              { author.organizations.map(org => (
                <Typography key={author.contact_email + org.organization_name_ru} color="textPrimary">
                  { org.organization_name_ru }
                </Typography>
              ))}
              { author.organizations.map(org => (
                <Typography key={author.contact_email + org.organization_name_en} color="textSecondary">
                  { org.organization_name_en }
                </Typography>
              ))}
              <Typography color="textPrimary">
                { author.academic_title
                  ? author.academic_title.name_ru
                  : ''
                }
              </Typography>
              <Typography color="textSecondary">
                { author.academic_title
                  ? author.academic_title.name_en
                  : ''
                }
              </Typography>
              <Typography color="textPrimary">
                { author.academic_degree
                  ? author.academic_degree.name_ru
                  : ''
                }
              </Typography>
              <Typography color="textSecondary">
                { author.academic_degree
                  ? author.academic_degree.name_en
                  : ''
                }
              </Typography>
            </div>
          </Box>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    ))
  }

  const getPrimaryContact = () => {
    const primary = article.authors.find(item => item.is_primary_contact);
    return (
      <>
        <Box noWrap component={Typography} width={1}>
          {getFullName(primary, 'ru')}
        </Box>
        <Box noWrap component={Typography} width={1}>
          <Link className={classes.link} href={`mailto:${primary.contact_email}`}>
            { primary.contact_email }
          </Link>
        </Box>
      </>
    );
  }

  const getMetadata = lang => {
    return (
      <Grid container item xs={12}>
        { SubTitle("Аннотация") }
        <Box component={Typography} paragraph>
          { article.submission[`abstract_${lang}`] }
        </Box>
        { SubTitle("Ключевые\xa0слова") }
        <Box width={1} pb={1.5}>
          { article.submission[`keywords_${lang}`].map((word, index) => (
            <Chip
              key={word + index}
              label={word}
              className={classes.keyWord}
              color="default"
              variant="default"
            />
          ))}
        </Box>
        { SubTitle("Как\xa0цитировать") }
        <Box component={Typography} style={{ width: '100%' }} paragraph>
          { getShortNames(article.authors, lang) + ' ' +
            article.submission[`title_${lang}`] + '. ' +
            journalName.value + '.'
          }
        </Box>
      </Grid>
    )
  }

  return(
    <>
      <Head>
        <title>{ article.submission.title_ru } | { article.authors[0].last_name_ru } | { journalName.value }</title>
        <meta name="citation_title" content={`${article.submission.title_ru} ${journalName.value}`} />
        { article.authors.map((author, index) => (
            <meta key={'author' + index} name="citation_author" content={getFullName(author, 'ru')} />
          ))
        }
        <meta name="citation_publication_date" content={getDate(article.issue.publication_date)} />
        <meta name="citation_journal_title" content={journalName.value} />
        <meta name="citation_volume" content={article.issue.volume.number} />
        <meta name="citation_issue" content={article.issue.number} />
        <meta name="citation_firstpage" content={article.pages.split('-')[0]} />
        <meta name="citation_lastpage" content={article.pages.split('-')[1]} />
        <meta name="description" content={article.submission['abstract_ru']} />
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
            <Typography variant="h6" component="h1" paragraph>
              { article.submission.title_ru }
            </Typography>
            <Typography component="h1" variant="body2" className={classes.subTitle}>
              { article.submission.title_en }
            </Typography>

            { SubTitle("Авторы\xa0статьи") }
            <div>
              { getAuthors() }
            </div>

            <Divider className={classes.divider} />

            <Tabs
              value={metaTab}
              indicatorColor="primary"
              textColor="primary"
              centered
              onChange={handleMetaTabChange}
              className={classes.tabs}
            >
              <Tab value="meta_ru" label="Метаданные на русском" />
              <Tab value="meta_en" label="Метаданные на английском" />
            </Tabs>

            {metaTab === 'meta_ru' && getMetadata('ru')}
            {metaTab === 'meta_en' && getMetadata('en')}
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
        <Grid container item className={classes.stickyBlock}>
          <Box
            component={Grid}
            container
            item xs={12} sm={6} md={12}
            pr={{ sm: 4, md: 0 }}
            alignContent="flex-start"
          >
            <Box width={1} pb={4}>
              <Paper square className={classes.paper}>
                <NextLink
                  href={`/issue?slug=${article.issue.issue_id}`}
                  hrefAs={`/issue/${article.issue.issue_id}`}
                  className={ classes.issueLink }
                >
                  <Typography variant="h6" noWrap className={classes.issueLink}>
                    {`Том\xa0${article.issue.volume.number}\xa0(${article.issue.volume.year}),\xa0№${article.issue.number}\xa0(${article.issue.number_general})`}
                  </Typography>
                </NextLink>
              </Paper>
            </Box>
            <Box width={1} pb={{ xs: 4 }}>
              <Download fileId={article.file}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.button}
                >
                  Скачать статью
                </Button>
              </Download>
            </Box>
            <Box width={1} pb={4}>
              <Paper square className={classes.paper}>
                { SubTitle("Дата\xa0публикации") }
                <Typography>
                  { getDate(article.issue.publication_date) }
                </Typography>
              </Paper>
            </Box>
            <Box width={1} pb={4}>
              <Paper square className={classes.paper}>
                <Box component={Typography} variant="body2" fontWeight={500} display="flex">
                  Страницы
                  <span style={{ marginLeft: 'auto' }}>
                    { article.pages }
                  </span>
                </Box>
              </Paper>
            </Box>
          </Box>

          <Box
            component={Grid}
            container
            item xs={12} sm={6} md={12}
            alignContent="flex-start"
          >
            <Paper square className={classes.paper}>
              { SubTitle("Корреспондирующий\xa0автор") }
              { getPrimaryContact() }
            </Paper>
          </Box>
        </Grid>
        </Box>
      </Layout>
    </>
  );
}

Article.getInitialProps = async ({ query }) => {
  const article = await getArticle(query.slug);
  return { article };
}

Article.propTypes = {
  article: PropTypes.object.isRequired
};

export default Article;
