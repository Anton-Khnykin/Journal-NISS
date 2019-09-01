import React, { useState, useEffect } from 'react';
import Router from 'next/router';
import Head from 'next/head';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import SubmissionIcon from '@material-ui/icons/Inbox';
import ChatIcon from '@material-ui/icons/Chat';
import DashboardLayout from 'components/dashboard/DashboardLayout';
import SubmissionStepper from 'components/dashboard/SubmissionStepper';
import SubmissionDialog from 'components/dashboard/SubmissionDialog';
import SubmissionAppBar from 'components/dashboard/SubmissionAppBar';
import { getSubmission } from 'middleware/api/author';
import { getMessages } from 'middleware/api/common';
import { SUBMISSION_STATUS } from 'middleware/enums';

const useStyles = makeStyles(theme => ({
  container: {
    minHeight: 'calc(100vh - 161px)',
    [theme.breakpoints.down('xs')]: {
      minHeight: 'calc(100vh - 105px)'
    }
  }
}));

function MySubmission(props) {
  const classes = useStyles();
  const { submissionId, submission } = props;
  const [ messages, setMessages ] = useState(props.messages);
  const [ messageText, setMessageText ] = useState('');
  const [ tabValue, setTabValue ] = useState(0);
  const isEditable = submission.submission_details.status.id === SUBMISSION_STATUS.UNDER_REVISION;

  useEffect(() => {
    if (window.location.hash === '#dialog') {
      setTabValue(1);
    }
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  }

  const handleCancelling = () => {
    Router.push('/dashboard/my-submissions');
  }

  const handleFinishSubmission = () => {
    window.location.href = '/dashboard/my-submissions';
  }

  return (
    <>
      <Head>
        <title>{ submission.submission_details.title_ru } | Панель управления</title>
      </Head>
      <DashboardLayout navBarTitle="Заявка">
        <Paper square>
          <SubmissionAppBar
            tabs={[
              {
                label: "Заявка",
                icon: <SubmissionIcon/>
              },
              {
                label: "Диалог с редакцией",
                icon: <ChatIcon/>
              }
            ]}
            value={tabValue}
            onChange={handleTabChange}
          />
          <div className={classes.container}>
            { tabValue === 0 &&
              <SubmissionStepper
                handleCancelling={handleCancelling}
                handleFinishSubmission={handleFinishSubmission}
                submission={submission}
                submissionId={submissionId}
                readOnlyMode={!isEditable}
                editMode={isEditable}
              />
            }
            { tabValue === 1 && 
              <SubmissionDialog
                submissionId={submissionId}
                messages={messages}
                setMessages={setMessages}
                messageText={messageText}
                setMessageText={setMessageText}
              />
            }
          </div>
        </Paper>
      </DashboardLayout>
    </>
  );
}

MySubmission.getInitialProps = async ({ req, query }) => {
  const submissionId = query.slug;
  const submission = req ? await getSubmission(submissionId, req.headers.cookie) : await getSubmission(submissionId);
  const messages = req ? await getMessages(submissionId, req.headers.cookie) : await getMessages(submissionId);
  return { submission, messages, submissionId };
}

MySubmission.propTypes = {
  submission: PropTypes.object.isRequired,
  messages: PropTypes.array.isRequired,
  submissionId: PropTypes.string.isRequired
};

export default MySubmission;
