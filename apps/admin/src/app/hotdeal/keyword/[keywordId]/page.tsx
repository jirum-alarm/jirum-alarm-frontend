import React from 'react';

import { getAccessToken } from '@/app/actions/token';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

import KeywordDetail from './components/KeywordDetail';

const KeywordDetailPage = async ({ params }: { params: Promise<{ keywordId: string }> }) => {
  const { keywordId } = await params;
  const token = await getAccessToken();
  return (
    <DefaultLayout isLoggedIn={!!token}>
      <KeywordDetail keywordId={keywordId} />
    </DefaultLayout>
  );
};

export default KeywordDetailPage;
