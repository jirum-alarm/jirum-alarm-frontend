import DefaultLayout from '@/components/Layouts/DefaultLayout';
import { getAccessToken } from '@/app/actions/token';
import KeywordUpdate from './components/KeywordUpdate';

interface Props {
  params: {
    keywordId: string;
  };
}

const KeywordUpdatePage = async ({ params }: Props) => {
  const token = await getAccessToken();
  return (
    <DefaultLayout isLoggedIn={!!token}>
      <KeywordUpdate keywordId={params.keywordId} />
    </DefaultLayout>
  );
};

export default KeywordUpdatePage;
