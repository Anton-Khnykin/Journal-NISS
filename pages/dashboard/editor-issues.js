import React from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import DashboardLayout from 'components/dashboard/DashboardLayout';
import StatusChip from 'components/dashboard/StatusChip';
import CustomTable from 'components/dashboard/table/CustomTable';
import NextLink from 'components/NextLink';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import IconButton from '@material-ui/core/IconButton';
import ForwardIcon from '@material-ui/icons/Forward';
import { getIssues } from 'middleware/api/editor';
import { parseEditorIssuesTableData } from 'utils/table_data_parser';
import { ISSUE_STATUS } from 'middleware/enums';

const searchOptions = {
  threshold: 0.4,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 2,
  keys: [
    "number",
    "numberGeneral",
    "volume"
  ]
};

const filterList = [
  { filter: ISSUE_STATUS.CONSIDERATION_EDITOR, label: 'На рассмотрении' },
  { filter: ISSUE_STATUS.REJECTED_EDITOR, label: 'Отклонено' },
  { filter: ISSUE_STATUS.ACCEPTED_EDITOR, label: 'Принято' }
];

const headRows = [
  { id: 'empty' },
  { id: 'number', label: 'Номер', type: 'number' },
  { id: 'numberGeneral', label: 'Сквозной\xa0номер', type: 'number' },
  { id: 'volume', label: 'Том', type: 'number' },
  { id: 'creationDate', label: 'Дата\xa0создания', type: 'date' },
  { id: 'publicationDate', label: 'Дата\xa0публикации', type: 'date' },
  { id: 'status', label: 'Статус', type: 'string' }
];

const useTableRowStyles = makeStyles(theme => ({
  tableCell: {
    fontSize: '0.875rem',
    paddingRight: theme.spacing(2)
  },
  link: {
    color: 'inherit',
    textDecoration: 'none',
    '&:hover': {
      color: theme.palette.primary.main
    }
  }
}));

const IssueTableRow = ({ row }) => {
  const classes = useTableRowStyles();

  return (
    <TableRow hover tabIndex={-1}>
      <TableCell className={classes.tableCell} align="left" padding="checkbox" style={{paddingRight: 0}}>
        <IconButton
          component={NextLink}
          href={`/dashboard/editor-issue?slug=${row.id}`}
          hrefAs={`/dashboard/editor-issue/${row.id}`}
        >
          <ForwardIcon />
        </IconButton>
      </TableCell>
      <TableCell className={classes.tableCell} align="left">{row.number}</TableCell>
      <TableCell className={classes.tableCell} align="left">{row.numberGeneral}</TableCell>
      <TableCell className={classes.tableCell} align="left">{row.volume}</TableCell>
      <TableCell className={classes.tableCell} align="left">{row.creationDate}</TableCell>
      <TableCell className={classes.tableCell} align="left">{row.publicationDate}</TableCell>
      <TableCell className={classes.tableCell} align="left">
        <StatusChip
          statusOf="issue"
          status={row.status.id}
          label={row.status.name}
        />
      </TableCell>
    </TableRow>
  );
}

IssueTableRow.propTypes = {
  row: PropTypes.object.isRequired
};

function EditorIssues(props) {
  const { rows } = props;

  return (
    <>
      <Head>
        <title>Выпуски журнала | Панель управления</title>
      </Head>
      <DashboardLayout navBarTitle="Выпуски журнала">
        <CustomTable 
          rows={rows}
          headRows={headRows}
          CustomTableRow={IssueTableRow}
          searchOptions={searchOptions}
          defaultOrder='creationDate'
          emptyRowsText='Нет выпусков'
          filterList={filterList}
          filterProperty="status"
        />
      </DashboardLayout>
    </>
  );
}

EditorIssues.getInitialProps = async ({ req }) => {
  const issues = req ? await getIssues(req.headers.cookie) : await getIssues();
  return { rows: parseEditorIssuesTableData(issues) };
}

EditorIssues.propTypes = {
  rows: PropTypes.array.isRequired
};

export default EditorIssues;
