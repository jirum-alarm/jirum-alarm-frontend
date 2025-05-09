import { getAccessToken } from '@/app/actions/token';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

import KeywordUpdate from './components/KeywordUpdate';

interface Props {
  params: Promise<{ keywordId: string }>;
}

const KeywordUpdatePage = async ({ params }: Props) => {
  const { keywordId } = await params;
  const token = await getAccessToken();
  return (
    <DefaultLayout isLoggedIn={!!token}>
      <KeywordUpdate keywordId={keywordId} />
    </DefaultLayout>
  );
};

export default KeywordUpdatePage;
