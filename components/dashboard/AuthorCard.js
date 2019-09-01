import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Close from '@material-ui/icons/Close';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import InputAdornment from '@material-ui/core/InputAdornment';
import Tooltip from '@material-ui/core/Tooltip';
import { replaceNull } from 'utils/validation';

const useStyles = makeStyles((theme) => ({
  authorName: {
    flexGrow: 1,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center'
  },
  deleteButton: {
    height: 22,
    width: 22,
    '&:hover': {
      backgroundColor: 'inherit',
      color: theme.palette.primary.dark
    }
  },
  name: {
    fontWeight: 400
  },
  header: {
    display: 'flex'
  }
}));

function AuthorCard(props) {
  const classes = useStyles();
  const {
    firstName,
    lastName,
    middleName,
    posInCredits,
    positions,
    onAuthorPosInCreditsChange,
    onClick,
    onClickDelete,
    isPrimaryContact,
    onPrimaryContactChange,
    readOnlyMode
  } = props;

  return (
    <Card>
      <CardContent>
        <div className={classes.header}>
          <Tooltip title="Корреспондирующий автор" style={{marginRight: 0}}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isPrimaryContact}
                  onChange={onPrimaryContactChange}
                  color="primary"
                  disabled={readOnlyMode}
                />
              }
            />
          </Tooltip>
          <div className={classes.authorName}>
            <Typography variant="h6" noWrap className={classes.name}>
              { replaceNull(lastName) + ' ' + replaceNull(firstName) + ' ' + replaceNull(middleName) }
            </Typography>
          </div>
          { !readOnlyMode &&
            <IconButton
              disableRipple
              className={classes.deleteButton}
              onClick={onClickDelete} 

            >
              <Close />
            </IconButton>
          }
        </div>
      </CardContent>
      <CardActions>
        <Grid container justify="space-between" alignItems="center">
          <Grid item>
            <Button onClick={onClick}>
              { readOnlyMode ? 'Подробнее' : 'Изменить' }
            </Button>
          </Grid>
          <Grid item>
            <Tooltip title="Позиция в авторах" placement="right">
              <TextField
                select
                value={posInCredits}
                onChange={onAuthorPosInCreditsChange}
                className={classes.test}
                id="pos-in-credits"
                InputProps={{
                  startAdornment: <InputAdornment position="start">#</InputAdornment>,
                  disableUnderline: true,
                  readOnly: readOnlyMode
                }}
              >
                <MenuItem value=" " />
                { positions.map(value => (
                    <MenuItem value={value} key={value}>
                      { value }
                    </MenuItem>
                  ))
                }
              </TextField>
            </Tooltip>
          </Grid>
        </Grid>
      </CardActions>
    </Card>
  )
}

AuthorCard.propTypes = {
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  middleName: PropTypes.string,
  posInCredits: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  positions: PropTypes.array.isRequired,
  onAuthorPosInCreditsChange: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  onClickDelete: PropTypes.func.isRequired,
  isPrimaryContact: PropTypes.bool,
  onPrimaryContactChange: PropTypes.func.isRequired,
  readOnlyMode: PropTypes.bool
};

export default AuthorCard;
