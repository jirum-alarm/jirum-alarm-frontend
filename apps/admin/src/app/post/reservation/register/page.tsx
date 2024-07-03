import DefaultLayout from '@/components/Layouts/DefaultLayout';
// import KeywordRegister from './components/KeywordRegister';
import { getAccessToken } from '@/app/actions/token';

const PostReservationRegisterPage = async () => {
  const token = await getAccessToken();
  return (
    <DefaultLayout isLoggedIn={!!token}>
      {/* <KeywordRegister /> */}
      <div>KeywordRegister</div>
    </DefaultLayout>
  );
};

export default PostReservationRegisterPage;
