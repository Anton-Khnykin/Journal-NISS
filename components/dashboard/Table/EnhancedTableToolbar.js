import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Fade from '@material-ui/core/Fade';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import FilterListIcon from '@material-ui/icons/FilterList';
import Tooltip from '@material-ui/core/Tooltip';
import Checkbox from '@material-ui/core/Checkbox';
import Badge from '@material-ui/core/Badge';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const useToolbarStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1)
  },
  spacer: {
    flexGrow: 1
  },
  searchField: {
    width: 300
  },
  popper: {
    zIndex: 999
  },
  menuList: {
    padding: 0,
    maxHeight: 350,
    overflowX: 'auto'
  },
  menuItem: {
    paddingTop: 0,
    paddingBottom: 0
  },
  reset: {
    display: 'flex',
    justifyContent: 'flex-end',
    fontStyle: 'italic'
  }
}));

function EnhancedTableToolbar (props) {
  const classes = useToolbarStyles();
  const { fuse, onRequestFiltration, onRequestSearch, filterList, children } = props;
  const [searchValue, setSearchValue] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  let temp = {};
  filterList.forEach(item => temp[item.filter] = false);
  const [checked, setChecked] = useState(temp);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const anchorRef = useRef(null);
  const refSearch = useRef(null);

  useEffect(() => {
    if (isVisible) {
      refSearch.current.focus();
    }
  }, [isVisible]);

  const handleToggle = () => {
    setFilterMenuOpen(prevOpen => !prevOpen);
  }

  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setFilterMenuOpen(false);
  }

  const handleSearchBtnClick = () => {
    if (isVisible) {
      setIsVisible(false);
      setSearchValue('');
      onRequestSearch([], false);
    }
    else {
      setIsVisible(true);
    }
  }

  const handleSearchInputChange = event => {
    const value = event.target.value;
    setSearchValue(value);
    if (value.trim() === '') {
      onRequestSearch([], false);
      return;
    }
    const result = fuse.search(value);
    onRequestSearch(result, true);
  }

  const handleReset = () => {
    setFilterMenuOpen(false);
    const newFilter = {...checked};
    for (const item in newFilter) {
      newFilter[item] = false;
    }
    setChecked(newFilter);
    onRequestFiltration([]);
  }

  const handleChange = name => event => {
    let filter = {...checked};
    filter[name] = event.target.checked;
    let filters = [];
    for (const item in filter) {
      if (filter[item]) {
        filters.push(item);
      }
    }
    onRequestFiltration(filters);
    setChecked(filter);
  };

  const renderMenuList = () => {
    const elements = [];
    elements.push(
      <MenuItem
        key={"reset"}
        onClick={handleReset}
        className={classes.reset}
      >
        Сбросить
      </MenuItem>
    );
    for (const item of filterList) {
      elements.push(
        <MenuItem key={item.filter} className={classes.menuItem}>
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                value={item.filter}
                checked={checked[item.filter]}
                onChange={handleChange(item.filter)}
              />
            }
            label={item.label}
          />
        </MenuItem>
      );
    }
    return elements;
  }

  return (
    <Toolbar className={classes.root}>
      <Fade in={isVisible}>
        <TextField
          value={searchValue}
          onChange={handleSearchInputChange}
          inputRef={refSearch}
          type="search"
          margin="dense"
          placeholder="Поиск"
          className={classes.searchField}
        />
      </Fade>
      <div className={classes.spacer} />
      <Tooltip title="Поиск">
        <IconButton aria-label="Search" onClick={handleSearchBtnClick}>
          <SearchIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Фильтр по статусу">
        <IconButton
          aria-label="Filter list"
          aria-controls="menu-list-grow"
          aria-haspopup="true"
          ref={anchorRef}
          onClick={handleToggle}
        >
          <Badge
            invisible={!Object.values(checked).some(item => item)}
            color="primary"
            variant="dot"
          >
            <FilterListIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      {children}

      <Popper
        open={filterMenuOpen}
        anchorEl={anchorRef.current}
        transition
        disablePortal
        className={classes.popper}
        placement="bottom-end"
      >
        { ({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
          >
            <Paper square id="menu-list-grow">
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList className={classes.menuList}>
                  {renderMenuList()}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>

    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  fuse: PropTypes.object.isRequired,
  onRequestFiltration: PropTypes.func,
  onRequestSearch: PropTypes.func,
  filterList: PropTypes.array,
  children: PropTypes.any
};

export default EnhancedTableToolbar;
