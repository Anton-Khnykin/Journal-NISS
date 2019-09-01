import React from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import DashboardLayout from 'components/dashboard/DashboardLayout';
import NothingToDisplayText from 'components/dashboard/NothingToDisplayText';
import ReviewPanel from 'components/dashboard/ReviewPanel';
import { getArchivedReviews } from 'middleware/api/reviewer';

function ArchivedReviews(props) {
  const { reviews } = props;

  return (
    <>
      <Head>
        <title>Ахрив рецензий | Панель управления</title>
      </Head>
      <DashboardLayout navBarTitle="Рецензии">
        { reviews.length === 0 ?
          <NothingToDisplayText text="Нет архивных рецензий" />
          :
          <div style={{width: '100%'}}>
            {reviews.map(review => (
              <ReviewPanel key={'review' + review.review_id} review={review} />
            ))}
          </div>
        }
      </DashboardLayout>
    </>
  );
}

ArchivedReviews.getInitialProps = async ({ req }) => {
  const reviews = req ? await getArchivedReviews(req.headers.cookie) : await getArchivedReviews();
  return { reviews };
}

ArchivedReviews.propTypes = {
  reviews: PropTypes.array.isRequired
};

export default ArchivedReviews;
