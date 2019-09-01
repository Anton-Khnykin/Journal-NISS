import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import NextLink from '../NextLink';

const styles = theme => ({
  nested: {
    paddingLeft: theme.spacing(4)
  },
  listItemText: {
    fontSize: '0.875rem'
  }
});

class ListMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = { open: true }
  }

  handleClick = () => {
    this.setState({ open: !this.state.open });
  }

  render() {
    const { 
      pathname,
      classes,
      parentNodeText,
      parentNodeIcon,
      listItemIcons,
      listItemTexts,
      listItemLinks, } = this.props;
    const { open } = this.state;

    const listItems = [];
    for (let i = 0; i < listItemTexts.length; i++) {
      listItems.push(
        <ListItem
          button
          className={classes.nested}
          key={i}
          component={NextLink}
          href={listItemLinks[i]}
          selected={pathname === listItemLinks[i]}
        >
          <ListItemIcon>
            { listItemIcons[i] }
          </ListItemIcon>
          <ListItemText 
            primary={listItemTexts[i]}
            classes={{primary:classes.listItemText}}
          />
        </ListItem>
      );
    }

    return (
      <List disablePadding>
        <ListItem button onClick={this.handleClick}>
          <ListItemIcon>
            { parentNodeIcon }
          </ListItemIcon>
          <ListItemText
            primary={parentNodeText}
            classes={{primary:classes.listItemText}}
          />
          { this.state.open ? <ExpandLess /> : <ExpandMore /> }
        </ListItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            { listItems }
          </List>
        </Collapse>
      </List>
    );
  }
}

ListMenu.propTypes = {
  classes: PropTypes.object.isRequired,
  parentNodeText: PropTypes.string.isRequired,
  parentNodeIcon: PropTypes.object.isRequired,
  listItemIcons: PropTypes.arrayOf(PropTypes.element).isRequired,
  listItemTexts: PropTypes.arrayOf(PropTypes.string).isRequired,
  listItemLinks: PropTypes.arrayOf(PropTypes.string),
  pathname: PropTypes.string
};

export default withStyles(styles, { withTheme: true })(ListMenu);
