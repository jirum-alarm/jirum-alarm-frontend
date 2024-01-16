import Button from '@/components/common/Button';
import usePersonalInfoFormViewModel from '../hooks/usePersonalInfoFormViewModel';
import { Registration } from '../../page';
import BirthYearSelect from '@/app/mypage/account/personal/components/BirthYearSelect';
import GenderRadioGroup from '@/app/mypage/account/personal/components/GenderRadioGroup';

const PersonalForm = ({
  registration,
  handleRegistration,
  moveNextStep,
}: {
  registration: Registration;
  handleRegistration: (nickname: (registration: Registration) => Partial<Registration>) => void;
  moveNextStep: () => void;
}) => {
  const { birthYear, gender, handleSubmit, handleSelectChange, handleRadioChange } =
    usePersonalInfoFormViewModel({
      registration,
      handleRegistration,
      moveNextStep,
    });

  return (
    <form className="flex-1 flex flex-col justify-between pt-11" onSubmit={handleSubmit}>
      <div>
        <BirthYearSelect handleSelectChange={handleSelectChange} birthYear={birthYear} />
        <div className="h-10" />
        <GenderRadioGroup handleRadioChange={handleRadioChange} gender={gender} />
      </div>
      <Button type="submit">가입완료</Button>
    </form>
  );
};

export default PersonalForm;
