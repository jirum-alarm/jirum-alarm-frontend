import Button from '@/components/common/Button';

import BirthYearSelect from '@features/personal/components/BirthYearSelect';
import GenderRadioGroup from '@features/personal/components/GenderRadioGroup';

import { Registration } from '../../page';
import usePersonalInfoFormViewModel from '../hooks/usePersonalInfoFormViewModel';

const PersonalForm = ({
  registration,
  handleRegistration,
  moveNextStep,
}: {
  registration: Registration;
  handleRegistration: (nickname: (registration: Registration) => Partial<Registration>) => void;
  moveNextStep: () => void;
}) => {
  const {
    birthYear,
    gender,
    handleSubmit,
    handleSelectChange,
    handleRadioChange,
    birthYearOptions,
  } = usePersonalInfoFormViewModel({
    registration,
    handleRegistration,
    moveNextStep,
  });

  return (
    <form className="flex flex-1 flex-col justify-between pt-22" onSubmit={handleSubmit}>
      <div>
        <BirthYearSelect
          handleSelectChange={handleSelectChange}
          birthYear={birthYear}
          birthYearOptions={birthYearOptions}
        />
        <div className="h-10" />
        <GenderRadioGroup handleRadioChange={handleRadioChange} gender={gender} />
      </div>
      <div className="fixed bottom-0 left-0 right-0 m-auto w-full max-w-[600px] px-5 pb-9">
        <Button type="submit">가입완료</Button>
      </div>
    </form>
  );
};

export default PersonalForm;
