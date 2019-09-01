import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { makeStyles } from '@material-ui/core/styles';
import DashboardLayout from 'components/dashboard/DashboardLayout';
import NothingToDisplayText from 'components/dashboard/NothingToDisplayText';
import StatusChip from 'components/dashboard/StatusChip';
import CustomTable from 'components/dashboard/table/CustomTable';
import NextLink from 'components/NextLink';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import IconButton from '@material-ui/core/IconButton';
import ForwardIcon from '@material-ui/icons/Forward';
import { getSubmissions } from 'middleware/api/secretary';
import { parseSubmissionsTableData } from 'utils/table_data_parser';
import { SUBMISSION_STATUS } from 'middleware/enums';

const searchOptions = {
  threshold: 0.4,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 2,
  keys: [
    "title",
    "authors"
  ]
};

const filterList = [
  { filter: SUBMISSION_STATUS.UNDER_CONSIDERATION, label: 'На рассмотрении' },
  { filter: SUBMISSION_STATUS.UNDER_REVIEWING, label: 'На рецензировании' },
  { filter: SUBMISSION_STATUS.UNDER_REVISION, label: 'На доработке' },
  { filter: SUBMISSION_STATUS.RECOMMENDED_FOR_PUBLISHING, label: 'Рекомендовано к публикации' },
  { filter: SUBMISSION_STATUS.ACCEPTED_IN_CURRENT_ISSUE, label: 'Принято в текущий выпуск' },
  { filter: SUBMISSION_STATUS.PUBLISHED, label: 'Опубликовано' },
  { filter: SUBMISSION_STATUS.REJECTED, label: 'Отклонено' }
];

const headRows = [
  { id: 'empty' },
  { id: 'date', label: 'Дата\xa0подачи', type: 'date' },
  { id: 'authors', label: 'Авторы', type: 'string' },
  { id: 'title', label: 'Название\xa0статьи', type: 'string' },
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

const SubmissionTableRow = ({ row }) => {
  const classes = useTableRowStyles();

  return (
    <TableRow hover tabIndex={-1}>
      <TableCell
        className={classes.tableCell}
        align="left"
        padding="checkbox"
        style={{paddingRight: 0}}
      >
        <IconButton
          component={NextLink}
          href={`/dashboard/submission?slug=${row.id}`}
          hrefAs={`/dashboard/submission/${row.id}`}
        >
          <ForwardIcon />
        </IconButton>
      </TableCell>
      <TableCell className={classes.tableCell} align="left">{row.date}</TableCell>
      <TableCell className={classes.tableCell} align="left">{row.authors}</TableCell>
      <TableCell className={classes.tableCell} align="left">
        {row.title}
      </TableCell>
      <TableCell align="left">
        <StatusChip statusOf="submission" status={row.status}/>
      </TableCell>
    </TableRow>
  );
}

SubmissionTableRow.propTypes = {
  row: PropTypes.object.isRequired
};

function CurrentSubmissions(props) {
  const { rows } = props;

  return (
    <>
      <Head>
        <title>Заявки на публикацию | Панель управления</title>
      </Head>
      <DashboardLayout navBarTitle="Заявки на публикацию">
        { rows.length === 0 && <NothingToDisplayText text ="Нет текущих заявок" />}
        { rows.length > 0 && 
          <CustomTable 
            rows={rows}
            headRows={headRows}
            CustomTableRow={SubmissionTableRow}
            searchOptions={searchOptions}
            defaultOrder='date'
            filterList={filterList}
            filterProperty="status"
          />
        }
      </DashboardLayout>
    </>
  );
}

CurrentSubmissions.getInitialProps = async ({ req }) => {
  const submissions = req ? await getSubmissions(req.headers.cookie) : await getSubmissions();
  const rows = parseSubmissionsTableData(submissions);
  return { rows };
}

CurrentSubmissions.propTypes = {
  rows: PropTypes.array.isRequired
};

export default CurrentSubmissions;
