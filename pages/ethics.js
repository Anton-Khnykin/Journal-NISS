import React from 'react';
import Head from 'next/head';
import { makeStyles } from '@material-ui/core/styles';
import Layout from 'components/main/Layout';
import PaperBlock from 'components/main/PaperBlock';
import Typography from '@material-ui/core/Typography';
import { journalName } from 'static/page_content/general.json';
import content from 'static/page_content/ethics_page.json';

const useStyles = makeStyles(theme => ({
  '@global': {
    '.attention': {
      fontWeight: 500,
      color: theme.palette.primary.main
    }
  }
}));

function PublicationEthics() {
  const classes = useStyles();

  return (
    <>
      <Head>
        <title>Публикационная этика | { journalName.value }</title>
        <meta name="description" content={content.description}/>
      </Head>
      <Layout>
        <PaperBlock title='Публикационная&nbsp;этика'>
          { content.blocks.map((block, index) => (
            <>
              { block.title &&
                <Typography
                  key={block.title}
                  variant="h6"
                  component="h2"
                  paragraph
                  dangerouslySetInnerHTML={{ __html: block.title }}
                />  
              }
              { block.text &&
                <Typography
                  key={block.text}
                  paragraph={index !== content.blocks.length - 1}
                  dangerouslySetInnerHTML={{ __html: block.text }}
                />
              }
            </>
          ))}
        </PaperBlock>
      </Layout>
    </>
  );
}

export default PublicationEthics;
