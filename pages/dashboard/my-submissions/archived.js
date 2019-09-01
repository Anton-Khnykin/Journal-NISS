import React, { useState } from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import DashboardLayout from 'components/dashboard/DashboardLayout';
import NothingToDisplayText from 'components/dashboard/NothingToDisplayText';
import SubmissionHistory from 'components/dashboard/SubmissionHistory';
import SubmissionPanel from 'components/dashboard/SubmissionPanel';
import WithMobileDialog from 'components/WithMobileDialog';
import { getArchivedSubmissions } from 'middleware/api/author';

function Archived(props) {
  const { submissions } = props;
  const [ modalHistory, setModalHistory ] = useState({
    open: false,
    submissionId: ''
  });

  const handleModalHistoryOpen = submissionId => () => {
    setModalHistory({ 
      open: true,
      submissionId: submissionId
    });
  }

  const handleModalHistoryClose = () => {
    setModalHistory({
      open: false,
      submissionId: ''
    });
  }

  return (
    <>
      <Head>
        <title>Архив моих заявок | Панель управления</title>
      </Head>
      <DashboardLayout navBarTitle="Архив моих заявок на публикацию">
        { submissions.length === 0 && <NothingToDisplayText text="Нет архивных заявок" />}
        { submissions.length !== 0 &&
          <div style={{ width: '100%' }}>
            { submissions.map(item => (
              <SubmissionPanel
                key={item.submissions_id}
                submission={item}
                handleOpenModalHistory={handleModalHistoryOpen}
              />
            ))}
          </div>
        }

        <WithMobileDialog
          maxWidth="xs"
          open={modalHistory.open}
          onClose={handleModalHistoryClose}
          title="История&nbsp;заявки"
        >
          <SubmissionHistory
            submissionId={modalHistory.submissionId}
            onClose={handleModalHistoryClose}
          />
        </WithMobileDialog>
      </DashboardLayout>
    </>
  );
}

Archived.getInitialProps = async ({ req }) => {
  const submissions = req ? await getArchivedSubmissions(req.headers.cookie) : await getArchivedSubmissions();
  return { submissions };
}

Archived.propTypes = {
  submissions: PropTypes.array.isRequired 
};

export default Archived;
