import React from 'react';
import PropTypes from 'prop-types';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort, headRows } = props;
  
  const createSortHandler = (property, type) => () => {
    onRequestSort(property, type);
  };

  return (
    <TableHead>
      <TableRow>
        {headRows.map(row => (
          row.id === 'empty' ? 
            <TableCell
              key={row.id}
              align="left"
              style={{ paddingRight: 16 }}
            />
            : 
            <TableCell
              key={row.id}
              align='left'
              style={{ paddingRight: 16 }}
              padding='default'
              sortDirection={orderBy === row.id ? order : false}
            >
              <TableSortLabel
                active={orderBy === row.id}
                direction={order}
                onClick={createSortHandler(row.id, row.type)}
              >
                {row.label}
              </TableSortLabel>
            </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  headRows: PropTypes.array.isRequired
};

export default EnhancedTableHead;