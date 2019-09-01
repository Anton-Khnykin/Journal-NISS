import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Fade from '@material-ui/core/Fade';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import InputBase from '@material-ui/core/InputBase';
import TextField from '@material-ui/core/TextField';
import SendIcon from '@material-ui/icons/Send';
import AttachmentIcon from '@material-ui/icons/Attachment';
import DocxIcon from '@material-ui/icons/Description';
import ImageIcon from '@material-ui/icons/Photo';
import PDFIcon from '@material-ui/icons/PictureAsPdf';
import StorageIcon from '@material-ui/icons/Storage';
import { getDate } from 'utils/data_parser';
import { getMessages, sendMessage } from 'middleware/api/common';
import Download from 'components/Download';

const getIcon = (type, className) => {
  switch(type) {
    case 'application/pdf':
      return <PDFIcon className={className} />;
    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return <DocxIcon className={className} />;
    case 'image/jpeg':
    case 'image/png':
      return <ImageIcon className={className} />;
    default:
      return <StorageIcon className={className} />;
  }
}

const useMessageStyles = makeStyles(theme => ({
  paper: {
    backgroundColor: theme.palette.secondary.main,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    marginBottom: theme.spacing(2),
    wordWrap: 'anywhere',
    display: 'flex',
    flexDirection: 'column'
  },
  paperColorSender: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.secondary.light
  },
  fileIcon: {
    height: 20,
    width: 20,
    marginRight: theme.spacing(1)
  },
  iconColorLight: {
    color: theme.palette.secondary.light
  },
  iconColotDork: {
    color: theme.palette.primary.main
  },
  file: {
    height: 20,
    '&:hover': {
      textDecoration: 'underline',
      cursor: 'pointer'
    }
  },
  spacing: {
    marginBottom: theme.spacing(1)
  },
  fontWeight: {
    fontWeight: 500
  }
}));

const Message = ({ message }) => {
  const classes = useMessageStyles();

  return (
    <Fade in>
    <Grid
      container
      justify={message.isSender ? 'flex-end' : 'flex-start'}
    >
      <Grid
        container
        justify={message.isSender ? 'flex-end' : 'flex-start'}
      >
        <Typography color="textSecondary">
          {getDate(message.date, true)}
        </Typography>
        &nbsp;
        <Typography className={classes.fontWeight}>
          {message.name}
        </Typography>
      </Grid>
      <Paper
        className={clsx(
          classes.paper, 
          { [classes.paperColorSender]: message.isSender }
        )}
      >
        { message.text !== '' &&
          <Typography
            component="span"
            className={clsx({
              [classes.spacing]: message.files.length !== 0
            })}
          >
            {message.text.split('\n').map((item, index) => (
              <React.Fragment key={item + index}>
                {item}
                <br />
              </React.Fragment>
            ))}
          </Typography>
        }
        { message.files.length !== 0 && message.files.map(file => (
          <Grid
            key={file.id}
            container
            item xs={12}
            justify="flex-start"
            className={classes.file}
          >
            {getIcon(
              file.type,
              clsx(classes.fileIcon,
                message.isSender ?
                classes.iconColorLight :
                classes.iconColotDork
              )
            )}
            <Download fileId={file.id}>
              <Typography className={classes.fontWeight}>
                {file.name}
              </Typography>
            </Download>
          </Grid>
        ))}
      </Paper>
    </Grid>
    </Fade>
  );
}

Message.propTypes = {
  message: PropTypes.object.isRequired
}

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    height: '100%',
    minHeight: 'calc(100vh - 161px)'
  },
  dialog: {
    flex: '2 1 100%',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 'calc(100vh - 161px)',
    [theme.breakpoints.down('xs')]: {
      maxHeight: 'calc(100vh - 110px)'
    }
  },
  lineFlex: {
    display: 'flex',
    height: 'auto',
    width: '100%',
    boxSizing: 'border-box'
  },
  dialogBody: {
    padding: theme.spacing(3),
    flexGrow: 1,
    flexDirection: 'column',
    maxHeight: 'calc(100vh - 161px)',
    overflowX: 'auto'
  },
  dialogInput: {
    maxHeight: 150
  },
  buttonContainer: {
    display: 'flex',
    alignItems: 'flex-end'
  },
  input: {
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    flexDirection: 'column'
  },
  inputRoot: {
    padding: 0,
    maxHeight: 150,
    overflowX: 'hidden'
  },
  fileIcon: {
    height: 20,
    width: 20,
    color: theme.palette.primary.main,
    marginRight: theme.spacing(1)
  },
  dialogContent: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  }
}));

