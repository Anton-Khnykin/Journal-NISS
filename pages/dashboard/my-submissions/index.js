import React, { useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';
import DashboardLayout from 'components/dashboard/DashboardLayout';
import NothingToDisplayText from 'components/dashboard/NothingToDisplayText';
import SubmissionPanel from 'components/dashboard/SubmissionPanel';
import SubmissionHistory from 'components/dashboard/SubmissionHistory';
import StyledSnackbar from 'components/dashboard/StyledSnackbar';
import ConfirmDialog from 'components/dashboard/ConfirmDialog';
import WithMobileDialog from 'components/WithMobileDialog';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { getSubmissions } from 'middleware/api/author';

const CreateSubmissionButton = ({ onClick, centered, gutterTop, gutterBottom, ...other }) => (
  <Box
    display="flex"
    width={1}
    justifyContent={centered ? "center" : "flex-end"}
    pb={gutterBottom ? 3 : 0}
    pt={gutterTop ? 3 : 0}
  >
    <Button
      variant="outlined"
      color="primary"
      onClick={onClick}
      {...other}
    >
    Подать заявку
    </Button>
  </Box>
);

CreateSubmissionButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  centered: PropTypes.bool,
  gutterTop: PropTypes.bool,
  gutterBottom: PropTypes.bool
}

const SubmissionStepper = dynamic(
  () => import('components/dashboard/SubmissionStepper'),
  {
    // eslint-disable-next-line react/display-name
    loading: () => <CircularProgress size={80} />,
    ssr: false
  });

function Index(props) {
  const [ submissions , setSubmissions ] = useState(props.submissions);
  const [ userStatus, setUserStatus ] = useState({
    creating: false,
    cancelling: false
  });
  const [ modalHistory, setModalHistory ] = useState({
    open: false,
    submissionId: ''
  });
  const [ snackbar, setSnackbar ] = useState({
    open: false,
    variant: 'success',
    message: ''
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

  const handleCreatingSubmission = () => {
    setUserStatus({
      creating: !userStatus.creating,
      cancelling: false
    });
  }

  const handleCancelling = () => {
    setUserStatus({
      ...userStatus,
      cancelling: !userStatus.cancelling
    });
  }

  const handleFinishSubmission = async () => {
    const submissions = await getSubmissions();
    setSubmissions(submissions);
    setUserStatus({
      ...userStatus,
      creating: false
    });
  } 

  const handleCloseSnack = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({
      open: false,
      variant: 'success',
      message: ''
    });
  }

  return (
    <>
      <Head>
        <title>Мои заявки | Панель управления</title>
      </Head>
      <DashboardLayout navBarTitle="Мои заявки на публикацию">
        { submissions.length === 0 && !userStatus.creating &&
          <>
            <NothingToDisplayText text="Нет текущих заявок" />
            <CreateSubmissionButton
              onClick={handleCreatingSubmission}
              centered
              gutterTop
            />
          </>
        }
      
        { submissions.length !== 0 && !userStatus.creating &&
          <div style={{ width: '100%' }}>
            <CreateSubmissionButton
              onClick={handleCreatingSubmission}
              gutterBottom
            />
            { submissions.map(item => (
              <SubmissionPanel 
                key={'submission' + item.submission_id}
                submission={item}
                handleOpenModalHistory={handleModalHistoryOpen}
              />
            ))}
          </div>
        }

        { userStatus.creating &&
          <SubmissionStepper
            handleCancelling={handleCancelling}
            handleFinishSubmission={handleFinishSubmission}
          />
        }

        <ConfirmDialog
          open={userStatus.cancelling}
          text="Вы уверены, что хотите отменить подачу заявки? Введённые данные будут сохранены в браузере."
          closeYes={handleCreatingSubmission}
          closeNo={handleCancelling}
        />

        <StyledSnackbar
          open={snackbar.open}
          variant={snackbar.variant}
          message={snackbar.message}
          onClose={handleCloseSnack}
        />

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

Index.getInitialProps = async ({ req }) => {
  const submissions = req ? await getSubmissions(req.headers.cookie) : await getSubmissions();
  return { submissions };
}

Index.propTypes = {
  submissions: PropTypes.array.isRequired
};

export default Index;
