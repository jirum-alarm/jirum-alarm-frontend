import BasicLayout from '@/components/layout/BasicLayout';
import PersonalInfoForm from './components/PersonalInfoForm';

const PersonalPage = () => {
  return (
    <BasicLayout hasBackButton title="개인정보 수정">
      <div className="flex flex-col h-full pt-9 px-5 pb-9">
        <p className="font-semibold text-2xl">
          출생년도와 성별을
          <br />
          수정해주세요.
        </p>
        <PersonalInfoForm />
      </div>
    </BasicLayout>
  );
};

export default PersonalPage;
