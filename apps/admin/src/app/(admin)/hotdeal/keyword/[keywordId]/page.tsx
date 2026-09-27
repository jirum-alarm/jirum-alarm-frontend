import React from 'react';

import KeywordDetail from './components/KeywordDetail';

const KeywordDetailPage = async ({ params }: { params: Promise<{ keywordId: string }> }) => {
  const { keywordId } = await params;
  return (
    <>
      <KeywordDetail keywordId={keywordId} />
    </>
  );
};

export default KeywordDetailPage;
