import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import NextLink from 'components/NextLink';
import { getDate } from 'utils/data_parser';

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1
  },
  card: {
    display: 'flex'
  },
  details: {
    display: 'flex',
    flexDirection: 'column'
  },
  content: {
    flex: '1 0 auto',
    padding: theme.spacing(2)
  },
  controls: {
    padding: theme.spacing(2)
  },
  cover: {
    width: 150
  }
}));

function IssueCard(props) {
  const classes = useStyles();
  const { issue, href, hrefAs } = props;

  return (
    <Card className={classes.card} square>
      <div className={classes.details}>
        <CardContent className={classes.content}>
          <Typography variant="h5">
            №{ issue.number }&nbsp;({issue.number_general})
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            { getDate(issue.publication_date) }
          </Typography>
        </CardContent>
        <div className={classes.controls}>
          <Button
            component={NextLink}
            href={href}
            hrefAs={hrefAs}
            variant="outlined"
            color="primary"
            size="small"
          >
            Перейти
          </Button>
        </div>
      </div>
      <div className={classes.grow} />
      { issue.cover &&
        <CardMedia className={classes.cover} image={issue.cover} title="Обложка номера" />
      }
    </Card>
  );
}

IssueCard.propTypes = {
  issue: PropTypes.object.isRequired,
  href: PropTypes.string.isRequired,
  hrefAs: PropTypes.string
};

export default IssueCard;
