import BasicLayout from '@/components/layout/BasicLayout';
import NicknameForm from './components/NickNameForm';

const NickNamePage = () => {
  return (
    <BasicLayout hasBackButton title="닉네임 수정">
      <div className="flex flex-col h-full pt-9 px-5 pb-9">
        <p className="font-semibold text-2xl">
          변경할 닉네임을
          <br />
          입력해주세요.
        </p>
        <NicknameForm />
      </div>
    </BasicLayout>
  );
};

export default NickNamePage;
