import React, { useState } from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import Layout from 'components/main/Layout';
import PaperBlock from 'components/main/PaperBlock';
import IssueCard from 'components/main/IssueCard';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import Divider from '@material-ui/core/Divider';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { getIssues } from 'middleware/api/public';
import { journalName } from 'static/page_content/general.json';

function Archive(props) {
  const { volumes } = props;
  const [ open, setOpen ] = useState(volumes.map((item, index) => index === 0));

  const handleClick = index => () => {
    const newOpen = [...open];
    newOpen[index] = !open[index];
    setOpen(newOpen);
  }

  const elements = [];
  for (const volume of volumes) {
    const index = volumes.indexOf(volume);
    const issues = [];
    for (const issue of volume.issues) {
      let href = '';
      let hrefAs = '';
      if (volumes.indexOf(volume) === 0 && volume.issues.indexOf(issue) === (volume.issues.length - 1)) {
        href = '/issue/current';
        hrefAs = undefined;
      }
      else {
        href = '/issue?slug=' + issue.issue_id;
        hrefAs = '/issue/' + issue.issue_id;
      }
      issues.push(
        <Grid
          container
          item
          xs={12}
          sm={6}
          md={3}
          key={`i${issue.number}`}
        >
          <IssueCard
            issue={issue}
            href={href}
            hrefAs={hrefAs}
          />
        </Grid>
      );
    }
    elements.push(
      <React.Fragment key={`v${volume.number}`}>
        <List style={{ width: '100%' }}>
          <ListItem button onClick={handleClick(index)}>
            <ListItemText primary={
              <Typography variant="h6">
                { 'Том\xa0' + volume.number + '\xa0(' + volume.year + ')' }
              </Typography>
            } />
            { open[index] ? <ExpandLess /> : <ExpandMore /> }
          </ListItem>
          <Collapse in={open[index]} timeout="auto">
            <List component="div" disablePadding>
              <ListItem>
                <Grid
                  container
                  spacing={4}
                  item xs={12}
                  justify="flex-start"
                >
                  { issues }
                </Grid>
              </ListItem>
            </List>
          </Collapse>
        </List>
        <Box
          component={Divider}
          mt={2}
          mb={1}
          width={1} 
        />
      </React.Fragment>
    );
  }

  return (
    <>
      <Head>
        <title>Архив выпусков | { journalName.value }</title>
      </Head>
      <Layout>
        <PaperBlock title="Архив&nbsp;выпусков">
          { elements }
        </PaperBlock>
      </Layout>
    </>
  );
}

Archive.getInitialProps = async () => {
  const volumes = await getIssues();
  return { volumes };
}

Archive.propTypes = {
  volumes: PropTypes.array.isRequired
};

export default Archive;
