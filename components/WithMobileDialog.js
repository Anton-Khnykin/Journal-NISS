import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import withMobileDialog from '@material-ui/core/withMobileDialog';

const useStyles = makeStyles(() => ({
  fullHeight: {
    height: '100%'
  }
}));

function WithMobileDialog(props) {
  const classes = useStyles();
  const { fullScreen, maxWidth, open, onClose, className, title, children, fullHeight } = props;

  return (
    <Dialog
      fullScreen={fullScreen}
      maxWidth={maxWidth}
      fullWidth
      open={open}
      onClose={onClose}
      className={className}
      classes={ fullHeight ? { paper: classes.fullHeight } : {}}
    >
      {title !== undefined && <DialogTitle>{title}</DialogTitle>}
      {children}
    </Dialog>
  );
}

WithMobileDialog.propTypes = {
  fullScreen: PropTypes.bool.isRequired,
  maxWidth: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  className: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.any.isRequired,
  fullHeight: PropTypes.bool
};

export default withMobileDialog({breakpoint: 'xs'})(WithMobileDialog);
