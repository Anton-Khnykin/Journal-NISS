import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import journalInfo from 'static/page_content/general.json';
import { editor } from 'static/page_content/board_page.json';

const useStyles = makeStyles(theme => ({
  footer: {
    marginTop: theme.spacing(4),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    backgroundColor: theme.palette.primary.main
  },
  grow: {
    flexGrow: 1
  },
  text: {
    color: theme.palette.secondary.light
  },
  link: {
    color: theme.palette.secondary.light,
    '&:hover':{
      textDecoration: 'none',
      color: theme.palette.secondary.dark
    }
  },
}));

function Footer() {
  const classes = useStyles();

  return (
    <footer className={classes.footer}>
      <Grid container className={classes.grow} justify="center" alignItems="center">
        <Grid item xs={10} className={classes.text}>
          <Typography>
            { journalInfo.journalName.value } { journalInfo.ISSN.value }
          </Typography>
          <Typography paragraph>
            Главный редактор { editor.name }{' '}
            <Link href={`mailto:${editor.email}`} className={classes.link}>
              { editor.email }
            </Link>
          </Typography>
          <Typography>
            Издательство { journalInfo.publishingHouse.value }{' '}
            <Link href={journalInfo.publishingHouse.link} className={classes.link}>
              { journalInfo.publishingHouse.link.split('//')[1] }
            </Link>
          </Typography>
        </Grid>
      </Grid>
    </footer>
    
  );
}

export default Footer;
