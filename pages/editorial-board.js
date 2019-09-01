import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { makeStyles } from '@material-ui/core/styles';
import Layout from 'components/main/Layout';
import PaperBlock from 'components/main/PaperBlock';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import { journalName } from 'static/page_content/general.json';
import content from 'static/page_content/board_page.json';
import AccountCircle from '@material-ui/icons/AccountCircle';

const useStyles = makeStyles(() => ({
  grow: {
    flexGrow: 1
  },
  avatar: {
    width: 100,
    height: 100
  },
  bigAvatar: {
    width: 150,
    height: 150
  },
  avatarIcon: {
    width: '100%',
    height: '100%'
  }
}));

function BoardMember(props) {
  const { member, avatarProps } = props;

  return (
    <Grid container item xs={12} sm={6} md={4}>
      <Box pr={2}>
        <Avatar {...avatarProps}>
        { !avatarProps.src &&
          <AccountCircle style={{ width: '100%', height: '100%' }} />
        }
        </Avatar>
      </Box>
      <div>
        <Box component={Typography} variant="body2" fontWeight={500} paragraph>
          { member.name }
        </Box>
        <Typography>
          { member.academic_title }
        </Typography>
        <Typography>
          { member.academic_degree }
        </Typography>
      </div>
      { member.text &&
        <Box component={Typography} pt={4} width={1}>
          { member.text }
        </Box>
      }
    </Grid>
  );
}

BoardMember.propTypes = {
  member: PropTypes.object.isRequired,
  avatarProps: PropTypes.object
};

function EditorialBoard() {
  const classes = useStyles();

  return (
    <>
      <Head>
        <title>Редакционная коллегия | { journalName.value }</title>
      </Head>
      <Layout>
        <PaperBlock title='Главный&nbsp;редактор'>
          <BoardMember
            member={content.editor}
            avatarProps={{ className: classes.bigAvatar }}
          />
        </PaperBlock>
        <PaperBlock title='Редакционная&nbsp;коллегия'>
          <Grid container spacing={3}>
            { content.members.map((member, index) => (
              <BoardMember
                key={member.name + index}
                member={member}
                avatarProps={{ className: classes.avatar }}
              />
            ))}
          </Grid>
        </PaperBlock>
      </Layout>
    </>
  );
}

export default EditorialBoard;
