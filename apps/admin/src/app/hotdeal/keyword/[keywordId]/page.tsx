import DefaultLayout from '@/components/Layouts/DefaultLayout';
import React from 'react';
import KeywordDetail from './components/KeywordDetail';
import { getAccessToken } from '@/app/actions/token';

const KeywordDetailPage = async ({ params }: { params: { keywordId: string } }) => {
  const token = await getAccessToken();
  return (
    <DefaultLayout isLoggedIn={!!token}>
      <KeywordDetail keywordId={params.keywordId} />
    </DefaultLayout>
  );
};

export default KeywordDetailPage;