function SubmissionDialog(props) {
  const classes = useStyles();
  const { messages, submissionId, setMessages, messageText, setMessageText } = props;
  const [ commentaryText, setCommentaryText ] = useState('');
  const [ files, setFiles ] = useState([]);
  const [ fileDialogOpen, setFileDialogOpen ] = useState(false);
  const endOfMessagesRef = useRef(null);
  const messageInputRef = useRef(null);

  useEffect(() => {
    const inputRef = messageInputRef.current;
    inputRef.selectionStart = inputRef.value.length;
    return () => setMessageText(inputRef.value);
  }, []);

  const inputFocus = () => {
    if (!fileDialogOpen) {
      setTimeout(() => {
        if (messageInputRef.current) {
          messageInputRef.current.focus();
        }
      }, 0);
    }
  }

  const scrollToBottom = () => {
    endOfMessagesRef.current.scrollIntoView();
  }

  useEffect(scrollToBottom, [messages]);

  const handleChange = ({ target: { value } }) => {
    setCommentaryText(value);
  }

  const handleFileFialogClose = () => {
    setFileDialogOpen(false);
  }

  const onChangeFileInput = event => {
    const newFiles = [];
    for (let i = 0; i < event.target.files.length; i++) {
      newFiles.push(event.target.files.item(i));
    }
    setFiles(newFiles);
    setCommentaryText(messageInputRef.current.value);
    setFileDialogOpen(true);
  }

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append('data', JSON.stringify({ text: messageInputRef.current.value.trim() }));
    sendMessage(submissionId, formData)
      .then(async () => {
        setMessages(await getMessages(submissionId));
      });
    messageInputRef.current.value = '';
  }

  const handleFilesSubmit = event => {
    event.preventDefault();
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('data', JSON.stringify({ text: commentaryText.trim() }));
    sendMessage(submissionId, formData)
      .then(async () => {
        setMessages(await getMessages(submissionId));
      });
    setFileDialogOpen(false);
    setCommentaryText('');
    messageInputRef.current.value = '';
  }

  let keys = {};
  const handleKeyDown = event => {
    keys[event.key] = true;
    if (keys['Enter'] && !keys['Shift']) {
      event.preventDefault();
      if (messageInputRef.current.value.trim()) {
        handleSubmit();
      }
    }
  }

  const handleKeyUp = event => {
    keys[event.key] = false;
  }

  return (
    <div className={classes.root}>
      <div className={classes.dialog}>
        <div className={clsx(classes.lineFlex, classes.dialogBody)}>
          {messages.map((item, index) => (
            <Message key={'message' + index} message={item}/>
          ))}
          <div ref={endOfMessagesRef} />
        </div>
        <Divider />
        <div className={clsx(classes.lineFlex, classes.dialogInput)}>
          <input
            id="button-file"
            style={{display: 'none'}}
            type="file"
            multiple
            onChange={onChangeFileInput}
          />
          <label htmlFor="button-file" className={classes.buttonContainer}>
            <IconButton component="span">
              <AttachmentIcon/>
            </IconButton>
          </label>
          <div className={classes.input}>
            <InputBase
              defaultValue={messageText}
              autoFocus
              fullWidth
              placeholder="Введите сообщение..."
              multiline
              type='text'
              inputRef={messageInputRef}
              onBlur={inputFocus}
              classes={{root: classes.inputRoot}}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
            />
          </div>
          <label className={classes.buttonContainer}>
            <IconButton onClick={handleSubmit}>
              <SendIcon/>
            </IconButton>
          </label>
        </div>
      </div>

      <Dialog
        fullWidth
        maxWidth='xs'
        open={fileDialogOpen}
        onClose={handleFileFialogClose}
      >
        <DialogTitle>
          Прикрепленые файлы
        </DialogTitle>
        <form onSubmit={handleFilesSubmit}>
          <DialogContent dividers className={classes.dialogContent}>
            {files.map((file, index) => (
              <Box
                key={file.name + index}
                display="flex"
                heigh={30}
                pb={1}
              >
                {getIcon(file.type, classes.fileIcon)}
                <Typography noWrap>
                  {file.name}
                </Typography>
              </Box>
              ))
            }
            <TextField
              autoFocus
              fullWidth
              multiline
              label="Комментарий"
              value={commentaryText}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              size="small"
              onClick={handleFileFialogClose}
            >
              Отмена
            </Button>
            <Button
              color="primary"
              size="small"
              type="submit"
            >
              Отправить
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}

SubmissionDialog.propTypes = {
  messages: PropTypes.array.isRequired,
  submissionId: PropTypes.string.isRequired,
  setMessages: PropTypes.func.isRequired,
  messageText: PropTypes.string.isRequired,
  setMessageText: PropTypes.func.isRequired 
}

export default SubmissionDialog;
