import DefaultLayout from '@/components/Layouts/DefaultLayout';
import KeywordRegister from './components/KeywordRegister';
import { getAccessToken } from '@/app/actions/token';

const KeywordRegisterPage = async () => {
  const token = await getAccessToken();
  return (
    <DefaultLayout isLoggedIn={!!token}>
      <KeywordRegister />
    </DefaultLayout>
  );
};

export default KeywordRegisterPage;
