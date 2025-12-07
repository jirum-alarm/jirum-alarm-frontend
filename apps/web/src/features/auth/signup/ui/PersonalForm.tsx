import { Registration } from '@/app/(mobile)/signup/page';
import { BirthYearSelect, GenderRadioGroup } from '@entities/user';

import Button from '@/shared/ui/Button';

import usePersonalInfoFormViewModel from '@/features/auth/signup/model/usePersonalInfoFormViewModel';

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
      <div className="fixed right-0 bottom-0 left-0 m-auto w-full max-w-[600px] px-5 pb-9">
        <Button type="submit">가입완료</Button>
      </div>
    </form>
  );
};

export default PersonalForm;
