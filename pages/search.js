import React, { useContext, createRef } from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Layout from 'components/main/Layout';
import Typography from '@material-ui/core/Typography';
import PaperBlock from 'components/main/PaperBlock';
import Search from '@material-ui/icons/Search';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import NextLink from 'components/NextLink';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Auth from 'utils/auth';
import JournalInfo from 'static/page_content/general.json';
import { search } from 'middleware/api/public';
import NothingToDisplayText from 'components/dashboard/NothingToDisplayText';
import Router from 'next/router';
import { isInvalidDate, cleanSearchQuery } from 'utils/validation';

const useSearchResultStyles = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(2)
  },
  title: {
    fontSize: '1.2rem',
    color: 'rgba(0, 0, 0, 0.87)',
    textDecoration: 'none',
    '&:hover': {
      color: theme.palette.primary.main,
      textDecoration: 'underline'
    }
  },
  authors: {
    color: 'rgba(0, 0, 0, 0.87)',
    fontStyle: 'italic'
  },
  abstract: {
    color: 'rgba(0, 0, 0, 0.77)'
  }
}));

function SearchResult({ article }) {
  const classes = useSearchResultStyles();
  const { title_ru, id, authors } = article;
  let { abstract_ru } = article; 

  if (abstract_ru.charAt(0) === abstract_ru.charAt(0).toLowerCase()) {
    abstract_ru = '... ' + abstract_ru;
  }
  if (!/[.!?]/.test(abstract_ru.charAt(abstract_ru.length - 1))) {
    abstract_ru += ' ...';
  }

  return (
    <Grid className={classes.root}>
      <NextLink
        href={`/issue/article?slug=${id}`}
        hrefAs={`/issue/article/${id}`}
        className={classes.title}
      >
        <Typography
          className={classes.title}
          gutterBottom
          dangerouslySetInnerHTML={{ __html: title_ru }}
        />
      </NextLink>
      <Typography
        className={classes.authors}
        gutterBottom
        dangerouslySetInnerHTML={{ __html: authors }}
      />
      <Typography
        className={classes.abstract}
        dangerouslySetInnerHTML={{ __html: abstract_ru }}
      />
    </Grid>
  );
}

SearchResult.propTypes = {
  article: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array
  ]).isRequired
};

function FilterTextField(props) {
  return (
    <TextField
      variant="outlined"
      margin="dense"
      style={{opacity: '0.75'}}
      {...props}
    />
  )
}

FilterTextField.propTypes = {
  name: PropTypes.string.isRequired,
  type:PropTypes.string.isRequired,
  value: PropTypes.string
};

function LabeledBox(props) {
  const { label, children } = props;
  
  return (
    <Box component={Grid} item display="flex" alignItems="center">
      <Box component={Typography} pr={children ? 2 : 0} style={{fontSize: '1rem'}}>
        { label }
      </Box>
      { children }
    </Box>
  );
}

LabeledBox.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string,
  children: PropTypes.any
};

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1
  },
  search: {
    opacity: '0.55',
    marginRight: 10
  },
  paperBlock: {
    marginBottom: theme.spacing(3)
  },
  searchField: {
    margin: 0
  },
  dateFields: {
    marginTop: theme.spacing(1)
  },
  '@global': {
    '.attention': {
      fontWeight: 700,
      color: theme.palette.primary.main
    }
  },
  divider: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4)
  }
}));

function SearchPage(props) {
  const classes = useStyles();
  const { articles, textSearch, from, to } = props;
  const { isAuthenticated } = useContext(Auth);
  const textSearchRef = createRef();
  const fromRef = createRef();
  const toRef = createRef();
  
  const handleSubmit = event => {
    event.preventDefault();
    const query = cleanSearchQuery(textSearchRef.current.value, ' ');
    if (query.length !== 0) {
      Router.push(`/search?query=${query}&from=${fromRef.current.value}&to=${toRef.current.value}`);
    }
  }

  return (
    <>
      <Head>
        <title>{`Поиск | ${JournalInfo.journalName.value}`}</title>
        <meta name="description" content={`На странице поиска можно найти все статьи журнала ${JournalInfo.journalName.value}`} />
      </Head>

      <Layout isAuthenticated={isAuthenticated}>
        <PaperBlock
          title="Поиск по журналу"
          className={classes.paperBlock}
        >
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              autoFocus
              inputRef={textSearchRef}
              defaultValue={textSearch}
              placeholder="Поиск по всем категориям"
              variant="outlined"
              margin="normal"
              type="search"
              name="query"
              id="search field"
              className={classes.searchField}
              InputProps={{
                startAdornment: <Search className={classes.search} />,
                endAdornment: <Button color="primary" type="submit">Поиск</Button>
              }}
            />
            <Grid
              container
              spacing={2}
              className={classes.dateFields}
            >
              <LabeledBox label="Фильтрация по дате:" />
              <LabeledBox label="от">
                <FilterTextField
                  type="date"
                  name="from"
                  inputRef={fromRef}
                  defaultValue={from}
                />
              </LabeledBox>
              <LabeledBox label="до">
                <FilterTextField
                  type="date"
                  name="to"
                  inputRef={toRef}
                  defaultValue={to}
                />
              </LabeledBox>
            </Grid>
          </form>
          <Divider className={classes.divider} />
          { articles && articles.length > 0
            ?
            articles.map(article => (
              <SearchResult
                key={article.title_ru}
                article={article}
              />
            ))
            :
            articles instanceof Array &&
            <NothingToDisplayText text="Ничего не найдено" />
          }
        </PaperBlock>
      </Layout>
    </>
  );
}

SearchPage.getInitialProps = async ({ query, pathname, asPath }) => {
  let articles;
  let searched;
  if (Object.keys(query).length !== 0) {
    const q = asPath.substring(pathname.length);
    if (query) {
      articles = await search(q);
    }

    searched = {
      textSearch: query.query,
      from: isInvalidDate(query.from) ? '' : query.from,
      to: isInvalidDate(query.to) ? '' : query.to
    }
  }

  return { articles, ...searched };
}

SearchPage.propTypes = {
  articles: PropTypes.array,
  textSearch: PropTypes.string,
  from: PropTypes.string,
  to: PropTypes.string
};

export default SearchPage;
