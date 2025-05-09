import { getAccessToken } from '@/app/actions/token';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

import KeywordRegister from './components/KeywordRegister';

const KeywordRegisterPage = async () => {
  const token = await getAccessToken();
  return (
    <DefaultLayout isLoggedIn={!!token}>
      <KeywordRegister />
    </DefaultLayout>
  );
};

export default KeywordRegisterPage;
