import React from 'react';

import { getAccessToken } from '@/app/actions/token';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

import KeywordDetail from './components/KeywordDetail';

const KeywordDetailPage = async ({ params }: { params: { keywordId: string } }) => {
  const token = await getAccessToken();
  return (
    <DefaultLayout isLoggedIn={!!token}>
      <KeywordDetail keywordId={params.keywordId} />
    </DefaultLayout>
  );
};

export default KeywordDetailPage;
