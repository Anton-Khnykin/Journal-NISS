import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import SaveIcon from '@material-ui/icons/Save';
import ClearIcon from '@material-ui/icons/Clear';

const useStyles = makeStyles(theme => ({
  paper: {
    height: theme.spacing(8),
    width: '100%',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    marginBottom: theme.spacing(3),
    display: 'flex'
  },
  flexContainer: {
    display: 'flex'
  },
  title: {
    display: 'flex',
    alignItems: 'center'
  },
  spacer: {
    flexGrow: 1
  },
}));

function IssueToolbar(props) {
  const classes = useStyles();
  const { onSave, onCancel, title, disabled } = props;

  return (
    <Paper square className={classes.paper}>
      <Typography variant="h6" noWrap className={classes.title}>
        {title}
      </Typography>
      <div className={classes.spacer}/>
      <Tooltip title="Сохранить">
        <div>
          <IconButton
            onClick={onSave}
            disabled={disabled}
          >
            <SaveIcon />
          </IconButton>
        </div>
      </Tooltip>
      <Tooltip title="Вернуться">
        <IconButton onClick={onCancel}>
          <ClearIcon />
        </IconButton>
      </Tooltip>
    </Paper>
  );
}

IssueToolbar.propTypes = {
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  disabled: PropTypes.bool
};

export default IssueToolbar;