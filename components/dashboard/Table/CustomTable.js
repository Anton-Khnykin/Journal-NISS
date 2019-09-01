import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import EnhancedTableHead from './EnhancedTableHead';
import EnhancedTableToolbar from './EnhancedTableToolbar';
import NothingToDisplayText from 'components/dashboard/NothingToDisplayText';
import Fuse from 'fuse.js';
import { getSorting, stableSort } from 'utils/sorting';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2)
  },
  table: {
    minWidth: 750
  },
  tableWrapper: {
    overflowX: 'auto'
  }
}));

function CustomTable(props) {
  const classes = useStyles();
  const { rows,
          headRows,
          searchOptions,
          defaultOrder,
          filterList,
          filterProperty,
          emptyRowsText,
          ToolbarActions,
          CustomTableRow } = props;
  const [tableRows, setTableRows] = useState(rows);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState(defaultOrder);
  const [filter, setFilter] = useState([]);
  const [dateSort, setDateSort] = useState(false);
  const fuse = new Fuse(rows, searchOptions);

  useEffect(() => {
    if (tableRows.length <= rowsPerPage * page) {
      const newPage = page === 0 ? page : (page - 1);
      setPage(newPage);
    }
  }, [tableRows, rowsPerPage, page]);

  const handleRequestSort = (property, type) => {
    const isDesc = orderBy === property && order === 'desc';
    setDateSort(type === 'date');
    setOrder(isDesc ? 'asc' : 'desc');
    setOrderBy(property);
  }

  const handleRequestFilter = properties => {
    setFilter(properties);
  }

  const handleRequestSearch = (data, isFiltered) => {
    setTableRows(isFiltered ? data : rows);
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(+event.target.value);
  } 

  const getFiltration = data => {
    if (filter.length !== 0 && data.length !== 0) {
      if (typeof data[0][filterProperty] === 'number') {
        return data.filter(item => filter.includes(item[filterProperty].toString()));
      }
      else if (data[0][filterProperty] instanceof Array) {
        return data.filter(item => item[filterProperty].some(item2 => filter.includes(item2.toString())));
      }
      else if (data[0][filterProperty] instanceof Object) {
        return data.filter(item => filter.includes(item[filterProperty].id.toString()));
      }
    }
    return data;
  }

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, tableRows.length - page * rowsPerPage);
  
  return (
    <div className={classes.root}>
      <Paper square className={classes.paper}>
        <EnhancedTableToolbar
          fuse={fuse}
          onRequestSearch={handleRequestSearch}
          onRequestFiltration={handleRequestFilter}
          filterList={filterList}
        >
          {ToolbarActions && <ToolbarActions />}
        </EnhancedTableToolbar>
        <div className={classes.tableWrapper}>
          <Table className={classes.table}>
            <EnhancedTableHead
              headRows={headRows}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {rows.length === 0 ?
                <TableRow style={{ height: 49 * rowsPerPage }}>
                  <TableCell colSpan={7} align="left">
                    <NothingToDisplayText text={emptyRowsText} />
                  </TableCell>
                </TableRow>
                :
                <>
                  {getFiltration(stableSort(tableRows, getSorting(order, orderBy, dateSort)))
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map(row => (
                      <CustomTableRow key={row.id} row={row} />
                    ))}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 49 * emptyRows }}>
                      <TableCell colSpan={7} />
                    </TableRow>
                  )}
                </>
              }
            </TableBody>
          </Table>
        </div>
        <TablePagination
          component="div"
          labelRowsPerPage='Строк на странице'
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
          rowsPerPageOptions={[5, 10, 25]}
          count={tableRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          backIconButtonProps={{'aria-label': 'Предыдущая страница'}}
          nextIconButtonProps={{'aria-label': 'Следующая страница'}}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}

CustomTable.propTypes = {
  rows: PropTypes.array.isRequired,
  headRows: PropTypes.array.isRequired,
  searchOptions: PropTypes.object.isRequired,
  defaultOrder: PropTypes.string.isRequired,
  filterList: PropTypes.array.isRequired,
  filterProperty: PropTypes.string.isRequired,
  emptyRowsText: PropTypes.string,
  ToolbarActions: PropTypes.func,
  CustomTableRow: PropTypes.func.isRequired
};


export default CustomTable;
