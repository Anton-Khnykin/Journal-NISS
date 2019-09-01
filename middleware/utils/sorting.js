
import { getTimestamp } from 'utils/data_parser';
const getSorting = (order, orderBy, dateSort) => {
  return order === 'desc' ?
    (a, b) => desc(a, b, orderBy, dateSort) :
    (a, b) => -desc(a, b, orderBy, dateSort);
}

const desc = (a, b, orderBy, dateSort) => {
  if (dateSort) {
    return  getTimestamp(b[orderBy]) < getTimestamp(a[orderBy]) ? -1 :
            getTimestamp(b[orderBy]) > getTimestamp(a[orderBy]) ? 1 : 0
  }
  return  b[orderBy] < a[orderBy] ? -1 :
          b[orderBy] > a[orderBy] ? 1 : 0
}

const stableSort = (array, cmp) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

module.exports = {
  getSorting, 
  stableSort
};