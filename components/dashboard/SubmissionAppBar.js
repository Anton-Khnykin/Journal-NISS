import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography'
import Hidden from '@material-ui/core/Hidden'

const useStyles = makeStyles(theme => ({
  appBar: {
    backgroundColor: theme.palette.secondary.light
  },
  indicator: {
    backgroundColor: theme.palette.secondary.light,
    height: 0
  },
  tab: { 
    minHeight: 0,
    height: 48
  },
  tabLabel: {
    fontWeight: 500
  },
  wrapper: {
    '& > :first-child': {
      marginBottom: '0 !important'
    }
  }
}));

function SubmissionAppBar(props) {
  const classes = useStyles();
  const { tabs, value, onChange } = props;

  return (
    <>  
      <AppBar position="static" className={classes.appBar} elevation={0}>
        <Tabs
          centered
          value={value}
          onChange={onChange}
          textColor="primary"
          classes={{ indicator: classes.indicator }}
        >
          { tabs.map(tab => (
            <Tab
              key={tab.label}
              classes={{
                labelIcon: classes.tab,
                wrapper: classes.wrapper
              }}
              label={
                <Hidden xsDown>
                  <Typography className={classes.tabLabel}>
                    {tab.label}
                  </Typography>
                </Hidden>
              }
              icon={
                <Hidden smUp>
                  {tab.icon}
                </Hidden>
              }
            />
          ))}
        </Tabs>
      </AppBar>
      <Divider />
    </>
  )
}

SubmissionAppBar.propTypes = {
  tabs: PropTypes.array.isRequired,
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired
}

export default SubmissionAppBar;