'use client';
import Button from '@/components/common/Button';
import usePersonalInfoFormViewModel from '../hooks/usePersonalInfoFormViewModel';
import BirthYearSelect from '@/features/personal/components/BirthYearSelect';
import GenderRadioGroup from '@/features/personal/components/GenderRadioGroup';

const PersonalInfoForm = () => {
  const {
    birthYear,
    gender,
    handleSubmit,
    handleSelectChange,
    handleRadioChange,
    isValidPersonalInfoInput,
    birthYearOptions,
  } = usePersonalInfoFormViewModel();
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
      <Button type="submit" disabled={isValidPersonalInfoInput()}>
        저장
      </Button>
    </form>
  );
};

export default PersonalInfoForm;
